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
const lineClient = require("./dabyss-module/clients/lineClient");
const Group_1 = require("./dabyss-module/classes/Group");
const WordWolf_1 = require("./wordWolf-module/classes/WordWolf");
process.on('uncaughtException', function (err) {
    console.log(err);
});
exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const lineEvent = event.Input.event;
    console.log(lineEvent);
    const replyToken = lineEvent.replyToken;
    let message;
    if (lineEvent.message.type == "text") {
        message = lineEvent.message;
    }
    const text = message.text;
    const source = lineEvent.source;
    let groupId;
    if (source.type == "group") {
        groupId = source.groupId;
    }
    else if (source.type == "room") {
        groupId = source.roomId; // roomIdもgroupId扱いしよう
    }
    const wordWolf = yield WordWolf_1.WordWolf.createInstance(groupId);
    const userNumber = yield wordWolf.getUserNumber();
    let minNumber = 2;
    if (userNumber < minNumber) {
        // 参加者数が2人以下の場合
        return replyTooFewParticipant(wordWolf, replyToken);
    }
    else {
        // 参加受付終了の意思表明に対するリプライ
        // 参加受付を終了した旨（TODO 参加者を変更したい場合はもう一度「参加者が」ゲーム名を発言するように言う）、参加者のリスト、該当ゲームの最初の設定のメッセージを送る
        return replyRollCallEnd(wordWolf, replyToken);
    }
});
const replyTooFewParticipant = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const userNumber = yield wordWolf.getUserNumber(); // 参加者数
    const recruitingGameName = wordWolf.gameName;
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyTooFewParticipant"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(userNumber, recruitingGameName));
});
const replyRollCallEnd = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const group = yield Group_1.Group.createInstance(wordWolf.groupId);
    const displayNames = yield wordWolf.getDisplayNames(); // 参加者の表示名リスト
    // DB変更操作１
    promises.push(wordWolf.updateDefaultSettingStatus());
    promises.push(group.updateStatus("play")); // 参加者リストをプレイ中にして、募集中を解除する
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyRollCallEnd"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(displayNames)));
    yield Promise.all(promises);
    return;
});
