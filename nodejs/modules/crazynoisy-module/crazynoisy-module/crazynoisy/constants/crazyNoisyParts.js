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
exports.positionNumberMessage = exports.timerMessage = exports.settingConfirmMessage = exports.modeOptions = exports.typeOptions = exports.citizen = exports.detective = exports.fanatic = exports.guru = void 0;
const dabyss = require("dabyss");
exports.guru = "教祖";
exports.fanatic = "狂信者";
exports.detective = "探偵";
exports.citizen = "市民";
exports.typeOptions = {
    "type": "bubble",
    "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
            {
                "type": "text",
                "text": "話し合いの方法を選んでください！",
                "size": "md",
                "wrap": true,
                "weight": "bold",
                "margin": "none"
            },
            {
                "type": "separator",
                "margin": "md"
            },
            {
                "type": "text",
                "text": "1：チャット(LINE)を使う",
                "wrap": true,
                "size": "sm"
            },
            {
                "type": "text",
                "text": "2：通話(音声のみ)を使う",
                "wrap": true,
                "size": "sm"
            },
            {
                "type": "text",
                "text": "3：ビデオ通話を使う",
                "size": "sm",
                "wrap": true,
                "margin": "md"
            },
            {
                "type": "separator"
            }
        ],
        "spacing": "xs",
        "margin": "none"
    },
    "footer": {
        "type": "box",
        "layout": "vertical",
        "contents": [
            {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": "1",
                            "text": "1"
                        },
                        "color": dabyss.mainColor
                    },
                    {
                        "type": "separator"
                    },
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": "2",
                            "text": "2"
                        },
                        "color": dabyss.mainColor
                    },
                    {
                        "type": "separator"
                    },
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": "3",
                            "text": "3"
                        },
                        "color": dabyss.mainColor
                    }
                ]
            }
        ]
    },
    "styles": {
        "body": {
            "separator": true
        }
    }
};
exports.modeOptions = {
    "type": "bubble",
    "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
            {
                "type": "text",
                "text": "モードを選んでください！",
                "size": "md",
                "wrap": true,
                "weight": "bold",
                "margin": "none"
            },
            {
                "type": "separator"
            },
            {
                "type": "text",
                "text": "デモモードでは最初から全員に狂気が配られます。(洗脳されているわけではありません)",
                "margin": "md",
                "wrap": true,
                "size": "sm"
            },
            {
                "type": "text",
                "text": "どのような狂気があるか全員が確認することができます。初めての方がいらっしゃる場合におすすめです。",
                "margin": "md",
                "wrap": true,
                "size": "sm"
            }
        ],
        "spacing": "xs",
        "margin": "none"
    },
    "footer": {
        "type": "box",
        "layout": "vertical",
        "contents": [
            {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": "ノーマル",
                            "text": "ノーマル"
                        },
                        "color": dabyss.mainColor
                    },
                    {
                        "type": "separator"
                    },
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": "デモ",
                            "text": "デモ"
                        },
                        "color": dabyss.mainColor
                    }
                ]
            }
        ]
    },
    "styles": {
        "body": {
            "separator": true
        }
    }
};
exports.settingConfirmMessage = (userNumber, mode, type, timer, zeroGuru, zeroDetective) => __awaiter(void 0, void 0, void 0, function* () {
    let zeroGuruMessage;
    if (zeroGuru) {
        zeroGuruMessage = "あり";
    }
    else {
        zeroGuruMessage = "なし";
    }
    let zeroDetectiveMessage;
    if (zeroDetective) {
        zeroDetectiveMessage = "あり";
    }
    else {
        zeroDetectiveMessage = "なし";
    }
    return {
        "type": "bubble",
        "size": "giga",
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "以下の内容でよろしいですか？",
                            "size": "md",
                            "wrap": true
                        }
                    ]
                },
                {
                    "type": "separator",
                    "margin": "md"
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "spacer"
                        },
                        {
                            "type": "text",
                            "text": `参加者 : ${userNumber.toString()}人`,
                            "size": "md"
                        },
                        {
                            "type": "text",
                            "text": `役職 : ランダム`,
                            "size": "md"
                        },
                        {
                            "type": "text",
                            "text": `モード : ${mode}`,
                            "size": "md"
                        },
                        {
                            "type": "text",
                            "text": `話し合い方法 : ${type.toString()}`,
                            "size": "md"
                        },
                        {
                            "type": "text",
                            "text": `0日目洗脳(教祖) : ${zeroGuruMessage}`,
                            "size": "md"
                        },
                        {
                            "type": "text",
                            "text": `0日目調査(探偵) : ${zeroDetectiveMessage}`,
                            "size": "md"
                        },
                        {
                            "type": "text",
                            "text": `議論時間 : ${timer}`,
                            "size": "md"
                        }
                    ],
                    "margin": "md"
                },
                {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "モード変更",
                                "text": "モード変更"
                            },
                            "color": dabyss.mainColor
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "議論時間変更",
                                "text": "議論時間変更"
                            },
                            "color": dabyss.mainColor
                        }
                    ],
                    "margin": "md"
                },
                {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "0日目洗脳有無",
                                "text": "0日目洗脳有無"
                            },
                            "color": dabyss.mainColor
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "0日目調査有無",
                                "text": "0日目調査有無"
                            },
                            "color": dabyss.mainColor
                        }
                    ],
                    "margin": "md"
                },
                {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "話し合い方法変更",
                                "text": "話し合い方法変更"
                            },
                            "color": dabyss.mainColor
                        }
                    ],
                    "margin": "md"
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "horizontal",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                        "type": "message",
                        "label": "ゲームを開始する",
                        "text": "ゲームを開始する"
                    },
                    "color": dabyss.mainColor
                }
            ]
        },
        "styles": {
            "footer": {
                "separator": true
            }
        }
    };
});
exports.timerMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    return {
        "type": "bubble",
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": "議論時間を選択してください",
                    "weight": "bold",
                    "size": "md"
                },
                {
                    "type": "text",
                    "text": "※「時」が分に、「分」が秒に対応してます。例えば、「午後3時20分」を選択した場合、議論時間は「15分20秒」になります。わかりにくくて申し訳ないです...",
                    "wrap": true,
                    "size": "sm",
                    "margin": "md"
                }
            ]
        },
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
                        "type": "datetimepicker",
                        "label": "議論時間設定",
                        "mode": "time",
                        "data": "timer",
                        "initial": "05:00",
                        "max": "23:59",
                        "min": "00:01"
                    },
                    color: dabyss.mainColor
                }
            ],
            "flex": 0
        }
    };
});
exports.positionNumberMessage = (userNumber, numberOption) => __awaiter(void 0, void 0, void 0, function* () {
    let detectiveNumber = "";
    let citizenNumber = "";
    if (userNumber > 6) {
        detectiveNumber = "1";
        citizenNumber = `${userNumber - numberOption - 2}~${userNumber - numberOption - 1}`;
    }
    else {
        detectiveNumber = `0~1`;
        citizenNumber = `${userNumber - numberOption * 2 - 1}~${userNumber - numberOption * 2 + 1}`;
    }
    return {
        "type": "bubble",
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": "各役職の人数は以下の通りです",
                    "size": "md",
                    "wrap": true
                },
                {
                    "type": "separator",
                    "margin": "md"
                },
                {
                    "type": "text",
                    "text": "教祖 : 1人",
                    "margin": "md"
                },
                {
                    "type": "text",
                    "text": `狂信者 : ${numberOption - 1}~${numberOption}人`
                },
                {
                    "type": "text",
                    "text": `探偵 : ${detectiveNumber}人`
                },
                {
                    "type": "text",
                    "text": `市民 : ${citizenNumber}人`
                }
            ]
        }
    };
});
