import * as lineClient from "./clients/lineClient";
import line = require('@line/bot-sdk');

import { User } from './classes/User';
import { WordWolf } from './classes/WordWolf';

process.on('uncaughtException', function (err) {
    console.log(err);
});

exports.handler = async (event: any, context: any): Promise<void> => {
    const lineEvent: line.PostbackEvent = event.Input.event;
    console.log(lineEvent);

    const replyToken: string = lineEvent.replyToken;
    const postback: line.Postback = lineEvent.postback;
    const postbackData: string = postback.data;
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

    const wordWolf: WordWolf = await WordWolf.createInstance(groupId);
    const status: string = wordWolf.gameStatus;

    if (status == "discuss") {
        if (postbackData == "残り時間") {
            return replyRemainingTime(wordWolf, replyToken);
        }
    }

    if (status == "vote") {
        const userIndex: number = await wordWolf.getUserIndexFromUserId(userId);
        const voteState: boolean = await wordWolf.isVotedUser(userIndex);
        if (!voteState) {
            // postbackした参加者の投票がまだの場合

            const votedUserIndex: number = await wordWolf.getUserIndexFromUserId(postbackData); // postbackDataがuserIdじゃなかったら-1がかえる
            const isUserCandidate: boolean = await wordWolf.isUserCandidate(votedUserIndex);
            if (isUserCandidate) {
                // postbackのデータが候補者のインデックスだった場合

                // ※
                if (userId != postbackData) {
                    // 自分以外に投票していた場合
                    await replyVoteSuccess(wordWolf, postbackData, replyToken, userIndex);
                } else {
                    // 自分に投票していた場合
                    // await replySelfVote(plId, replyToken, userIndex);
                }
            }
        } else {
            // await replyDuplicateVote(plId, replyToken, userIndex);
        }
    }
}

const replyRemainingTime = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const remainingTime = await wordWolf.getRemainingTime();

    const replyMessage = await import("./template/messages/replyRemainingTime");
    await lineClient.replyMessage(replyToken, await replyMessage.main(remainingTime));
};

const replyVoteSuccess = async (wordWolf: WordWolf, postbackData: string, replyToken: string, userIndex: number) => {
    const voterDisplayName: string = await wordWolf.getDisplayName(userIndex);

    // DB変更操作１，２
    // 投票ユーザーの投票状況をtrueにできたら得票ユーザーの得票数を+1する同期処理
    const votedUserIndex: number = await wordWolf.getUserIndexFromUserId(postbackData);
    await wordWolf.vote(userIndex, votedUserIndex);

    // const isVoteCompleted = await wordWolf.isVoteCompleted();
    // if (isVoteCompleted) {
    //     const multipleMostVotedUserExists = await wordWolf.multipleMostVotedUserExists();
    //     if (!multipleMostVotedUserExists) {
    //         // 最多得票者が一人だった場合

    //         const replyMessage = require("../template/messages/word_wolf/replyAnnounceWinner");
    //         const mostVotedUserIndex = await wordWolf.getMostVotedUserIndex(); // 最多得票者＝処刑者
    //         const executorDisplayName = await wordWolf.getDisplayName(mostVotedUserIndex);
    //         const isExecutorWolf = await wordWolf.isUserWolf(mostVotedUserIndex); // 処刑者がウルフかどうか

    //         await wordWolf.updateStatus("winner"); // 勝者発表状況をtrueにする
    //         if (isExecutorWolf) {
    //             wordWolf.updateWinner("citizen");
    //         } else {
    //             wordWolf.updateWinner("wolf");
    //         }
    //         const displayNames = await wordWolf.getDisplayNames();
    //         const isWinnerArray = await wordWolf.isWinnerArray(isExecutorWolf);

    //         return client.replyMessage(
    //             replyToken,
    //             await replyMessage.main(
    //                 voterDisplayName,
    //                 executorDisplayName,
    //                 isExecutorWolf,
    //                 displayNames,
    //                 isWinnerArray
    //             )
    //         );
    //     } else {
    //         // 最多得票者が複数いた場合
    //         const mostVotedUserIndexes = await wordWolf.getMostVotedUserIndexes(); // 最多得票者の配列
    //         const isRevoting = (await wordWolf.getVoteCount()) > 1;
    //         if (!isRevoting) {
    //             // 一回目の投票の場合

    //             const replyMessage = require("../template/messages/word_wolf/replyRevote");

    //             // DB変更操作３’，４’
    //             // 再投票データを作成したら、投票データを初期化する同期処理
    //             await wordWolf.createRevote(mostVotedUserIndexes);

    //             const displayNames = await wordWolf.getDisplayNames();
    //             const userIds = await wordWolf.getUserIds();
    //             return client.replyMessage(
    //                 replyToken,
    //                 await replyMessage.main(
    //                     voterDisplayName,
    //                     displayNames,
    //                     userIds,
    //                     mostVotedUserIndexes
    //                 )
    //             );
    //         } else {
    //             const replyMessage = require("../template/messages/word_wolf/replyAnnounceWinnerInRevote");
    //             const executorIndex = await wordWolf.chooseExecutorIndex(); // 処刑者をランダムで決定
    //             const executorDisplayName = await wordWolf.getDisplayName(
    //                 executorIndex
    //             );
    //             const isExecutorWolf = await wordWolf.isUserWolf(executorIndex); // 処刑者がウルフかどうか

    //             await wordWolf.updateStatus("winner");
    //             if (isExecutorWolf) {
    //                 wordWolf.updateWinner("citizen");
    //             } else {
    //                 wordWolf.updateWinner("wolf");
    //             }
    //             const displayNames = await wordWolf.getDisplayNames();
    //             const isWinnerArray = await wordWolf.isWinnerArray(isExecutorWolf);

    //             return client.replyMessage(
    //                 replyToken,
    //                 await replyMessage.main(
    //                     voterDisplayName,
    //                     executorDisplayName,
    //                     isExecutorWolf,
    //                     displayNames,
    //                     isWinnerArray
    //                 )
    //             );
    //         }
    //     }
    // } else {
    //     const replyMessage = require("../template/messages/word_wolf/replyVoteSuccess");
    //     return client.replyMessage(
    //         replyToken,
    //         await replyMessage.main(voterDisplayName)
    //     );
    // }
};

