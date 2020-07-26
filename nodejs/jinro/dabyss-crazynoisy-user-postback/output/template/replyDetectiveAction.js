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
exports.main = (displayName, isGuru) => __awaiter(void 0, void 0, void 0, function* () {
    let message = "";
    if (isGuru) {
        message = "教祖でした";
    }
    else {
        message = "教祖ではありませんでした";
    }
    return [
        {
            type: "text",
            text: `調査の結果、${displayName}さんは${message}`
        }
    ];
});
