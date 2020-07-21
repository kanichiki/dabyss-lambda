import line = require('@line/bot-sdk');

import * as parts from "../dabyss-module/constants/messageParts";
import * as wordWolfParts from "../wordwolf-module/constants/wordWolfParts";


export const main = async (voterDisplayName: string): Promise<line.Message[]> => {
    return [
        {
            type: "text",
            text: `${voterDisplayName}さん、投票完了しました！`
        }
    ]
}