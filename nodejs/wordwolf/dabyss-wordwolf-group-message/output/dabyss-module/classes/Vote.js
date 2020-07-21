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
exports.Vote = void 0;
const aws = require("../clients/awsClient");
const voteTable = "dabyss-dev-vote";
const sequenceTable = "dabyss-dev-sequence";
class Vote {
    /**
     * Creates an instance of Vote.
     *
     * @param {number} gameId
     * @memberof Vote
     */
    constructor(gameId) {
        this.gameId = gameId;
        this.voteId = -1;
        this.voteKey = {
            game_id: this.gameId,
            vote_id: this.voteId
        };
        this.day = -1;
        this.count = -1;
        this.candidateIndexes = [];
        this.polledNumbers = [];
        this.voteStatus = [];
    }
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Vote
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield aws.dynamoQuery(voteTable, "game_id", this.gameId, false);
                if (data.Count != undefined) {
                    if (data.Count > 0) {
                        if (data.Items != undefined) {
                            const vote = data.Items[0];
                            this.voteId = vote.vote_id;
                            this.voteKey = {
                                game_id: this.gameId,
                                vote_id: this.voteId
                            };
                            this.day = vote.day;
                            this.count = vote.count;
                            this.candidateIndexes = vote.candidate_indexes;
                            this.polledNumbers = vote.polled_numbers;
                            this.voteStatus = vote.vote_status;
                        }
                    }
                }
            }
            catch (err) {
                console.error(err);
                console.error("discussionの初期化失敗");
            }
        });
    }
    /**
     * Voteインスタンス作成
     *
     * @static
     * @param {number} gameId
     * @returns {Promise<Vote>}
     * @memberof Vote
     */
    static createInstance(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vote = new Vote(gameId);
            yield vote.init();
            return vote;
        });
    }
    /**
     * Voteデータ追加
     *
     * @static
     * @param {number} gameId
     * @param {number} day
     * @param {number} count
     * @param {number[]} candidateIndexes
     * @param {number} userNumber
     * @returns {Promise<void>}
     * @memberof Vote
     */
    static putVote(gameId, day, count, candidateIndexes, userNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const key = { name: voteTable };
                const data = yield aws.dynamoGet(sequenceTable, key);
                if (data.Item != undefined) {
                    const voteId = data.Item.number + 1;
                    const polledNumbers = new Array(userNumber).fill(0);
                    const voteStatus = new Array(userNumber).fill(false);
                    const item = {
                        game_id: gameId,
                        vote_id: voteId,
                        day: day,
                        count: count,
                        candidate_indexes: candidateIndexes,
                        polled_numbers: polledNumbers,
                        vote_status: voteStatus
                    };
                    // groupデータをputできたらsequenceをプラス１
                    aws.dynamoPut(voteTable, item).then(yield aws.dynamoUpdate(sequenceTable, key, "number", voteId));
                }
                else {
                    throw new Error("sequenceのデータ取得失敗");
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    /**
     * userIndexが投票済みかどうかを
     *
     * @param {number} userIndex
     * @returns {Promise<boolean>}
     * @memberof Vote
     */
    isVotedUser(userIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = false;
            if (this.voteStatus[userIndex]) {
                res = true;
            }
            return res;
        });
    }
    /**
     * userIndexが候補者かどうかを返す
     *
     * @param {number} userIndex
     * @returns {Promise<boolean>}
     * @memberof Vote
     */
    isUserCandidate(userIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = false;
            for (const candidateIndex of this.candidateIndexes) {
                if (candidateIndex == userIndex) {
                    res = true;
                    break;
                }
            }
            return res;
        });
    }
    /**
     * userの投票ステータスを更新
     *
     * @param {number} userIndex
     * @returns {Promise<void>}
     * @memberof Vote
     */
    updateVoteState(userIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voteStatus[userIndex] = true;
            aws.dynamoUpdate(voteTable, this.voteKey, "vote_status", this.voteStatus);
        });
    }
    /**
     * ユーザーの得票数を更新
     *
     * @param {number} userIndex
     * @returns {Promise<void>}
     * @memberof Vote
     */
    updatePolledNumber(userIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            this.polledNumbers[userIndex] += 1;
            console.log(this.polledNumbers);
            aws.dynamoUpdate(voteTable, this.voteKey, "polled_numbers", this.polledNumbers);
        });
    }
    /**
     * 投票に関する処理
     *
     * @param {number} voterIndex
     * @param {number} polledIndex
     * @returns {Promise<void>}
     * @memberof Vote
     */
    vote(voterIndex, polledIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateVoteState(voterIndex);
            this.updatePolledNumber(polledIndex);
        });
    }
    /**
     * 投票が完了しているかどうか
     *
     * @returns {Promise<boolean>}
     * @memberof Vote
     */
    isVoteCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = true;
            for (const state of this.voteStatus) {
                if (!state) {
                    res = false;
                    break;
                }
            }
            return res;
        });
    }
    multipleMostPolledUserExists() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = false;
            let max = -1;
            for (let voteNumber of this.polledNumbers) {
                if (voteNumber > max) {
                    max = voteNumber;
                    res = false;
                }
                else if (voteNumber == max) {
                    res = true;
                    break;
                }
            }
            return res;
        });
    }
    getMostPolledUserIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = -1;
            let max = -1;
            for (let i = 0; i < this.polledNumbers.length; i++) {
                if (this.polledNumbers[i] > max) {
                    max = this.polledNumbers[i];
                    res = i;
                }
            }
            return res;
        });
    }
    getMostPolledNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const number = Math.max.apply(null, this.polledNumbers);
            return number;
        });
    }
    getMostPolledUserIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            const mostPolledNumber = yield this.getMostPolledNumber();
            let indexes = [];
            for (let i = 0; i < this.polledNumbers.length; i++) {
                if (this.polledNumbers[i] == mostPolledNumber) {
                    indexes.push(i);
                }
            }
            return indexes;
        });
    }
    chooseExecutorRandomly() {
        return __awaiter(this, void 0, void 0, function* () {
            const userIndexes = yield this.getMostPolledUserIndexes();
            const index = Math.floor(Math.random() * userIndexes.length); // これは返さない
            return userIndexes[index];
        });
    }
}
exports.Vote = Vote;
