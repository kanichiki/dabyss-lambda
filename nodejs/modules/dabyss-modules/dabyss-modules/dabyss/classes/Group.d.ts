import { DocumentClient } from 'aws-sdk/clients/dynamodb';
/**
 * Groupクラス
 *
 * @export
 * @class Group
 */
export declare class Group {
    groupTable: string;
    groupId: string;
    groupKey: DocumentClient.Key;
    exists: boolean;
    status: string;
    isRestarting: boolean;
    isFinishing: boolean;
    /**
     * Groupクラスのコンストラクタ
     * @param {string} groupId
     * @memberof Group
     */
    constructor(groupId: string);
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    init(): Promise<void>;
    /**
     * Groupインスタンス作成
     *
     * @static
     * @param {string} groupId
     * @returns {Promise<Group>}
     * @memberof Group
     */
    static createInstance(groupId: string): Promise<Group>;
    /**
     * groupを作成
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    putGroup(): Promise<void>;
    /**
     * Groupをリセット
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    resetGroup(): Promise<void>;
    /**
     * ステータスを更新
     *
     * @param {string} status
     * @returns {Promise<void>}
     * @memberof Group
     */
    updateStatus(status: string): Promise<void>;
    /**
     * リスタート状態をboolに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    updateIsRestarting(bool: boolean): Promise<void>;
    /**
     * 強制終了状態をtrueに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    updateIsFinishing(bool: boolean): Promise<void>;
    /**
     * 全部終わらせる
     * 全部falseにする
     * ただし、ユーザーに関してはまだ参加中が該当のgroupIdのときのみ
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    finishGroup(): Promise<void>;
}
