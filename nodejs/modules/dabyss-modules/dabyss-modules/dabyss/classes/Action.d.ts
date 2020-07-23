import { DocumentClient } from "aws-sdk/clients/dynamodb";
/**
 * アクションのクラス
 *
 * @export
 * @class Action
 */
export declare class Action {
    gameId: number;
    day: number;
    actionKey: DocumentClient.Key;
    actionStatus: boolean[];
    targets: number[];
    /**
     * アクションクラスのコンストラクタ
     *
     * @param {number} gameId
     * @param {number} day
     * @memberof Action
     */
    constructor(gameId: number, day: number);
    /**
     * データで初期化
     *
     * @returns {Promise<void>}
     * @memberof Action
     */
    init(): Promise<void>;
    /**
     * アクションインスタンス作成
     *
     * @static
     * @param {number} gameId
     * @param {number} day
     * @returns {Promise<Action>}
     * @memberof Action
     */
    static createInstance(gameId: number, day: number): Promise<Action>;
    /**
     * アクションデータ挿入
     *
     * @static
     * @param {number} gameId
     * @param {number} day
     * @param {boolean[]} defaultStatus
     * @returns {Promise<void>}
     * @memberof Action
     */
    static putAction(gameId: number, day: number, defaultStatus: boolean[]): Promise<void>;
    /**
     * ユーザーがアクション済みかどうか返す
     *
     * @param {number} index
     * @returns {Promise<boolean>}
     * @memberof Action
     */
    isActedUser(index: number): Promise<boolean>;
    /**
     * アクションステータスをtrueに
     *
     * @param {number} index
     * @returns {Promise<void>}
     * @memberof Action
     */
    updateActionStateTrue(index: number): Promise<void>;
    /**
     * ターゲットを更新
     *
     * @param {number} index
     * @param {number} target
     * @returns {Promise<void>}
     * @memberof Action
     */
    updateTarget(index: number, target: number): Promise<void>;
    /**
     * アクションする
     * アクションステータスをtrueにしてターゲットを更新する
     *
     * @param {number} userIndex
     * @param {number} target
     * @returns {Promise<void>}
     * @memberof Action
     */
    act(userIndex: number, target: number): Promise<void>;
    /**
     * アクションが完了しているかどうかを返す
     *
     * @returns {Promise<boolean>}
     * @memberof Action
     */
    isActionCompleted(): Promise<boolean>;
}
