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
const dabyss = require("dabyss");
const crazynoisy = require("crazynoisy");
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
    const crazyNoisy = yield crazynoisy.CrazyNoisy.createInstance(groupId);
    const status = crazyNoisy.gameStatus;
    if (status == "setting") {
        const settingNames = crazyNoisy.settingNames;
        const settingStatus = crazyNoisy.settingStatus;
        for (let i = 0; i < settingNames.length; i++) {
            if (!settingStatus[i]) {
                if (settingNames[i] == "timer") {
                    return replyTimerChosen(crazyNoisy, time, replyToken);
                }
            }
        }
    }
});
const replyTimerChosen = (crazyNoisy, time, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const settingIndex = yield crazyNoisy.getSettingIndex("timer");
    promises.push(crazyNoisy.updateTimer(time));
    yield crazyNoisy.updateSettingStateTrue(settingIndex);
    const isSettingCompleted = yield crazyNoisy.isSettingCompleted();
    if (!isSettingCompleted) {
    }
    else {
        promises.push(replyConfirm(crazyNoisy, replyToken));
    }
    yield Promise.all(promises);
    return;
});
const replyConfirm = (crazyNoisy, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const userNumber = yield crazyNoisy.getUserNumber();
    const mode = crazyNoisy.gameMode;
    const type = crazyNoisy.talkType;
    const timer = yield crazyNoisy.getTimerString();
    const zeroGuru = crazyNoisy.zeroGuru;
    const zeroDetective = crazyNoisy.zeroDetective;
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyChanged"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(userNumber, mode, type, timer, zeroGuru, zeroDetective)));
    yield Promise.all(promises);
    return;
});
