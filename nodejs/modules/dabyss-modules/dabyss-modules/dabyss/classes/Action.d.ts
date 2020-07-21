import { DocumentClient } from "aws-sdk/clients/dynamodb";
export declare class Action {
    gameId: number;
    day: number;
    actionKey: DocumentClient.Key;
    actionStatus: boolean[];
    targets: number[];
    constructor(gameId: number, day: number);
    init(): Promise<void>;
    static createInstance(gameId: number, day: number): Promise<Action>;
    static putAction(gameId: number, day: number, defaultStatus: boolean[]): Promise<void>;
    isActedUser(index: number): Promise<boolean>;
    updateActionStateTrue(index: number): Promise<void>;
    updateTarget(index: number, target: number): Promise<void>;
    act(userIndex: number, target: number): Promise<void>;
    isActionCompleted(): Promise<boolean>;
}
