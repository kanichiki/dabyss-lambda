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
exports.positionNumberMessage = exports.timerMessage = exports.settingConfirmMessage = exports.typeOptions = exports.citizen = exports.hunter = exports.psychic = exports.forecaster = exports.madman = exports.werewolf = void 0;
const dabyss = require("dabyss");
exports.werewolf = "人狼";
exports.madman = "狂人";
exports.forecaster = "占い師";
exports.hunter = "狩人"
exports.psychic = "霊媒師"
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

exports.settingConfirmMessage = (userNumber, type, timer, zeroWerewolf, zeroForecaster) => __awaiter(void 0, void 0, void 0, function* () {
    let zeroWerewolfMessage;
    if (zeroWerewolf) {
        zeroWerewolfMessage = "あり";
    }
    else {
        zeroWerewolfMessage = "なし";
    }
    let zeroForecasterMessage;
    if (zeroForecaster) {
        zeroForecasterMessage = "あり";
    }
    else {
        zeroForecasterMessage = "なし";
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
                            "text": `話し合い方法 : ${type.toString()}`,
                            "size": "md"
                        },
                        {
                            "type": "text",
                            "text": `0日目襲撃(人狼) : ${zeroWerewolfMessage}`,
                            "size": "md"
                        },
                        {
                            "type": "text",
                            "text": `0日目調査(探偵) : ${zeroForecasterMessage}`,
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
                                "label": "0日目襲撃有無",
                                "text": "0日目襲撃有無"
                            },
                            "color": dabyss.mainColor
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "0日目占い有無",
                                "text": "0日目占い有無"
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
    let forecasterNumber = "";
    let citizenNumber = "";
    if (userNumber > 6) {
        forecasterNumber = "1";
        citizenNumber = `${userNumber - numberOption - 2}~${userNumber - numberOption - 1}`;
    }
    else {
        forecasterNumber = `0~1`;
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
                    "text": "人狼 : 1人",
                    "margin": "md"
                },
                {
                    "type": "text",
                    "text": `狂人 : ${numberOption - 1}~${numberOption}人`
                },
                {
                    "type": "text",
                    "text": `占い師 : ${forecasterNumber}人`
                },
                {
                    "type": "text",
                    "text": `市民 : ${citizenNumber}人`
                }
            ]
        }
    };
});
