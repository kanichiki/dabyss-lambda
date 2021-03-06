import * as aws from "../clients/awsClient";
import { User } from "./User";
import { Discussion } from "./Discussion";
import { Vote } from "./Vote";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Action } from "./Action";

// インスタンス変数にしちゃうとstatic関数で参照できないから
const games: any = {
    "ワードウルフ": {
        minNumber: 2
    },
    "クレイジーノイジー": {
        minNumber: 2
    }
};

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
    winner: string;
    positionConfirmStatus: boolean[];
    positions: string[];

    discussion: Discussion;
    vote: Vote;
    action: Action;

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
        };
        this.userIds = [];
        this.day = -1;
        this.gameName = "";
        this.gameStatus = "";
        this.settingStatus = [];
        this.timer = "00:03:00";
        this.winner = "";
        this.positionConfirmStatus = [];
        this.positions = [];

        this.discussion = new Discussion(this.gameId, this.day);
        this.vote = new Vote(this.gameId);
        this.action = new Action(this.gameId, this.day);
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
        for (let gameName of Object.keys(games)) {
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
                        this.winner = game.winner as string;
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

    async getDisplayNamesExceptOneself(index: number): Promise<string[]> {
        let res: string[] = [];
        for (let i = 0; i < this.userIds.length; i++) {
            if (i != index) {
                const user: User = new User(this.userIds[i]);
                const displayName: string = await user.getDisplayName();
                res.push(displayName);
            }
        }
        return res;
    }

    async getUserIndexesExceptOneself(index: number): Promise<number[]> {
        let res: number[] = [];
        for (let i = 0; i < this.userIds.length; i++) {
            if (i != index) {
                res.push(i);
            }
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

    async getDisplayNamesFromIndexes(indexes: number[]): Promise<string[]> {
        const displayNames = await this.getDisplayNames();
        let res: string[] = [];
        for (const index of indexes) {
            res.push(displayNames[index]);
        }
        return res;
    }

    async getMinNumber(): Promise<number> {
        const minNumber: number = games[this.gameName]["minNumber"];
        return minNumber;
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
    async getUserIndexFromUserId(userId: string): Promise<number> {
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

    async updateSettingState(name: string, bool: boolean): Promise<void> {
        const settingIndex: number = await this.getSettingIndex(name);
        this.settingStatus[settingIndex] = bool;
        await aws.dynamoUpdate(this.gameTable, this.gameKey, "setting_status", this.settingStatus);
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
     * 設定がすべてfalseかどうかを取得
     *
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    async isAllSettingStatusFalse(): Promise<boolean> {
        const settingStatus: boolean[] = this.settingStatus;
        let res: boolean = true;
        for (let settingState of settingStatus) {
            if (settingState) {
                res = false;
            }
        }
        return res;
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

    async updateTimer(time: string): Promise<void> {
        this.timer = "00:" + time;
        aws.dynamoUpdate(this.gameTable, this.gameKey, "timer", this.timer);
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

    async setDiscussion(): Promise<void> {
        const discussion: Discussion = await Discussion.createInstance(this.gameId, this.day);
        this.discussion = discussion;
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

    async putRevote(): Promise<void> {
        const indexes = await this.vote.getMostPolledUserIndexes();
        const count = this.vote.count + 1;
        const userNumber = await this.getUserNumber();
        Vote.putVote(this.gameId, this.day, count, indexes, userNumber);
    }

    async setVote(): Promise<void> {
        const vote: Vote = await Vote.createInstance(this.gameId);
        this.vote = vote;
    }

    async updateWinner(winner: string): Promise<void> {
        this.winner = winner;
        aws.dynamoUpdate(this.gameTable, this.gameKey, "winner", this.winner);
    }

    async displayNameExists(name: string): Promise<boolean> {
        const displayNames: string[] = await this.getDisplayNames();
        let res: boolean = false;
        for (const displayName of displayNames) {
            if (displayName == name) {
                res = true;
                break;
            }
        }
        return res;
    }

    async updateDefaultPositionConfirmStatus(): Promise<void> {
        const userNumber: number = await this.getUserNumber();
        this.positionConfirmStatus = Array(userNumber).fill(false);
        aws.dynamoUpdate(this.gameTable, this.gameKey, "position_confirm_status", this.positionConfirmStatus);
    }

    async updatePositionConfirmState(index: number): Promise<void> {
        this.positionConfirmStatus[index] = true;
        aws.dynamoUpdate(this.gameTable, this.gameKey, "position_confirm_status", this.positionConfirmStatus);
    }

    async isPositionConfirmCompleted(): Promise<boolean> {
        let res: boolean = true;
        for (const state of this.positionConfirmStatus) {
            if (!state) {
                res = false;
                break;
            }
        }
        return res;
    }

    async setAction(): Promise<void> {
        const action: Action = await Action.createInstance(this.gameId, this.day);
        this.action = action;
    }

    async putZeroAction(): Promise<void> {
        const userNumber: number = await this.getUserNumber();
        const status: boolean[] = Array(userNumber).fill(false);
        Action.putAction(this.gameId, this.day, status);
    }


}
