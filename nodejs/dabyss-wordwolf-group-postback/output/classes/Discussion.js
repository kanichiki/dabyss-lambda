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
const commonFunction = require("../template/functions/commonFunction");
class Discussion {
    /**
     * Creates an instance of Discussion.
     * @param {number} gameId
     * @param {number} day
     * @memberof Discussion
     */
    constructor(gameId, day) {
        this.discussionTable = "dabyss-dev-discussion";
        this.exists = false;
        this.gameId = gameId;
        this.day = day;
        this.discussionKey = {
            game_id: this.gameId,
            day: this.day
        };
        this.timer = "";
        this.startTime = "";
        this.endTime = "";
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield aws.dynamoGet(this.discussionTable, this.discussionKey);
                if (data.Item != undefined) {
                    this.exists = true;
                    const discussion = data.Item;
                    this.timer = discussion.timer;
                    this.startTime = discussion.start_time;
                    this.endTime = discussion.end_time;
                }
            }
            catch (err) {
                console.error(err);
                console.error("discussionの初期化失敗");
            }
        });
    }
    static createInstance(gameId, day) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = new Discussion(gameId, day);
            yield discussion.init();
            return discussion;
        });
    }
    static putDiscussion(gameId, day, timer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startTime = yield commonFunction.getCurrentTime();
                const endTime = yield commonFunction.getEndTime(startTime, timer);
                const item = {
                    game_id: gameId,
                    day: day,
                    timer: timer,
                    start_time: startTime,
                    end_time: endTime
                };
                aws.dynamoPut("dabyss-dev-discussion", item);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    getRemainingTime() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.endTime);
            const remainingTime = yield commonFunction.getRemainingTime(this.endTime);
            const remainingTimeString = yield commonFunction.convertIntervalToTimerString(remainingTime);
            return remainingTimeString;
        });
    }
}
exports.Discussion = Discussion;
