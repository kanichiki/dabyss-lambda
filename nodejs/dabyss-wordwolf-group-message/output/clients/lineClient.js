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
exports.getProfile = exports.pushMessage = exports.replyMessage = exports.getChannelId = void 0;
const aws = require("aws-sdk");
const line = require("@line/bot-sdk");
let lineClient;
const getLineConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    const region = "ap-northeast-1";
    const secretName = "dabyss-dev-line";
    let secretString;
    const client = new aws.SecretsManager({
        region: region
    });
    yield client.getSecretValue({ SecretId: secretName }, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            if (data.SecretString != undefined) {
                secretString = data.SecretString;
            }
        }
    }).promise();
    const secret = JSON.parse(secretString);
    return secret;
});
const createLineClient = () => __awaiter(void 0, void 0, void 0, function* () {
    const secret = yield getLineConfig();
    const config = {
        channelAccessToken: secret.channelAccessToken,
        channelSecret: secret.channelSecret
    };
    const client = new line.Client(config);
    return client;
});
exports.getChannelId = () => __awaiter(void 0, void 0, void 0, function* () {
    const secret = yield getLineConfig();
    return secret.channelId;
});
exports.replyMessage = (replyToken, messages) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lineClient) {
        lineClient = yield createLineClient();
    }
    return lineClient.replyMessage(replyToken, messages);
});
exports.pushMessage = (to, messages) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lineClient) {
        lineClient = yield createLineClient();
    }
    return lineClient.pushMessage(to, messages);
});
exports.getProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lineClient) {
        lineClient = yield createLineClient();
    }
    const profile = yield lineClient.getProfile(userId);
    return profile;
});
