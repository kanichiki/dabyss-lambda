"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoAppend = exports.dynamoUpdate = exports.dynamoPut = exports.dynamoQuerySecondaryIndex = exports.dynamoQuery = exports.dynamoGet = void 0;
const aws = require("aws-sdk");
let documentClient;
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
const commonFunction = require("../template/functions/commonFunction");
exports.dynamoGet = (tableName, key, consistentRead = true) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: tableName,
        Key: key,
        ConsistentRead: consistentRead
    };
    return documentClient.get(params).promise();
});
exports.dynamoQuery = (tableName, partitionKey, value, asc = true, consistentRead = true) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
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
    };
    return documentClient.query(params).promise();
});
exports.dynamoQuerySecondaryIndex = (tableName, indexName, partitionKey, value, asc = true) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
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
    };
    return documentClient.query(params).promise();
});
exports.dynamoPut = (tableName, item) => __awaiter(void 0, void 0, void 0, function* () {
    const currentTime = yield commonFunction.getCurrentTime();
    item["created_at"] = currentTime;
    const params = {
        TableName: tableName,
        Item: item
    };
    return documentClient.put(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    });
});
exports.dynamoUpdate = (tableName, key, name, value) => __awaiter(void 0, void 0, void 0, function* () {
    const currentTime = yield commonFunction.getCurrentTime();
    const params = {
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
    };
    return documentClient.update(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    });
});
exports.dynamoAppend = (tableName, key, name, value) => __awaiter(void 0, void 0, void 0, function* () {
    const currentTime = yield commonFunction.getCurrentTime();
    const params = {
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
    };
    return documentClient.update(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    });
});
