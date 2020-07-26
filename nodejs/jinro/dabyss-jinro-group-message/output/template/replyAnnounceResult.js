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
exports.main = (displayNames, positions, contentsList) => __awaiter(void 0, void 0, void 0, function* () {
    let positionMessages = "役職一覧\n\n";
    let crazinessMessages = "狂気一覧\n";
    for (let i = 0; i < displayNames.length; i++) {
        let positionMessage = `・${displayNames[i]} : ${positions[i]}\n`;
        positionMessages += positionMessage;
        if (contentsList[i].length > 0) {
            let crazinessMessage = `\n・${displayNames[i]} : `;
            for (let j = 0; j < contentsList[i].length; j++) {
                crazinessMessage += `\n ${j + 1}. ${contentsList[i][j]}`;
            }
            crazinessMessage += `\n`;
            crazinessMessages += crazinessMessage;
        }
    }
    return [
        {
            type: "text",
            text: positionMessages
        },
        {
            type: "text",
            text: crazinessMessages
        },
        {
            "type": "flex",
            "altText": "ゲーム終了",
            "contents": {
                "type": "bubble",
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
                                "uri": "https://forms.gle/kGHqE924ACYQmTKj7",
                                "altUri": {
                                    "desktop": "https://forms.gle/kGHqE924ACYQmTKj7"
                                }
                            },
                            "color": "#e83b10",
                            "style": "primary"
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "ゲーム一覧",
                                "text": "ゲーム一覧"
                            },
                            "color": "#e83b10",
                        }
                    ]
                }
            }
        }
    ];
});
