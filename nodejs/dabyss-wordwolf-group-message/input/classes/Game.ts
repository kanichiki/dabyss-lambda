import * as aws from "../clients/awsClient";
import { User } from "./User";
import { Discussion } from "./Discussion";
import { Vote } from "./Vote";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

// インスタンス変数にしちゃうとstatic関数で参照できないから
const gameNames = ["ワードウルフ"];

/**
 * ゲームのクラス
 * それぞれのゲームデータで参加者のデータを持ってる
 * 
 * gameテーブルは
 * partition key : group_id
 * sort key : game_id
 * 
 * game_idはオートインクリメント
 * よってgroup_idで降順でqueryして得られたデータの1番目が現在そのグループで行われてるゲーム
 *
 * @export
 * @class Game
 */
export class Game {
    gameTable: string;
    sequence: string;
    settingNames: string[];
    defaultSettingStatus: boolean[];
    exists: boolean;

    groupId: string;
    gameId: number;
    gameKey: DocumentClient.Key;
    userIds: string[];
    day: number;
    gameName: string;
    gameStatus: string;
    settingStatus: boolean[];
    timer: string;

    /**
     * Gameインスタンス作成
     * 
     * @constructor
     * @param {string} groupId
     * @memberof Game
     */

    constructor(groupId: string) {
        this.gameTable = "dabyss-dev-game";
        this.sequence = "dabyss-dev-sequence";
        this.settingNames = [];
        this.defaultSettingStatus = [];
        this.exists = false;

        this.groupId = groupId;
        this.gameId = -1;
        this.gameKey = {
            group_id: this.groupId,
            game_id: this.gameId
        }
        this.userIds = [];
        this.day = -1;
        this.gameName = "";
        this.gameStatus = "";
        this.settingStatus = [];
        this.timer = "00:03:00";
    }

    /**
     * ゲームの名前が存在するかどうかを返す
     *
     * @static
     * @param {string} text
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    static async gameNameExists(text: string): Promise<boolean> {
        let res: boolean = false;
        for (let gameName of gameNames) {
            if (text == gameName) {
                res = true;
            }
        }
        return res;
    }


    /**
     * ゲームデータを引っ張ってきてそれぞれインスタンス変数に代入
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    async init(): Promise<void> {
        try {
            const data: DocumentClient.QueryOutput = await aws.dynamoQuery(this.gameTable, "group_id", this.groupId, false);
            if (data.Count != undefined) {
                if (data.Count > 0) {
                    this.exists = true;

                    if (data.Items != undefined) {
                        const game: DocumentClient.AttributeMap = data.Items[0];
                        this.gameId = game.game_id as number;
                        this.gameKey = {
                            group_id: this.groupId,
                            game_id: this.gameId
                        };
                        this.userIds = game.user_ids as string[];
                        this.day = game.day as number;
                        this.gameName = game.game_name as string;
                        this.gameStatus = game.game_status as string;
                        this.settingStatus = game.setting_status as boolean[];
                        this.timer = game.timer as string;
                    }

                }
            }

        } catch (err) {
            console.error(err);
            console.error("gameの初期化失敗");
        }
    }

    /**
     * Gameインスタンスを作る
     * constructorでasyncが使えないので。
     *
     * @static
     * @param {string} groupId
     * @returns {Promise<Game>}
     * @memberof Game
     */
    static async createInstance(groupId: string): Promise<Game> {
        const game: Game = new Game(groupId);
        await game.init();
        return game;
    }


