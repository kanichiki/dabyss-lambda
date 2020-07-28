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
exports.main = (day, timer) => __awaiter(void 0, void 0, void 0, function* () {
    return [
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
                            "text": `${day.toString()}日目の話し合いをスタートします`,
                            "wrap": true,
                            "weight": "bold"
                        },
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
                            "color": dabyss.mainColor,
                            "style": "primary"
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "役職人数確認",
                                "text": "役職人数確認"
                            },
                            "color": dabyss.subColor
                        }
                    ]
                }
            }
        }
    ];
});
