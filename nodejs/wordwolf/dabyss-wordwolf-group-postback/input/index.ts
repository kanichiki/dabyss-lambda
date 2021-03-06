import * as lineClient from "./dabyss-module/clients/lineClient";
import line = require('@line/bot-sdk');

import { User } from './dabyss-module/classes/User';
import { WordWolf } from './wordwolf-module/classes/WordWolf';
import * as commonFunction from './dabyss-module/functions/commonFunction'


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
        await wordWolf.setDiscussion();
        if (postbackData == "残り時間") {
            return replyRemainingTime(wordWolf, replyToken);
        }
    }

    if (status == "vote") {
        await wordWolf.setVote();

        const userIndex: number = await wordWolf.getUserIndexFromUserId(userId);
        const voteState: boolean = await wordWolf.vote.isVotedUser(userIndex);
        if (!voteState) {
            // postbackした参加者の投票がまだの場合

            const votedUserIndex: number = Number(postbackData);
            const isUserCandidate: boolean = await wordWolf.vote.isUserCandidate(votedUserIndex);
            if (isUserCandidate) {
                // postbackのデータが候補者のインデックスだった場合

                // ※
                if (userIndex != votedUserIndex) {
                    // 自分以外に投票していた場合
                    return replyVoteSuccess(wordWolf, votedUserIndex, userIndex, replyToken);
                } else {
                    // 自分に投票していた場合
                    return replySelfVote(wordWolf, userIndex, replyToken);
                }
            }
        } else {
            return replyDuplicateVote(wordWolf, userIndex, replyToken);
        }
    }
}

const replyRemainingTime = async (wordWolf: WordWolf, replyToken: string): Promise<void> => {
    const remainingTime = await wordWolf.discussion.getRemainingTime();

    const replyMessage = await import("./template/replyRemainingTime");
    await lineClient.replyMessage(replyToken, await replyMessage.main(remainingTime));
};

const replyVoteSuccess = async (wordWolf: WordWolf, votedUserIndex: number, userIndex: number, replyToken: string): Promise<void> => {
    const promises: Promise<void>[] = [];

    const voterDisplayName: string = await wordWolf.getDisplayName(userIndex);

    // DB変更操作１，２
    // 投票ユーザーの投票状況をtrueにできたら得票ユーザーの得票数を+1する同期処理
    await wordWolf.vote.vote(userIndex, votedUserIndex);

    const isVoteCompleted: boolean = await wordWolf.vote.isVoteCompleted();
    if (isVoteCompleted) {
        const multipleMostVotedUserExists: boolean = await wordWolf.vote.multipleMostPolledUserExists();
        if (!multipleMostVotedUserExists) {
            // 最多得票者が一人だった場合

            const mostVotedUserIndex: number = await wordWolf.vote.getMostPolledUserIndex(); // 最多得票者＝処刑者
            const executorDisplayName: string = await wordWolf.getDisplayName(mostVotedUserIndex);
            const isExecutorWolf: boolean = await wordWolf.isUserWolf(mostVotedUserIndex); // 処刑者がウルフかどうか

            promises.push(wordWolf.updateGameStatus("winner")); // 勝者発表状況をtrueにする
            if (isExecutorWolf) {
                promises.push(wordWolf.updateWinner("citizen"));
            } else {
                promises.push(wordWolf.updateWinner("wolf"));
            }
            const displayNames: string[] = await wordWolf.getDisplayNames();
            const isWinnerArray: boolean[] = await wordWolf.isWinnerArray();

            const replyMessage = await import("./template/replyAnnounceWinner");
            promises.push(lineClient.replyMessage(
                replyToken,
                await replyMessage.main(
                    voterDisplayName,
                    executorDisplayName,
                    isExecutorWolf,
                    displayNames,
                    isWinnerArray
                )
            ));
        } else {
            // 最多得票者が複数いた場合
            const mostVotedUserIndexes: number[] = await wordWolf.vote.getMostPolledUserIndexes(); // 最多得票者の配列
            const isRevoting: boolean = wordWolf.vote.count > 1;
            if (!isRevoting) {
                // 一回目の投票の場合

                // DB変更操作３’，４’
                // 再投票データを作成したら、投票データを初期化する同期処理
                promises.push(wordWolf.putRevote());
                const shuffleMostVotedUserIndexes: number[] = await commonFunction.getRandomIndexes(mostVotedUserIndexes, mostVotedUserIndexes.length);

                const displayNames: string[] = await wordWolf.getDisplayNamesFromIndexes(shuffleMostVotedUserIndexes);

                const replyMessage = await import("./template/replyRevote");
                promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(voterDisplayName, shuffleMostVotedUserIndexes, displayNames)));
            } else {
                const executorIndex = await wordWolf.vote.chooseExecutorRandomly(); // 処刑者をランダムで決定
                const executorDisplayName = await wordWolf.getDisplayName(executorIndex);
                const isExecutorWolf = await wordWolf.isUserWolf(executorIndex); // 処刑者がウルフかどうか

                promises.push(wordWolf.updateGameStatus("winner"));
                if (isExecutorWolf) {
                    promises.push(wordWolf.updateWinner("citizen"));
                } else {
                    promises.push(wordWolf.updateWinner("wolf"));
                }
                const displayNames = await wordWolf.getDisplayNames();
                const isWinnerArray = await wordWolf.isWinnerArray();

                const replyMessage = await import("./template/replyAnnounceWinnerInRevote");
                promises.push(lineClient.replyMessage(
                    replyToken,
                    await replyMessage.main(
                        voterDisplayName,
                        executorDisplayName,
                        isExecutorWolf,
                        displayNames,
                        isWinnerArray
                    )
                ));
            }
        }
    } else {
        const replyMessage = await import("./template/replyVoteSuccess");
        promises.push(lineClient.replyMessage(replyToken, await replyMessage.main(voterDisplayName)));
    }

    await Promise.all(promises);
    return;
};

const replySelfVote = async (wordWolf: WordWolf, userIndex: number, replyToken: string): Promise<void> => {
    const displayName = await wordWolf.getDisplayName(userIndex);
    const replyMessage = await import("./template/replySelfVote");
    await lineClient.replyMessage(replyToken, await replyMessage.main(displayName));
};

const replyDuplicateVote = async (wordWolf: WordWolf, userIndex: number, replyToken: string): Promise<void> => {
    const displayName = await wordWolf.getDisplayName(userIndex);
    const replyMessage = await import("./template/replyDuplicateVote");
    await lineClient.replyMessage(replyToken, await replyMessage.main(displayName));
};

