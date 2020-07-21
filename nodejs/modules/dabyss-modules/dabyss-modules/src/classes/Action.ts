import * as aws from "../clients/awsClient";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as commonFunction from '../functions/commonFunction';

const actionTable = "dabyss-dev-action";

export class Action {
    gameId: number;
    day: number;
    actionKey: DocumentClient.Key;
    actionStatus: boolean[];
    targets: number[];

    constructor(gameId: number, day: number) {
        this.gameId = gameId;
        this.day = day;
        this.actionKey = {
            game_id: this.gameId,
            day: this.day
        };
        this.actionStatus = [];
        this.targets = [];
    }

    async init(): Promise<void> {
        try {
            const data: DocumentClient.GetItemOutput = await aws.dynamoGet(actionTable, this.actionKey);
            if (data.Item != undefined) {
                const action: DocumentClient.AttributeMap = data.Item;
                this.actionStatus = action.action_status as boolean[];
                this.targets = action.targets as number[];
            } else {
                throw new Error("Actionデータが見つかりません");
            }
        } catch (err) {
            console.error(err);
        }
    }

    static async createInstance(gameId: number, day: number): Promise<Action> {
        const action: Action = new Action(gameId, day);
        await action.init();
        return action;
    }

    static async putAction(gameId: number, day: number, defaultStatus: boolean[]): Promise<void> {
        const targets = Array(defaultStatus.length).fill(-1);
        try {
            const item: DocumentClient.AttributeMap = {
                game_id: gameId,
                day: day,
                action_status: defaultStatus,
                targets: targets
            }

            aws.dynamoPut(actionTable, item);
        } catch (err) {
            console.log(err);
        }
    }

    async isActedUser(index: number): Promise<boolean> {
        return this.actionStatus[index]
    }

    async updateActionStateTrue(index: number): Promise<void> {
        this.actionStatus[index] = true;
        aws.dynamoUpdate(actionTable, this.actionKey, "action_status", this.actionStatus);
    }

    async updateTarget(index: number, target: number): Promise<void> {
        this.targets[index] = target;
        aws.dynamoUpdate(actionTable, this.actionKey, "targets", this.targets);
    }

    async act(userIndex: number, target: number): Promise<void> {
        this.updateActionStateTrue(userIndex);
        this.updateTarget(userIndex, target);
    }

    async isActionCompleted(): Promise<boolean> {
        let res: boolean = true;
        for (const state of this.actionStatus) {
            if (!state) {
                res = false;
                break;
            }
        }
        return res;
    }
}