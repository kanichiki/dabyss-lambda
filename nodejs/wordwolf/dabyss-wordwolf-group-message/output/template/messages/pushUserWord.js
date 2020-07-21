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
exports.main = (displayName, userWord, isLunatic) => __awaiter(void 0, void 0, void 0, function* () {
    let reply = [];
    if (!isLunatic) {
        reply = [
            {
                type: "text",
                text: `${displayName}さんのワードは\n\n${userWord}\n\nです！`
            }
        ];
    }
    else {
        reply = [
            {
                type: "text",
                text: `あなたは「狂人」です。ただし、ウルフを兼ねている可能性もあるので気をつけてください\n\n${displayName}さんのワードは\n\n${userWord}\n\nです！`
            }
        ];
    }
    return reply;
});
