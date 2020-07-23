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
    /**
     * 日付更新
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateDay(): Promise<void>;
    /**
     * 参加者の表示名の配列を取得
     *
     * @returns {Promise<string[]>}
     * @memberof Game
     */
    getDisplayNames(): Promise<string[]>;
    /**
     * 入力ユーザー以外の表示名を配列で取得
     *
     * @param {number} index
     * @returns {Promise<string[]>}
     * @memberof Game
     */
    getDisplayNamesExceptOneself(index: number): Promise<string[]>;
    /**
     * 入力ユーザー以外のインデックス配列取得
     *
     * @param {number} index
     * @returns {Promise<number[]>}
     * @memberof Game
     */
    getUserIndexesExceptOneself(index: number): Promise<number[]>;
    /**
     * targetIndexがonesIndex以外の範囲内インデックスであるかどうか
     *
     * @param {number} onesIndex
     * @param {number} targetIndex
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    existsUserIndexExceptOneself(onesIndex: number, targetIndex: number): Promise<boolean>;
    /**
     * indexの参加者の表示名を取得
     *
     * @param {number} index
     * @returns {Promise<string>}
     * @memberof Game
     */
    getDisplayName(index: number): Promise<string>;
    /**
     * インデックスの配列に対応した表示名の配列を返す
     *
     * @param {number[]} indexes
     * @returns {Promise<string[]>}
     * @memberof Game
     */
    getDisplayNamesFromIndexes(indexes: number[]): Promise<string[]>;
    /**
     * ゲームを始めるのに必要な最小の人数を返す
     *
     * @returns {Promise<number>}
     * @memberof Game
     */
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
    /**
     * 入力の設定名の設定ステータスをboolに更新
     *
     * @param {string} name
     * @param {boolean} bool
     * @returns {Promise<void>}
     * @memberof Game
     */
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
    /**
     * timer設定を更新
     *
     * @param {string} time
     * @returns {Promise<void>}
     * @memberof Game
     */
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
    /**
     * discussionをセット
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    setDiscussion(): Promise<void>;
    /**
     * 残り時間取得
     *
     * @returns {Promise<string>}
     * @memberof Game
     */
    getRemainingTime(): Promise<string>;
    /**
     * 最初の投票のデータを挿入
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    putFirstVote(): Promise<void>;
    /**
     * 再投票データを挿入
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    putRevote(): Promise<void>;
    /**
     * 投票データをセット
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    setVote(): Promise<void>;
    /**
     * 勝者を更新
     *
     * @param {string} winner
     * @returns {Promise<void>}
     * @memberof Game
     */
    updateWinner(winner: string): Promise<void>;
    /**
     * 表示名が参加者に存在するかどうかを返す
     *
     * @param {string} name
     * @returns {Promise<boolean>}
     * @memberof Game
     */
    displayNameExists(name: string): Promise<boolean>;
    /**
     * アクションデータをセット
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    setAction(): Promise<void>;
    /**
     * 0日目のアクションデータの初期値を挿入
     *
     * @returns {Promise<void>}
     * @memberof Game
     */
    putZeroAction(): Promise<void>;
    /**
     * positionNameに一致する役職のインデックスの配列を取得
     *
     * @param {string} positionName
     * @returns {Promise<number[]>}
     * @memberof Game
     */
    getPositionIndexes(positionName: string): Promise<number[]>;
    /**
     * 入力の役職のターゲットを配列で取得
     *
     * @param {string} positionName
     * @returns {Promise<number[]>}
     * @memberof Game
     */
    getTargetsOfPosition(positionName: string): Promise<number[]>;
    /**
     * 入力の役職のターゲットを取得
     *
     * @param {string} positionName
     * @returns {Promise<number>}
     * @memberof Game
     */
    getTargetOfPosition(positionName: string): Promise<number>;
}
