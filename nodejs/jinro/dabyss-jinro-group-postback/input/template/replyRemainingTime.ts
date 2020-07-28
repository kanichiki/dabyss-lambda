import line = require('@line/bot-sdk');
import dabyss = require('dabyss');

export const main = async (remainingTime: string): Promise<line.TextMessage[]> => {
    return [
        {
            type: "text",
            text: `話し合いの残り時間は${remainingTime}です`
        }
    ]
}