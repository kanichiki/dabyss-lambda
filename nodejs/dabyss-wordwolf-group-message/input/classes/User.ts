import * as aws from "../clients/awsClient";
import * as line from '../clients/lineClient';
import { DocumentClient } from "aws-sdk/clients/dynamodb";

/**
 * Userクラス
 *
 * @export
 * @class User
 */
export class User {
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

    constructor(userId: string) {
        this.userTable = "dabyss-dev-user";
        this.userId = userId;
        this.userKey = {
            user_id: userId
        }
        this.exists = false;
        this.groupId = "";
        this.isRestarting = false;
    }

    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    async init(): Promise<void> {
        const data: DocumentClient.QueryOutput = await aws.dynamoQuery(this.userTable, "user_id", this.userId, false);
        if (data.Count != undefined) {
            if (data.Count > 0) {
                this.exists = true;
                if (data.Items != undefined) {
                    const user: DocumentClient.AttributeMap = data.Items[0];
                    this.groupId = user.group_id;
                    this.isRestarting = user.is_restarting;
                }
            }
        }
    }

    /**
     * userインスタンスを作る
     *
     * @static
     * @param {string} userId
     * @returns {Promise<User>}
     * @memberof User
     */
    static async createInstance(userId: string): Promise<User> {
        const user: User = new User(userId);
        await user.init();
        return user;
    }


    /**
     * group_idを持ってるかどうか
     *
     * @returns {Promise<boolean>}
     * @memberof User
     */
    async hasGroupId(): Promise<boolean> {
        let res: boolean = true;
        if (this.groupId == "") {
            res = false;
        }
        return res;
    }


    /**
     * 与えられたgroupIdとユーザーのgroupIdが一致するか否か
     *
     * @param {string} groupId
     * @returns {Promise<boolean>}
     * @memberof User
     */
    async isMatchGroupId(groupId: string): Promise<boolean> {
        const currentGroupId: string = this.groupId;
        let res: boolean = false;
        if (groupId == currentGroupId) {
            res = true;
        }
        return res;
    }


    /**
     * ユーザーデータ挿入
     *
     * @param {string} groupId
     * @returns {Promise<void>}
     * @memberof User
     */
    async putUser(groupId: string): Promise<void> {
        const item: DocumentClient.AttributeMap = {
            user_id: this.userId,
            group_id: groupId,
            is_restarting: false
        }
        aws.dynamoPut(this.userTable, item);
    }


    /**
     * group_idを削除する（emptyにする）
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    async deleteGroupId(): Promise<void> {
        aws.dynamoUpdate(this.userTable, this.userKey, "group_id", "");
    }

    /**
     * リスタート状態をtrueに
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    async updateIsRestartingTrue(): Promise<void> {
        aws.dynamoUpdate(this.userTable, this.userKey, "is_restarting", true);
        this.isRestarting = true;
    }

    /**
     * リスタート状態をfalseに
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    async updateIsRestartingFalse(): Promise<void> {
        aws.dynamoUpdate(this.userTable, this.userKey, "is_restarting", false);
        this.isRestarting = false;
    }

    /**
     * 表示名を返す
     *
     * @returns {Promise<string>}
     * @memberof User
     */
    async getDisplayName(): Promise<string> {
        const profile = await line.getProfile(this.userId);
        const displayName = profile.displayName;
        return displayName;
    }

}