import line = require('@line/bot-sdk');
import dabyss = require('dabyss');
import jinro = require('jinro');

exports.handler = async (event: any, context: any): Promise<void> => {
    const lineEvent: line.PostbackEvent = event.Input.event;
    console.log(lineEvent);

    const replyToken: string = lineEvent.replyToken;
    const postback: line.Postback = lineEvent.postback;
    let time!: string;
    if (postback.params != undefined) {
        if (postback.params.time != undefined) {
            time = postback.params.time;
        }
    }
    const source: line.EventSource = lineEvent.source;

    let groupId!: string;
    let userId!: string;
    if (source.type == "group") {
        groupId = source.groupId;
    } else if (source.type == "room") {
        groupId = source.roomId; // roomIdもgroupId扱いしよう
    }

    if (source.userId != undefined) {
        userId = source.userId;
    }

    const jinro: jinro.Jinro = await jinro.Jinro.createInstance(groupId);
    const status: string = jinro.gameStatus;

    if (status == "setting") {
        const settingNames = jinro.settingNames;
        const settingStatus = jinro.settingStatus;
        for (let i = 0; i < settingNames.length; i++) {
            if (!settingStatus[i]) {
                if (settingNames[i] == "timer") {
                    return replyTimerChosen(jinro, time, replyToken);
                }
            }
        }
    }
}

const replyTimerChosen = async (jinro: jinro.Jinro, time: string, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const settingIndex = await jinro.getSettingIndex("timer");

    promises.push(jinro.updateTimer(time));
    await jinro.updateSettingStateTrue(settingIndex);

    const isSettingCompleted = await jinro.isSettingCompleted();
    if (!isSettingCompleted) {
    } else {
        promises.push(replyConfirm(jinro, replyToken));
    }

    await Promise.all(promises);
    return;
};

const replyConfirm = async (jinro: jinro.Jinro, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const userNumber = await jinro.getUserNumber();
    const mode = jinro.gameMode;
    const type = jinro.talkType;
    const timer = await jinro.getTimerString();
    const zeroGuru = jinro.zeroGuru;
    const zeroDetective = jinro.zeroDetective;

    const replyMessage = await import("./template/replyChanged");
    promises.push(dabyss.replyMessage(replyToken, await replyMessage.main(userNumber, mode, type, timer, zeroGuru, zeroDetective)));

    await Promise.all(promises);
    return;
};

