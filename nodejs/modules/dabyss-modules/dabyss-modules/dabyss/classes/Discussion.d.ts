import { DocumentClient } from "aws-sdk/clients/dynamodb";
export declare class Discussion {
    discussionTable: string;
    gameId: number;
    day: number;
    discussionKey: DocumentClient.Key;
    timer: string;
    startTime: string;
    endTime: string;
    /**
     * Creates an instance of Discussion.
     * @param {number} gameId
     * @param {number} day
     * @memberof Discussion
     */
    constructor(gameId: number, day: number);
    init(): Promise<void>;
    static createInstance(gameId: number, day: number): Promise<Discussion>;
    static putDiscussion(gameId: number, day: number, timer: string): Promise<void>;
    getRemainingTime(): Promise<string>;
}
