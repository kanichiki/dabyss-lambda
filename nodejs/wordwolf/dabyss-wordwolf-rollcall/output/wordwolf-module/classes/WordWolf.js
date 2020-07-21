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
exports.WordWolf = void 0;
const aws = require("../../dabyss-module/clients/awsClient");
const Game_1 = require("../../dabyss-module/classes/Game");
const commonFunction = require("../../dabyss-module/functions/commonFunction");
/**
 * みんな大好きワードウルフ！
 *
 * @export
 * @class WordWolf
 * @extends {Game}
 */
class WordWolf extends Game_1.Game {
    /**
     * WordWolfインスタンス作成
     *
     * @constructor
     * @extends Game
     * @param {string} groupId
     * @memberof WordWolf
     */
    constructor(groupId) {
        super(groupId);
        this.wordSetTable = "dabyss-dev-word-set";
        this.settingNames = ["depth", "wolf_number", "lunatic_number", "timer"];
        this.defaultSettingStatus = [false, false, false, true];
        this.wordSetId = -1;
        this.depth = -1;
        this.citizenWord = "";
        this.wolfWord = "";
        this.wolfIndexes = [];
        this.lunaticIndexes = [];
    }
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof WordWolf
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield aws.dynamoQuery(this.gameTable, "group_id", this.groupId, false);
                if (data.Count != undefined) {
                    if (data.Count > 0) {
                        this.exists = true;
                        if (data.Items != undefined) {
                            const game = data.Items[0];
                            this.gameId = game.game_id;
                            this.gameKey = {
                                group_id: this.groupId,
                                game_id: this.gameId
                            };
                            this.userIds = game.user_ids;
                            this.day = game.day;
                            this.gameName = game.game_name;
                            this.gameStatus = game.game_status;
                            this.settingStatus = game.setting_status;
                            this.timer = game.timer;
                            this.wordSetId = game.word_set_id;
                            this.depth = game.depth;
                            this.citizenWord = game.citizen_word;
                            this.wolfWord = game.wolf_word;
                            this.wolfIndexes = game.wolf_indexes;
                            this.lunaticIndexes = game.lunatic_indexes;
                        }
                    }
                }
            }
            catch (err) {
                console.error(err);
                console.error("gameの初期化失敗");
            }
        });
    }
    /**
     * インスタンス作成
     *
     * @static
     * @param {string} groupId
     * @returns {Promise<WordWolf>}
     * @memberof WordWolf
     */
    static createInstance(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wordWolf = new WordWolf(groupId);
            yield wordWolf.init();
            return wordWolf;
        });
    }
    /**
     * depthに一致するワードセットのidの配列を返す
     *
     * @param {number} depth
     * @returns {Promise<number[]>}
     * @memberof WordWolf
     */
    getWordSetIdsMatchDepth(depth) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = "depth-word_set_id-index";
            let wordSetIds = [];
            if (depth != 3) {
                const data = yield aws.dynamoQuerySecondaryIndex(this.wordSetTable, index, "depth", Number(depth));
                if (data.Items != undefined) {
                    for (let item of data.Items) {
                        wordSetIds.push(item.word_set_id);
                    }
                }
            }
            else {
                const data3 = yield aws.dynamoQuerySecondaryIndex(this.wordSetTable, index, "depth", 3);
                if (data3.Items != undefined) {
                    for (let item of data3.Items) {
                        wordSetIds.push(item.word_set_id);
                    }
                }
                const data4 = yield aws.dynamoQuerySecondaryIndex(this.wordSetTable, index, "depth", 4);
                if (data4.Items != undefined) {
                    for (let item of data4.Items) {
                        wordSetIds.push(item.word_set_id);
                    }
                }
            }
            return wordSetIds;
        });
    }
    /**
     * depthに一致するワードセットをランダムに1つ選ぶ
     *
     * @param {number} depth
     * @returns {Promise<number>}
     * @memberof WordWolf
     */
    chooseWordSetIdMatchDepth(depth) {
        return __awaiter(this, void 0, void 0, function* () {
            const wordSetIds = yield this.getWordSetIdsMatchDepth(depth);
            const index = Math.floor(Math.random() * wordSetIds.length);
            return wordSetIds[index];
        });
    }
    /**
     * ワードセットの情報取得
     *
     * @returns {Promise<number>}
     * @memberof WordWolf
     */
    getWordSet() {
        return __awaiter(this, void 0, void 0, function* () {
            const key = {
                word_set_id: this.wordSetId
            };
            const data = yield aws.dynamoGet(this.wordSetTable, key);
            if (data.Item == undefined) {
                data.Item = { "word_set_id": null };
            }
            return data.Item;
        });
    }
    /**
     * depthに一致するワードセットを選んでgameデータにいれる
     *
     * @param {number} depth
     * @returns {Promise<void>}
     * @memberof WordWolf
     */
    updateWordSet(depth) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.depth = depth;
                aws.dynamoUpdate(this.gameTable, this.gameKey, "depth", this.depth);
                const wordSetId = yield this.chooseWordSetIdMatchDepth(depth);
                this.wordSetId = wordSetId;
                aws.dynamoUpdate(this.gameTable, this.gameKey, "word_set_id", this.wordSetId);
                const isReverse = yield commonFunction.getRandomBoolean();
                const wordSet = yield this.getWordSet();
                if (isReverse) {
                    this.citizenWord = wordSet.word1;
                    this.wolfWord = wordSet.word2;
                }
                else {
                    this.citizenWord = wordSet.word2;
                    this.wolfWord = wordSet.word1;
                }
                aws.dynamoUpdate(this.gameTable, this.gameKey, "citizen_word", this.citizenWord);
                aws.dynamoUpdate(this.gameTable, this.gameKey, "wolf_word", this.wolfWord);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    /**
     * ウルフのインデックスを選択する
     *
     * @param {number} wolfNumber
     * @returns {Promise<number[]>}
     * @memberof WordWolf
     */
    chooseWolfIndexes(wolfNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            const wolfIndexes = yield commonFunction.chooseRandomIndexes(userNumber, wolfNumber);
            return wolfIndexes;
        });
    }
    /**
     * ウルフのインデックスを更新する
     *
     * @param {number} wolfNumber
     * @returns {Promise<void>}
     * @memberof WordWolf
     */
    updateWolfIndexes(wolfNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const wolfIndexes = yield this.chooseWolfIndexes(wolfNumber);
            this.wolfIndexes = wolfIndexes;
            aws.dynamoUpdate(this.gameTable, this.gameKey, "wolf_indexes", this.wolfIndexes);
        });
    }
    // ウルフの数についての関数
    /**
     * ウルフの数の選択肢を返す
     * 参加者数の半数未満
     *
     * @returns {Promise<number[]>}
     * @memberof WordWolf
     */
    getWolfNumberOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            const maxWolfNumber = yield commonFunction.calculateMaxNumberLessThanHalf(userNumber);
            let res = [];
            for (let i = 1; i <= maxWolfNumber; i++) {
                res.push(i);
            }
            if (userNumber == 2) {
                res.push(1);
            }
            return res;
        });
    }
    /**
     * ウルフの数の選択肢に"人"をつけたものを返す
     *
     * @returns {Promise<string[]>}
     * @memberof WordWolf
     */
    getWolfNumberNinOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const wolfNumberOptions = yield this.getWolfNumberOptions();
            let wolfNumberNinOptions = [];
            for (let i = 0; i < wolfNumberOptions.length; i++) {
                wolfNumberNinOptions[i] = wolfNumberOptions[i] + "人";
            }
            return wolfNumberNinOptions;
        });
    }
    /**
     * 与えられたテキストがウルフの人数の選択肢の中にあるかどうかを返す
     * 例: text = "1人" → true, text = "1" → false
     *
     * @param {string} text
     * @returns {Promise<boolean>}
     * @memberof WordWolf
     */
    wolfNumberExists(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const wolfNumberNinOptions = yield this.getWolfNumberNinOptions();
            let res = false;
            for (let wolfNumberNinOption of wolfNumberNinOptions) {
                if (text == wolfNumberNinOption) {
                    res = true;
                }
            }
            return res;
        });
    }
    /**
     * textからウルフの数を取得する
     * "人"とる方が多分早いんだけどなぜかダブルチェック兼ねて配列の何番目と一致するかでやってる
     *
     * @param {string} text
     * @returns {Promise<number>}
     * @memberof WordWolf
     */
    getWolfNumberFromText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const wolfNumberNinOptions = yield this.getWolfNumberNinOptions();
            let wolfNumber = -1;
            for (let i = 0; i < wolfNumberNinOptions.length; i++) {
                if (text == wolfNumberNinOptions[i]) {
                    wolfNumber = i + 1;
                }
            }
            if (wolfNumber != -1) {
                return wolfNumber;
            }
            else {
                throw "ウルフの人数と一致しないよ";
            }
        });
    }
    // ウルフの数についての関数ここまで
    // 狂人の数について
    /**
     * 狂人の数の選択肢を取得する
     * とりあえず0か1
     *
     * @returns {Promise<number[]>}
     * @memberof WordWolf
     */
    getLunaticNumberOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            return [0, 1];
        });
    }
    /**
     * 狂人の数の選択肢に"人"をつけた配列を返す
     *
     * @returns {Promise<string[]>}
     * @memberof WordWolf
     */
    getLunaticNumberNinOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const lunaticNumberOptions = yield this.getLunaticNumberOptions();
            let lunaticNumberNinOptions = [];
            for (let i = 0; i < lunaticNumberOptions.length; i++) {
                lunaticNumberNinOptions[i] = lunaticNumberOptions[i] + "人";
            }
            return lunaticNumberNinOptions;
        });
    }
    /**
     * textが狂人の数の選択肢と一致するかどうかを返す
     *
     * @param {string} text
     * @returns {Promise<boolean>}
     * @memberof WordWolf
     */
    lunaticNumberExists(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const lunaticNumberNinOptions = yield this.getLunaticNumberNinOptions();
            let res = false;
            for (let lunaticNumberNinOption of lunaticNumberNinOptions) {
                if (text == lunaticNumberNinOption) {
                    res = true;
                }
            }
            return res;
        });
    }
    /**
     * textから狂人の数を取得する
     *
     * @param {string} text
     * @returns {Promise<number>}
     * @memberof WordWolf
     */
    getLunaticNumberFromText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const lunaticNumberNinOptions = yield this.getLunaticNumberNinOptions();
            let lunaticNumber = -1;
            for (let i = 0; i < lunaticNumberNinOptions.length; i++) {
                if (text == lunaticNumberNinOptions[i]) {
                    lunaticNumber = i;
                }
            }
            if (lunaticNumber != -1) {
                return lunaticNumber;
            }
            else {
                throw "狂人の人数と一致しないよ";
            }
        });
    }
    /**
     * 狂人のインデックスを選ぶ
     *
     * @param {number} lunaticNumber
     * @returns {Promise<number[]>}
     * @memberof WordWolf
     */
    chooseLunaticIndexes(lunaticNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            const lunaticIndexes = yield commonFunction.chooseRandomIndexes(userNumber, lunaticNumber);
            return lunaticIndexes;
        });
    }
    /**
     * 狂人のインデックスを更新
     *
     * @param {number} lunaticNumber
     * @returns {Promise<void>}
     * @memberof WordWolf
     */
    updateLunaticIndexes(lunaticNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const lunaticIndexes = yield this.chooseLunaticIndexes(lunaticNumber);
            this.lunaticIndexes = lunaticIndexes;
            aws.dynamoUpdate(this.gameTable, this.gameKey, "lunatic_indexes", this.lunaticIndexes);
        });
    }
    // 狂人の数ここまで
    isUserWolf(userIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = false;
            for (let wolfIndex of this.wolfIndexes) {
                if (userIndex == wolfIndex) {
                    res = true;
                }
            }
            return res;
        });
    }
    isUserLunatic(userIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = false;
            for (let lunaticIndex of this.lunaticIndexes) {
                if (userIndex == lunaticIndex) {
                    res = true;
                }
            }
            return res;
        });
    }
    isUserWolfSide(userIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserWolf = yield this.isUserWolf(userIndex);
            const isUserLunatic = yield this.isUserLunatic(userIndex);
            const res = isUserWolf || isUserLunatic;
            return res;
        });
    }
    isWinnerArray() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            let res = [];
            const isWolfWinner = (this.winner == "wolf");
            for (let i = 0; i < userNumber; i++) {
                const isUserWolfSide = yield this.isUserWolfSide(i);
                if (isWolfWinner) {
                    if (!isUserWolfSide) {
                        res[i] = true;
                    }
                    else {
                        res[i] = false;
                    }
                }
                else {
                    if (!isUserWolfSide) {
                        res[i] = false;
                    }
                    else {
                        res[i] = true;
                    }
                }
            }
            return res;
        });
    }
}
exports.WordWolf = WordWolf;
