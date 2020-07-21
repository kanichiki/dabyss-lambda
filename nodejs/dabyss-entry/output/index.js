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
process.on('uncaughtException', function (err) {
    console.log(err);
});
exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const lineEvent = event.Input.event;
    console.log(lineEvent);
    if (lineEvent.source.userId != undefined) {
        const userId = lineEvent.source.userId;
        const user = yield dabyss.User.createInstance(userId);
        let isFriend = true;
        try {
            yield dabyss.getProfile(userId);
        }
        catch (err) {
            isFriend = false;
        }
        // TODO 友達追加されていないユーザーの場合の分岐
        if (isFriend) {
            if (lineEvent.type == "message") {
                const replyToken = lineEvent.replyToken;
                if (lineEvent.message.type == "text") { // テキストメッセージイベントなら
                    const text = lineEvent.message.text;
                    if (lineEvent.source.type == "group" || lineEvent.source.type == "room") {
                        let groupId;
                        if (lineEvent.source.type == "group") {
                            groupId = lineEvent.source.groupId;
                        }
                        else if (lineEvent.source.type == "room") {
                            groupId = lineEvent.source.roomId; // roomIdもgroupId扱いしよう
                        }
                        const group = yield dabyss.Group.createInstance(groupId);
                        if (text == "ゲーム一覧") {
                            return replyGameList(replyToken);
                        }
                        const groupExists = group.exists;
                        const isUser = user.exists; // ユーザーのデータがあるかどうか
                        const gameNameExists = yield dabyss.Game.gameNameExists(text);
                        if (gameNameExists) {
                            if (groupExists) {
                                const isRestarting = group.isRestarting;
                                if (!isRestarting) {
                                    const status = group.status;
                                    if (status == "recruit") {
                                        // 参加者募集中のゲームがあるが新しくゲームの参加者を募集するかどうかを聞く旨のリプライを返す
                                        return replyRestartConfirmIfRecruiting(group, text, replyToken);
                                    }
                                    if (status == "play") {
                                        const game = yield dabyss.Game.createInstance(groupId);
                                        const isUserParticipate = yield game.isUserExists(userId);
                                        if (isUserParticipate) { // 参加者の発言の場合
                                            // プレイ中のゲームがあるが新しくゲームの参加者を募集するかどうかを聞く旨のリプライを返す
                                            return replyRestartConfirmIfPlaying(group, text, replyToken);
                                        }
                                    }
                                }
                            }
                            // 参加を募集する旨のリプライを返す
                            return replyRollCall(group, text, replyToken);
                        }
                        else { // 発言の内容がゲーム名じゃないなら
                            if (groupExists) {
                                const status = group.status;
                                group.updateIsRestarting(false); // 発言グループのリスタート待ちを解除
                                if (status == "recruit") { // 参加者募集中の場合
                                    const game = yield dabyss.Game.createInstance(groupId);
                                    if (text == "参加") {
                                        if (isUser) { // ユーザーテーブルにデータがあるか
                                            const hasGroupId = yield user.hasGroupId();
                                            const isUserParticipate = yield game.isUserExists(userId); // 発言ユーザーが参加者かどうか
                                            if (hasGroupId && !isUserParticipate) { // ユーザーに参加中のgroupがあってそれが当該グループではない場合
                                                const isUserRestarting = user.isRestarting;
                                                if (!isUserRestarting) { // restart待ちじゃなかったら
                                                    return replyParticipateConfirm(user, replyToken);
                                                }
                                            }
                                        }
                                        // 参加意思表明に対するリプライ
                                        // 参加を受け付けた旨、現在の参加者のリスト、参加募集継続中の旨を送る
                                        return replyParticipate(game, user, replyToken);
                                    }
                                    else {
                                        if (isUser) {
                                            user.updateIsRestarting(false); // もし「参加」以外の言葉がユーザーから発言されたら確認状況をリセットする
                                        }
                                    }
                                    const isUserParticipate = yield game.isUserExists(userId); // 発言ユーザーが参加者かどうか
                                    if (isUserParticipate) { // 参加受付を終了できるのは参加済みの者のみ
                                        if (text == "受付終了") {
                                            const userNumber = yield game.getUserNumber();
                                            const minNumber = yield game.getMinNumber();
                                            if (userNumber < minNumber) {
                                                // 参加者数が規定数以下の場合
                                                return replyTooFewParticipant(game, replyToken);
                                            }
                                            else {
                                                // 参加受付終了の意思表明に対するリプライ
                                                // 参加受付を終了した旨（TODO 参加者を変更したい場合はもう一度「参加者が」ゲーム名を発言するように言う）、参加者のリスト、該当ゲームの最初の設定のメッセージを送る
                                                const gameName = game.gameName;
                                                return { "game": gameName, "eventType": "groupMessage", "event": lineEvent };
                                            }
                                        }
                                    }
                                }
                                if (status == "play") { // プレイ中の場合
                                    const game = yield dabyss.Game.createInstance(groupId);
                                    const isUserParticipate = yield game.isUserExists(userId);
                                    if (isUserParticipate) { // 参加者の発言の場合
                                        //     if (text == "強制終了") {
                                        //         await replyTerminate(plId, replyToken);
                                        //         continue;
                                        //     }
                                        const gameName = game.gameName;
                                        return { "game": gameName, "eventType": "groupMessage", "event": lineEvent };
                                        //     if (gameId == 2) { // プレイするゲームがクレイジーノイジーの場合
                                        //         await crazyNoisyBranch.playingMessageBranch(plId, text, replyToken);
                                        //         continue;
                                        //     }
                                        //     if (gameId == 3) { // 人狼の場合
                                        //     }
                                    }
                                }
                            }
                        }
                        // await replyDefaultGroupMessage(lineEvent));
                    }
                    else if (lineEvent.source.type == "user") {
                        // const hasPlId = await user.hasPlId();
                        // if (hasPlId) { // 参加中の参加者リストがあるなら
                        //     const plId = await user.getPlid();
                        //     const playingGame = new PlayingGame(plId);
                        //     const gameId = await playingGame.getGameId();
                        //     if (gameId == 2) {
                        //         // await crazyNoisyBranch.userMessageBranch();
                        //     }
                        // }
                    }
                }
            }
            if (lineEvent.type == "postback") {
                if (lineEvent.source.type == "group" || lineEvent.source.type == "room") {
                    let groupId = "";
                    if (lineEvent.source.type == "group") {
                        groupId = lineEvent.source.groupId;
                    }
                    else if (lineEvent.source.type == "room") {
                        groupId = lineEvent.source.roomId; // roomIdもgroupId扱いしよう
                    }
                    const group = yield dabyss.Group.createInstance(groupId);
                    const groupExists = group.exists;
                    if (groupExists) {
                        const status = group.status;
                        if (status == "play") {
                            const game = yield dabyss.Game.createInstance(groupId);
                            const isUserParticipate = yield game.isUserExists(userId);
                            if (isUserParticipate) {
                                if (lineEvent.postback.params != undefined) {
                                    const gameName = game.gameName;
                                    return { "game": gameName, "eventType": "groupDatetimepicker", "event": lineEvent };
                                }
                                else {
                                    const gameName = game.gameName;
                                    return { "game": gameName, "eventType": "groupPostback", "event": lineEvent };
                                }
                            }
                        }
                    }
                }
                if (lineEvent.source.type == "user") {
                    const groupId = user.groupId;
                    const group = yield dabyss.Group.createInstance(groupId);
                    const groupExists = group.exists;
                    if (groupExists) {
                        const status = group.status;
                        if (status == "play") {
                            const game = yield dabyss.Game.createInstance(groupId);
                            const isUserParticipate = yield game.isUserExists(userId);
                            if (isUserParticipate) {
                                const gameName = game.gameName;
                                return { "game": gameName, "eventType": "userPostback", "event": lineEvent };
                            }
                        }
                    }
                }
            }
        }
    }
    return { "game": "none" };
});
/**
 * ゲームリストを返す
 *
 * @param {*} replyToken
 */
