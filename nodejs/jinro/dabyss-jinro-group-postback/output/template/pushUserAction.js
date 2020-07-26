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
exports.main = (displayName, position, isBrainwash, targetDisplayNames, targetUserIndexes) => __awaiter(void 0, void 0, void 0, function* () {
    let actionMessage = "";
    let targetMessages = [
        {
            "type": "spacer"
        }
    ];
    if (position == crazynoisy.guru || position == crazynoisy.detective) {
        if (position == crazynoisy.guru) {
            actionMessage = "洗脳する人を選んでください";
            for (let i = 0; i < targetDisplayNames.length; i++) {
                const targetMessage = {
                    "type": "button",
                    "action": {
                        "type": "postback",
                        "label": targetDisplayNames[i],
                        "data": targetUserIndexes[i].toString()
                    },
                    "color": dabyss.mainColor
                };
                targetMessages.push(targetMessage);
            }
        }
        else {
            if (isBrainwash) {
                actionMessage = "狂っているため調査できません";
            }
            else {
                actionMessage = "調査する人を選んでください";
                for (let i = 0; i < targetDisplayNames.length; i++) {
                    const targetMessage = {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": targetDisplayNames[i],
                            "data": targetUserIndexes[i].toString()
                        },
                        "color": dabyss.mainColor
                    };
                    targetMessages.push(targetMessage);
                }
            }
        }
    }
    else {
        actionMessage = "アクションはありません";
    }
    return [
        {
            "type": "flex",
            "altText": "アクション",
            "contents": {
                "type": "bubble",
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
                                    "text": "text",
                                    "size": "md",
                                    "contents": [
                                        {
                                            "type": "span",
                                            "text": `${displayName}さんの役職は『`
                                        },
                                        {
                                            "type": "span",
                                            "text": position,
                                            "weight": "bold",
                                            "color": dabyss.mainColor
                                        },
                                        {
                                            "type": "span",
                                            "text": "』です"
                                        }
                                    ],
                                    "wrap": true
                                },
                                {
                                    "type": "text",
                                    "text": actionMessage,
                                    "size": "md",
                                    "wrap": true
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": targetMessages
                        }
                    ]
                }
            }
        }
    ];
});
