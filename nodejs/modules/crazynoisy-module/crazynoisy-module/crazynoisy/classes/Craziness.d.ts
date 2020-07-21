import { DocumentClient } from "aws-sdk/clients/dynamodb";
export declare class Craziness {
    crazinessId: number;
    crazinessKey: DocumentClient.Key;
    content: string;
    remark: string;
    type: number;
    level: number;
    constructor(crazinessId: number);
    init(): Promise<void>;
    static createInstance(crazinessId: number): Promise<Craziness>;
    static getCrazinessIdsMatchType(type: number): Promise<number[]>;
}
