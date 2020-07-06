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
    static createInstance(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vote = new Vote(gameId);
            yield vote.init();
            return vote;
        });
    }
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
}
exports.Vote = Vote;
