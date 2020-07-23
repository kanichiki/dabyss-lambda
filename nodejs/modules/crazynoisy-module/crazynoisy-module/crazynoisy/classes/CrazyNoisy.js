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
exports.CrazyNoisy = void 0;
const dabyss = require("dabyss");
const Craziness_1 = require("./Craziness");
const crazinessTable = "dabyss-dev-craziness";
/**
 * みんな狂ってるッ！！
 *
 * @export
 * @class CrazyNoisy
 * @extends {Game}
 */
class CrazyNoisy extends dabyss.Game {
    /**
     * CrazyNoisyインスタンス作成
     *
     * @constructor
     * @extends Game
     * @param {string} groupId
     * @memberof CrazyNoisy
     */
    constructor(groupId) {
        super(groupId);
        this.settingNames = ["mode", "type", "timer"];
        this.defaultSettingStatus = [false, false, true];
        this.positionNames = {
            guru: "教祖",
            fanatic: "狂信者",
            detective: "探偵",
            citizen: "市民",
            sp: "用心棒"
        };
        this.gameMode = "";
        this.talkType = -1;
        this.zeroDetective = false;
        this.zeroGuru = false;
        this.brainwashStatus = [];
        this.crazinessIds = [];
    }
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof CrazyNoisy
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield dabyss.dynamoQuery(this.gameTable, "group_id", this.groupId, false);
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
                            this.gameMode = game.game_mode;
                            this.talkType = game.talk_type;
                            this.zeroDetective = game.zero_detective;
                            this.zeroGuru = game.zero_guru;
                            if (game.positions) {
                                this.positions = game.positions;
                            }
                            if (game.brainwash_status) {
                                this.brainwashStatus = game.brainwash_status;
                            }
                            if (game.craziness_ids) {
                                this.crazinessIds = game.craziness_ids;
                            }
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
     * @returns {Promise<CrazyNoisy>}
     * @memberof CrazyNoisy
     */
    static createInstance(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const crazyNoisy = new CrazyNoisy(groupId);
            yield crazyNoisy.init();
            return crazyNoisy;
        });
    }
    chooseFanaticNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            const number = Math.floor((userNumber - 1) / 3);
            const fanaticNumber = yield dabyss.getRandomNumber(number - 1, number);
            return fanaticNumber;
        });
    }
    chooseDetectiveNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            const number = Math.floor((userNumber - 1) / 3);
            let detectiveNumber = yield dabyss.getRandomNumber(number - 1, number);
            if (detectiveNumber > 1) {
                detectiveNumber = 1;
            }
            return detectiveNumber;
        });
    }
    chooseSpNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            let spNumber = 0;
            if (userNumber > 6) {
                spNumber = 1;
            }
            return spNumber;
        });
    }
    updatePositions() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            const guruNumber = 1;
            const fanaticNumber = yield this.chooseFanaticNumber();
            // const fanaticNumber = 1;
            const detectiveNumber = yield this.chooseDetectiveNumber();
            // const detectiveNumber = 1;
            const spNumber = yield this.chooseSpNumber();
            let isDecided = [];
            for (let i = 0; i < userNumber; i++) {
                isDecided[i] = false;
            }
            const positionNumbers = {
                guru: guruNumber,
                fanatic: fanaticNumber,
                detective: detectiveNumber,
                sp: spNumber
            };
            for (let k in positionNumbers) {
                let undecided = [];
                for (let i = 0; i < userNumber; i++) {
                    if (!isDecided[i]) { // まだ決まってなかったら
                        undecided.push(i);
                    }
                }
                const indexes = yield dabyss.getRandomIndexes(undecided, positionNumbers[k]);
                for (let index of indexes) {
                    this.positions[index] = this.positionNames[k];
                    isDecided[index] = true;
                }
            }
            for (let i = 0; i < userNumber; i++) {
                if (!isDecided[i]) { // まだ決まってなかったら
                    this.positions[i] = this.positionNames.citizen;
                }
            }
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "positions", this.positions);
        });
    }
    getPosition(userIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const position = this.positions[userIndex];
            return position;
        });
    }
    updateGameMode(mode) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gameMode = mode;
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "game_mode", this.gameMode);
        });
    }
    updateTalkType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            this.talkType = type;
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "talk_type", this.talkType);
        });
    }
    switchZeroGuru() {
        return __awaiter(this, void 0, void 0, function* () {
            this.zeroGuru = !(this.zeroGuru);
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "zero_guru", this.zeroGuru);
        });
    }
    switchZeroDetective() {
        return __awaiter(this, void 0, void 0, function* () {
            this.zeroDetective = !(this.zeroDetective);
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "zero_detective", this.zeroDetective);
        });
    }
    updateDefaultBrainwashStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const positions = this.positions;
            for (let i = 0; i < positions.length; i++) {
                if (positions[i] == this.positionNames.guru || positions[i] == this.positionNames.fanatic) {
                    this.brainwashStatus[i] = true;
                }
                else {
                    this.brainwashStatus[i] = false;
                }
            }
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "brainwash_status", this.brainwashStatus);
        });
    }
    isBrainwash(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.brainwashStatus[index];
        });
    }
    getNotBrainwashedNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = 0;
            for (let state of this.brainwashStatus) {
                if (!state) {
                    res++;
                }
            }
            return res;
        });
    }
    isBrainwashCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            const notBrainwashed = yield this.getNotBrainwashedNumber();
            const res = (notBrainwashed <= 1);
            return res;
        });
    }
    updateBrainwashStateTrue(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.brainwashStatus[index] = true;
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "brainwash_status", this.brainwashStatus);
        });
    }
    chooseCrazinessId(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const crazinessIds = yield Craziness_1.Craziness.getCrazinessIdsMatchType(type);
            const index = Math.floor(Math.random() * crazinessIds.length);
            return crazinessIds[index];
        });
    }
    updateDefaultCrazinessIds() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            for (let i = 0; i < userNumber; i++) {
                this.crazinessIds[i] = [];
                if (this.positions[i] == this.positionNames.fanatic) {
                    const crazinessId = yield this.chooseCrazinessId(this.talkType);
                    this.crazinessIds[i].push(crazinessId);
                }
            }
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "craziness_ids", this.crazinessIds);
        });
    }
    updateDefaultCrazinessIdsInDemo() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            for (let i = 0; i < userNumber; i++) {
                this.crazinessIds[i] = [];
                const crazinessId = yield this.chooseCrazinessId(this.talkType);
                this.crazinessIds[i].push(crazinessId);
            }
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "craziness_ids", this.crazinessIds);
        });
    }
    addCrazinessId(index) {
        return __awaiter(this, void 0, void 0, function* () {
            let status = false;
            LOOP: while (!status) {
                const crazinessId = yield this.chooseCrazinessId(this.talkType);
                for (let j = 0; j < this.crazinessIds[index].length; j++) {
                    if (this.crazinessIds[index][j] == crazinessId) {
                        continue LOOP;
                    }
                }
                this.crazinessIds[index].push(crazinessId);
                status = true;
            }
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "craziness_ids", this.crazinessIds);
        });
    }
    isGuru(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = (this.positions[index] == this.positionNames.guru);
            return res;
        });
    }
    getWinnerIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = [];
            for (let i = 0; i < this.positions.length; i++) {
                if (this.winner == "guru") { // 教団陣営勝利なら
                    if (this.positions[i] == this.positionNames.guru || this.positions[i] == this.positionNames.fanatic) {
                        res.push(i);
                    }
                }
                else { // 市民陣営勝利なら
                    if ((this.positions[i] == this.positionNames.detective || this.positions[i] == this.positionNames.citizen) || this.positions[i] == this.positionNames.sp) {
                        res.push(i);
                    }
                }
            }
            return res;
        });
    }
}
exports.CrazyNoisy = CrazyNoisy;
