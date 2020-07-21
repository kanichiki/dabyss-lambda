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
exports.main = (displayNames, wolfIndexes, lunaticIndexes, citizenWord, wolfWord, winner) => __awaiter(void 0, void 0, void 0, function* () {
    let resultMessage = "それぞれの単語は以下の通りです\n\n";
    let result = [];
    for (let i = 0; i < displayNames.length; i++) {
        let word = "";
        if (wolfIndexes.indexOf(i) == -1) {
            if (lunaticIndexes.indexOf(i) == -1) {
                word = "・" + displayNames[i] + " : " + citizenWord;
            }
            else {
                word = "・" + displayNames[i] + " : " + citizenWord + " ←狂人";
            }
        }
        else {
            if (lunaticIndexes.indexOf(i) == -1) {
                word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ";
            }
            else {
                word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ&狂人";
            }
        }
        result.push(word);
    }
    const resultEnter = result.join("\n");
    resultMessage = resultMessage + resultEnter;
    let shareMessage = encodeURI("Dabyssでワードウルフをプレイしました！") + "%0a%0a" + encodeURI("市民側ワード：") + encodeURI(citizenWord) + "%0a" + encodeURI("ウルフ側ワード：") + encodeURI(wolfWord) + "%0a%0a";
    if (winner == "citizen") {
        shareMessage += encodeURI("市民側の勝利！！") + "%0a%0a";
    }
    else {
        shareMessage += encodeURI("ウルフ側の勝利！！") + "%0a%0a";
    }
    const shareUrl = `https://note.com/m_dabyss/n/n2d85008f4ce0`;
    const shareUri = "https://twitter.com/share?text=" + shareMessage + "&hashtags=dabyss&url=" + shareUrl + "&related=m_dabyss";
    const formUri = "https://forms.gle/kGHqE924ACYQmTKj7";
    return [
        {
            type: "text",
            text: resultMessage
        },
        {
            "type": "flex",
            "altText": "ゲーム終了",
            "contents": {
                "type": "bubble",
                "size": "mega",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "サービス向上のためフィードバックにご協力ください！",
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
                                "label": "フィードバックを書く",
                                "uri": formUri,
                                "altUri": {
                                    "desktop": formUri
                                }
                            },
                            "color": parts.mainColor,
                            "style": "primary"
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "Twitterでシェア",
                                "uri": shareUri,
                                "altUri": {
                                    "desktop": shareUri
                                }
                            },
                            "color": "#00acee"
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "ゲーム一覧",
                                "text": "ゲーム一覧"
                            },
                            "color": parts.mainColor,
                        }
                    ]
                }
            }
        }
    ];
});
