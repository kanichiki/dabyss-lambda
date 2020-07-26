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
const dabyss = require("dabyss");
const crazynoisy = require("crazynoisy");
exports.main = (userNumber, numberOption) => __awaiter(void 0, void 0, void 0, function* () {
    const channelId = yield dabyss.getChannelId();
    return [
        {
            "type": "flex",
            "altText": "役職人数確認",
            "contents": yield crazynoisy.positionNumberMessage(userNumber, numberOption)
        },
        {
            "type": "flex",
            "altText": "役職確認",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "それぞれの役職を個人トークルームにて確認してください",
                            "wrap": true
                        },
                        {
                            "type": "text",
                            "text": "役職を確認した方は個人トークルームにて「確認しました」ボタンを押してください",
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
                                "label": "役職を確認する",
                                "uri": `https://line.me/R/oaMessage/${channelId}/`,
                                "altUri": {
                                    "desktop": `https://line.me/R/oaMessage/${channelId}/`
                                }
                            },
                            "color": dabyss.mainColor
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "postback",
                                "label": "確認状況",
                                "data": "確認状況"
                            },
                            "color": dabyss.subColor,
                            "margin": "sm"
                        } //,
                        // {
                        //   "type": "separator",
                        //   "margin": "sm"
                        // },
                        // {
                        //   "type": "button",
                        //   "action": {
                        //     "type": "postback",
                        //     "label": "確認しました",
                        //     "data": "確認しました"
                        //   },
                        //   "color": parts.mainColor,
                        //   "style": "primary",
                        //   "margin": "sm"
                        // }
                    ]
                }
            }
        }
    ];
});
