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
const dabyss = require("dabyss");
exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    const discussionTable = "dabyss-dev-discussion";
    const secondaryIndex = "is_discussing-game_id-index";
    const data = yield dabyss.dynamoQuerySecondaryIndex(discussionTable, secondaryIndex, "is_discussing", "discussing");
    if (data.Items != undefined) {
        for (let item of data.Items) {
            const discussion = yield dabyss.Discussion.createInstance(item.game_id, item.day, item.group_id);
            const remainingTime = yield dabyss.getRemainingTime(discussion.endTime);
            if (remainingTime.hours < 0) {
                const game = yield dabyss.Game.createInstance(discussion.groupId);
                promises.push(discussion.updateIsDiscussingFalse());
                promises.push(game.putFirstVote());
                promises.push(game.updateGameStatus("vote"));
                const userNumber = yield game.getUserNumber();
                const shuffleUserIndexes = yield dabyss.makeShuffuleNumberArray(userNumber);
                let displayNames = [];
                // 公平にするため投票用の順番はランダムにする
                for (let i = 0; i < userNumber; i++) {
                    displayNames[i] = yield game.getDisplayName(shuffleUserIndexes[i]);
                }
                //if (usePostback) { // postbackを使う設定の場合
                const replyMessage = yield Promise.resolve().then(() => require("./template/replyDiscussFinish"));
                promises.push(dabyss.pushMessage(game.groupId, yield replyMessage.main(shuffleUserIndexes, displayNames)));
            }
        }
    }
    yield Promise.all(promises);
    return;
});
