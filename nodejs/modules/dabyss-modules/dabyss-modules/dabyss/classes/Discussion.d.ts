import { DocumentClient } from "aws-sdk/clients/dynamodb";
/**
 * ディスカッションクラス
 * 話し合いに関するクラス
 *
 * @export
 * @class Discussion
 */
export declare class Discussion {
    discussionTable: string;
    gameId: number;
    day: number;
    discussionKey: DocumentClient.Key;
    groupId: string;
    timer: string;
    startTime: string;
    endTime: string;
    isDiscussing: string;
    /**
     * ディスカッションクラスのコンストラクタ
     * @param {number} gameId
     * @param {number} day
     * @param {string} groupId
     * @memberof Discussion
     */
    constructor(gameId: number, day: number, groupId: string);
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Discussion
     */
    init(): Promise<void>;
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
    static createInstance(gameId: number, day: number, groupId: string): Promise<Discussion>;
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
    static putDiscussion(gameId: number, day: number, groupId: string, timer: string): Promise<void>;
    /**
     * 残り時間を「○分✖︎✖︎秒」の形で取得
     *
     * @returns {Promise<string>}
     * @memberof Discussion
     */
    getRemainingTime(): Promise<string>;
    /**
     * 議論中ステータスをfalseに
     *
     * @returns {Promise<void>}
     * @memberof Discussion
     */
    updateIsDiscussingFalse(): Promise<void>;
}
