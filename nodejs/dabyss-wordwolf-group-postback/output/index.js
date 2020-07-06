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
        if (postbackData == "残り時間") {
            return replyRemainingTime(wordWolf, replyToken);
        }
    }
    // if (status == "vote") {
    //     const userIndex = await wordWolf.getUserIndexFromUserId(userId);
    //     const voteState = await wordWolf.isVotedUser(userIndex);
    //     if (!voteState) {
    //         // postbackした参加者の投票がまだの場合
    //         const votedUserIndex = await wordWolf.getUserIndexFromUserId(postbackData); // postbackDataがuserIdじゃなかったら-1がかえる
    //         const isUserCandidate = await wordWolf.isUserCandidate(votedUserIndex);
    //         if (isUserCandidate) {
    //             // postbackのデータが候補者のインデックスだった場合
    //             // ※
    //             if (userId != postbackData) {
    //                 // 自分以外に投票していた場合
    //                 await replyVoteSuccess(plId, postbackData, replyToken, userIndex);
    //             } else {
    //                 // 自分に投票していた場合
    //                 await replySelfVote(plId, replyToken, userIndex);
    //             }
    //         }
    //     } else {
    //         await replyDuplicateVote(plId, replyToken, userIndex);
    //     }
    // }
});
const replyRemainingTime = (wordWolf, replyToken) => __awaiter(void 0, void 0, void 0, function* () {
    const remainingTime = yield wordWolf.getRemainingTime();
    const replyMessage = yield Promise.resolve().then(() => require("./template/messages/replyRemainingTime"));
    yield lineClient.replyMessage(replyToken, yield replyMessage.main(remainingTime));
});
