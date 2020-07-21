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
const wordWolfParts = require("../wordwolf-module/constants/wordWolfParts");
/* ジャンル
exports.main = async (displayNames, genres) => {

    let genreMessages = [];
    for (let id in genres) {
        const genreMessage = {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": genres[id],
                            "text": genres[id]
                        },
                        "color": parts.mainColor,
                        "style": "link"
                    }
                ]
            }
        }
        genreMessages.push(genreMessage);
    }

    const displayNamesSan = displayNames.join("さん、\n");

    return [
        {
            type: "text",
            text: `参加受付を終了します`
        },
        {
            type: "text",
            text: `参加者は\n\n${displayNamesSan}さん\n\nです！`
        },
        {
            type: "text",
            text: `ワードのジャンルを選んでください`
        },
        {
            "type": "flex",
            "altText": "ワードのジャンル候補",
            "contents": {
                "type": "carousel",
                "contents": genreMessages
            }
        }
    ]

}
*/
// depth
exports.main = (displayNames) => __awaiter(void 0, void 0, void 0, function* () {
    // let depthMessages = [];
    // for (let depth in depths) {
    //     const depthMessage = {
    //         "type": "bubble",
    //         "body": {
    //             "type": "box",
    //             "layout": "vertical",
    //             "contents": [
    //                 {
    //                     "type": "button",
    //                     "action": {
    //                         "type": "message",
    //                         "label": depth,
    //                         "text": depth
    //                     },
    //                     "color": parts.mainColor,
    //                     "style": "link"
    //                 }
    //             ]
    //         }
    //     }
    //     depthMessages.push(depthMessage);
    // }
    const displayNamesSan = displayNames.join("さん、\n");
    return [
        {
            type: "text",
            text: `参加受付を終了します\n\n参加者は\n\n${displayNamesSan}さん\n\nです！`
        },
        {
            type: "text",
            text: `ゲームを途中で終了する際は「強制終了」と発言してください`
        },
        {
            "type": "flex",
            "altText": "ワードの難易度",
            "contents": yield wordWolfParts.depthOptionsMessage()
        }
    ];
});
