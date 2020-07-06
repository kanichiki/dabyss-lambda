const line = require("./clients/lineClient");

const User = require("./classes/User");
const Group = require("./classes/Group");
const Game = require('./classes/Game');

process.on('uncaughtException', function (err) {
    console.log(err);
});

exports.handler = async (event, context) => {
    const lineEvent = event.Input.event;
    console.log(lineEvent);

    const eventType = lineEvent.type;
    const userId = lineEvent.source.userId;
    const user = await User.createInstance(userId);
    const replyToken = lineEvent.replyToken;

    let isFriend = true;
    try {
        await line.getProfile(userId);

    } catch (err) {
        isFriend = false;
    }

    // TODO 友達追加されていないユーザーの場合の分岐
    if (isFriend) {
        if (eventType == "message") {
            const text = lineEvent.message.text;
            const toType = lineEvent.source.type;

            if (toType == "group" || toType == "room") {
                let groupId;
                if (toType == "group") {
                    groupId = lineEvent.source.groupId;
                } else if (toType == "room") {
                    groupId = lineEvent.source.roomId; // roomIdもgroupId扱いしよう
                }
                const group = await Group.createInstance(groupId);

                if (text == "ゲーム一覧") {
                    return replyGameList(replyToken);
                }

                const groupExists = group.exists;
                const isUser = user.exists; // ユーザーのデータがあるかどうか


                const gameNameExists = await Game.gameNameExists(text);
                if (gameNameExists) {

                    if (groupExists) {
                        const isRestarting = group.isRestarting;
                        if (!isRestarting) {

                            const status = group.status;
                            if (status == "recruit") {

                                // 参加者募集中のゲームがあるが新しくゲームの参加者を募集するかどうかを聞く旨のリプライを返す
                                return replyRestartConfirmIfRecruiting(groupId, text, replyToken);

                            }
                            if (status == "play") {
                                const game = await Game.createInstance(groupId);
                                const isUserParticipate = await game.isUserExists(userId);
                                if (isUserParticipate) { // 参加者の発言の場合

                                    // プレイ中のゲームがあるが新しくゲームの参加者を募集するかどうかを聞く旨のリプライを返す
                                    return replyRestartConfirmIfPlaying(groupId, text, replyToken);
                                }

                            }
                        }
                    }

                    // 参加を募集する旨のリプライを返す
                    return replyRollCall(groupId, text, replyToken);
                } else { // 発言の内容がゲーム名じゃないなら
                    if (groupExists) {
                        const status = group.status;

                        group.updateIsRestartingFalse(); // 発言グループのリスタート待ちを解除

                        if (status == "recruit") { // 参加者募集中の場合
                            const game = await Game.createInstance(groupId);

                            if (text == "参加") {
                                if (isUser) { // ユーザーテーブルにデータがあるか
                                    const hasGroupId = await user.hasGroupId();
                                    const isUserParticipate = await game.isUserExists(userId); // 発言ユーザーが参加者かどうか
                                    if (hasGroupId && !isUserParticipate) { // ユーザーに参加中のgroupがあってそれが当該グループではない場合

                                        const isUserRestarting = user.isRestarting;
                                        if (!isUserRestarting) { // restart待ちじゃなかったら

                                            return replyParticipateConfirm(userId, replyToken);
                                        }

                                    }
                                }
                                // 参加意思表明に対するリプライ
                                // 参加を受け付けた旨、現在の参加者のリスト、参加募集継続中の旨を送る
                                return replyParticipate(groupId, userId, replyToken);
                            } else {
                                if (isUser) {
                                    user.updateIsRestartingFalse(); // もし「参加」以外の言葉がユーザーから発言されたら確認状況をリセットする
                                }
                            }

                            const isUserParticipate = await game.isUserExists(userId); // 発言ユーザーが参加者かどうか
                            if (isUserParticipate) { // 参加受付を終了できるのは参加済みの者のみ

                                if (text == "受付終了") {
                                    const gameName = game.gameName;

                                    return { "game": gameName, "eventType": "groupMessage", "status": "recruit", "event": lineEvent };

                                    // if (gameId == 2) { // クレイジーノイジーの場合

                                    //     await crazyNoisyBranch.rollCallBranch(plId, replyToken);
                                    //     continue;
                                    // }
                                    // if (gameId == 3) { // 人狼の場合
                                    //     const options = {
                                    //         uri: "http://localhost:8000/rollcall",
                                    //         headers: {
                                    //             "Content-type": "application/json"
                                    //         },
                                    //         // これがpythonに渡される
                                    //         json: {
                                    //             "replyToken": replyToken,
                                    //             "pl_id": plId
                                    //         }
                                    //     };
                                    //     request.post(options, (error, response, body) => { });
                                    //     pl.updateIsRecruitingFalse();
                                    //     pl.updateIsPlayingTrue();
                                    // }
                                }
                            }
                        }

                        if (status == "play") {　// プレイ中の場合
                            const game = await Game.createInstance(groupId);

                            const isUserParticipate = await game.isUserExists(userId);
                            if (isUserParticipate) { // 参加者の発言の場合
                                //     if (text == "強制終了") {
                                //         await replyTerminate(plId, replyToken);
                                //         continue;
                                //     }

                                const gameName = game.gameName;
                                return { "game": gameName, "eventType": "groupMessage", "status": "play", "event": lineEvent };
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

            } else if (toType == "user") {
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


        } else if (eventType == "postback") {
            const toType = lineEvent.source.type;

            if (toType == "group" || toType == "room") {
                let groupId = "";
                if (toType == "group") {
                    groupId = lineEvent.source.groupId;
                } else if (toType == "room") {
                    groupId = lineEvent.source.roomId; // roomIdもgroupId扱いしよう
                }

                const group = await Group.createInstance(groupId);
                const groupExists = group.exists;

                if (groupExists) {
                    const status = group.status;
                    if (status == "play") {

                        const game = await Game.createInstance(groupId);
                        const isUserParticipate = await game.isUserExists(userId);
                        if (isUserParticipate) {
                            if (lineEvent.postback.params != undefined) {
                                //                 const params = lineEvent.postback.params;

                                //                 if (gameId == 1) {
                                //                     await wordWolfBranch.postbackDatetimeBranch(plId, userId, params, replyToken);
                                //                     continue;
                                //                 }
                                //                 if (gameId == 2) {
                                //                     await crazyNoisyBranch.postbackDatetimeBranch(plId, userId, params, replyToken);
                                //                     continue;
                                //                 }
                                //                 if (gameId == 3) { // 人狼の場合

                                //                 }
                            } else {
                                const gameName = game.gameName;
                                return { "game": gameName, "eventType": "groupPostback", "status": "play", "event": lineEvent };
                            }
                        }
                    }
                    // } else if (toType == "user") {
                    //     const hasPlId = await user.hasPlId();
                    //     if (hasPlId) { // 参加中の参加者リストがあるなら
                    //         const plId = await user.getPlid();

                    //         const playingGame = new PlayingGame(plId);
                    //         const gameId = await playingGame.getGameId();

                    //         if (gameId == 2) {

                    //             await crazyNoisyBranch.postbackUserBranch(plId, userId, postbackData, replyToken);
                    //         }

                    //         if (gameId == 3) { // 人狼の場合

                    //         }
                    //     }
                }
            }
        }
    }

}


/**
 * ゲームリストを返す
 *
 * @param {*} replyToken
 */
const replyGameList = async (replyToken) => {
    const replyMessage = require("./template/messages/replyGameList");
    await line.replyMessage(replyToken, await replyMessage.main());
    return { "game": "none" };
}

const replyRollCall = async (groupId, text, replyToken) => {
    const replyMessage = require("./template/messages/replyRollCall");
    await line.replyMessage(replyToken, await replyMessage.main(text));

    const group = await Group.createInstance(groupId);

    const groupExists = group.exists;

    if (groupExists) {
        const isRestarting = group.isRestarting;
        // DB変更操作１
        if (isRestarting) {
            await group.finishGroup();
        }
    }

    group.putGroup();

    const game = await Game.createInstance(groupId);
    game.putGame(text);

    return { "game": "none" };
}

const replyParticipate = async (groupId, userId, replyToken) => {
    const user = await User.createInstance(userId);

    const game = await Game.createInstance(groupId);
    const displayName = await user.getDisplayName();

    const isUserParticipant = await game.isUserExists(userId);
    // DB変更操作１
    if (!isUserParticipant) { // ユーザーがまだ参加してない場合
        //   const displayNameExists = await pl.displayNameExists(plId, displayName);
        //   if (!displayNameExists) { // 同じ名前の参加者が存在しなければ

        let displayNames = await game.getDisplayNames(); // 参加者リストのユーザー全員の表示名の配列
        displayNames.push(displayName);
        const replyMessage = require("./template/messages/replyParticipate");
        await line.replyMessage(replyToken, await replyMessage.main(game.gameName, displayName, displayNames));

        game.appendUserId(userId);

        const isUser = user.exists;
        if (isUser) { // ユーザーデータがある場合

            const isUserRestarting = user.isRestarting;
            if (isUserRestarting) { // ユーザーがリスタート待ちの場合

                const hasGroupId = await user.hasGroupId();
                if (hasGroupId) { // リスタート待ちの間に消えてる可能性もあるので

                    const oldGroupId = user.groupId;
                    if (groupId != oldGroupId) {
                        const oldGroup = await Group.createInstance(oldGroupId);
                        oldGroup.finishGroup();

                        try {
                            const pushMessage = require("./template/messages/pushGameFinish");
                            // 終了したゲームのグループにその旨を送る
                            line.pushMessage(oldGroupId, await pushMessage.main());
                        } catch (err) {

                        }
                    }
                }
            }
        }
        user.putUser(groupId);

        //   } else { // 同じ名前のユーザーが存在するなら
        //     const replyMessage = require("../template/messages/replyDisplayNameExists");
        //     return line.replyMessage(replyToken, await replyMessage.main());
        //   }

    } else { // 既に参加していた場合
        const replyMessage = require("./template/messages/replyAlreadyParticipate");
        await line.replyMessage(replyToken, await replyMessage.main(displayName));
    }
    return { "game": "none" };
}

const replyParticipateConfirm = async (userId, replyToken) => {
    const user = await User.createInstance(userId);

    // DB変更操作１．
    user.updateIsRestartingTrue(); // 確認状況をtrueにする
    const displayName = await user.getDisplayName();

    const replyMessage = require("./template/messages/replyParticipateConfirm");
    await line.replyMessage(replyToken, await replyMessage.main(displayName));
    return { "game": "none" };
}

const replyRestartConfirmIfRecruiting = async (groupId, text, replyToken) => {
    const group = await Group.createInstance(groupId);

    const game = await Game.createInstance(groupId);

    // DB変更操作１
    group.updateIsRestartingTrue(); // 参加者リストをリスタート待ちにする

    const recruitingGameName = game.gameName;

    // 一応newGameNameも渡すがまだ使ってない
    // TODO is_restartingをrestart_game_idに変更する
    const replyMessage = require("./template/messages/replyRestartConfirmIfRecruiting");
    await line.replyMessage(replyToken, await replyMessage.main(recruitingGameName, text));
    return { "game": "none" };
}

const replyRestartConfirmIfPlaying = async (groupId, text, replyToken) => {
    const group = await Group.createInstance(groupId);

    const game = await Game.createInstance(groupId);

    // DB変更操作１
    group.updateIsRestartingTrue(); // 参加者リストをリスタート待ちにする

    const playingGameName = game.gameName;

    // 一応newGameNameも渡すがまだ使ってない
    const replyMessage = require("./template/messages/replyRestartConfirmIfPlaying");
    await line.replyMessage(replyToken, await replyMessage.main(playingGameName, text));
    return { "game": "none" };
}