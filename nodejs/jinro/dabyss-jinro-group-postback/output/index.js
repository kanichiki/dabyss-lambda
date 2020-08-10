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
const crazynoisy = require("crazynoisy");
process.on('uncaughtException', function (err) {
    console.log(err);
});
exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const lineEvent = event.Input.event;
    console.log(lineEvent);
    const replyToken = lineEvent.replyToken;
    const postback = lineEvent.postback;
    const postbackData = postback.data;
    const source = lineEvent.source;
    let groupId;
    let userId;
    if (source.type == "group") {
        groupId = source.groupId;
    }
    else if (source.type == "room") {
        groupId = source.roomId; // roomIdもgroupId扱いしよう
    }
    if (source.userId != undefined) {
        userId = source.userId;
    }
    const crazyNoisy = yield crazynoisy.CrazyNoisy.createInstance(groupId);
    const status = crazyNoisy.gameStatus;
    if (status == "action" && crazyNoisy.day == 0) {
        yield crazyNoisy.setAction();
        if (postbackData == "確認状況") {
            yield replyConfirmStatus(crazyNoisy, replyToken);
        }
    }
    if (status == "discuss") {
        yield crazyNoisy.setDiscussion();
        if (postbackData == "残り時間") {
            return replyRemainingTime(crazyNoisy, replyToken);
        }
    }
    if (status == "vote") {
        yield crazyNoisy.setVote();
        const userIndex = yield crazyNoisy.getUserIndexFromUserId(userId);
        const voteState = yield crazyNoisy.vote.isVotedUser(userIndex);
        if (!voteState) {
            // postbackした参加者の投票がまだの場合
            const votedUserIndex = Number(postbackData);
            const isUserCandidate = yield crazyNoisy.vote.isUserCandidate(votedUserIndex);
            if (isUserCandidate) {
                // postbackのデータが候補者のインデックスだった場合
                // ※
                if (userIndex != votedUserIndex) {
                    // 自分以外に投票していた場合
                    return replyVoteSuccess(crazyNoisy, votedUserIndex, userIndex, replyToken);
                }
                else {
                    // 自分に投票していた場合
                    return replySelfVote(crazyNoisy, userIndex, replyToken);
                }
            }
        }
        else {
            return replyDuplicateVote(crazyNoisy, userIndex, replyToken);
        }
    }
});
const replyConfirmStatus = (crazyNoisy, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const displayNames = yield crazyNoisy.getDisplayNames();
    const confirmStatus = crazyNoisy.action.actionStatus;
    let unconfirmed = [];
    for (let i = 0; i < displayNames.length; i++) {
        if (!confirmStatus[i]) {
            unconfirmed.push(displayNames[i]);
        }
    }
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyConfirmStatus"));
    yield dabyss.replyMessage(replyToken, yield replyMessage.main(unconfirmed));
});
const replyRemainingTime = (crazyNoisy, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const remainingTime = yield crazyNoisy.discussion.getRemainingTime();
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyRemainingTime"));
    yield dabyss.replyMessage(replyToken, yield replyMessage.main(remainingTime));
});
const replyVoteSuccess = (crazyNoisy, votedUserIndex, userIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const voterDisplayName = yield crazyNoisy.getDisplayName(userIndex);
    yield crazyNoisy.vote.vote(userIndex, votedUserIndex);
    let replyMessage = [];
    const replyVoteSuccess = yield Promise.resolve().then(() => require("./template/replyVoteSuccess"));
    replyMessage = replyMessage.concat(yield replyVoteSuccess.main(voterDisplayName));
    const isVoteCompleted = yield crazyNoisy.vote.isVoteCompleted();
    if (isVoteCompleted) {
        const displayNames = yield crazyNoisy.getDisplayNames();
        const multipleMostVotedUserExists = yield crazyNoisy.vote.multipleMostPolledUserExists();
        if (!multipleMostVotedUserExists) { // 最多得票者が一人だった場合
            const mostVotedUserIndex = yield crazyNoisy.vote.getMostPolledUserIndex(); // 最多得票者
            const executorDisplayName = yield crazyNoisy.getDisplayName(mostVotedUserIndex);
            const replyExecutor = yield Promise.resolve().then(() => require("./template/replyExecutor"));
            const replyExecutorMessage = yield replyExecutor.main(executorDisplayName);
            replyMessage = replyMessage.concat(replyExecutorMessage);
            const isGuru = yield crazyNoisy.isGuru(mostVotedUserIndex); // 最多得票者が教祖かどうか
            if (!isGuru) { // 最多得票者が教祖じゃなかった場合
                replyMessage = replyMessage.concat(yield replyExecutorIsNotGuru(crazyNoisy, executorDisplayName, mostVotedUserIndex));
                const isBrainwashCompleted = yield crazyNoisy.isBrainwashCompleted();
                if (!isBrainwashCompleted) {
                    replyMessage = replyMessage.concat(yield replyVoteFinish(crazyNoisy));
                }
                else { // 洗脳が完了したら
                    replyMessage = replyMessage.concat(yield replyBrainwashCompleted(crazyNoisy));
                }
            }
            else { // 最多得票者が教祖だった場合
                replyMessage = replyMessage.concat(yield replyCitizenWin(crazyNoisy));
            }
        }
        else { // 最多得票者が複数いた場合
            const mostVotedUserIndexes = yield crazyNoisy.vote.getMostPolledUserIndexes(); // 最多得票者の配列
            const isRevoting = (crazyNoisy.vote.count > 1);
            if (!isRevoting) { // 一回目の投票の場合
                const replyRevote = yield Promise.resolve().then(() => require("./template/replyRevote"));
                const replyRevoteMessage = yield replyRevote.main(mostVotedUserIndexes, displayNames);
                replyMessage = replyMessage.concat(replyRevoteMessage);
                // DB変更操作３’，４’
                // 再投票データを作成したら、投票データを初期化する同期処理
                promises.push(crazyNoisy.putRevote());
            }
            else { // 再投票中だった場合
                const executorIndex = yield crazyNoisy.vote.chooseExecutorRandomly(); // 処刑者をランダムで決定
                const executorDisplayName = yield crazyNoisy.getDisplayName(executorIndex);
                const replyExecutorInRevote = yield Promise.resolve().then(() => require("./template/replyExecutorInRevote"));
                const replyExecutorInRevoteMessage = yield replyExecutorInRevote.main(executorDisplayName);
                replyMessage = replyMessage.concat(replyExecutorInRevoteMessage);
                const isGuru = yield crazyNoisy.isGuru(executorIndex); // 最多得票者が教祖かどうか
                if (!isGuru) { // 最多得票者が教祖じゃなかった場合
                    replyMessage = replyMessage.concat(yield replyExecutorIsNotGuru(crazyNoisy, executorDisplayName, executorIndex));
                    const isBrainwashCompleted = yield crazyNoisy.isBrainwashCompleted();
                    if (!isBrainwashCompleted) {
                        replyMessage = replyMessage.concat(yield replyVoteFinish(crazyNoisy));
                    }
                    else { // 洗脳が完了したら
                        replyMessage = replyMessage.concat(yield replyBrainwashCompleted(crazyNoisy));
                    }
                }
                else { // 最多得票者が教祖だった場合
                    replyMessage = replyMessage.concat(yield replyCitizenWin(crazyNoisy));
                }
            }
        }
    }
    promises.push(dabyss.replyMessage(replyToken, replyMessage));
    yield Promise.all(promises);
    return;
});
const replyExecutorIsNotGuru = (crazyNoisy, executorDisplayName, executorIndex) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    yield crazyNoisy.updateBrainwashStateTrue(executorIndex); // 最多投票者洗脳
    promises.push(crazyNoisy.addCrazinessId(executorIndex)); // 最多投票者狂気追加
    const replyExecutorIsNotGuru = yield Promise.resolve().then(() => require("./template/replyExecutorIsNotGuru"));
    const replyExecutorIsNotGuruMessage = yield replyExecutorIsNotGuru.main(executorDisplayName);
    yield Promise.all(promises);
    return replyExecutorIsNotGuruMessage;
});
const replyVoteFinish = (crazyNoisy) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    promises.push(crazyNoisy.updateGameStatus("action")); // ステータスをアクション中に
    const displayNames = yield crazyNoisy.getDisplayNames();
    promises.push(crazyNoisy.setAction());
    for (let i = 0; i < crazyNoisy.userIds.length; i++) {
        const targetDisplayNames = yield crazyNoisy.getDisplayNamesExceptOneself(i);
        const targetIndexes = yield crazyNoisy.getUserIndexesExceptOneself(i);
        const isBrainwash = yield crazyNoisy.isBrainwash(i);
        const pushUserAction = yield Promise.resolve().then(() => require("./template/pushUserAction"));
        promises.push(dabyss.pushMessage(crazyNoisy.userIds[i], yield pushUserAction.main(displayNames[i], crazyNoisy.positions[i], isBrainwash, targetDisplayNames, targetIndexes)));
    }
    const replyVoteFinish = yield Promise.resolve().then(() => require("./template/replyVoteFinish"));
    const replyVoteFinishMessage = yield replyVoteFinish.main(crazyNoisy.day);
    return replyVoteFinishMessage;
});
const replyBrainwashCompleted = (crazyNoisy) => __awaiter(void 0, void 0, void 0, function* () {
    yield crazyNoisy.updateGameStatus("winner");
    yield crazyNoisy.updateWinner("guru");
    const winnerIndexes = yield crazyNoisy.getWinnerIndexes();
    const displayNames = yield crazyNoisy.getDisplayNames();
    const replyWinner = yield Promise.resolve().then(() => require("./template/replyWinner"));
    const replyWinnerMessage = yield replyWinner.main(displayNames, true, winnerIndexes);
    return replyWinnerMessage;
});
const replyCitizenWin = (crazyNoisy) => __awaiter(void 0, void 0, void 0, function* () {
    yield crazyNoisy.updateGameStatus("winner"); // 勝者発表状況をtrueにする
    const winnerIndexes = yield crazyNoisy.getWinnerIndexes();
    const displayNames = yield crazyNoisy.getDisplayNames();
    const replyWinner = yield Promise.resolve().then(() => require("./template/replyWinner"));
    const replyWinnerMessage = yield replyWinner.main(displayNames, false, winnerIndexes);
    return replyWinnerMessage;
});
const replySelfVote = (crazyNoisy, userIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const displayName = yield crazyNoisy.getDisplayName(userIndex);
    const replyMessage = yield Promise.resolve().then(() => require("./template/replySelfVote"));
    yield dabyss.replyMessage(replyToken, yield replyMessage.main(displayName));
});
const replyDuplicateVote = (crazyNoisy, userIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const displayName = yield crazyNoisy.getDisplayName(userIndex);
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyDuplicateVote"));
    yield dabyss.replyMessage(replyToken, yield replyMessage.main(displayName));
});
