const aws = require('../clients/awsClient');
const Group = require('./Group');
const Game = require('./Game');

const commonFunction = require('../template/functions/commonFunction')

/**
 * みんな大好きワードウルフ！
 *
 * @class WordWolf
 * @extends {Game}
 */
class WordWolf extends Game {

    /**
     * WordWolfインスタンス作成
     * 
     * @constructor
     * @extends Game
     * @param {*} groupId
     * @memberof WordWolf
     */
    constructor(groupId) {
        super(groupId);
        this.settingNames = ["depth", "wolf_number", "lunatic_number", "timer"];
        this.defaultSettingStatus = [false, false, false, true];
        this.wordSetId = -1;
        this.isReverse = false;
        this.wolfIndexes = [];
        this.lunaticIndexes = [];
    }

    /**
     * インスタンス変数初期化
     *
     * @memberof WordWolf
     */
    async init() {
        try {
            const data = await aws.dynamoQuery(this.gameTable, "group_id", this.groupId, false);
            if (data.Count > 0) {
                this.exists = true;
                const game = data.Items[0];
                this.gameId = game.game_id;
                this.userIds = game.user_ids;
                this.day = game.day;
                this.gameName = game.game_name;
                this.gameStatus = game.game_status;
                this.settingStatus = game.settingStatus;
                this.timer = game.timer;

                this.wordSetId = game.word_set_id;
                this.isReverse = game.is_reverse;
                this.wolfIndexes = game.wolf_indexes;
                this.lunaticIndexes = game.lunatic_indexes;

            } else {
                this.exists = false;
            }
        } catch (err) {
            console.error(err);
            console.error("gameの初期化失敗");
        }
    }

    /**
     * インスタンス作成
     *
     * @static
     * @param {*} groupId
     * @returns
     * @memberof WordWolf
     */
    static async createInstance(groupId) {
        const wordWolf = new WordWolf(groupId);
        await wordWolf.init();
        return wordWolf;
    }

    /**
     * depthに一致するワードセットのidの配列を返す
     *
     * @param {*} depth
     * @returns Array
     * @memberof WordWolf
     */
    async getWordSetIdsMatchDepth(depth) {
        const table = "dabyss-dev-word-set";
        let wordSetIds = [];
        if (depth != 3) {
            const data = await aws.dynamoQuery(table, "depth", depth);
            for (let item of data.Items) {
                wordSetIds.push(item.word_id);
            }
        } else {
            const data3 = await aws.dynamoQuery(table, "depth", 3);
            for (let item of data3.Items) {
                wordSetIds.push(item.word_id);
            }
            const data4 = await aws.dynamoQuery(table, "depth", 4);
            for (let item of data4.Items) {
                wordSetIds.push(item.word_id);
            }
        }
        return wordSetIds;
    }

    /**
     * depthに一致するワードセットをランダムに1つ選ぶ
     *
     * @param {*} depth
     * @returns Number
     * @memberof WordWolf
     */
    async chooseWordSetIdMatchDepth(depth) {
        const wordSetIds = await this.getWordSetIdsMatchDepth(depth);
        const index = Math.floor(Math.random() * wordSetIds.length);
        return wordSetIds[index];
    }

    /**
     * depthに一致するワードセットを選んでgameデータにいれる
     *
     * @param {*} depth
     * @memberof WordWolf
     */
    async updateWordSetIdMatchDepth(depth) {
        const key = await this.getKey();
        const wordSetId = await this.chooseWordSetIdMatchDepth(depth);
        aws.dynamoUpdate(this.gameTable, key, "word_set_id", wordSetId);
        this.wordSetId = wordSetId;
    }

    // ウルフの数についての関数

    /**
     * ウルフの数の選択肢を返す
     * 参加者数の半数未満
     *
     * @returns 配列
     * @memberof WordWolf
     */
    async getWolfNumberOptions() {
        const userNumber = await this.getUserNumber();
        const maxWolfNumber = await commonFunction.calculateMaxNumberLessThanHalf(userNumber);

        let res = [];
        for (let i = 1; i <= maxWolfNumber; i++) {
            res.push(i);
        }
        if (userNumber == 2) {
            res.push(1);
        }
        return res;
    }

