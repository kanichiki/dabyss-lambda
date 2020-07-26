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
exports.main = (executorDisplayName) => __awaiter(void 0, void 0, void 0, function* () {
    return [
        {
            "type": "flex",
            "altText": "役職確認",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "text",
                            "wrap": true,
                            "contents": [
                                {
                                    "type": "span",
                                    "text": executorDisplayName,
                                    "color": dabyss.mainColor
                                },
                                {
                                    "type": "span",
                                    "text": "さんは教祖ではなかったようですが、拷問の結果気が狂ってしまいました"
                                }
                            ],
                            "size": "lg"
                        }
                    ]
                }
            }
        }
    ];
});
