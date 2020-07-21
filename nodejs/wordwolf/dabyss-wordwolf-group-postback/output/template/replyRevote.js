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
const parts = require("../dabyss-module/constants/messageParts");
exports.main = (voterDisplayName, mostVotedUserIndexes, displayNames) => __awaiter(void 0, void 0, void 0, function* () {
    return [
        {
            type: "text",
            text: `${voterDisplayName}さん、投票完了しました！`
        },
        {
            type: "text",
            text: `得票数が並んだため再投票に入ります`
        },
        {
            "type": "flex",
            "altText": "再投票",
            "contents": {
                "type": "carousel",
                "contents": yield parts.voteMessage(mostVotedUserIndexes, displayNames)
            }
        }
    ];
});
