const parts = require("./constants/messageParts");

exports.main = async (displayName) => {
    return [
        {
            type: "text",
            text: `${displayName}さんは別のゲームに参加中ですが、終了してこちらのゲームに参加しますか？\n参加する場合はもう一度「参加」と発言してください`,
            "quickReply": {
                "items": [
                    {
                        "type": "action",
                        "action": {
                            "type": "message",
                            "label": "参加",
                            "text": "参加"
                        }
                    },
                    {
                        "type": "action",
                        "action": {
                            "type": "message",
                            "label": "受付終了",
                            "text": "受付終了"
                        }
                    }
                ]
            }
        }
    ]
}