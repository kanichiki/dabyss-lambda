const aws = require('../clients/awsClient');
const line = require('../clients/lineClient');

class User {


    /**
     *Creates an instance of User.
     * 
     * テーブル構造は以下の通り
     * @param {*} userId : userId
     * pl_id : 参加中の参加者リストid。ゲーム終了時に削除するようにする
     * is_restarting : pl_idがあるときに他のゲームに参加しようとしたら確認をするが、その保留ステータス
     */

    constructor(userId) {
        this.userTable = "dabyss-dev-user";
        this.userId = userId;
        this.exists = true;
        this.groupId = "";
        this.isRestarting = false;
    }

    async init() {
        const data = await aws.dynamoQuery(this.userTable, "user_id", this.userId, false);
        if (data.Count > 0) {
            this.exists = true;
            const user = data.Items[0];
            this.groupId = user.group_id;
            this.isRestarting = user.is_restarting;
        } else {
            this.exists = false;
        }
    }

    static async createInstance(userId) {
        const user = new User(userId);
        await user.init();
        return user;
    }

    async getKey() {
        const key = {
            user_id: this.userId
        }
        return key;
    }

    async getUser() {
        const key = await this.getKey();
        const data = await aws.dynamoGet(this.userTable, key);
        return data.Item;
    }



    /**
     * ユーザーデータがあるかどうか
     *
     * @returns
     */
    async existsUser() {
        const data = await aws.dynamoQuery(this.userTable, "user_id", this.userId, false);
        let res = false;
        if (data.Count > 0) {
            res = true;
        }
        return res;
    }

    /**
     * group_idを持ってるかどうか
     *
     * @returns
     */
    async hasGroupId() {
        let res = true;
        if (this.groupId == "") {
            res = false;
        }
        return res;
    }



    /**
     * 与えられたgroupIdとユーザーのgroupIdが一致するか否か
     *
     * @param {*} groupId
     * @returns
     */
    async isMatchGroupId(groupId) {
        const currentGroupId = this.groupId;
        let res = false;
        if (groupId == currentGroupId) {
            res = true;
        }
        return res;
    }

    /**
     * ユーザーデータ挿入
     *
     * @param {*} groupId
     */
    async putUser(groupId) {
        const item = {
            user_id: this.userId,
            group_id: groupId,
            is_restarting: false
        }
        aws.dynamoPut(this.userTable, item);
    }

    /**
     * group_idを削除する（emptyにする）
     *
     */
    async deleteGroupId() {
        const key = await this.getKey();
        aws.dynamoUpdate(this.userTable, key, "group_id", "");
    }

    async updateIsRestartingTrue() {
        const key = await this.getKey();
        aws.dynamoUpdate(this.userTable, key, "is_restarting", true);
    }

    async updateIsRestartingFalse() {
        const key = await this.getKey();
        aws.dynamoUpdate(this.userTable, key, "is_restarting", false);
    }

    /**
     * 表示名を返す
     *
     * @returns
     */
    async getDisplayName() {
        const profile = await line.getProfile(this.userId);
        const displayName = profile.displayName;
        return displayName;
    }

}

module.exports = User;