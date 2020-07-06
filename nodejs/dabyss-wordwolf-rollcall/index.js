const line = require("./clients/lineClient");

const User = require("./classes/User");
const Group = require("./classes/Group");
const Game = require("./classes/Game");
const WordWolf = require('./classes/WordWolf');

process.on('uncaughtException', function (err) {
    console.log(err);
});

exports.handler = async (event, context) => {
    const lineEvent = event.Input.event;
    const toType = lineEvent.source.type;
    const replyToken = lineEvent.replyToken;

    let groupId;
    if (toType == "group") {
        groupId = lineEvent.source.groupId;
    } else if (toType == "room") {
        groupId = lineEvent.source.roomId; // roomIdもgroupId扱いしよう
    }
    const game = await Game.createInstance(groupId);
    const userNumber = await game.getUserNumber();

    let minNumber = 2;

    if (userNumber < minNumber) {
        // 参加者数が2人以下の場合
        return replyTooFewParticipant(groupId, replyToken);
    } else {
        // 参加受付終了の意思表明に対するリプライ
        // 参加受付を終了した旨（TODO 参加者を変更したい場合はもう一度「参加者が」ゲーム名を発言するように言う）、参加者のリスト、該当ゲームの最初の設定のメッセージを送る
        return replyRollCallEnd(groupId, replyToken);
    }
}

const replyTooFewParticipant = async (groupId, replyToken) => {
    const game = await Game.createInstance(groupId);

    const userNumber = await game.getUserNumber(); // 参加者数
    const recruitingGameName = "ワードウルフ";

    const replyMessage = require("./template/messages/replyTooFewParticipant");
    return line.replyMessage(replyToken, await replyMessage.main(userNumber, recruitingGameName));
};

const replyRollCallEnd = async (groupId, replyToken) => {
    const group = new Group(groupId);
    const wordWolf = await WordWolf.createInstance(groupId);

    const displayNames = await wordWolf.getDisplayNames(); // 参加者の表示名リスト

    // DB変更操作１
    wordWolf.updateDefaultSettingStatus();
    group.updateStatus("play"); // 参加者リストをプレイ中にして、募集中を解除する

    const replyMessage = require("./template/messages/replyRollCallEnd");
    return line.replyMessage(replyToken, await replyMessage.main(displayNames));
};