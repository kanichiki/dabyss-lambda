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
const WordWolf_1 = require("./wordWolf-module/classes/WordWolf");
const commonFunction = require("./dabyss-module/functions/commonFunction");
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
    const wordWolf = yield WordWolf_1.WordWolf.createInstance(groupId);
    const status = wordWolf.gameStatus;
    if (status == "discuss") {
        yield wordWolf.setDiscussion();
        if (postbackData == "残り時間") {
            return replyRemainingTime(wordWolf, replyToken);
        }
    }
    if (status == "vote") {
        yield wordWolf.setVote();
        const userIndex = yield wordWolf.getUserIndexFromUserId(userId);
        const voteState = yield wordWolf.vote.isVotedUser(userIndex);
        if (!voteState) {
            // postbackした参加者の投票がまだの場合
            const votedUserIndex = Number(postbackData);
            const isUserCandidate = yield wordWolf.vote.isUserCandidate(votedUserIndex);
            if (isUserCandidate) {
                // postbackのデータが候補者のインデックスだった場合
                // ※
                if (userIndex != votedUserIndex) {
                    // 自分以外に投票していた場合
                    return replyVoteSuccess(wordWolf, votedUserIndex, userIndex, replyToken);
                }
                else {
                    // 自分に投票していた場合
                    yield replySelfVote(wordWolf, userIndex, replyToken);
                }
            }
        }
        else {
            yield replyDuplicateVote(wordWolf, userIndex, replyToken);
        }
    }
});
const replyRemainingTime = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const remainingTime = yield wordWolf.discussion.getRemainingTime();
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyRemainingTime"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(remainingTime));
});
const replyVoteSuccess = (wordWolf, votedUserIndex, userIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const voterDisplayName = yield wordWolf.getDisplayName(userIndex);
    // DB変更操作１，２
    // 投票ユーザーの投票状況をtrueにできたら得票ユーザーの得票数を+1する同期処理
    yield wordWolf.vote.vote(userIndex, votedUserIndex);
    const isVoteCompleted = yield wordWolf.vote.isVoteCompleted();
    if (isVoteCompleted) {
        const multipleMostVotedUserExists = yield wordWolf.vote.multipleMostPolledUserExists();
        if (!multipleMostVotedUserExists) {
            // 最多得票者が一人だった場合
            const mostVotedUserIndex = yield wordWolf.vote.getMostPolledUserIndex(); // 最多得票者＝処刑者
            const executorDisplayName = yield wordWolf.getDisplayName(mostVotedUserIndex);
            const isExecutorWolf = yield wordWolf.isUserWolf(mostVotedUserIndex); // 処刑者がウルフかどうか
            promises.push(wordWolf.updateGameStatus("winner")); // 勝者発表状況をtrueにする
            if (isExecutorWolf) {
                promises.push(wordWolf.updateWinner("citizen"));
            }
            else {
                promises.push(wordWolf.updateWinner("wolf"));
            }
            const displayNames = yield wordWolf.getDisplayNames();
            const isWinnerArray = yield wordWolf.isWinnerArray();
            const replyMessage = yield Promise.resolve().then(() => require("./template/replyAnnounceWinner"));
            promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(voterDisplayName, executorDisplayName, isExecutorWolf, displayNames, isWinnerArray)));
        }
        else {
            // 最多得票者が複数いた場合
            const mostVotedUserIndexes = yield wordWolf.vote.getMostPolledUserIndexes(); // 最多得票者の配列
            const isRevoting = wordWolf.vote.count > 1;
            if (!isRevoting) {
                // 一回目の投票の場合
                // DB変更操作３’，４’
                // 再投票データを作成したら、投票データを初期化する同期処理
                promises.push(wordWolf.putRevote());
                const shuffleMostVotedUserIndexes = yield commonFunction.getRandomIndexes(mostVotedUserIndexes, mostVotedUserIndexes.length);
                const displayNames = yield wordWolf.getDisplayNamesFromIndexes(shuffleMostVotedUserIndexes);
                const replyMessage = yield Promise.resolve().then(() => require("./template/replyRevote"));
                promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(voterDisplayName, shuffleMostVotedUserIndexes, displayNames)));
            }
            else {
                const executorIndex = yield wordWolf.vote.chooseExecutorRandomly(); // 処刑者をランダムで決定
                const executorDisplayName = yield wordWolf.getDisplayName(executorIndex);
                const isExecutorWolf = yield wordWolf.isUserWolf(executorIndex); // 処刑者がウルフかどうか
                promises.push(wordWolf.updateGameStatus("winner"));
                if (isExecutorWolf) {
                    promises.push(wordWolf.updateWinner("citizen"));
                }
                else {
                    promises.push(wordWolf.updateWinner("wolf"));
                }
                const displayNames = yield wordWolf.getDisplayNames();
                const isWinnerArray = yield wordWolf.isWinnerArray();
                const replyMessage = yield Promise.resolve().then(() => require("./template/replyAnnounceWinnerInRevote"));
                promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(voterDisplayName, executorDisplayName, isExecutorWolf, displayNames, isWinnerArray)));
            }
        }
    }
    else {
        const replyMessage = yield Promise.resolve().then(() => require("./template/replyVoteSuccess"));
        promises.push(lineClient.replyMessage(replyToken, yield replyMessage.main(voterDisplayName)));
    }
    yield Promise.all(promises);
    return;
});
const replySelfVote = (wordWolf, userIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const displayName = yield wordWolf.getDisplayName(userIndex);
    const replyMessage = yield Promise.resolve().then(() => require("./template/replySelfVote"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(displayName));
});
const replyDuplicateVote = (wordWolf, userIndex, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const displayName = yield wordWolf.getDisplayName(userIndex);
    const replyMessage = yield Promise.resolve().then(() => require("./template/replyDuplicateVote"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(displayName));
});
