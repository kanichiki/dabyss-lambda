"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const lineClient = require("../dabyss-module/clients/lineClient");
const parts = require("../dabyss-module/constants/messageParts");
exports.main = (timer) => __awaiter(void 0, void 0, void 0, function* () {
    const channelId = yield lineClient.getChannelId();
    return [
        {
            "type": "flex",
            "altText": "ゲームスタート",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "ゲームをスタートします",
                            "wrap": true
                        },
                        {
                            "type": "text",
                            "text": "それぞれのワードを個人トークルームにて確認してください",
                            "wrap": true
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "ワードを確認する",
                                "uri": `https://line.me/R/oaMessage/${channelId}/`,
                                "altUri": {
                                    "desktop": `https://line.me/R/oaMessage/${channelId}/`
                                }
                            },
                            "color": parts.mainColor
                        }
                    ]
                }
            }
        },
        {
            "type": "flex",
            "altText": "残り時間",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": `話し合い時間は${timer}です`,
                            "wrap": true,
                            "weight": "bold"
                        },
                        {
                            "type": "text",
                            "text": "話し合いを途中で終了するには「終了」と発言してください",
                            "wrap": true
                        },
                        {
                            "type": "text",
                            "text": "話し合いの残り時間は下のボタンで確認できます！",
                            "wrap": true
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "postback",
                                "data": "残り時間",
                                "label": "残り時間"
                            },
                            "color": parts.mainColor,
                            "style": "primary"
                        }
                    ]
                }
            }
        }
    ];
});
