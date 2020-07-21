import * as lineClient from "./dabyss-module/clients/lineClient";
import line = require('@line/bot-sdk');

import { User } from './dabyss-module/classes/User';
import { Group } from './dabyss-module/classes/Group';
import { WordWolf } from './wordWolf-module/classes/WordWolf';
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
    const userNumber: number = await wordWolf.getUserNumber();

    let minNumber = 2;

    if (userNumber < minNumber) {
        // 参加者数が2人以下の場合
        return replyTooFewParticipant(wordWolf, replyToken);
    } else {
        // 参加受付終了の意思表明に対するリプライ
        // 参加受付を終了した旨（TODO 参加者を変更したい場合はもう一度「参加者が」ゲーム名を発言するように言う）、参加者のリスト、該当ゲームの最初の設定のメッセージを送る
        return replyRollCallEnd(wordWolf, replyToken);
    }
}

const replyTooFewParticipant = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const userNumber = await wordWolf.getUserNumber(); // 参加者数
    const recruitingGameName = wordWolf.gameName;

    const replyMessage = await import("./template/replyTooFewParticipant");
    await lineClient.replyMessage(replyToken, await replyMessage.main(userNumber, recruitingGameName));
};

const replyRollCallEnd = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const group: Group = await Group.createInstance(wordWolf.groupId);
    const displayNames: string[] = await wordWolf.getDisplayNames(); // 参加者の表示名リスト

    // DB変更操作１
    promises.push(wordWolf.updateDefaultSettingStatus());
    promises.push(group.updateStatus("play")); // 参加者リストをプレイ中にして、募集中を解除する

    const replyMessage = await import("./template/replyRollCallEnd");
    promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(displayNames)));

    await Promise.all(promises);
    return;
};