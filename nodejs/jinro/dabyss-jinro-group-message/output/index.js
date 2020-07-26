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
const crazynoisy = require("crazynoisy");
const dabyss = require("dabyss");
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
    const crazyNoisy = yield crazynoisy.CrazyNoisy.createInstance(groupId);
    const status = crazyNoisy.gameStatus;
    if (status == "setting") {
        const settingNames = crazyNoisy.settingNames;
        const settingStatus = crazyNoisy.settingStatus;
        if (settingStatus == [] || settingStatus == undefined) {
            const group = yield dabyss.Group.createInstance(groupId);
            if (group.status == "recruit") {
                return replyRollCallEnd(group, crazyNoisy, replyToken);
            }
        }
        else {
            const isSettingCompleted = yield crazyNoisy.isSettingCompleted();
            if (!isSettingCompleted) {
                for (let i = 0; i < settingNames.length; i++) {
                    if (!settingStatus[i]) {
                        if (settingNames[i] == "mode") {
                            if (text == "ノーマル" || text == "デモ") {
                                return replyModeChosen(crazyNoisy, text, replyToken);
                            }
                        }
                        if (settingNames[i] == "type") {
                            if ((text == "1" || text == "2") || text == "3") {
                                yield replyTypeChosen(crazyNoisy, text, replyToken);
                            }
                        }
                        break; // これがないと設定繰り返しちゃう
                    }
                }
            }
            else { // 設定項目がすべてtrueだったら
                let changeSetting = "";
                switch (text) {
                    case "ゲームを開始する":
                        yield replyConfirmYes(crazyNoisy, replyToken);
                        break;
                    case "モード変更":
                        changeSetting = "mode";
                        break;
                    case "話し合い方法変更":
                        changeSetting = "type";
                        break;
                    case "議論時間変更":
                        changeSetting = "timer";
                        break;
                    case "0日目洗脳有無":
                        changeSetting = "zeroGuru";
                        break;
                    case "0日目調査有無":
                        changeSetting = "zeroDetective";
                        break;
                }
                if (changeSetting != "") {
                    yield replySettingChange(crazyNoisy, changeSetting, replyToken);
                }
            }
        }
    }
    else if (text == "役職人数確認") {
        // await replyPositionNumber(crazyNoisy, replyToken);
    }
    if (status == "discuss") {
        // 話し合い中だった場合
        if (text == "終了") {
            yield replyDiscussFinish(crazyNoisy, replyToken);
        }
    }
    if (status == "winner") {
        // すべての結果発表がまだなら
        if (text == "役職・狂気を見る") {
            yield replyAnnounceResult(crazyNoisy, replyToken);
        }
    }
});
const replyRollCallEnd = (group, crazyNoisy, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const displayNames = yield crazyNoisy.getDisplayNames(); // 参加者の表示名リスト
    // DB変更操作１
    promises.push(crazyNoisy.updateDefaultSettingStatus());
    promises.push(group.updateStatus("play")); // 参加者リストをプレイ中にして、募集中を解除する
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyRollCallEnd"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(displayNames)));
    yield Promise.all(promises);
    return;
});
const replyModeChosen = (crazyNoisy, text, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    promises.push(crazyNoisy.updateGameMode(text));
    yield crazyNoisy.updateSettingState("mode", true);
    const isSettingCompleted = yield crazyNoisy.isSettingCompleted();
    if (!isSettingCompleted) {
        const replyMessage = yield Promise.resolve().then(() => require("./template/replyModeChosen"));
        promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(text)));
    }
    else {
        promises.push(replyConfirm(crazyNoisy, replyToken));
    }
    yield Promise.all(promises);
    return;
});
const replyTypeChosen = (crazyNoisy, text, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    promises.push(crazyNoisy.updateTalkType(Number(text)));
    yield crazyNoisy.updateSettingState("type", true);
    const isSettingCompleted = yield crazyNoisy.isSettingCompleted();
    if (!isSettingCompleted) {
    }
    else {
        promises.push(replyConfirm(crazyNoisy, replyToken));
    }
    yield Promise.all(promises);
    return;
});
const replySettingChange = (crazyNoisy, setting, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    if (setting == "mode") {
        promises.push(crazyNoisy.updateSettingState(setting, false)); // 設定状態をfalseに
        const replyMessage = yield Promise.resolve().then(() => require("./template/replyModeChange"));
        promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main()));
    }
    if (setting == "type") {
        promises.push(crazyNoisy.updateSettingState(setting, false)); // 設定状態をfalseに
        const replyMessage = yield Promise.resolve().then(() => require("./template/replyTypeChange"));
        promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main()));
    }
    if (setting == "timer") {
        promises.push(crazyNoisy.updateSettingState(setting, false)); // 設定状態をfalseに
        const replyMessage = yield Promise.resolve().then(() => require("./template/replyTimerChange"));
        promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main()));
    }
    if (setting == "zeroGuru") {
        yield crazyNoisy.switchZeroGuru();
        promises.push(replyConfirm(crazyNoisy, replyToken));
    }
    if (setting == "zeroDetective") {
        yield crazyNoisy.switchZeroDetective();
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
const replyConfirmYes = (crazyNoisy, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    promises.push(crazyNoisy.updateGameStatus("action"));
    yield crazyNoisy.updatePositions();
    const mode = crazyNoisy.gameMode;
    if (mode != "デモ") {
        promises.push(crazyNoisy.updateDefaultCrazinessIds());
    }
    else {
        promises.push(crazyNoisy.updateDefaultCrazinessIdsInDemo());
    }
    promises.push(crazyNoisy.updateDefaultBrainwashStatus()); // 洗脳ステータスを初期配置
    promises.push(crazyNoisy.updateDefaultPositionConfirmStatus()); // 役職確認ステータスを全員false
    const userIds = crazyNoisy.userIds;
    const displayNames = yield crazyNoisy.getDisplayNames();
    const positions = crazyNoisy.positions;
    const userNumber = yield crazyNoisy.getUserNumber();
    const zeroGuru = crazyNoisy.zeroGuru;
    const zeroDetective = crazyNoisy.zeroDetective;
    promises.push(crazyNoisy.putZeroAction());
    for (let i = 0; i < userNumber; i++) {
        const targetDisplayNames = yield crazyNoisy.getDisplayNamesExceptOneself(i);
        const targetUserIndexes = yield crazyNoisy.getUserIndexesExceptOneself(i);
        const pushPosition = yield Promise.resolve().then(() => require("./template/pushUserPosition"));
        promises.push(dabyss.pushMessage(userIds[i], yield pushPosition.main(displayNames[i], positions[i], targetDisplayNames, targetUserIndexes, zeroGuru, zeroDetective)));
    }
    const numberOption = Math.floor((userNumber - 1) / 3);
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyConfirmYes"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(userNumber, numberOption)));
    yield Promise.all(promises);
    return;
});
const replyDiscussFinish = (crazyNoisy, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    // DB変更操作１，２
    // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
    promises.push(crazyNoisy.putFirstVote());
    promises.push(crazyNoisy.updateGameStatus("vote"));
    const userNumber = yield crazyNoisy.getUserNumber();
    const shuffleUserIndexes = yield dabyss.makeShuffuleNumberArray(userNumber);
    let displayNames = [];
    // 公平にするため投票用の順番はランダムにする
    for (let i = 0; i < userNumber; i++) {
        displayNames[i] = yield crazyNoisy.getDisplayName(shuffleUserIndexes[i]);
    }
    //if (usePostback) { // postbackを使う設定の場合
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyDiscussFinish"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(shuffleUserIndexes, displayNames)));
    yield Promise.all(promises);
    return;
});
const replyAnnounceResult = (crazyNoisy, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    promises.push(crazyNoisy.updateGameStatus("result"));
    const group = yield dabyss.Group.createInstance(crazyNoisy.groupId);
    promises.push(group.finishGroup());
    const userNumber = yield crazyNoisy.getUserNumber();
    const displayNames = yield crazyNoisy.getDisplayNames();
    const positions = crazyNoisy.positions;
    const crazinessIds = crazyNoisy.crazinessIds;
    let contentsList = [];
    for (let i = 0; i < userNumber; i++) {
        let contents = [];
        if (crazinessIds[i][0] != null) {
            for (let crazinessId of crazinessIds[i]) {
                const craziness = yield crazynoisy.Craziness.createInstance(crazinessId);
                const content = craziness.content;
                contents.push(content);
            }
        }
        contentsList.push(contents);
    }
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyAnnounceResult"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(displayNames, positions, contentsList)));
    yield Promise.all(promises);
    return;
});
