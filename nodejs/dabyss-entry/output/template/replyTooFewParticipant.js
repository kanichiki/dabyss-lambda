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
exports.main = (userNumber, recruitingGameName, minNumber) => __awaiter(void 0, void 0, void 0, function* () {
    return [
        {
            type: "text",
            text: `現在の参加者数は${userNumber}人です\n${recruitingGameName}を始めるには${minNumber}人以上必要です`,
            quickReply: {
                "items": [
                    {
                        "type": "action",
                        "action": {
                            "type": "message",
                            "label": "参加",
                            "text": "参加"
                        }
                    },
                    {
                        "type": "action",
                        "action": {
                            "type": "message",
                            "label": "受付終了",
                            "text": "受付終了"
                        }
                    }
                ]
            }
        }
    ];
});
