import * as lineClient from "./clients/lineClient";
import line = require('@line/bot-sdk');

import { User } from './classes/User';
import { WordWolf } from './classes/WordWolf';
import * as commonFunction from './template/functions/commonFunction'

process.on('uncaughtException', function (err) {
    console.log(err);
});

exports.handler = async (event: any, context: any): Promise<void> => {
    const lineEvent: line.MessageEvent = event.Input.event;
    console.log(lineEvent);

    const replyToken: string = lineEvent.replyToken;
    let message!: line.TextEventMessage;
    if (lineEvent.message.type == "text") {
        message = lineEvent.message;
    }
    const text: string = message.text;
    const source: line.EventSource = lineEvent.source;

    let groupId!: string;
    if (source.type == "group") {
        groupId = source.groupId;
    } else if (source.type == "room") {
        groupId = source.roomId; // roomIdもgroupId扱いしよう
    }

    const wordWolf: WordWolf = await WordWolf.createInstance(groupId);
    const status: string = wordWolf.gameStatus;

    if (status == "setting") {
        const settingNames: string[] = wordWolf.settingNames;
        const settingStatus: boolean[] = wordWolf.settingStatus;
        const isSettingCompleted: boolean = await wordWolf.isSettingCompleted();
        if (!isSettingCompleted) {
            for (let i = 0; i < settingNames.length; i++) {
                if (!settingStatus[i]) {
                    if (settingNames[i] == "depth") {
                        if (text == "1" || text == "2" || text == "3" || text == "5") {
                            return replyDepthChosen(wordWolf, text, replyToken);
                        }
                    }
                    if (settingNames[i] == "wolf_number") {
                        const wolfNumberExists: boolean = await wordWolf.wolfNumberExists(text); // ウルフの人数（"2人"など)が発言されたかどうか
                        if (wolfNumberExists) {
                            const wolfNumber: number = await wordWolf.getWolfNumberFromText(text); // textからウルフの人数(2など)を取得
                            return replyWolfNumberChosen(wordWolf, wolfNumber, replyToken);
                        }
                    }
                    if (settingNames[i] == "lunatic_number") {


                        const lunaticNumberExists: boolean = await wordWolf.lunaticNumberExists(text);
                        if (lunaticNumberExists) {
                            // 狂人の人数が発言された場合

                            const lunaticNumber: number = await wordWolf.getLunaticNumberFromText(text);
                            return replyLunaticNumberChosen(wordWolf, lunaticNumber, replyToken);
                        }
                    }
                    break;
                }
            }
        } else { // 設定項目がすべてtrueだったら
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
}

const replyDepthChosen = async (wordWolf: WordWolf, text: string, replyToken: string): Promise<void> => {

    // DB変更操作１、２
    // ワードセットはランダムで選んでる

    const settingIndex: number = await wordWolf.getSettingIndex("depth");

    await wordWolf.updateWordSet(Number(text));
    console.log(settingIndex);
    await wordWolf.updateSettingStateTrue(settingIndex);

    const isSettingCompleted: boolean = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // 設定が完了していなかったら
        const wolfNumberOptions: number[] = await wordWolf.getWolfNumberOptions();

        const replyMessage = require("./template/messages/replyDepthChosen");
        await lineClient.replyMessage(replyToken, await replyMessage.main(text, wolfNumberOptions));
    } else {
        return replyConfirm(wordWolf, replyToken);
    }
};

const replyWolfNumberChosen = async (wordWolf: WordWolf, wolfNumber: number, replyToken: string): Promise<void> => {
    const settingIndex: number = await wordWolf.getSettingIndex("wolf_number");

    //ウルフ番号データを挿入できたらステータスをtrueにする
    wordWolf.updateWolfIndexes(wolfNumber);
    await wordWolf.updateSettingStateTrue(settingIndex);

    const isSettingCompleted: boolean = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        const replyMessage = await import("./template/messages/replyWolfNumberChosen");
        const lunaticNumberOptions: number[] = await wordWolf.getLunaticNumberOptions();

        await lineClient.replyMessage(replyToken, await replyMessage.main(wolfNumber, lunaticNumberOptions));
    } else {
        return replyConfirm(wordWolf, replyToken);
    }
};

