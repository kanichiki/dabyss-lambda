"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const aws = require("../clients/awsClient");
const User_1 = require("./User");
const Discussion_1 = require("./Discussion");
const Vote_1 = require("./Vote");
const Action_1 = require("./Action");
// インスタンス変数にしちゃうとstatic関数で参照できないから
const games = {
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
class Game {
    /**
     * Gameインスタンス作成
     *
     * @constructor
     * @param {string} groupId
     * @memberof Game
     */
    constructor(groupId) {
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
        this.discussion = new Discussion_1.Discussion(this.gameId, this.day);
        this.vote = new Vote_1.Vote(this.gameId);
        this.action = new Action_1.Action(this.gameId, this.day);
    }
    /**
     * ゲームの名前が存在するかどうかを返す
     *
     * @static
     * @param {string} text
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    static gameNameExists(text) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = false;
            for (let gameName of Object.keys(games)) {
                if (text == gameName) {
                    res = true;
                }
            }
            return res;
        });
    }
    /**
     * ゲームデータを引っ張ってきてそれぞれインスタンス変数に代入
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield aws.dynamoQuery(this.gameTable, "group_id", this.groupId, false);
                if (data.Count != undefined) {
                    if (data.Count > 0) {
                        this.exists = true;
                        if (data.Items != undefined) {
                            const game = data.Items[0];
                            this.gameId = game.game_id;
                            this.gameKey = {
                                group_id: this.groupId,
                                game_id: this.gameId
                            };
                            this.userIds = game.user_ids;
                            this.day = game.day;
                            this.gameName = game.game_name;
                            this.gameStatus = game.game_status;
                            this.settingStatus = game.setting_status;
                            this.timer = game.timer;
                            this.winner = game.winner;
                        }
                    }
                }
            }
            catch (err) {
                console.error(err);
                console.error("gameの初期化失敗");
            }
        });
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
    static createInstance(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = new Game(groupId);
            yield game.init();
            return game;
        });
    }
    /**
     * ゲームデータ挿入
     *
     * @param {string} gameName
     * @returns {Promise<void>}
     * @memberof Game
     */
    putGame(gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const key = { name: this.gameTable };
                const data = yield aws.dynamoGet(this.sequence, key);
                if (data.Item != undefined) {
                    this.gameId = data.Item.number + 1;
                }
                const item = {
                    group_id: this.groupId,
                    game_id: this.gameId,
                    user_ids: [],
                    game_status: "setting",
                    game_name: gameName,
                    day: 0,
                    timer: "00:03:00"
                };
                // groupデータをputできたらsequenceをプラス１
                aws.dynamoPut(this.gameTable, item).then(yield aws.dynamoUpdate(this.sequence, key, "number", this.gameId));
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    /**
     * 参加者の表示名の配列を取得
     *
     * @returns {Promise<string[]>}
     * @memberof Game
     */
    getDisplayNames() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = [];
            for (let userId of this.userIds) {
                const user = new User_1.User(userId);
                const displayName = yield user.getDisplayName();
                res.push(displayName);
            }
            return res;
        });
    }
    getDisplayNamesExceptOneself(index) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = [];
            for (let i = 0; i < this.userIds.length; i++) {
                if (i != index) {
                    const user = new User_1.User(this.userIds[i]);
                    const displayName = yield user.getDisplayName();
                    res.push(displayName);
                }
            }
            return res;
        });
    }
    getUserIndexesExceptOneself(index) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = [];
            for (let i = 0; i < this.userIds.length; i++) {
                if (i != index) {
                    res.push(i);
                }
            }
            return res;
        });
    }
    /**
     * indexの参加者の表示名を取得
     *
     * @param {number} index
     * @returns {Promise<string>}
     * @memberof Game
     */
    getDisplayName(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayNames = yield this.getDisplayNames();
            return displayNames[index];
        });
    }
    getDisplayNamesFromIndexes(indexes) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayNames = yield this.getDisplayNames();
            let res = [];
            for (const index of indexes) {
                res.push(displayNames[index]);
            }
            return res;
        });
    }
    getMinNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const minNumber = games[this.gameName]["minNumber"];
            return minNumber;
        });
    }
    /**
     * 参加者追加
     *
     * @param {string} userId
     * @returns {Promise<void>}
     * @memberof Game
     */
    appendUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            aws.dynamoAppend(this.gameTable, this.gameKey, "user_ids", userId);
        });
    }
    /**
     * 与えられたuserIdが参加者リストに存在するか
     *
     * @param {string} userId
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    isUserExists(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userIds = this.userIds;
            let res = false;
            for (const id of userIds) {
                if (userId == id) {
                    res = true;
                }
            }
            return res;
        });
    }
    /**
     * 参加者のデータのgroup_idを空文字にする
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    deleteUsersGroupId() {
        return __awaiter(this, void 0, void 0, function* () {
            const userIds = this.userIds;
            for (let userId of userIds) {
                const user = yield User_1.User.createInstance(userId);
                const userGroupId = user.groupId;
                if (userGroupId == this.groupId) {
                    user.deleteGroupId();
                }
            }
        });
    }
    /**
     * 参加者数を取得
     *
     * @returns {Promise<number>}
     * @memberof Game
     */
    getUserNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userIds.length;
        });
    }
    /**
     * 参加者数分の連続した整数の配列作る
     * 例: 4人の場合 [0,1,2,3]
     *
     * @returns {Promise<number[]>}
     * @memberof Game
     */
    getUserIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            let res = [];
            for (let i = 0; i < userNumber; i++) {
                res[i] = i;
            }
            return res;
        });
    }
    /**
     * indexのuserIdを取得
     *
     * @param {number} index
     * @returns {Promise<string>}
     * @memberof Game
     */
    getUserId(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userIds[index];
        });
    }
    /**
     * 与えられたuserIdから参加者リストのインデックスを取得
     *
     * @param {string} userId
     * @returns {Promise<Number>}
     * @memberof Game
     */
    getUserIndexFromUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userIds = this.userIds;
            let index = -1;
            for (let i = 0; i < userIds.length; i++) {
                if (userIds[i] == userId) {
                    index = i;
                }
            }
            return index;
        });
    }
    /**
     * デフォルトの設定ステータスにする
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateDefaultSettingStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settingStatus = this.defaultSettingStatus;
            aws.dynamoUpdate(this.gameTable, this.gameKey, "setting_status", this.settingStatus);
        });
    }
    /**
     * nameに一致する設定名のインデックスを取得
     *
     * @param {string} name
     * @returns {Promise<number>}
     * @memberof Game
     */
    getSettingIndex(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const settingNames = this.settingNames;
            let res = -1;
            for (let i = 0; i < settingNames.length; i++) {
                if (settingNames[i] == name) {
                    res = i;
                }
            }
            return res;
        });
    }
    updateSettingState(name, bool) {
        return __awaiter(this, void 0, void 0, function* () {
            const settingIndex = yield this.getSettingIndex(name);
            this.settingStatus[settingIndex] = bool;
            yield aws.dynamoUpdate(this.gameTable, this.gameKey, "setting_status", this.settingStatus);
        });
    }
    /**
     * indexの設定ステータスをtrueに
     *
     * @param {number} index
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateSettingStateTrue(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.settingStatus[index] = true;
            console.log(this.settingStatus);
            yield aws.dynamoUpdate(this.gameTable, this.gameKey, "setting_status", this.settingStatus);
        });
    }
    /**
     * indexの設定ステータスをfalseに
     *
     * @param {number} index
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateSettingStateFalse(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.settingStatus[index] = false;
            aws.dynamoUpdate(this.gameTable, this.gameKey, "setting_status", this.settingStatus);
        });
    }
    /**
     * 設定がすべてfalseかどうかを取得
     *
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    isAllSettingStatusFalse() {
        return __awaiter(this, void 0, void 0, function* () {
            const settingStatus = this.settingStatus;
            let res = true;
            for (let settingState of settingStatus) {
                if (settingState) {
                    res = false;
                }
            }
            return res;
        });
    }
    /**
     * 設定が完了しているかどうかを返す
     *
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    isSettingCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            const settingStatus = this.settingStatus;
            let res = true;
            for (let settingState of settingStatus) {
                if (!settingState) {
                    res = false;
                }
            }
            return res;
        });
    }
    /**
     * タイマー情報を"○時間✖︎分△秒の形で返す"
     *
     * @returns {Promise<string>}
     * @memberof Game
     */
    getTimerString() {
        return __awaiter(this, void 0, void 0, function* () {
            const timer = this.timer;
            const timerArray = timer.split(":");
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
        });
    }
    updateTimer(time) {
        return __awaiter(this, void 0, void 0, function* () {
            this.timer = "00:" + time;
            aws.dynamoUpdate(this.gameTable, this.gameKey, "timer", this.timer);
        });
    }
    /**
     * ゲームのステータスを更新
     *
     * @param {string} status
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateGameStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gameStatus = status;
            aws.dynamoUpdate(this.gameTable, this.gameKey, "game_status", this.gameStatus);
        });
    }
    /**
     * discussionデータ作成
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    putDiscussion() {
        return __awaiter(this, void 0, void 0, function* () {
            Discussion_1.Discussion.putDiscussion(this.gameId, this.day, this.timer);
        });
    }
    setDiscussion() {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield Discussion_1.Discussion.createInstance(this.gameId, this.day);
            this.discussion = discussion;
        });
    }
    /**
     * 残り時間取得
     *
     * @returns {Promise<string>}
     * @memberof Game
     */
    getRemainingTime() {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield Discussion_1.Discussion.createInstance(this.gameId, this.day);
            const remainingTime = yield discussion.getRemainingTime();
            return remainingTime;
        });
    }
    putFirstVote() {
        return __awaiter(this, void 0, void 0, function* () {
            const indexes = yield this.getUserIndexes();
            Vote_1.Vote.putVote(this.gameId, this.day, 1, indexes, indexes.length);
        });
    }
    putRevote() {
        return __awaiter(this, void 0, void 0, function* () {
            const indexes = yield this.vote.getMostPolledUserIndexes();
            const count = this.vote.count + 1;
            const userNumber = yield this.getUserNumber();
            Vote_1.Vote.putVote(this.gameId, this.day, count, indexes, userNumber);
        });
    }
    setVote() {
        return __awaiter(this, void 0, void 0, function* () {
            const vote = yield Vote_1.Vote.createInstance(this.gameId);
            this.vote = vote;
        });
    }
    updateWinner(winner) {
        return __awaiter(this, void 0, void 0, function* () {
            this.winner = winner;
            aws.dynamoUpdate(this.gameTable, this.gameKey, "winner", this.winner);
        });
    }
    displayNameExists(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayNames = yield this.getDisplayNames();
            let res = false;
            for (const displayName of displayNames) {
                if (displayName == name) {
                    res = true;
                    break;
                }
            }
            return res;
        });
    }
    updateDefaultPositionConfirmStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            this.positionConfirmStatus = Array(userNumber).fill(false);
            aws.dynamoUpdate(this.gameTable, this.gameKey, "position_confirm_status", this.positionConfirmStatus);
        });
    }
    updatePositionConfirmState(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.positionConfirmStatus[index] = true;
            aws.dynamoUpdate(this.gameTable, this.gameKey, "position_confirm_status", this.positionConfirmStatus);
        });
    }
    isPositionConfirmCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = true;
            for (const state of this.positionConfirmStatus) {
                if (!state) {
                    res = false;
                    break;
                }
            }
            return res;
        });
    }
    setAction() {
        return __awaiter(this, void 0, void 0, function* () {
            const action = yield Action_1.Action.createInstance(this.gameId, this.day);
            this.action = action;
        });
    }
    putZeroAction() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            const status = Array(userNumber).fill(false);
            Action_1.Action.putAction(this.gameId, this.day, status);
        });
    }
}
exports.Game = Game;
