import line = require('@line/bot-sdk');

export const main = async (displayName: string): Promise<line.Message[]> => {
    return [
        {
            type: "text",
            text: `自分には投票できません`
        }
    ]
}