const replyLunaticNumberChosen = async (wordWolf: WordWolf, lunaticNumber: number, replyToken: string): Promise<void> => {
    const settingIndex: number = await wordWolf.getSettingIndex("lunatic_number");

    //狂人番号データを挿入できたらステータスをtrueにする
    wordWolf.updateLunaticIndexes(lunaticNumber)
    await wordWolf.updateSettingStateTrue(settingIndex);

    const isSettingCompleted: boolean = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // const replyMessage = require("../template/messages/word_wolf/replyLunaticNumberChosen");
    } else {
        return replyConfirm(wordWolf, replyToken);
    }
};

const replyConfirm = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const userNumber: number = await wordWolf.getUserNumber();
    const depth: number = wordWolf.depth;
    const wolfNumber: number = wordWolf.wolfIndexes.length;
    const lunaticNumber: number = wordWolf.lunaticIndexes.length;
    const timerString: string = await wordWolf.getTimerString();

    const replyMessage = await import("./template/messages/replyChanged");
    await lineClient.replyMessage(replyToken, await replyMessage.main(userNumber, depth, wolfNumber, lunaticNumber, timerString));
};

const replyDepthChange = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const index = await wordWolf.getSettingIndex("depth");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに

    const replyMessage = await import("./template/messages/replyDepthChange");
    await lineClient.replyMessage(replyToken, await replyMessage.main());
};

const replyWolfNumberChange = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const index = await wordWolf.getSettingIndex("wolf_number");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに

    const wolfNumberOptions = await wordWolf.getWolfNumberOptions();
    const replyMessage = await import("./template/messages/replyWolfNumberChange");
    await lineClient.replyMessage(replyToken, await replyMessage.main(wolfNumberOptions));
};

const replyLunaticNumberChange = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const index = await wordWolf.getSettingIndex("lunatic_number");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに

    const lunaticNumberOptions = await wordWolf.getLunaticNumberOptions();
    const replyMessage = await import("./template/messages/replyLunaticNumberChange");
    await lineClient.replyMessage(replyToken, await replyMessage.main(lunaticNumberOptions));
};

const replyTimerChange = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const index = await wordWolf.getSettingIndex("timer");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに

    const replyMessage = await import("./template/messages/replyTimerChange");
    await lineClient.replyMessage(replyToken, await replyMessage.main());
};

const replyConfirmYes = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    wordWolf.updateGameStatus("discuss");
    wordWolf.putDiscussion(); // 話し合い時間に関する設定を挿入

    const displayNames = await wordWolf.getDisplayNames();
    const wolfIndexes = wordWolf.wolfIndexes;
    const lunaticIndexes = wordWolf.lunaticIndexes;
    const citizenWord = wordWolf.citizenWord;
    const wolfWord = wordWolf.wolfWord;

    const userIds: string[] = wordWolf.userIds;
    let userWords: string[] = [];
    let isLunatic: boolean[] = [];
    for (let i = 0; i < userIds.length; i++) {
        if (wolfIndexes.indexOf(i) == -1) {
            userWords[i] = citizenWord;
        } else {
            userWords[i] = wolfWord;
        }

        if (lunaticIndexes.indexOf(i) == -1) {
            isLunatic[i] = false;
        } else {
            isLunatic[i] = true;
        }
    }

    for (let i = 0; i < userIds.length; i++) {
        // プッシュメッセージ数節約のため開発時は一時的に無効化
        try {
            const pushMessage = await import("./template/messages/pushUserWord");
            await lineClient.pushMessage(userIds[i], await pushMessage.main(displayNames[i], userWords[i], isLunatic[i]));
        } catch (err) {
            console.error(err);
        }
    }

    const timer = await wordWolf.getTimerString(); // タイマー設定を取得

    const replyMessage = await import("./template/messages/replyConfirmYes");
    await lineClient.replyMessage(replyToken, await replyMessage.main(timer));
};

const replyDiscussFinish = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    // DB変更操作１，２
    // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
    wordWolf.putFirstVote();
    wordWolf.updateGameStatus("vote");

    const userNumber: number = await wordWolf.getUserNumber();
    const shuffleUserIndexes: number[] = await commonFunction.makeShuffuleNumberArray(userNumber);

    let displayNames: string[] = [];

    // 公平にするため投票用の順番はランダムにする
    for (let i = 0; i < userNumber; i++) {
        displayNames[i] = await wordWolf.getDisplayName(shuffleUserIndexes[i]);
    }

    //if (usePostback) { // postbackを使う設定の場合
    const replyMessage = await import("./template/messages/replyDiscussFinish");

    await lineClient.replyMessage(replyToken, await replyMessage.main(shuffleUserIndexes, displayNames));
};