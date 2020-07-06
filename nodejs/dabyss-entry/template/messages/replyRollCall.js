const parts = require("./constants/messageParts");

exports.main = async (gameName) => {
    return [
        {
            type: "text",
            text: `「${gameName}」の参加受付を開始します！`
        },
        {
            "type": "flex",
            "altText": "参加募集",
            "contents": {
                "type": "bubble",
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "button",
                            "style": "link",
                            "height": "sm",
                            "action": {
                                "type": "message",
                                "label": "参加",
                                "text": "参加"
                            },
                            "color": parts.mainColor,
                            "style": "primary"
                        },
                        {
                            "type": "spacer",
                            "size": "sm"
                        }
                    ],
                    "flex": 0
                }
            }
        }
    ]
}

