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
const parts = require("../dabyss-module/constants/messageParts");
exports.main = (voterDisplayName, executorDisplayName, isExecutorWolf, displayNames, isWinnerArray) => __awaiter(void 0, void 0, void 0, function* () {
    let message = "";
    if (!isExecutorWolf) {
        message = "ウルフ側の勝利です！！";
    }
    else {
        message = "市民側の勝利です！！";
    }
    let winners = [];
    for (let i = 0; i < displayNames.length; i++) {
        if (isWinnerArray[i]) {
            winners.push(displayNames[i]);
        }
    }
    const winnerMessage = winners.join("さん、");
    return [
        {
            type: "text",
            text: `${voterDisplayName}さん、投票完了しました！`
        },
        {
            type: "text",
            text: `得票数が並んだため、ランダムで${executorDisplayName}さんが処刑されました`
        },
        {
            "type": "flex",
            "altText": "勝者",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": message,
                            "size": "lg",
                            "wrap": true,
                            "align": "center"
                        },
                        {
                            "type": "separator",
                            "margin": "md"
                        },
                        {
                            "type": "text",
                            "text": `勝者 : ${winnerMessage}さん`,
                            "margin": "md",
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
                                "type": "message",
                                "label": "ワードを見る",
                                "text": "ワードを見る"
                            },
                            "color": parts.mainColor
                        }
                    ]
                }
            }
        }
    ];
});
