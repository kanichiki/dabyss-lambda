import line = require('@line/bot-sdk');
import dabyss = require('dabyss');
import crazynoisy = require('crazynoisy');

export const main = async (displayName: string): Promise<line.Message[]> => {
    return [
        {
            type: "text",
            text: `${displayName}さんを噛み殺します`
        }
    ]
}