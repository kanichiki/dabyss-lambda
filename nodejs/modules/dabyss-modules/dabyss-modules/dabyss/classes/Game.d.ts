import { Discussion } from "./Discussion";
import { Vote } from "./Vote";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Action } from "./Action";
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
export declare class Game {
    gameTable: string;
    sequence: string;
    settingNames: string[];
    defaultSettingStatus: boolean[];
    exists: boolean;
    groupId: string;
    gameId: number;
    gameKey: DocumentClient.Key;
    userIds: string[];
    day: number;
    gameName: string;
    gameStatus: string;
    settingStatus: boolean[];
    timer: string;
    winner: string;
    positionConfirmStatus: boolean[];
    positions: string[];
    discussion: Discussion;
    vote: Vote;
    action: Action;
    /**
     * Gameインスタンス作成
     *
     * @constructor
     * @param {string} groupId
     * @memberof Game
     */
    constructor(groupId: string);
    /**
     * ゲームの名前が存在するかどうかを返す
     *
     * @static
     * @param {string} text
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    static gameNameExists(text: string): Promise<boolean>;
    /**
     * ゲームデータを引っ張ってきてそれぞれインスタンス変数に代入
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    init(): Promise<void>;
    /**
     * Gameインスタンスを作る
     * constructorでasyncが使えないので。
     *
     * @static
     * @param {string} groupId
     * @returns {Promise<Game>}
     * @memberof Game
     */
    static createInstance(groupId: string): Promise<Game>;
    /**
     * ゲームデータ挿入
     *
     * @param {string} gameName
     * @returns {Promise<void>}
     * @memberof Game
     */
    putGame(gameName: string): Promise<void>;
    updateDay(): Promise<void>;
    /**
     * 参加者の表示名の配列を取得
     *
     * @returns {Promise<string[]>}
     * @memberof Game
     */
    getDisplayNames(): Promise<string[]>;
    getDisplayNamesExceptOneself(index: number): Promise<string[]>;
    getUserIndexesExceptOneself(index: number): Promise<number[]>;
    existsUserIndexExceptOneself(onesIndex: number, targetIndex: number): Promise<boolean>;
    /**
     * indexの参加者の表示名を取得
     *
     * @param {number} index
     * @returns {Promise<string>}
     * @memberof Game
     */
    getDisplayName(index: number): Promise<string>;
    getDisplayNamesFromIndexes(indexes: number[]): Promise<string[]>;
    getMinNumber(): Promise<number>;
    /**
     * 参加者追加
     *
     * @param {string} userId
     * @returns {Promise<void>}
     * @memberof Game
     */
    appendUserId(userId: string): Promise<void>;
    /**
     * 与えられたuserIdが参加者リストに存在するか
     *
     * @param {string} userId
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    isUserExists(userId: string): Promise<boolean>;
    /**
     * 参加者のデータのgroup_idを空文字にする
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    deleteUsersGroupId(): Promise<void>;
    /**
     * 参加者数を取得
     *
     * @returns {Promise<number>}
     * @memberof Game
     */
    getUserNumber(): Promise<number>;
    /**
     * 参加者数分の連続した整数の配列作る
     * 例: 4人の場合 [0,1,2,3]
     *
     * @returns {Promise<number[]>}
     * @memberof Game
     */
    getUserIndexes(): Promise<number[]>;
    /**
     * indexのuserIdを取得
     *
     * @param {number} index
     * @returns {Promise<string>}
     * @memberof Game
     */
    getUserId(index: number): Promise<string>;
    /**
     * 与えられたuserIdから参加者リストのインデックスを取得
     *
     * @param {string} userId
     * @returns {Promise<Number>}
     * @memberof Game
     */
    getUserIndexFromUserId(userId: string): Promise<number>;
    /**
     * デフォルトの設定ステータスにする
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateDefaultSettingStatus(): Promise<void>;
    /**
     * nameに一致する設定名のインデックスを取得
     *
     * @param {string} name
     * @returns {Promise<number>}
     * @memberof Game
     */
    getSettingIndex(name: string): Promise<number>;
    updateSettingState(name: string, bool: boolean): Promise<void>;
    /**
     * indexの設定ステータスをtrueに
     *
     * @param {number} index
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateSettingStateTrue(index: number): Promise<void>;
    /**
     * indexの設定ステータスをfalseに
     *
     * @param {number} index
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateSettingStateFalse(index: number): Promise<void>;
    /**
     * 設定がすべてfalseかどうかを取得
     *
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    isAllSettingStatusFalse(): Promise<boolean>;
    /**
     * 設定が完了しているかどうかを返す
     *
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    isSettingCompleted(): Promise<boolean>;
    /**
     * タイマー情報を"○時間✖︎分△秒の形で返す"
     *
     * @returns {Promise<string>}
     * @memberof Game
     */
    getTimerString(): Promise<string>;
    updateTimer(time: string): Promise<void>;
    /**
     * ゲームのステータスを更新
     *
     * @param {string} status
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateGameStatus(status: string): Promise<void>;
    /**
     * discussionデータ作成
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    putDiscussion(): Promise<void>;
    setDiscussion(): Promise<void>;
    /**
     * 残り時間取得
     *
     * @returns {Promise<string>}
     * @memberof Game
     */
    getRemainingTime(): Promise<string>;
    putFirstVote(): Promise<void>;
    putRevote(): Promise<void>;
    setVote(): Promise<void>;
    updateWinner(winner: string): Promise<void>;
    displayNameExists(name: string): Promise<boolean>;
    updateDefaultPositionConfirmStatus(): Promise<void>;
    updatePositionConfirmState(index: number): Promise<void>;
    isPositionConfirmCompleted(): Promise<boolean>;
    setAction(): Promise<void>;
    putZeroAction(): Promise<void>;
    getPositionIndexes(positionName: string): Promise<number[]>;
    getTargetsOfPosition(positionName: string): Promise<number[]>;
    getTargetOfPosition(positionName: string): Promise<number>;
}
