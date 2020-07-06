const AWS = require('aws-sdk');
const AmazonDaxClient = require('amazon-dax-client');

let documentClient;

if (!documentClient) {
    if (process.env.DaxEndpoint) {
        const dax = new AmazonDaxClient({
            endpoints: process.env.DaxEndpoint
        });
        documentClient = new AWS.DynamoDB.DocumentClient({ service: dax });
    } else {
        documentClient = new AWS.DynamoDB.DocumentClient();
    }
}
const commonFunction = require("../template/functions/commonFunction");

exports.dynamoGet = async (tableName, key, consistentRead = true) => {
    const params = {
        TableName: tableName,
        Key: key,
        ConsistentRead: consistentRead
    }
    return documentClient.get(params).promise();
}

exports.dynamoQuery = async (tableName, partitionKey, value, asc, consistentRead = true) => {
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
    }
    return documentClient.query(params).promise();
}

exports.dynamoPut = async (tableName, item) => {
    const currentTime = await commonFunction.getCurrentTime();
    item["created_at"] = currentTime;
    const params = {
        TableName: tableName,
        Item: item
    }
    return documentClient.put(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    })
}

exports.dynamoUpdate = async (tableName, key, name, value) => {
    const currentTime = await commonFunction.getCurrentTime();
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
    }
    return documentClient.update(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    })
}

exports.dynamoAppend = async (tableName, key, name, value) => {
    const currentTime = await commonFunction.getCurrentTime();
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
    }
    return documentClient.update(params, (err, data) => {
        if (err) {
            console.log(err);
        }
    })
}