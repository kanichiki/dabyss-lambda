import line = require('@line/bot-sdk');

export const main = async (displayName: string, isGuru: boolean): Promise<line.Message[]> => {
    let message = "";
    if (isGuru) {
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