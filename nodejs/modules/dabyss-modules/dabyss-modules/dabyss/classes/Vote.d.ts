import { DocumentClient } from "aws-sdk/clients/dynamodb";
export declare class Vote {
    gameId: number;
    voteId: number;
    voteKey: DocumentClient.Key;
    day: number;
    count: number;
    candidateIndexes: number[];
    polledNumbers: number[];
    voteStatus: boolean[];
    /**
     * Creates an instance of Vote.
     *
     * @param {number} gameId
     * @memberof Vote
     */
    constructor(gameId: number);
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Vote
     */
    init(): Promise<void>;
    /**
     * Voteインスタンス作成
     *
     * @static
     * @param {number} gameId
     * @returns {Promise<Vote>}
     * @memberof Vote
     */
    static createInstance(gameId: number): Promise<Vote>;
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
    static putVote(gameId: number, day: number, count: number, candidateIndexes: number[], userNumber: number): Promise<void>;
    /**
     * userIndexが投票済みかどうかを
     *
     * @param {number} userIndex
     * @returns {Promise<boolean>}
     * @memberof Vote
     */
    isVotedUser(userIndex: number): Promise<boolean>;
    /**
     * userIndexが候補者かどうかを返す
     *
     * @param {number} userIndex
     * @returns {Promise<boolean>}
     * @memberof Vote
     */
    isUserCandidate(userIndex: number): Promise<boolean>;
    /**
     * userの投票ステータスを更新
     *
     * @param {number} userIndex
     * @returns {Promise<void>}
     * @memberof Vote
     */
    updateVoteState(userIndex: number): Promise<void>;
    /**
     * ユーザーの得票数を更新
     *
     * @param {number} userIndex
     * @returns {Promise<void>}
     * @memberof Vote
     */
    updatePolledNumber(userIndex: number): Promise<void>;
    /**
     * 投票に関する処理
     *
     * @param {number} voterIndex
     * @param {number} polledIndex
     * @returns {Promise<void>}
     * @memberof Vote
     */
    vote(voterIndex: number, polledIndex: number): Promise<void>;
    /**
     * 投票が完了しているかどうか
     *
     * @returns {Promise<boolean>}
     * @memberof Vote
     */
    isVoteCompleted(): Promise<boolean>;
    multipleMostPolledUserExists(): Promise<boolean>;
    getMostPolledUserIndex(): Promise<number>;
    getMostPolledNumber(): Promise<number>;
    getMostPolledUserIndexes(): Promise<number[]>;
    chooseExecutorRandomly(): Promise<number>;
}
