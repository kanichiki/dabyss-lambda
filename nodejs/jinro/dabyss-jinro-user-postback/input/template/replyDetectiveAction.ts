import line = require('@line/bot-sdk');

export const main = async (displayName: string, isWerewolf: boolean): Promise<line.Message[]> => {
    let message = "";
    if (isWerewolf) {
        message = "教祖でした"
    } else {
        message = "教祖ではありませんでした"
    }

    return [
        {
            type: "text",
            text: `占いの結果、${displayName}さんは${message}`
        }
    ]
}