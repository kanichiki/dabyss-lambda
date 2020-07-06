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
const lineClient = require("./clients/lineClient");
const WordWolf_1 = require("./classes/WordWolf");
const commonFunction = require("./template/functions/commonFunction");
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
    if (status == "discuss") {
        // 話し合い中だった場合
        if (text == "終了") {
            return replyDiscussFinish(wordWolf, replyToken);
        }
    }
    // if (status == "winner") {
    //     // すべての結果発表がまだなら
    //     if (text == "ワードを見る") {
    //         await replyAnnounceResult(plId, replyToken);
    //     }
    // }
});
const replyDepthChosen = (wordWolf, text, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    // DB変更操作１、２
    // ワードセットはランダムで選んでる
    const settingIndex = yield wordWolf.getSettingIndex("depth");
    yield wordWolf.updateWordSet(Number(text));
    console.log(settingIndex);
    yield wordWolf.updateSettingStateTrue(settingIndex);
    const isSettingCompleted = yield wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // 設定が完了していなかったら
        const wolfNumberOptions = yield wordWolf.getWolfNumberOptions();
        const replyMessage = require("./template/messages/replyDepthChosen");
        yield lineClient.replyMessage(replyToken, yield replyMessage.main(text, wolfNumberOptions));
    }
    else {
        return replyConfirm(wordWolf, replyToken);
    }
});
const replyWolfNumberChosen = (wordWolf, wolfNumber, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const settingIndex = yield wordWolf.getSettingIndex("wolf_number");
    //ウルフ番号データを挿入できたらステータスをtrueにする
    wordWolf.updateWolfIndexes(wolfNumber);
    yield wordWolf.updateSettingStateTrue(settingIndex);
    const isSettingCompleted = yield wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyWolfNumberChosen"));
        const lunaticNumberOptions = yield wordWolf.getLunaticNumberOptions();
        yield lineClient.replyMessage(replyToken, yield replyMessage.main(wolfNumber, lunaticNumberOptions));
    }
    else {
        return replyConfirm(wordWolf, replyToken);
    }
});
const replyLunaticNumberChosen = (wordWolf, lunaticNumber, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const settingIndex = yield wordWolf.getSettingIndex("lunatic_number");
    //狂人番号データを挿入できたらステータスをtrueにする
    wordWolf.updateLunaticIndexes(lunaticNumber);
    yield wordWolf.updateSettingStateTrue(settingIndex);
    const isSettingCompleted = yield wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // const replyMessage = require("../template/messages/word_wolf/replyLunaticNumberChosen");
    }
    else {
        return replyConfirm(wordWolf, replyToken);
    }
});
const replyConfirm = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const userNumber = yield wordWolf.getUserNumber();
    const depth = wordWolf.depth;
    const wolfNumber = wordWolf.wolfIndexes.length;
    const lunaticNumber = wordWolf.lunaticIndexes.length;
    const timerString = yield wordWolf.getTimerString();
    const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyChanged"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(userNumber, depth, wolfNumber, lunaticNumber, timerString));
});
const replyDepthChange = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const index = yield wordWolf.getSettingIndex("depth");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに
    const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyDepthChange"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main());
});
const replyWolfNumberChange = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const index = yield wordWolf.getSettingIndex("wolf_number");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに
    const wolfNumberOptions = yield wordWolf.getWolfNumberOptions();
    const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyWolfNumberChange"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(wolfNumberOptions));
});
const replyLunaticNumberChange = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const index = yield wordWolf.getSettingIndex("lunatic_number");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに
    const lunaticNumberOptions = yield wordWolf.getLunaticNumberOptions();
    const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyLunaticNumberChange"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(lunaticNumberOptions));
});
const replyTimerChange = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const index = yield wordWolf.getSettingIndex("timer");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに
    const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyTimerChange"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main());
});
const replyConfirmYes = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    wordWolf.updateGameStatus("discuss");
    wordWolf.putDiscussion(); // 話し合い時間に関する設定を挿入
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
            const pushMessage = yield Promise.resolve().then(() => require("./template/messages/pushUserWord"));
            yield lineClient.pushMessage(userIds[i], yield pushMessage.main(displayNames[i], userWords[i], isLunatic[i]));
        }
        catch (err) {
            console.error(err);
        }
    }
    const timer = yield wordWolf.getTimerString(); // タイマー設定を取得
    const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyConfirmYes"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(timer));
});
const replyDiscussFinish = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    // DB変更操作１，２
    // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
    wordWolf.putFirstVote();
    wordWolf.updateGameStatus("vote");
    const userNumber = yield wordWolf.getUserNumber();
    const shuffleUserIndexes = yield commonFunction.makeShuffuleNumberArray(userNumber);
    let displayNames = [];
    // 公平にするため投票用の順番はランダムにする
    for (let i = 0; i < userNumber; i++) {
        displayNames[i] = yield wordWolf.getDisplayName(shuffleUserIndexes[i]);
    }
    //if (usePostback) { // postbackを使う設定の場合
    const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyDiscussFinish"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(shuffleUserIndexes, displayNames));
});
