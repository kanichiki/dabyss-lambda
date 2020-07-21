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
const WordWolf_1 = require("./wordwolf-module/classes/WordWolf");
process.on('uncaughtException', function (err) {
    console.log(err);
});
exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const lineEvent = event.Input.event;
    console.log(lineEvent);
    const replyToken = lineEvent.replyToken;
    const postback = lineEvent.postback;
    let time;
    if (postback.params != undefined) {
        if (postback.params.time != undefined) {
            time = postback.params.time;
        }
    }
    const source = lineEvent.source;
    let groupId;
    let userId;
    if (source.type == "group") {
        groupId = source.groupId;
    }
    else if (source.type == "room") {
        groupId = source.roomId; // roomIdもgroupId扱いしよう
    }
    if (source.userId != undefined) {
        userId = source.userId;
    }
    const wordWolf = yield WordWolf_1.WordWolf.createInstance(groupId);
    const status = wordWolf.gameStatus;
    if (status == "setting") {
        const settingNames = wordWolf.settingNames;
        const settingStatus = wordWolf.settingStatus;
        for (let i = 0; i < settingNames.length; i++) {
            if (!settingStatus[i]) {
                if (settingNames[i] == "timer") {
                    return replyTimerChosen(wordWolf, time, replyToken);
                }
            }
        }
    }
});
const replyTimerChosen = (wordWolf, time, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const settingIndex = yield wordWolf.getSettingIndex("timer");
    promises.push(wordWolf.updateTimer(time));
    yield wordWolf.updateSettingStateTrue(settingIndex);
    const isSettingCompleted = yield wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
    }
    else {
        promises.push(replyConfirm(wordWolf, replyToken));
    }
    yield Promise.all(promises);
    return;
});
const replyConfirm = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const userNumber = yield wordWolf.getUserNumber();
    const depth = wordWolf.depth;
    const wolfNumber = wordWolf.wolfIndexes.length;
    const lunaticNumber = wordWolf.lunaticIndexes.length;
    const timerString = yield wordWolf.getTimerString();
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyChanged"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(userNumber, depth, wolfNumber, lunaticNumber, timerString));
    return;
});
