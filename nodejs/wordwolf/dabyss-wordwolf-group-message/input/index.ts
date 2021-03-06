import * as lineClient from "./dabyss-module/clients/lineClient";
import line = require('@line/bot-sdk');

import { User } from './dabyss-module/classes/User';
import { Group } from './dabyss-module/classes/Group';
import { WordWolf } from './wordwolf-module/classes/WordWolf';
import * as commonFunction from './dabyss-module/functions/commonFunction';

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
        if (settingStatus == [] || settingStatus == undefined) {
            const group: Group = await Group.createInstance(groupId);
            if (group.status == "recruit") {
                return replyRollCallEnd(group, wordWolf, replyToken);
            }
        } else {

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
}

const replyRollCallEnd = async (group: Group, wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const displayNames: string[] = await wordWolf.getDisplayNames(); // 参加者の表示名リスト

    // DB変更操作１
    promises.push(wordWolf.updateDefaultSettingStatus());
    promises.push(group.updateStatus("play")); // 参加者リストをプレイ中にして、募集中を解除する

    const replyMessage = await import("./template/replyRollCallEnd");
    promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(displayNames)));

    await Promise.all(promises);
    return;
};

const replyDepthChosen = async (wordWolf: WordWolf, text: string, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const settingIndex: number = await wordWolf.getSettingIndex("depth");

    promises.push(wordWolf.updateWordSet(Number(text)));
    await wordWolf.updateSettingStateTrue(settingIndex);

    const isSettingCompleted: boolean = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // 設定が完了していなかったら
        const wolfNumberOptions: number[] = await wordWolf.getWolfNumberOptions();

        const replyMessage = require("./template/replyDepthChosen");
        promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(text, wolfNumberOptions)));
    } else {
        promises.push(replyConfirm(wordWolf, replyToken));
    }
    await Promise.all(promises);
    return;
};

const replyWolfNumberChosen = async (wordWolf: WordWolf, wolfNumber: number, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const settingIndex: number = await wordWolf.getSettingIndex("wolf_number");

    //ウルフ番号データを挿入できたらステータスをtrueにする
    promises.push(wordWolf.updateWolfIndexes(wolfNumber));
    await wordWolf.updateSettingStateTrue(settingIndex);

    const isSettingCompleted: boolean = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        const lunaticNumberOptions: number[] = await wordWolf.getLunaticNumberOptions();

        const replyMessage = await import("./template/replyWolfNumberChosen");
        promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(wolfNumber, lunaticNumberOptions)));
    } else {
        promises.push(replyConfirm(wordWolf, replyToken));
    }
    await Promise.all(promises);
    return;
};

const replyLunaticNumberChosen = async (wordWolf: WordWolf, lunaticNumber: number, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const settingIndex: number = await wordWolf.getSettingIndex("lunatic_number");

    //狂人番号データを挿入できたらステータスをtrueにする
    promises.push(wordWolf.updateLunaticIndexes(lunaticNumber));
    await wordWolf.updateSettingStateTrue(settingIndex);

    const isSettingCompleted: boolean = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // const replyMessage = require("../template/messages/word_wolf/replyLunaticNumberChosen");
    } else {
        promises.push(replyConfirm(wordWolf, replyToken));
    }
    await Promise.all(promises);
    return;
};

const replyConfirm = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const userNumber: number = await wordWolf.getUserNumber();
    const depth: number = wordWolf.depth;
    const wolfNumber: number = wordWolf.wolfIndexes.length;
    const lunaticNumber: number = wordWolf.lunaticIndexes.length;
    const timerString: string = await wordWolf.getTimerString();

    const replyMessage = await import("./template/replyChanged");
    await lineClient.replyMessage(replyToken, await replyMessage.main(userNumber, depth, wolfNumber, lunaticNumber, timerString));
    return;
};

const replyDepthChange = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const index = await wordWolf.getSettingIndex("depth");
    promises.push(wordWolf.updateSettingStateFalse(index)); // 設定状態をfalseに

    const replyMessage = await import("./template/replyDepthChange");
    promises.push(lineClient.replyMessage(replyToken, await replyMessage.main()));

    await Promise.all(promises);
    return;
};

const replyWolfNumberChange = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const index = await wordWolf.getSettingIndex("wolf_number");
    promises.push(wordWolf.updateSettingStateFalse(index)); // 設定状態をfalseに

    const wolfNumberOptions = await wordWolf.getWolfNumberOptions();
    const replyMessage = await import("./template/replyWolfNumberChange");
    promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(wolfNumberOptions)));

    await Promise.all(promises);
    return;
};

const replyLunaticNumberChange = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const index = await wordWolf.getSettingIndex("lunatic_number");
    promises.push(wordWolf.updateSettingStateFalse(index)); // 設定状態をfalseに

    const lunaticNumberOptions = await wordWolf.getLunaticNumberOptions();
    const replyMessage = await import("./template/replyLunaticNumberChange");
    promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(lunaticNumberOptions)));

    await Promise.all(promises);
    return;
};

const replyTimerChange = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const index = await wordWolf.getSettingIndex("timer");
    promises.push(wordWolf.updateSettingStateFalse(index)); // 設定状態をfalseに

    const replyMessage = await import("./template/replyTimerChange");
    promises.push(lineClient.replyMessage(replyToken, await replyMessage.main()));

    await Promise.all(promises);
    return;
};

const replyConfirmYes = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    promises.push(wordWolf.updateGameStatus("discuss"));
    promises.push(wordWolf.putDiscussion()); // 話し合い時間に関する設定を挿入

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
            const pushMessage = await import("./template/pushUserWord");
            promises.push(lineClient.pushMessage(userIds[i], await pushMessage.main(displayNames[i], userWords[i], isLunatic[i])));
        } catch (err) {
            console.error(err);
        }
    }

    const timer = await wordWolf.getTimerString(); // タイマー設定を取得

    const replyMessage = await import("./template/replyConfirmYes");
    promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(timer)));

    await Promise.all(promises);
    return;
};

const replyDiscussFinish = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    // DB変更操作１，２
    // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
    promises.push(wordWolf.putFirstVote());
    promises.push(wordWolf.updateGameStatus("vote"));

    const userNumber: number = await wordWolf.getUserNumber();
    const shuffleUserIndexes: number[] = await commonFunction.makeShuffuleNumberArray(userNumber);

    let displayNames: string[] = [];

    // 公平にするため投票用の順番はランダムにする
    for (let i = 0; i < userNumber; i++) {
        displayNames[i] = await wordWolf.getDisplayName(shuffleUserIndexes[i]);
    }

    //if (usePostback) { // postbackを使う設定の場合
    const replyMessage = await import("./template/replyDiscussFinish");

    promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(shuffleUserIndexes, displayNames)));

    await Promise.all(promises);
    return;
};

const replyAnnounceResult = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const displayNames: string[] = await wordWolf.getDisplayNames();

    promises.push(wordWolf.updateGameStatus("result"));
    const group: Group = await Group.createInstance(wordWolf.groupId);
    promises.push(group.finishGroup());

    const replyMessage = await import("./template/replyAnnounceResult");

    promises.push(lineClient.replyMessage(replyToken,
        await replyMessage.main(
            displayNames,
            wordWolf.wolfIndexes,
            wordWolf.lunaticIndexes,
            wordWolf.citizenWord,
            wordWolf.wolfWord,
            wordWolf.winner
        )
    ));

    await Promise.all(promises);
    return;
};