    /**
     * ウルフの数の選択肢に"人"をつけたものを返す
     *
     * @returns
     * @memberof WordWolf
     */
    async getWolfNumberNinOptions() {
        const wolfNumberOptions = await this.getWolfNumberOptions();
        let wolfNumberNinOptions = [];
        for (let i = 0; i < wolfNumberOptions.length; i++) {
            wolfNumberNinOptions[i] = wolfNumberOptions[i] + "人";
        }
        return wolfNumberNinOptions;
    }

    /**
     * 与えられたテキストがウルフの人数の選択肢の中にあるかどうかを返す
     * 例: text = "1人" → true, text = "1" → false
     *
     * @param {*} text
     * @returns Boolean
     * @memberof WordWolf
     */
    async wolfNumberExists(text) {
        const wolfNumberNinOptions = await this.getWolfNumberNinOptions();
        let res = false;
        for (let wolfNumberNinOption of wolfNumberNinOptions) {
            if (text == wolfNumberNinOption) {
                res = true;
            }
        }
        return res;
    }

    /**
     * textからウルフの数を取得する
     * "人"とる方が多分早いんだけどなぜか配列の何番目と一致するかでやってる
     *
     * @param {*} text
     * @returns Number
     * @memberof WordWolf
     */
    async getWolfNumberFromText(text) {
        const wolfNumberNinOptions = await this.getWolfNumberNinOptions();
        let wolfNumber = -1;
        for (let i = 0; i < wolfNumberNinOptions.length; i++) {
            if (text == wolfNumberNinOptions[i]) {
                wolfNumber = i + 1;
            }
        }
        if (wolfNumber != -1) {
            return wolfNumber;
        } else {
            throw "ウルフの人数と一致しないよ"
        }
    }

    // ウルフの数についての関数ここまで

    // 狂人の数について

    /**
     * 狂人の数の選択肢を取得する
     * とりあえず0か1
     *
     * @returns Array
     * @memberof WordWolf
     */
    async getLunaticNumberOptions() {
        return [0, 1];
    }

    /**
     * 狂人の数の選択肢に"人"をつけた配列を返す
     *
     * @returns Array
     * @memberof WordWolf
     */
    async getLunaticNumberNinOptions() {
        const lunaticNumberOptions = await this.getLunaticNumberOptions();
        let lunaticNumberNinOptions = [];
        for (let i = 0; i < lunaticNumberOptions.length; i++) {
            lunaticNumberNinOptions[i] = lunaticNumberOptions[i] + "人";
        }
        return lunaticNumberNinOptions;
    }

    /**
     * textが狂人の数の選択肢と一致するかどうかを返す
     *
     * @param {*} text
     * @returns Boolean
     * @memberof WordWolf
     */
    async lunaticNumberExists(text) {
        const lunaticNumberNinOptions = await this.getLunaticNumberNinOptions();
        let res = false;
        for (let lunaticNumberNinOption of lunaticNumberNinOptions) {
            if (text == lunaticNumberNinOption) {
                res = true;
            }
        }
        return res;
    }

    /**
     * textから狂人の数を取得する
     *
     * @param {*} text
     * @returns Number
     * @memberof WordWolf
     */
    async getLunaticNumberFromText(text) {

        const lunaticNumberNinOptions = await this.getLunaticNumberNinOptions();
        let lunaticNumber = -1;
        for (let i = 0; i < lunaticNumberNinOptions.length; i++) {
            if (text == lunaticNumberNinOptions[i]) {
                lunaticNumber = i;
            }
        }
        if (lunaticNumber != -1) {
            return lunaticNumber;
        } else {
            throw "狂人の人数と一致しないよ"
        }

    }

    // 狂人の数ここまで



}

module.exports = WordWolf;