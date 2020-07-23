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
exports.Discussion = void 0;
const aws = require("../clients/awsClient");
const commonFunction = require("../functions/commonFunction");
/**
 * ディスカッションクラス
 * 話し合いに関するクラス
 *
 * @export
 * @class Discussion
 */
class Discussion {
    /**
     * ディスカッションクラスのコンストラクタ
     * @param {number} gameId
     * @param {number} day
     * @param {string} groupId
     * @memberof Discussion
     */
    constructor(gameId, day, groupId) {
        this.discussionTable = "dabyss-dev-discussion";
        this.gameId = gameId;
        this.day = day;
        this.discussionKey = {
            game_id: this.gameId,
            day: this.day
        };
        this.groupId = groupId;
        this.timer = "";
        this.startTime = "";
        this.endTime = "";
        this.isDiscussing = "";
    }
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Discussion
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield aws.dynamoGet(this.discussionTable, this.discussionKey);
                if (data.Item != undefined) {
                    const discussion = data.Item;
                    this.timer = discussion.timer;
                    this.startTime = discussion.start_time;
                    this.endTime = discussion.end_time;
                    this.isDiscussing = discussion.is_discussing;
                }
                else {
                    throw new Error("Disucussionデータが見つかりません");
                }
            }
            catch (err) {
                console.error(err);
                console.error("discussionの初期化失敗");
            }
        });
    }
    /**
     * ディスカッションクラスのインスタンス作成
     *
     * @static
     * @param {number} gameId
     * @param {number} day
     * @param {string} groupId
     * @returns {Promise<Discussion>}
     * @memberof Discussion
     */
    static createInstance(gameId, day, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = new Discussion(gameId, day, groupId);
            yield discussion.init();
            return discussion;
        });
    }
    /**
     * ディスカッションのデータ挿入
     *
     * @static
     * @param {number} gameId
     * @param {number} day
     * @param {string} groupId
     * @param {string} timer
     * @returns {Promise<void>}
     * @memberof Discussion
     */
    static putDiscussion(gameId, day, groupId, timer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startTime = yield commonFunction.getCurrentTime();
                const endTime = yield commonFunction.getEndTime(startTime, timer);
                const item = {
                    game_id: gameId,
                    day: day,
                    group_id: groupId,
                    timer: timer,
                    start_time: startTime,
                    end_time: endTime,
                    is_discussing: "discussing"
                };
                aws.dynamoPut("dabyss-dev-discussion", item);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    /**
     * 残り時間を「○分✖︎✖︎秒」の形で取得
     *
     * @returns {Promise<string>}
     * @memberof Discussion
     */
    getRemainingTime() {
        return __awaiter(this, void 0, void 0, function* () {
            const remainingTime = yield commonFunction.getRemainingTime(this.endTime);
            const remainingTimeString = yield commonFunction.convertIntervalToTimerString(remainingTime);
            return remainingTimeString;
        });
    }
    /**
     * 議論中ステータスをfalseに
     *
     * @returns {Promise<void>}
     * @memberof Discussion
     */
    updateIsDiscussingFalse() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isDiscussing = "none";
            aws.dynamoUpdate(this.discussionTable, this.discussionKey, "is_discussing", this.isDiscussing);
        });
    }
}
exports.Discussion = Discussion;
