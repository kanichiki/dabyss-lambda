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
exports.Jinro = void 0;
const dabyss = require("dabyss");

/**
 * みんな狂ってるッ！！
 *
 * @export
 * @class Jinro
 * @extends {Game}
 */
class Jinro extends dabyss.Game {
    /**
     * Jinroインスタンス作成
     *
     * @constructor
     * @extends Game
     * @param {string} groupId
     * @memberof Jinro
     */
    constructor(groupId) {
        super(groupId);
        this.settingNames = ["type", "timer"];
        this.defaultSettingStatus = [false, false, true];
        this.positionNames = {
            werewolf: "人狼",
            madman: "狂人",
            forecaster: "占い師",
            citizen: "市民",
            psychic: "霊媒師",
            hunter: "狩人"
        };
        this.talkType = -1;
        this.aliveStatus = [];
    }
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Jinro
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
                            this.talkType = game.talk_type;
                            if (game.positions) {
                                this.positions = game.positions;
                            }
                            if (game.brainwash_status) {
                                this.aliveStatus = game.brainwash_status;
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
     * @returns {Promise<Jinro>}
     * @memberof Jinro
     */
    static createInstance(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const jinro = new Jinro(groupId);
            yield jinro.init();
            return jinro;
        });
    }
    chooseMadmanNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const userNumber = yield this.getUserNumber();
            const number = Math.floor((userNumber - 1) / 3);
            const madmanNumber = yield dabyss.getRandomNumber(number - 1, number);
            return madmanNumber;
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
            const werewolfNumber = 1;
            const madmanNumber = yield this.chooseMadmanNumber();
            // const madmanNumber = 1;
            const detectiveNumber = yield this.chooseDetectiveNumber();
            // const detectiveNumber = 1;
            const spNumber = yield this.chooseSpNumber();
            let isDecided = [];
            for (let i = 0; i < userNumber; i++) {
                isDecided[i] = false;
            }
            const positionNumbers = {
                werewolf: werewolfNumber,
                madman: madmanNumber,
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
    updateTalkType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            this.talkType = type;
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "talk_type", this.talkType);
        });
    }
    switchZeroWerewolf() {
        return __awaiter(this, void 0, void 0, function* () {
            this.zeroWerewolf = !(this.zeroWerewolf);
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "zero_werewolf", this.zeroWerewolf);
        });
    }
    switchZeroDetective() {
        return __awaiter(this, void 0, void 0, function* () {
            this.zeroDetective = !(this.zeroDetective);
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "zero_detective", this.zeroDetective);
        });
    }
    updateDefaultAliveStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const positions = this.positions;
            for (let i = 0; i < positions.length; i++) {
                this.aliveStatus[i] = false;
            }
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "alive_status", this.aliveStatus);
        });
    }
    isAlive(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.aliveStatus[index];
        });
    }
    getAliveNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = 0;
            for (let state of this.aliveStatus) {
                if (!state) {
                    res++;
                }
            }
            return res;
        });
    }
    isDeadCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            const alive_num = yield this.getAliveNumber();
            const res = (alive_num <= 1);
            return res;
        });
    }
    updateAliveStateFalse(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.aliveStatus[index] = false;
            dabyss.dynamoUpdate(this.gameTable, this.gameKey, "alive_status", this.aliveStatus);
        });
    }
    isWerewolf(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = (this.positions[index] == this.positionNames.werewolf);
            return res;
        });
    }
    getWinnerIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = [];
            for (let i = 0; i < this.positions.length; i++) {
                if (this.winner == "werewolf") { // 人狼陣営勝利なら
                    if (this.positions[i] == this.positionNames.werewolf || this.positions[i] == this.positionNames.madman) {
                        res.push(i);
                    }
                }
                else { // 市民陣営勝利なら
                    if (this.positions[i] == this.positionNames.detective || this.positions[i] == this.positionNames.citizen || this.positionNames.sp) {
                        res.push(i);
                    }
                }
            }
            return res;
        });
    }
}
exports.Jinro = Jinro;
