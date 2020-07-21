import line = require('@line/bot-sdk');

import * as parts from "../dabyss-module/constants/messageParts";
import * as wordWolfParts from "../wordwolf-module/constants/wordWolfParts";


export const main = async (displayName: string): Promise<line.Message[]> => {
    return [
        {
            type: "text",
            text: `自分には投票できません`
        }
    ]
}