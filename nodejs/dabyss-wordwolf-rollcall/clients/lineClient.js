const AWS = require('aws-sdk');
const line = require('@line/bot-sdk');

let lineClient;

const getLineSecret = async () => {
    const region = "ap-northeast-1";
    const secretName = "dabyss-dev-line";
    let secret;

    const client = new AWS.SecretsManager({
        region: region
    });

    await client.getSecretValue({ SecretId: secretName }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            secret = data.SecretString;
        }
    }).promise();

    secret = JSON.parse(secret);
    return secret;
}

const createLineClient = async () => {
    const secret = await getLineSecret();
    const config = {
        channelAccessToken: secret.channelAccessToken,
        channelSecret: secret.channelSecret
    };
    const client = new line.Client(config);
    return client;
}

exports.replyMessage = async (replyToken, messages) => {
    if (!lineClient) {
        lineClient = await createLineClient();
    }

    return lineClient.replyMessage(replyToken, messages);
}

exports.pushMessage = async (to, messages) => {
    if (!lineClient) {
        lineClient = await createLineClient();
    }

    return lineClient.pushMessage(to, messages);
}

exports.getProfile = async (userId) => {
    if (!lineClient) {
        lineClient = await createLineClient();
    }

    const profile = lineClient.getProfile(userId);
    return profile;
}