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
const WordWolf_1 = require("./wordwolf-module/classes/WordWolf");
const commonFunction = require("./dabyss-module/functions/commonFunction");
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
    const status = wordWolf.gameStatus;
    if (status == "setting") {
        const settingNames = wordWolf.settingNames;
        const settingStatus = wordWolf.settingStatus;
        if (settingStatus == [] || settingStatus == undefined) {
            const group = yield Group_1.Group.createInstance(groupId);
            if (group.status == "recruit") {
                return replyRollCallEnd(group, wordWolf, replyToken);
            }
        }
        else {
            const isSettingCompleted = yield wordWolf.isSettingCompleted();
            if (!isSettingCompleted) {
                for (let i = 0; i < settingNames.length; i++) {
                    if (!settingStatus[i]) {
                        if (settingNames[i] == "depth") {
                            if (text == "1" || text == "2" || text == "3" || text == "5") {
                                return replyDepthChosen(wordWolf, text, replyToken);
                            }
                        }
                        if (settingNames[i] == "wolf_number") {
                            const wolfNumberExists = yield wordWolf.wolfNumberExists(text); // ウルフの人数（"2人"など)が発言されたかどうか
                            if (wolfNumberExists) {
                                const wolfNumber = yield wordWolf.getWolfNumberFromText(text); // textからウルフの人数(2など)を取得
                                return replyWolfNumberChosen(wordWolf, wolfNumber, replyToken);
                            }
                        }
                        if (settingNames[i] == "lunatic_number") {
                            const lunaticNumberExists = yield wordWolf.lunaticNumberExists(text);
                            if (lunaticNumberExists) {
                                // 狂人の人数が発言された場合
                                const lunaticNumber = yield wordWolf.getLunaticNumberFromText(text);
                                return replyLunaticNumberChosen(wordWolf, lunaticNumber, replyToken);
                            }
                        }
                        break;
                    }
                }
            }
            else { // 設定項目がすべてtrueだったら
                if (text == "ゲームを開始する") {
                    return replyConfirmYes(wordWolf, replyToken);
                }
                if (text == "難易度変更") {
                    return replyDepthChange(wordWolf, replyToken);
                }
                if (text == "ウルフ人数変更") {
                    return replyWolfNumberChange(wordWolf, replyToken);
                }
                if (text == "狂人人数変更") {
                    return replyLunaticNumberChange(wordWolf, replyToken);
                }
                if (text == "議論時間変更") {
                    return replyTimerChange(wordWolf, replyToken);
                }
            }
        }
    }
    if (status == "discuss") {
        // 話し合い中だった場合
        if (text == "終了") {
            return replyDiscussFinish(wordWolf, replyToken);
        }
    }
    if (status == "winner") {
        // すべての結果発表がまだなら
        if (text == "ワードを見る") {
            return replyAnnounceResult(wordWolf, replyToken);
        }
    }
});
const replyRollCallEnd = (group, wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const displayNames = yield wordWolf.getDisplayNames(); // 参加者の表示名リスト
    // DB変更操作１
    promises.push(wordWolf.updateDefaultSettingStatus());
    promises.push(group.updateStatus("play")); // 参加者リストをプレイ中にして、募集中を解除する
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyRollCallEnd"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(displayNames)));
    yield Promise.all(promises);
    return;
});
const replyDepthChosen = (wordWolf, text, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const settingIndex = yield wordWolf.getSettingIndex("depth");
    promises.push(wordWolf.updateWordSet(Number(text)));
    yield wordWolf.updateSettingStateTrue(settingIndex);
    const isSettingCompleted = yield wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // 設定が完了していなかったら
        const wolfNumberOptions = yield wordWolf.getWolfNumberOptions();
        const replyMessage = require("./template/replyDepthChosen");
        promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(text, wolfNumberOptions)));
    }
    else {
        promises.push(replyConfirm(wordWolf, replyToken));
    }
    yield Promise.all(promises);
    return;
});
const replyWolfNumberChosen = (wordWolf, wolfNumber, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const settingIndex = yield wordWolf.getSettingIndex("wolf_number");
    //ウルフ番号データを挿入できたらステータスをtrueにする
    promises.push(wordWolf.updateWolfIndexes(wolfNumber));
    yield wordWolf.updateSettingStateTrue(settingIndex);
    const isSettingCompleted = yield wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        const lunaticNumberOptions = yield wordWolf.getLunaticNumberOptions();
        const replyMessage = yield Promise.resolve().then(() => require("./template/replyWolfNumberChosen"));
        promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(wolfNumber, lunaticNumberOptions)));
    }
    else {
        promises.push(replyConfirm(wordWolf, replyToken));
    }
    yield Promise.all(promises);
    return;
});
const replyLunaticNumberChosen = (wordWolf, lunaticNumber, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const settingIndex = yield wordWolf.getSettingIndex("lunatic_number");
    //狂人番号データを挿入できたらステータスをtrueにする
    promises.push(wordWolf.updateLunaticIndexes(lunaticNumber));
    yield wordWolf.updateSettingStateTrue(settingIndex);
    const isSettingCompleted = yield wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // const replyMessage = require("../template/messages/word_wolf/replyLunaticNumberChosen");
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
const replyDepthChange = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const index = yield wordWolf.getSettingIndex("depth");
    promises.push(wordWolf.updateSettingStateFalse(index)); // 設定状態をfalseに
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyDepthChange"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main()));
    yield Promise.all(promises);
    return;
});
const replyWolfNumberChange = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const index = yield wordWolf.getSettingIndex("wolf_number");
    promises.push(wordWolf.updateSettingStateFalse(index)); // 設定状態をfalseに
    const wolfNumberOptions = yield wordWolf.getWolfNumberOptions();
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyWolfNumberChange"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(wolfNumberOptions)));
    yield Promise.all(promises);
    return;
});
const replyLunaticNumberChange = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const index = yield wordWolf.getSettingIndex("lunatic_number");
    promises.push(wordWolf.updateSettingStateFalse(index)); // 設定状態をfalseに
    const lunaticNumberOptions = yield wordWolf.getLunaticNumberOptions();
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyLunaticNumberChange"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(lunaticNumberOptions)));
    yield Promise.all(promises);
    return;
});
const replyTimerChange = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const index = yield wordWolf.getSettingIndex("timer");
    promises.push(wordWolf.updateSettingStateFalse(index)); // 設定状態をfalseに
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyTimerChange"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main()));
    yield Promise.all(promises);
    return;
});
const replyConfirmYes = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    promises.push(wordWolf.updateGameStatus("discuss"));
    promises.push(wordWolf.putDiscussion()); // 話し合い時間に関する設定を挿入
    const displayNames = yield wordWolf.getDisplayNames();
    const wolfIndexes = wordWolf.wolfIndexes;
    const lunaticIndexes = wordWolf.lunaticIndexes;
    const citizenWord = wordWolf.citizenWord;
    const wolfWord = wordWolf.wolfWord;
    const userIds = wordWolf.userIds;
    let userWords = [];
    let isLunatic = [];
    for (let i = 0; i < userIds.length; i++) {
        if (wolfIndexes.indexOf(i) == -1) {
            userWords[i] = citizenWord;
        }
        else {
            userWords[i] = wolfWord;
        }
        if (lunaticIndexes.indexOf(i) == -1) {
            isLunatic[i] = false;
        }
        else {
            isLunatic[i] = true;
        }
    }
    for (let i = 0; i < userIds.length; i++) {
        // プッシュメッセージ数節約のため開発時は一時的に無効化
        try {
            const pushMessage = yield Promise.resolve().then(() => require("./template/pushUserWord"));
            promises.push(lineClient.pushMessage(userIds[i], yield pushMessage.main(displayNames[i], userWords[i], isLunatic[i])));
        }
        catch (err) {
            console.error(err);
        }
    }
    const timer = yield wordWolf.getTimerString(); // タイマー設定を取得
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyConfirmYes"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(timer)));
    yield Promise.all(promises);
    return;
});
const replyDiscussFinish = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    // DB変更操作１，２
    // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
    promises.push(wordWolf.putFirstVote());
    promises.push(wordWolf.updateGameStatus("vote"));
    const userNumber = yield wordWolf.getUserNumber();
    const shuffleUserIndexes = yield commonFunction.makeShuffuleNumberArray(userNumber);
    let displayNames = [];
    // 公平にするため投票用の順番はランダムにする
    for (let i = 0; i < userNumber; i++) {
        displayNames[i] = yield wordWolf.getDisplayName(shuffleUserIndexes[i]);
    }
    //if (usePostback) { // postbackを使う設定の場合
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyDiscussFinish"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(shuffleUserIndexes, displayNames)));
    yield Promise.all(promises);
    return;
});
const replyAnnounceResult = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const displayNames = yield wordWolf.getDisplayNames();
    promises.push(wordWolf.updateGameStatus("result"));
    const group = yield Group_1.Group.createInstance(wordWolf.groupId);
    promises.push(group.finishGroup());
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyAnnounceResult"));
    promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(displayNames, wordWolf.wolfIndexes, wordWolf.lunaticIndexes, wordWolf.citizenWord, wordWolf.wolfWord, wordWolf.winner)));
    yield Promise.all(promises);
    return;
});
