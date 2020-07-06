import * as aws from "../clients/awsClient";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as commonFunction from '../template/functions/commonFunction';

const voteTable = "dabyss-dev-vote";
const sequenceTable = "dabyss-dev-sequence";

export class Vote {
    gameId: number;
    voteId: number;
    voteKey: DocumentClient.Key;
    day: number;
    count: number;
    candidateIndexes: number[];
    polledNumbers: number[];
    voteStatus: boolean[];

    constructor(gameId: number) {
        this.gameId = gameId;
        this.voteId = -1;
        this.voteKey = {
            game_id: this.gameId,
            vote_id: this.voteId
        }

        this.day = -1;
        this.count = -1;
        this.candidateIndexes = [];
        this.polledNumbers = [];
        this.voteStatus = [];
    }

    async init(): Promise<void> {
        try {
            const data: DocumentClient.QueryOutput = await aws.dynamoQuery(voteTable, "game_id", this.gameId, false);
            if (data.Count != undefined) {
                if (data.Count > 0) {
                    if (data.Items != undefined) {
                        const vote: DocumentClient.AttributeMap = data.Items[0];
                        this.voteId = vote.vote_id as number;
                        this.voteKey = {
                            game_id: this.gameId,
                            vote_id: this.voteId
                        }

                        this.day = vote.day as number;
                        this.count = vote.count as number;
                        this.candidateIndexes = vote.candidate_indexes as number[];
                        this.polledNumbers = vote.polled_numbers as number[];
                        this.voteStatus = vote.vote_status as boolean[];
                    }
                }
            }
        } catch (err) {
            console.error(err);
            console.error("discussionの初期化失敗");
        }
    }

    static async createInstance(gameId: number): Promise<Vote> {
        const vote: Vote = new Vote(gameId);
        await vote.init();
        return vote;
    }

    static async putVote(gameId: number, day: number, count: number, candidateIndexes: number[], userNumber: number): Promise<void> {
        try {
            const key: { name: string } = { name: voteTable };
            const data: DocumentClient.GetItemOutput = await aws.dynamoGet(sequenceTable, key);
            if (data.Item != undefined) {
                const voteId: number = data.Item.number + 1;
                const polledNumbers: number[] = new Array(userNumber).fill(0);
                const voteStatus: boolean[] = new Array(userNumber).fill(false);
                const item: DocumentClient.AttributeMap = {
                    game_id: gameId,
                    vote_id: voteId,
                    day: day,
                    count: count,
                    candidate_indexes: candidateIndexes,
                    polled_numbers: polledNumbers,
                    vote_status: voteStatus
                }
                // groupデータをputできたらsequenceをプラス１
                aws.dynamoPut(voteTable, item).then(await aws.dynamoUpdate(sequenceTable, key, "number", voteId));
            } else {
                throw new Error("sequenceのデータ取得失敗");
            }
        } catch (err) {
            console.log(err);
        }
    }

    async isVotedUser(userIndex: number): Promise<boolean> {
        let res: boolean = false;
        if (this.voteStatus[userIndex]) {
            res = true;
        }
        return res;
    }

    async isUserCandidate(userIndex: number): Promise<boolean> {
        let res: boolean = false;
        for (const candidateIndex of this.candidateIndexes) {
            if (candidateIndex == userIndex) {
                res = true;
                break;
            }
        }
        return res;
    }

    async updateVoteState(userIndex: number): Promise<void> {
        this.voteStatus[userIndex] = true;
        aws.dynamoUpdate(voteTable, this.voteKey, "vote_status", this.voteStatus);
    }

    async updatePolledNumber(userIndex: number): Promise<void> {
        this.polledNumbers[userIndex] += 1;
        aws.dynamoUpdate(voteTable, this.voteKey, "polled_number", this.polledNumbers);
    }

    async vote(voterIndex: number, polledIndex: number): Promise<void> {
        await this.updateVoteState(voterIndex).then(() => this.updatePolledNumber(polledIndex));
    }

}