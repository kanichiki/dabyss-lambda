import * as aws from '../clients/awsClient';
import { Game } from './Game';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

/**
 *
 *
 * @export
 * @class Group
 */
export class Group {
    groupTable: string;
    groupId: string;
    groupKey: DocumentClient.Key;
    exists: boolean;
    status: string;
    isRestarting: boolean;
    isFinishing: boolean;

    /**
     * Creates an instance of Group.
     * @param {string} groupId
     * @memberof Group
     */
    constructor(groupId: string) {
        this.groupTable = "dabyss-dev-group";
        this.groupId = groupId;
        this.groupKey = {
            group_id: groupId
        }
        this.exists = false;
        this.status = "";
        this.isRestarting = false;
        this.isFinishing = false;
    }

    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    async init(): Promise<void> {
        const data: DocumentClient.QueryOutput = await aws.dynamoQuery(this.groupTable, "group_id", this.groupId, false);
        if (data.Count != undefined) {
            if (data.Count > 0) {
                this.exists = true;
                if (data.Items != undefined) {
                    const group: DocumentClient.AttributeMap = data.Items[0];
                    this.status = group.status;
                    this.isRestarting = group.is_restarting;
                    this.isFinishing = group.is_finishing;
                }
            }
        }
    }

    /**
     * Groupインスタンス作成
     *
     * @static
     * @param {string} groupId
     * @returns {Promise<Group>}
     * @memberof Group
     */
    static async createInstance(groupId: string): Promise<Group> {
        const group: Group = new Group(groupId);
        await group.init();
        return group;
    }


    /**
     * groupを作成
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    async putGroup(): Promise<void> {
        try {
            const item: DocumentClient.PutItemInputAttributeMap = {
                group_id: this.groupId,
                status: "recruit",
                is_restarting: false,
                is_finishing: false
            }
            // groupデータをputできたらsequenceをプラス１
            aws.dynamoPut(this.groupTable, item);
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * ステータスを更新
     *
     * @param {string} status
     * @returns {Promise<void>}
     * @memberof Group
     */
    async updateStatus(status: string): Promise<void> {
        aws.dynamoUpdate(this.groupTable, this.groupKey, "status", status);
        this.status = status;
    }

    /**
     * リスタート状態をtrueに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    async updateIsRestartingTrue(): Promise<void> {
        aws.dynamoUpdate(this.groupTable, this.groupKey, "is_restarting", true);
        this.isRestarting = true;
    }

    /**
     * リスタート状態をfalseに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    async updateIsRestartingFalse(): Promise<void> {
        try {
            aws.dynamoUpdate(this.groupTable, this.groupKey, "is_restarting", false);
            this.isRestarting = false;
        } catch (err) {
            console.log(err);
            console.log("グループのリスタート状態をfalseにできませんでした");
        }
    }

    /**
     * 強制終了状態をtrueに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    async updateIsFinishingTrue(): Promise<void> {
        aws.dynamoUpdate(this.groupTable, this.groupKey, "is_finishing", true);
        this.isFinishing = true;
    }

    /**
     * 強制終了状態をfalseに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    async updateIsFinishingFalse(): Promise<void> {
        aws.dynamoUpdate(this.groupTable, this.groupKey, "is_finishing", false);
        this.isFinishing = false;
    }

    /**
     * 全部終わらせる
     * 全部falseにする
     * ただし、ユーザーに関してはまだ参加中が該当のgroupIdのときのみ
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    async finishGroup(): Promise<void> {
        this.updateStatus("finish");
        this.updateIsRestartingFalse();
        this.updateIsFinishingFalse();

        const game: Game = await Game.createInstance(this.groupId);
        game.deleteUsersGroupId();
    }


}