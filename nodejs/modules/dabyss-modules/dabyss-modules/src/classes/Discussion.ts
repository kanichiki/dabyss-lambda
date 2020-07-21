import * as aws from "../clients/awsClient";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as commonFunction from '../functions/commonFunction';

export class Discussion {
    discussionTable: string;
    gameId: number;
    day: number;
    discussionKey: DocumentClient.Key;
    groupId: string;
    timer: string;
    startTime: string;
    endTime: string;

    /**
     * Creates an instance of Discussion.
     * @param {number} gameId
     * @param {number} day
     * @memberof Discussion
     */
    constructor(gameId: number, day: number, groupId: string) {
        this.discussionTable = "dabyss-dev-discussion";

        this.gameId = gameId;
        this.day = day;
        this.discussionKey = {
            game_id: this.gameId,
            day: this.day
        }
        this.groupId = groupId;
        this.timer = "";
        this.startTime = "";
        this.endTime = "";
    }

    async init(): Promise<void> {
        try {
            const data: DocumentClient.GetItemOutput = await aws.dynamoGet(this.discussionTable, this.discussionKey);
            if (data.Item != undefined) {
                const discussion: DocumentClient.AttributeMap = data.Item;
                this.timer = discussion.timer as string;
                this.startTime = discussion.start_time as string;
                this.endTime = discussion.end_time as string;
            } else {
                throw new Error("Disucussionデータが見つかりません");
            }
        } catch (err) {
            console.error(err);
            console.error("discussionの初期化失敗");
        }
    }

    static async createInstance(gameId: number, day: number, groupId: string): Promise<Discussion> {
        const discussion: Discussion = new Discussion(gameId, day, groupId);
        await discussion.init();
        return discussion;
    }

    static async putDiscussion(gameId: number, day: number, groupId: string, timer: string): Promise<void> {
        try {
            const startTime: string = await commonFunction.getCurrentTime();
            const endTime: string = await commonFunction.getEndTime(startTime, timer);
            const item: DocumentClient.AttributeMap = {
                game_id: gameId,
                day: day,
                group_id: groupId,
                timer: timer,
                start_time: startTime,
                end_time: endTime
            }

            aws.dynamoPut("dabyss-dev-discussion", item);
        } catch (err) {
            console.log(err);
        }
    }

    async getRemainingTime(): Promise<string> {
        const remainingTime: commonFunction.Interval = await commonFunction.getRemainingTime(this.endTime);
        const remainingTimeString: string = await commonFunction.convertIntervalToTimerString(remainingTime);
        return remainingTimeString;
    }

}