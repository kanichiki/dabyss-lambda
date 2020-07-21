import line = require('@line/bot-sdk');

import * as parts from "../dabyss-module/constants/messageParts";
import * as wordWolfParts from "../wordwolf-module/constants/wordWolfParts";

export const main = async (userNumber: number, recruitingGameName: string): Promise<line.Message[]> => {

    return [
        {
            type: "text",
            text: `現在の参加者数は${userNumber}人です\n${recruitingGameName}を始めるには3人以上必要です`,
            quickReply: {
                "items": [
                    {
                        "type": "action",
                        "action": {
                            "type": "message",
                            "label": "参加",
                            "text": "参加"
                        }
                    },
                    {
                        "type": "action",
                        "action": {
                            "type": "message",
                            "label": "受付終了",
                            "text": "受付終了"
                        }
                    }
                ]
            }
        }
    ]
}