import aws = require('aws-sdk');
// import AmazonDaxClient = require('amazon-dax-client');
import { DocumentClient, GetItemInput, GetItemOutput, QueryInput } from 'aws-sdk/clients/dynamodb';

let documentClient!: DocumentClient;

if (!documentClient) {
    // if (process.env.DaxEndpoint) {
    //     const dax: any = new AmazonDaxClient({
    //         endpoints: process.env.DaxEndpoint
    //     });
    //     documentClient = new aws.DynamoDB.DocumentClient({ service: dax });
    // } else {
    documentClient = new aws.DynamoDB.DocumentClient();
    // }
}
import * as commonFunction from "../functions/commonFunction";

export const dynamoGet = async (tableName: string, key: DocumentClient.Key, consistentRead: boolean = true): Promise<GetItemOutput> => {
    const params: aws.DynamoDB.DocumentClient.GetItemInput = {
        TableName: tableName,
        Key: key,
        ConsistentRead: consistentRead
    }
    return documentClient.get(params).promise();
}

export const dynamoQuery = async (tableName: string, partitionKey: string, value: any, asc: boolean = true, consistentRead: boolean = true): Promise<any> => {
    const params: aws.DynamoDB.DocumentClient.QueryInput = {
        TableName: tableName,
        KeyConditionExpression: "#hash = :v",
        ExpressionAttributeNames: {
            "#hash": partitionKey
        },
        ExpressionAttributeValues: {
            ":v": value
        },
        ScanIndexForward: asc,
        ConsistentRead: consistentRead
    }
    return documentClient.query(params).promise();
}

export const dynamoQuerySecondaryIndex = async (tableName: string, indexName: string, partitionKey: string, value: string | number, asc: boolean = true): Promise<any> => {
    const params: aws.DynamoDB.DocumentClient.QueryInput = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: "#hash = :v",
        ExpressionAttributeNames: {
            "#hash": partitionKey
        },
        ExpressionAttributeValues: {
            ":v": value
        },
        ScanIndexForward: asc
    }
    return documentClient.query(params).promise();
}

export const dynamoPut = async (tableName: string, item: aws.DynamoDB.DocumentClient.PutItemInputAttributeMap): Promise<any> => {
    const currentTime: string = await commonFunction.getCurrentTime();
    item["created_at"] = currentTime;
    const params: aws.DynamoDB.DocumentClient.PutItemInput = {
        TableName: tableName,
        Item: item
    }
    return documentClient.put(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    })
}

export const dynamoUpdate = async (tableName: string, key: aws.DynamoDB.DocumentClient.Key, name: string, value: any): Promise<any> => {
    const currentTime: string = await commonFunction.getCurrentTime();
    const params: aws.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: key,
        ExpressionAttributeNames: {
            "#name": name,
            "#t": "updated_at"
        },
        ExpressionAttributeValues: {
            ":v": value,
            ":t": currentTime
        },
        UpdateExpression: 'SET #name = :v, #t = :t'
    }
    return documentClient.update(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    })
}

export const dynamoAppend = async (tableName: string, key: aws.DynamoDB.DocumentClient.Key, name: string, value: any): Promise<any> => {
    const currentTime: string = await commonFunction.getCurrentTime();
    const params: aws.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: key,
        ExpressionAttributeNames: {
            "#name": name,
            "#t": "updated_at"
        },
        ExpressionAttributeValues: {
            ":v": [value],
            ":t": currentTime
        },
        UpdateExpression: 'SET #name = list_append(#name, :v), #t = :t'
    }
    return documentClient.update(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    })
}