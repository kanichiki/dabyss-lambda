import aws = require('aws-sdk');
import { DocumentClient, GetItemOutput } from 'aws-sdk/clients/dynamodb';
export declare const dynamoGet: (tableName: string, key: DocumentClient.Key, consistentRead?: boolean) => Promise<GetItemOutput>;
export declare const dynamoQuery: (tableName: string, partitionKey: string, value: any, asc?: boolean, consistentRead?: boolean) => Promise<any>;
export declare const dynamoQuerySecondaryIndex: (tableName: string, indexName: string, partitionKey: string, value: string | number, asc?: boolean) => Promise<any>;
export declare const dynamoPut: (tableName: string, item: aws.DynamoDB.DocumentClient.PutItemInputAttributeMap) => Promise<any>;
export declare const dynamoUpdate: (tableName: string, key: aws.DynamoDB.DocumentClient.Key, name: string, value: any) => Promise<any>;
export declare const dynamoAppend: (tableName: string, key: aws.DynamoDB.DocumentClient.Key, name: string, value: any) => Promise<any>;
