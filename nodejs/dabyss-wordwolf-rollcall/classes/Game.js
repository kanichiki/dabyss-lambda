const aws = require('../clients/awsClient');
const User = require("./User");

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
 * @class Game
 */
class Game {

    /**
     * Gameインスタンス作成
     * 
     * @constructor
     * @param {*} groupId
     * @memberof Game
     */

    constructor(groupId) {
        this.gameTable = "dabyss-dev-game";
        this.sequence = "dabyss-dev-sequence";
        this.settingNames = [];
        this.defaultSettingStatus = [];
        this.exists = true;

        this.groupId = groupId;
        this.gameId = -1;
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
     * @param {*} text
     * @returns Boolean
     * @memberof Game
     */
    static async gameNameExists(text) {
        let res = false;
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
     * @memberof Game
     */
    async init() {
        try {
            const data = await aws.dynamoQuery(this.gameTable, "group_id", this.groupId, false);
            if (data.Count > 0) {
                this.exists = true;
                const game = data.Items[0];
                this.gameId = game.game_id;
                this.userIds = game.user_ids;
                this.day = game.day;
                this.gameName = game.game_name;
                this.gameStatus = game.game_status;
                this.settingStatus = game.settingStatus;
                this.timer = game.timer;
            } else {
                this.exists = false;
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
     * @param {*} groupId
     * @returns Game Instance
     * @memberof Game
     */
    static async createInstance(groupId) {
        const game = new Game(groupId);
        await game.init();
        return game;
    }

    /**
     * ゲームデータ挿入
     *
     * @param {*} gameName
     * @memberof Game
     */
    async putGame(gameName) {
        try {
            const key = { name: this.gameTable };
            const data = await aws.dynamoGet(this.sequence, key);
            const gameId = data.Item.number + 1;
            const item = {
                group_id: this.groupId,
                game_id: gameId,
                user_ids: [],
                game_status: "setting",
                game_name: gameName,
                day: 0,
                timer: "00:03:00"
            }
            // groupデータをputできたらsequenceをプラス１
            aws.dynamoPut(this.gameTable, item).then(aws.dynamoUpdate(this.sequence, key, "number", gameId));
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * putとかupdateのためのkey
     *
     * @returns Object
     * @memberof Game
     */
    async getKey() {
        const key = {
            group_id: this.groupId,
            game_id: this.gameId
        }
        return key;
    }

    /**
     * 参加者の表示名の配列を取得
     *
     * @returns Array
     * @memberof Game
     */
    async getDisplayNames() {
        const userIds = this.userIds;
        let res = [];
        for (let userId of userIds) {
            const user = new User(userId);
            const displayName = await user.getDisplayName();
            res.push(displayName);
        }
        return res;
    }

    /**
     * 参加者追加
     *
     * @param {*} userId
     * @memberof Game
     */
    async appendUserId(userId) {
        const key = await this.getKey();
        aws.dynamoAppend(this.gameTable, key, "user_ids", userId);
    }

    /**
     * 与えられたuserIdが参加者リストに存在するか
     *
     * @param {*} userId
     * @returns Boolean
     * @memberof Game
     */
    async isUserExists(userId) {
        const userIds = this.userIds;
        let res = false;
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
     * @memberof Game
     */
    async deleteUsersGroupId() {
        const userIds = this.userIds;
        for (let userId of userIds) {
            const user = await User.createInstance(userId);
            const userGroupId = user.groupId;
            if (userGroupId == this.groupId) {
                user.deleteGroupId();
            }
        }
    }

    /**
     * 参加者数を取得
     *
     * @returns Number
     * @memberof Game
     */
    async getUserNumber() {
        const userIds = this.userIds;
        return userIds.length;
    }

    /**
     * 参加者数分の連続した整数の配列作る
     * 例: 4人の場合 [0,1,2,3]
     *
     * @returns Array
     * @memberof Game
     */
    async getUserIndexes() {
        const userNumber = await this.getUserNumber();
        let res = [];
        for (let i = 0; i < userNumber; i++) {
            res[i] = i;
        }
        return res;
    }

    /**
     * indexのuserIdを取得
     *
     * @param {*} index
     * @returns String
     * @memberof Game
     */
    async getUserId(index) {
        const userIds = this.userIds;
        return userIds[index];
    }

    /**
     * 与えられたuserIdから参加者リストのインデックスを取得
     *
     * @param {*} userId
     * @returns Number
     * @memberof Game
     */
    async getUserIndexFromUserId(userId) {
        const userIds = this.userIds();
        let index = -1;
        for (let i = 0; i < userIds.length; i++) {
            if (userIds[i] == userId) {
                index = i;
            }
        }
        return index;
    }

    async updateDefaultSettingStatus() {
        const key = await this.getKey();
        aws.dynamoUpdate(this.gameTable, key, "setting_status", this.defaultSettingStatus);
    }

    /**
     * nameに一致する設定名のインデックスを取得
     *
     * @param {*} name
     * @returns Number
     * @memberof Game
     */
    async getSettingIndex(name) {
        const settingNames = this.settingNames;
        let res = -1;
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
     * @param {*} index
     * @memberof Game
     */
    async updateSettingStateTrue(index) {
        const key = await this.getKey();
        this.settingStatus[index] = true;
        aws.dynamoUpdate(this.gameTable, this.key, setting_status, this.settingStatus);
    }

    /**
     * indexの設定ステータスをfalseに
     *
     * @param {*} index
     * @memberof Game
     */
    async updateSettingStateFalse(index) {
        const key = await this.getKey();
        this.settingStatus[index] = false;
        aws.dynamoUpdate(this.gameTable, this.key, setting_status, this.settingStatus);
    }

    /**
     * 設定が完了しているかどうかを返す
     *
     * @returns Boolean
     * @memberof Game
     */
    async isSettingCompleted() {
        const settingStatus = this.settingStatus;
        let res = true;
        for (let settingState of settingStatus) {
            if (!settingState) {
                res = false;
            }
        }
        return res;
    }
}

module.exports = Game;