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
exports.main = (recruitingGameName, displayName, displayNames) => __awaiter(void 0, void 0, void 0, function* () {
    const displayNamesSan = displayNames.join("さん、\n");
    return [
        {
            type: "text",
            text: `${displayName}さんの参加を確認しました！\n\n現在の参加者は\n\n${displayNamesSan}さん\n\nです！\n引き続き${recruitingGameName}の参加者を募集します！`
        },
        {
            "type": "flex",
            "altText": "参加募集",
            "contents": {
                "type": "bubble",
                "footer": {
                    "type": "box",
                    "layout": "horizontal",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "button",
                            "height": "sm",
                            "action": {
                                "type": "message",
                                "label": "参加",
                                "text": "参加"
                            },
                            "color": dabyss.mainColor,
                            "style": "primary"
                        },
                        {
                            "type": "separator"
                        },
                        {
                            "type": "button",
                            "height": "sm",
                            "action": {
                                "type": "message",
                                "label": "受付終了",
                                "text": "受付終了"
                            },
                            "color": dabyss.mainColor,
                            "style": "primary"
                        },
                        {
                            "type": "spacer",
                            "size": "sm"
                        }
                    ],
                    "flex": 0
                }
            }
        }
    ];
});
