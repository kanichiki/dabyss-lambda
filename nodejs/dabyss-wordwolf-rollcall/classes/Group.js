const aws = require('../clients/awsClient');
const Game = require('./Game');

class Group {

    /**
     * 参加者リスト
     * Creates an instance of Group.
     * 
     */
    constructor(groupId) {
        this.groupTable = "dabyss-dev-group";
        this.groupId = groupId;
        this.exists = true;
        this.status = "";
        this.isRestarting = false;
        this.isFinishing = false;
    }

    async init() {
        const data = await aws.dynamoQuery(this.groupTable, "group_id", this.groupId, false);
        if (data.Count > 0) {
            this.exists = true;
            const group = data.Items[0];
            this.status = group.status;
            this.isRestarting = group.is_restarting;
            this.isFinishing = group.is_finishing;
        } else {
            this.exists = false;
        }
    }

    static async createInstance(groupId) {
        const group = new Group(groupId);
        await group.init();
        return group;
    }

    /**
     * putやupdateのためのKey
     *
     * @returns
     */
    async getKey() {
        const key = {
            group_id: this.groupId
        }
        return key;
    }

    /**
     * groupを作成
     *
     * @returns
     */

    async putGroup() {
        try {
            const item = {
                group_id: this.groupId,
                status: "recruit",
                is_restarting: false,
                is_finishing: false
            }
            // groupデータをputできたらsequenceをプラス１
            aws.dynamoPut(this.groupTable, item);
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * ステータスを更新
     *
     * @param {*} status
     */
    async updateStatus(status) {
        const key = await this.getKey();
        aws.dynamoUpdate(this.groupTable, key, "status", status);
        this.status = status;
    }

    async updateIsRestartingTrue() {
        const key = await this.getKey();
        aws.dynamoUpdate(this.groupTable, key, "is_restarting", true);
        this.isRestarting = true;
    }

    async updateIsRestartingFalse() {
        try {
            const key = await this.getKey();
            aws.dynamoUpdate(this.groupTable, key, "is_restarting", false);
            this.isRestarting = false;
        } catch (err) {
            console.log(err);
            console.log("グループのリスタート状態をfalseにできませんでした");
        }
    }

    async updateIsFinishingTrue() {
        const key = await this.getKey();
        aws.dynamoUpdate(this.groupTable, key, "is_finishing", true);
        this.isFinishing = true;
    }

    async updateIsFinishingFalse() {
        const key = await this.getKey();
        aws.dynamoUpdate(this.groupTable, key, "is_finishing", false);
        this.isFinishing = false;
    }

    /**
     * 全部終わらせる
     * 全部falseにする
     * ただし、ユーザーに関してはまだ参加中が該当のgroupIdのときのみ
     *
     * @param {*} plId
     */
    async finishGroup() {
        this.updateStatus("finish");
        this.updateIsRestartingFalse();
        this.updateIsFinishingFalse();

        const game = await Game.createInstance(this.groupId);
        game.deleteUsersGroupId();
    }


}

module.exports = Group;