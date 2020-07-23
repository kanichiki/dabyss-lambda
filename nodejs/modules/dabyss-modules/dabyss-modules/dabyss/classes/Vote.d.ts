import { DocumentClient } from "aws-sdk/clients/dynamodb";
/**
 * Voteクラス
 *
 * @export
 * @class Vote
 */
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
    /**
     * 最大得票数のユーザーが複数いるかどうかを返す
     *
     * @returns {Promise<boolean>}
     * @memberof Vote
     */
    multipleMostPolledUserExists(): Promise<boolean>;
    /**
     * 得票数が最も多いユーザーのインデックスを取得
     *
     * @returns {Promise<number>}
     * @memberof Vote
     */
    getMostPolledUserIndex(): Promise<number>;
    /**
     * 最大得票数を取得
     *
     * @returns {Promise<number>}
     * @memberof Vote
     */
    getMostPolledNumber(): Promise<number>;
    /**
     * 得票数が最大のユーザーを配列で取得
     *
     * @returns
     * @memberof Vote
     */
    getMostPolledUserIndexes(): Promise<number[]>;
    /**
     * 最大得票者の中からランダムで処刑者を選ぶ
     *
     * @returns
     * @memberof Vote
     */
    chooseExecutorRandomly(): Promise<number>;
}
