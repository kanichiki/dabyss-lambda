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
exports.main = (displayNames, isWinnerGuru, winnerIndexes) => __awaiter(void 0, void 0, void 0, function* () {
    let winners = [];
    for (let winnerIndex of winnerIndexes) {
        winners.push(displayNames[winnerIndex]);
    }
    const winnerMessage = winners.join("さん、");
    let message1 = "";
    let message2 = "";
    if (isWinnerGuru) {
        message1 = "狂ってない人が1人以下になりました";
        message2 = "教団陣営の勝利です！！";
    }
    else {
        message1 = "教祖の正体を暴きました";
        message2 = "市民陣営の勝利です！！";
    }
    return [
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
                            "text": message1,
                            "size": "md",
                            "wrap": true,
                            "align": "center"
                        },
                        {
                            "type": "text",
                            "text": message2,
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
                                "label": "役職・狂気を見る",
                                "text": "役職・狂気を見る"
                            },
                            "color": "#E83b10"
                        }
                    ]
                }
            }
        }
    ];
});
