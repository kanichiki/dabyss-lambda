const aws = require('../clients/awsClient');
const User = require("./User");

const gameNames = ["ワードウルフ"];

class Game {
    constructor(groupId) {
        ;
        this.gameTable = "dabyss-dev-game";
        this.sequence = "dabyss-dev-sequence";
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

    static async gameNameExists(text) {
        let res = false;
        for (let gameName of gameNames) {
            if (text == gameName) {
                res = true;
            }
        }
        return res;
    }

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
                this.settingStatus = game.setting_status;
                this.timer = game.timer;
            } else {
                this.exists = false;
            }
        } catch (err) {
            console.error(err);
            console.error("gameの初期化失敗");
        }
    }

    static async createInstance(groupId) {
        const game = new Game(groupId);
        await game.init();
        return game;
    }

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

    async getKey() {
        const key = {
            group_id: this.groupId,
            game_id: this.gameId
        }
        return key;
    }

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

    async appendUserId(userId) {
        const key = await this.getKey();
        aws.dynamoAppend(this.gameTable, key, "user_ids", userId);
    }

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

    async getUserNumber() {
        const userIds = this.userIds;
        return userIds.length;
    }

    async getUserIndexes() {
        const userNumber = await this.getUserNumber();
        let res = [];
        for (let i = 0; i < userNumber; i++) {
            res[i] = i;
        }
        return res;
    }

    async getUserId(index) {
        const userIds = this.userIds;
        return userIds[index];
    }

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
}

module.exports = Game;