    /**
     * ゲームデータ挿入
     *
     * @param {string} gameName
     * @returns {Promise<void>}
     * @memberof Game
     */
    async putGame(gameName: string): Promise<void> {
        try {
            const key: { name: string } = { name: this.gameTable };
            const data: DocumentClient.GetItemOutput = await aws.dynamoGet(this.sequence, key);
            if (data.Item != undefined) {
                this.gameId = data.Item.number + 1;
            }
            const item: DocumentClient.AttributeMap = {
                group_id: this.groupId,
                game_id: this.gameId,
                user_ids: [],
                game_status: "setting",
                game_name: gameName,
                day: 0,
                timer: "00:03:00"
            }
            // groupデータをputできたらsequenceをプラス１
            aws.dynamoPut(this.gameTable, item).then(await aws.dynamoUpdate(this.sequence, key, "number", this.gameId));
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 参加者の表示名の配列を取得
     *
     * @returns {Promise<string[]>}
     * @memberof Game
     */
    async getDisplayNames(): Promise<string[]> {
        let res: string[] = [];
        for (let userId of this.userIds) {
            const user: User = new User(userId);
            const displayName: string = await user.getDisplayName();
            res.push(displayName);
        }
        return res;
    }

    /**
     * indexの参加者の表示名を取得
     *
     * @param {number} index
     * @returns {Promise<string>}
     * @memberof Game
     */
    async getDisplayName(index: number): Promise<string> {
        const displayNames = await this.getDisplayNames();
        return displayNames[index];
    }


    /**
     * 参加者追加
     *
     * @param {string} userId
     * @returns {Promise<void>}
     * @memberof Game
     */
    async appendUserId(userId: string): Promise<void> {
        aws.dynamoAppend(this.gameTable, this.gameKey, "user_ids", userId);
    }

    /**
     * 与えられたuserIdが参加者リストに存在するか
     *
     * @param {string} userId
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    async isUserExists(userId: string): Promise<boolean> {
        const userIds: string[] = this.userIds;
        let res: boolean = false;
        for (const id of userIds) {
            if (userId == id) {
                res = true;
            }
        }
        return res;
    }


    /**
     * 参加者のデータのgroup_idを空文字にする
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    async deleteUsersGroupId(): Promise<void> {
        const userIds: string[] = this.userIds;
        for (let userId of userIds) {
            const user: User = await User.createInstance(userId);
            const userGroupId: string = user.groupId;
            if (userGroupId == this.groupId) {
                user.deleteGroupId();
            }
        }
    }

    /**
     * 参加者数を取得
     *
     * @returns {Promise<number>}
     * @memberof Game
     */
    async getUserNumber(): Promise<number> {
        return this.userIds.length;
    }

    /**
     * 参加者数分の連続した整数の配列作る
     * 例: 4人の場合 [0,1,2,3]
     *
     * @returns {Promise<number[]>}
     * @memberof Game
     */
    async getUserIndexes(): Promise<number[]> {
        const userNumber: number = await this.getUserNumber();
        let res: number[] = [];
        for (let i = 0; i < userNumber; i++) {
            res[i] = i;
        }
        return res;
    }


    /**
     * indexのuserIdを取得
     *
     * @param {number} index
     * @returns {Promise<string>}
     * @memberof Game
     */
    async getUserId(index: number): Promise<string> {
        return this.userIds[index];
    }

    /**
     * 与えられたuserIdから参加者リストのインデックスを取得
     *
     * @param {string} userId
     * @returns {Promise<Number>}
     * @memberof Game
     */
    async getUserIndexFromUserId(userId: string): Promise<Number> {
        const userIds = this.userIds;
        let index = -1;
        for (let i = 0; i < userIds.length; i++) {
            if (userIds[i] == userId) {
                index = i;
            }
        }
        return index;
    }

    /**
     * デフォルトの設定ステータスにする
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    async updateDefaultSettingStatus(): Promise<void> {
        this.settingStatus = this.defaultSettingStatus;
        aws.dynamoUpdate(this.gameTable, this.gameKey, "setting_status", this.settingStatus);
    }


    /**
     * nameに一致する設定名のインデックスを取得
     *
     * @param {string} name
     * @returns {Promise<number>}
     * @memberof Game
     */
    async getSettingIndex(name: string): Promise<number> {
        const settingNames: string[] = this.settingNames;
        let res: number = -1;
        for (let i = 0; i < settingNames.length; i++) {
            if (settingNames[i] == name) {
                res = i;
            }
        }
        return res;
    }


    /**
     * indexの設定ステータスをtrueに
     *
     * @param {number} index
     * @returns {Promise<void>}
     * @memberof Game
     */
    async updateSettingStateTrue(index: number): Promise<void> {
        this.settingStatus[index] = true;
        console.log(this.settingStatus);
        await aws.dynamoUpdate(this.gameTable, this.gameKey, "setting_status", this.settingStatus);
    }


    /**
     * indexの設定ステータスをfalseに
     *
     * @param {number} index
     * @returns {Promise<void>}
     * @memberof Game
     */
    async updateSettingStateFalse(index: number): Promise<void> {
        this.settingStatus[index] = false;
        aws.dynamoUpdate(this.gameTable, this.gameKey, "setting_status", this.settingStatus);
    }


    /**
     * 設定が完了しているかどうかを返す
     *
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    async isSettingCompleted(): Promise<boolean> {
        const settingStatus: boolean[] = this.settingStatus;
        let res: boolean = true;
        for (let settingState of settingStatus) {
            if (!settingState) {
                res = false;
            }
        }
        return res;
    }

    /**
     * タイマー情報を"○時間✖︎分△秒の形で返す"
     *
     * @returns {Promise<string>}
     * @memberof Game
     */
    async getTimerString(): Promise<string> {
        const timer: string = this.timer;
        const timerArray: string[] = timer.split(":");
        let timerString = "";
        if (timerArray[0] != "00") {
            timerString += Number(timerArray[0]) + "時間";
        }
        if (timerArray[1] != "00") {
            timerString += Number(timerArray[1]) + "分";
        }
        if (timerArray[2] != "00") {
            timerString += Number(timerArray[2]) + "秒";
        }

        return timerString;
    }

    /**
     * ゲームのステータスを更新
     *
     * @param {string} status
     * @returns {Promise<void>}
     * @memberof Game
     */
    async updateGameStatus(status: string): Promise<void> {
        this.gameStatus = status;
        aws.dynamoUpdate(this.gameTable, this.gameKey, "game_status", this.gameStatus);
    }

    /**
     * discussionデータ作成
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    async putDiscussion(): Promise<void> {
        Discussion.putDiscussion(this.gameId, this.day, this.timer);
    }

    /**
     * 残り時間取得
     *
     * @returns {Promise<string>}
     * @memberof Game
     */
    async getRemainingTime(): Promise<string> {
        const discussion: Discussion = await Discussion.createInstance(this.gameId, this.day);
        const remainingTime: string = await discussion.getRemainingTime();
        return remainingTime;
    }

    async putFirstVote(): Promise<void> {
        const indexes = await this.getUserIndexes();
        Vote.putVote(this.gameId, this.day, 1, indexes, indexes.length);
    }
}
