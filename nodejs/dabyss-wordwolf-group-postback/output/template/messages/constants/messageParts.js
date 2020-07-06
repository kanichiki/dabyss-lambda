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
exports.gamesMessage = exports.revoteMessage = exports.voteMessage = exports.subColor = exports.mainColor = void 0;
exports.mainColor = "#E83b10";
exports.subColor = "#036568";
exports.voteMessage = (displayNames, userIds) => __awaiter(void 0, void 0, void 0, function* () {
    let voteMessages = [];
    // どうやら整数は送れないらしい
    for (let i = 0; i < userIds.length; i++) {
        const voteMessage = {
            "type": "bubble",
            "size": "micro",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": displayNames[i],
                            "data": userIds[i]
                        },
                        "color": exports.mainColor
                    }
                ]
            }
        };
        voteMessages.push(voteMessage);
    }
    return voteMessages;
});
exports.revoteMessage = (displayNames, userIds, userIndexes) => __awaiter(void 0, void 0, void 0, function* () {
    let voteMessages = [];
    // どうやら整数は送れないらしい
    for (let userIndex of userIndexes) {
        const voteMessage = {
            "type": "bubble",
            "size": "micro",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": displayNames[userIndex],
                            "data": userIds[userIndex]
                        },
                        "color": exports.mainColor
                    }
                ]
            }
        };
        voteMessages.push(voteMessage);
    }
    return voteMessages;
});
exports.gamesMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    const gamesCarousel = {
        "type": "carousel",
        "contents": [
            {
                "type": "bubble",
                "size": "mega",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "ワードウルフ",
                            "size": "xl",
                            "style": "normal",
                            "color": exports.mainColor,
                            "align": "center",
                            "offsetTop": "10px"
                        }
                    ],
                    "spacing": "none",
                    "margin": "none"
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "少数派を見つけ出す",
                            "align": "center",
                            "size": "lg"
                        },
                        {
                            "type": "text",
                            "text": "トークゲーム！",
                            "align": "center",
                            "size": "lg"
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "詳しい説明はこちら",
                                "uri": "https://note.com/m_dabyss/n/nb741cd926bf9",
                                "altUri": {
                                    "desktop": "https://note.com/m_dabyss/n/nb741cd926bf9"
                                }
                            },
                            "color": exports.subColor
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "ワードウルフを始める",
                                "text": "ワードウルフ"
                            },
                            "style": "primary",
                            "margin": "md",
                            "color": exports.mainColor
                        }
                    ],
                    "spacing": "none",
                    "margin": "none"
                }
            },
            {
                "type": "bubble",
                "size": "mega",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "クレイジーノイジー",
                            "size": "xl",
                            "style": "normal",
                            "color": exports.mainColor,
                            "align": "center",
                            "offsetTop": "10px"
                        }
                    ],
                    "spacing": "none",
                    "margin": "none"
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "みんな狂っていく",
                            "align": "center",
                            "size": "lg"
                        },
                        {
                            "type": "text",
                            "text": "新感覚オリジナルゲーム！",
                            "align": "center",
                            "size": "lg"
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "詳しい説明はこちら",
                                "altUri": {
                                    "desktop": "https://note.com/m_dabyss/n/n0c37924b4f2e"
                                },
                                "uri": "https://note.com/m_dabyss/n/n0c37924b4f2e"
                            },
                            "color": exports.subColor
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "クレイジーノイジーを始める",
                                "text": "クレイジーノイジー"
                            },
                            "style": "primary",
                            "margin": "md",
                            "color": exports.mainColor
                        }
                    ],
                    "spacing": "none",
                    "margin": "none"
                }
            }
        ]
    };
    return gamesCarousel;
});
