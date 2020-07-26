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
process.on('uncaughtException', function (err) {
    console.log(err);
});
exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const lineEvent = event.Input.event;
    console.log(lineEvent);
    const replyToken = lineEvent.replyToken;
    const postback = lineEvent.postback;
    const postbackData = postback.data;
    const source = lineEvent.source;
    let userId;
    if (source.userId != undefined) {
        userId = source.userId;
    }
    const user = yield dabyss.User.createInstance(userId);
    const groupId = user.groupId;
    const crazyNoisy = yield crazynoisy.CrazyNoisy.createInstance(groupId);
    const status = crazyNoisy.gameStatus;
    const day = crazyNoisy.day;
    if (status == "action") {
        yield crazyNoisy.setAction();
        const userIndex = yield crazyNoisy.getUserIndexFromUserId(userId);
        const targetIndex = Number(postbackData);
        if (day == 0) { // 0日目なら
            const confirmsState = yield crazyNoisy.action.isActedUser(userIndex);
            if (!confirmsState) {
                const position = yield crazyNoisy.getPosition(userIndex);
                const zeroGuru = crazyNoisy.zeroGuru;
                const zeroDetective = crazyNoisy.zeroDetective;
                if (position == crazyNoisy.positionNames.guru && zeroGuru) {
                    const targetExists = yield crazyNoisy.existsUserIndexExceptOneself(userIndex, targetIndex);
                    if (targetExists) {
                        yield replyBasicAction(crazyNoisy, position, userIndex, targetIndex, replyToken);
                    }
                }
                else if (position == crazyNoisy.positionNames.detective && zeroDetective) {
                    const targetExists = yield crazyNoisy.existsUserIndexExceptOneself(userIndex, targetIndex);
                    if (targetExists) {
                        yield replyDetectiveAction(crazyNoisy, userIndex, targetIndex, replyToken);
                    }
                }
                else {
                    if (postbackData == "確認しました") {
                        yield replyPositionConfirm(crazyNoisy, userIndex, replyToken);
                    }
                }
            }
        }
        else { // 0日目以外の場合
            const actionsState = yield crazyNoisy.action.isActedUser(userIndex);
            if (!actionsState) { // その人のアクションがまだなら
                const targetExists = yield crazyNoisy.existsUserIndexExceptOneself(userIndex, targetIndex);
                if (targetExists) {
                    const position = yield crazyNoisy.getPosition(userIndex);
                    if (position == crazyNoisy.positionNames.guru) {
                        yield replyBasicAction(crazyNoisy, position, userIndex, targetIndex, replyToken);
                    }
                    if (position == crazyNoisy.positionNames.detective) {
                        yield replyDetectiveAction(crazyNoisy, userIndex, targetIndex, replyToken);
                    }
                }
            }
        }
    }
});
const replyBasicAction = (crazyNoisy, position, userIndex, targetIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    yield crazyNoisy.action.act(userIndex, targetIndex);
    const displayName = yield crazyNoisy.getDisplayName(targetIndex);
    if (position == crazyNoisy.positionNames.guru) {
        const replyMessage = yield Promise.resolve().then(() => require("./template/replyGuruAction"));
        promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(displayName)));
    }
    const isActionsCompleted = yield crazyNoisy.action.isActionCompleted();
    if (isActionsCompleted) {
        promises.push(replyActionCompleted(crazyNoisy));
    }
    yield Promise.all(promises);
    return;
});
const replyDetectiveAction = (crazyNoisy, userIndex, targetIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    yield crazyNoisy.action.act(userIndex, targetIndex);
    const isGuru = yield crazyNoisy.isGuru(targetIndex);
    const displayName = yield crazyNoisy.getDisplayName(targetIndex);
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyDetectiveAction"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(displayName, isGuru)));
    const isActionsCompleted = yield crazyNoisy.action.isActionCompleted();
    if (isActionsCompleted) {
        promises.push(replyActionCompleted(crazyNoisy));
    }
    yield Promise.all(promises);
    return;
});
const replyPositionConfirm = (crazyNoisy, userIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    yield crazyNoisy.action.updateActionStateTrue(userIndex);
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyPositionConfirm"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main()));
    const isActionsCompleted = yield crazyNoisy.action.isActionCompleted();
    if (isActionsCompleted) {
        promises.push(replyActionCompleted(crazyNoisy));
    }
    yield Promise.all(promises);
    return;
});
const replyActionCompleted = (crazyNoisy) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const pushCraziness = yield Promise.resolve().then(() => require("./template/pushUserCraziness"));
    const brainwashTarget = yield crazyNoisy.getTargetOfPosition(crazyNoisy.positionNames.guru);
    const spTarget = yield crazyNoisy.getTargetOfPosition(crazyNoisy.positionNames.sp);
    if (brainwashTarget != -1 && brainwashTarget != spTarget) {
        promises.push(crazyNoisy.updateBrainwashStateTrue(brainwashTarget));
        yield crazyNoisy.addCrazinessId(brainwashTarget);
    }
    const userNumber = yield crazyNoisy.getUserNumber();
    for (let i = 0; i < userNumber; i++) {
        if (crazyNoisy.crazinessIds[i][0] != null) {
            let contents = [];
            let remarks = [];
            for (let crazinessId of crazyNoisy.crazinessIds[i]) {
                const craziness = yield crazynoisy.Craziness.createInstance(crazinessId);
                contents.push(craziness.content);
                remarks.push(craziness.remark);
            }
            promises.push(dabyss.pushMessage(crazyNoisy.userIds[i], yield pushCraziness.main(contents, remarks)));
        }
    }
    yield crazyNoisy.updateDay(); // 日付更新
    const pushDay = yield Promise.resolve().then(() => require("./template/pushDay"));
    let pushMessage = yield pushDay.main(crazyNoisy.day);
    const isBrainwashCompleted = yield crazyNoisy.isBrainwashCompleted();
    if (!isBrainwashCompleted || crazyNoisy.day == 1) { // ゲームが続く場合
        const timer = yield crazyNoisy.getTimerString(); // タイマー設定を取得
        const pushFinishActions = yield Promise.resolve().then(() => require("./template/pushFinishActions"));
        const pushFinishActionsMessage = yield pushFinishActions.main(crazyNoisy.day, timer);
        promises.push(crazyNoisy.updateGameStatus("discuss"));
        promises.push(crazyNoisy.putDiscussion());
        pushMessage = pushMessage.concat(pushFinishActionsMessage);
        promises.push(dabyss.pushMessage(crazyNoisy.groupId, pushMessage));
    }
    else { // 洗脳が完了したら
        yield crazyNoisy.updateGameStatus("winner"); // 勝者発表状況をtrueにする
        const isWinnerGuru = true;
        const winnerIndexes = yield crazyNoisy.getWinnerIndexes();
        const replyWinner = yield Promise.resolve().then(() => require("./template/replyWinner"));
        const displayNames = yield crazyNoisy.getDisplayNames();
        const pushWinnerMessage = yield replyWinner.main(displayNames, isWinnerGuru, winnerIndexes);
        pushMessage = pushMessage.concat(pushWinnerMessage);
        promises.push(dabyss.pushMessage(crazyNoisy.groupId, pushMessage));
    }
    yield Promise.all(promises);
    return;
});
