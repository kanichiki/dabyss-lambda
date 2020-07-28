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
const crazynoisy = require("crazynoisy");
exports.main = (displayNames) => __awaiter(void 0, void 0, void 0, function* () {
    const displayNamesSan = displayNames.join("さん、\n");
    return [
        {
            type: "text",
            text: `参加受付を終了します\n\n参加者は\n\n${displayNamesSan}さん\n\nです！\nゲームを途中で終了する際は「強制終了」と発言してください`
        },
        {
            "type": "flex",
            "altText": "モード",
            "contents": crazynoisy.modeOptions
        }
    ];
});
