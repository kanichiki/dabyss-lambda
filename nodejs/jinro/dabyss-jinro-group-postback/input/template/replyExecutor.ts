import line = require('@line/bot-sdk');
import dabyss = require('dabyss');
import crazynoisy = require('crazynoisy');

export const main = async (executorDisplayName: string): Promise<line.Message[]> => {
    return [
        {
            type: "text",
            text: `${executorDisplayName}さんが拷問にかけられました`
        }
    ]
}