const replyGameList = (replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyGameList"));
    yield dabyss.replyMessage(replyToken, yield replyMessage.main());
    return { "game": "none" };
});
const replyRollCall = (group, text, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyRollCall"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(text)));
    if (group.exists) {
        promises.push(group.resetGroup());
    }
    else {
        promises.push(group.putGroup());
    }
    const game = yield dabyss.Game.createInstance(group.groupId);
    promises.push(game.putGame(text));
    yield Promise.all(promises);
    return { "game": "none" };
});
const replyParticipate = (game, user, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const displayName = yield user.getDisplayName();
    const isUserParticipant = yield game.isUserExists(user.userId);
    // DB変更操作１
    if (!isUserParticipant) { // ユーザーがまだ参加してない場合
        const displayNameExists = yield game.displayNameExists(displayName);
        if (!displayNameExists) { // 同じ名前の参加者が存在しなければ
            let displayNames = yield game.getDisplayNames(); // 参加者リストのユーザー全員の表示名の配列
            displayNames.push(displayName);
            const replyMessage = yield Promise.resolve().then(() => require("./template/replyParticipate"));
            promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(game.gameName, displayName, displayNames)));
            promises.push(game.appendUserId(user.userId));
            const isUser = user.exists;
            if (isUser) { // ユーザーデータがある場合
                const isUserRestarting = user.isRestarting;
                if (isUserRestarting) { // ユーザーがリスタート待ちの場合
                    const hasGroupId = yield user.hasGroupId();
                    if (hasGroupId) { // リスタート待ちの間に消えてる可能性もあるので
                        const oldGroupId = user.groupId;
                        if (game.groupId != oldGroupId) {
                            const oldGroup = yield dabyss.Group.createInstance(oldGroupId);
                            promises.push(oldGroup.finishGroup());
                            try {
                                const pushMessage = yield Promise.resolve().then(() => require("./template/pushGameFinish"));
                                // 終了したゲームのグループにその旨を送る
                                promises.push(dabyss.pushMessage(oldGroupId, yield pushMessage.main()));
                            }
                            catch (err) {
                            }
                        }
                    }
                }
                promises.push(user.updateGroupId(game.groupId));
            }
            else {
                promises.push(user.putUser(game.groupId));
            }
        }
        else { // 同じ名前のユーザーが存在するなら
            const replyMessage = yield Promise.resolve().then(() => require("./template/replyDisplayNameExists"));
            promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main()));
        }
    }
    else { // 既に参加していた場合
        const replyMessage = yield Promise.resolve().then(() => require("./template/replyAlreadyParticipate"));
        promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(displayName)));
    }
    yield Promise.all(promises);
    return { "game": "none" };
});
const replyParticipateConfirm = (user, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    promises.push(user.updateIsRestarting(true)); // 確認状況をtrueにする
    const displayName = yield user.getDisplayName();
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyParticipateConfirm"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(displayName)));
    yield Promise.all(promises);
    return { "game": "none" };
});
const replyRestartConfirmIfRecruiting = (group, text, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const game = yield dabyss.Game.createInstance(group.groupId);
    promises.push(group.updateIsRestarting(true)); // 参加者リストをリスタート待ちにする
    const recruitingGameName = game.gameName;
    // 一応newGameNameも渡すがまだ使ってない
    // TODO is_restartingをrestart_game_idに変更する
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyRestartConfirmIfRecruiting"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(recruitingGameName, text)));
    yield Promise.all(promises);
    return { "game": "none" };
});
const replyRestartConfirmIfPlaying = (group, text, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const game = yield dabyss.Game.createInstance(group.groupId);
    promises.push(group.updateIsRestarting(true)); // 参加者リストをリスタート待ちにする
    const playingGameName = game.gameName;
    // 一応newGameNameも渡すがまだ使ってない
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyRestartConfirmIfPlaying"));
    promises.push(dabyss.replyMessage(replyToken, yield replyMessage.main(playingGameName, text)));
    yield Promise.all(promises);
    return { "game": "none" };
});
const replyTooFewParticipant = (game, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const userNumber = yield game.getUserNumber(); // 参加者数
    const recruitingGameName = game.gameName;
    const minNumber = yield game.getMinNumber();
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyTooFewParticipant"));
    yield dabyss.replyMessage(replyToken, yield replyMessage.main(userNumber, recruitingGameName, minNumber));
    return { "game": "none" };
});
