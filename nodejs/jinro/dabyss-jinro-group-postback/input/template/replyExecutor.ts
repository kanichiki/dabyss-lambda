import line = require('@line/bot-sdk');
import dabyss = require('dabyss');

export const main = async (executorDisplayName: string): Promise<line.Message[]> => {
    return [
        {
            type: "text",
            text: `${executorDisplayName}さんが拷問にかけられました`
        }
    ]
}