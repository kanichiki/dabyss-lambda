import { DocumentClient } from "aws-sdk/clients/dynamodb";
/**
 * Userクラス
 *
 * @export
 * @class User
 */
export declare class User {
    userTable: string;
    userId: string;
    userKey: DocumentClient.Key;
    exists: boolean;
    groupId: string;
    isRestarting: boolean;
    /**
     * Creates an instance of User.
     *
     * テーブル構造は以下の通り
     * @param {string} userId : userId
     * group_id : 参加中のgroup_id。ゲーム終了時に削除するようにする
     * is_restarting : group_idがあるときに他のゲームに参加しようとしたら確認をするが、その保留ステータス
     */
    constructor(userId: string);
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    init(): Promise<void>;
    /**
     * userインスタンスを作る
     *
     * @static
     * @param {string} userId
     * @returns {Promise<User>}
     * @memberof User
     */
    static createInstance(userId: string): Promise<User>;
    /**
     * group_idを持ってるかどうか
     *
     * @returns {Promise<boolean>}
     * @memberof User
     */
    hasGroupId(): Promise<boolean>;
    /**
     * 与えられたgroupIdとユーザーのgroupIdが一致するか否か
     *
     * @param {string} groupId
     * @returns {Promise<boolean>}
     * @memberof User
     */
    isMatchGroupId(groupId: string): Promise<boolean>;
    /**
     * ユーザーデータ挿入
     *
     * @param {string} groupId
     * @returns {Promise<void>}
     * @memberof User
     */
    putUser(groupId: string): Promise<void>;
    /**
     * groupIdを更新
     *
     * @param {string} groupId
     * @returns {Promise<void>}
     * @memberof User
     */
    updateGroupId(groupId: string): Promise<void>;
    /**
     * group_idを削除する（"none"にする）
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    deleteGroupId(): Promise<void>;
    /**
     * リスタート状態をtrueに
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    updateIsRestarting(bool: boolean): Promise<void>;
    /**
     * 表示名を返す
     *
     * @returns {Promise<string>}
     * @memberof User
     */
    getDisplayName(): Promise<string>;
}
