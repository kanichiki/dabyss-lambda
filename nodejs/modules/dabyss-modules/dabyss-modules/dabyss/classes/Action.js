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
exports.Action = void 0;
const aws = require("../clients/awsClient");
const actionTable = "dabyss-dev-action";
/**
 * アクションのクラス
 *
 * @export
 * @class Action
 */
class Action {
    /**
     * アクションクラスのコンストラクタ
     *
     * @param {number} gameId
     * @param {number} day
     * @memberof Action
     */
    constructor(gameId, day) {
        this.gameId = gameId;
        this.day = day;
        this.actionKey = {
            game_id: this.gameId,
            day: this.day
        };
        this.actionStatus = [];
        this.targets = [];
    }
    /**
     * データで初期化
     *
     * @returns {Promise<void>}
     * @memberof Action
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield aws.dynamoGet(actionTable, this.actionKey);
                if (data.Item != undefined) {
                    const action = data.Item;
                    this.actionStatus = action.action_status;
                    this.targets = action.targets;
                }
                else {
                    throw new Error("Actionデータが見つかりません");
                }
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    /**
     * アクションインスタンス作成
     *
     * @static
     * @param {number} gameId
     * @param {number} day
     * @returns {Promise<Action>}
     * @memberof Action
     */
    static createInstance(gameId, day) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = new Action(gameId, day);
            yield action.init();
            return action;
        });
    }
    /**
     * アクションデータ挿入
     *
     * @static
     * @param {number} gameId
     * @param {number} day
     * @param {boolean[]} defaultStatus
     * @returns {Promise<void>}
     * @memberof Action
     */
    static putAction(gameId, day, defaultStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const targets = Array(defaultStatus.length).fill(-1);
            try {
                const item = {
                    game_id: gameId,
                    day: day,
                    action_status: defaultStatus,
                    targets: targets
                };
                aws.dynamoPut(actionTable, item);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    /**
     * ユーザーがアクション済みかどうか返す
     *
     * @param {number} index
     * @returns {Promise<boolean>}
     * @memberof Action
     */
    isActedUser(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.actionStatus[index];
        });
    }
    /**
     * アクションステータスをtrueに
     *
     * @param {number} index
     * @returns {Promise<void>}
     * @memberof Action
     */
    updateActionStateTrue(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.actionStatus[index] = true;
            aws.dynamoUpdate(actionTable, this.actionKey, "action_status", this.actionStatus);
        });
    }
    /**
     * ターゲットを更新
     *
     * @param {number} index
     * @param {number} target
     * @returns {Promise<void>}
     * @memberof Action
     */
    updateTarget(index, target) {
        return __awaiter(this, void 0, void 0, function* () {
            this.targets[index] = target;
            aws.dynamoUpdate(actionTable, this.actionKey, "targets", this.targets);
        });
    }
    /**
     * アクションする
     * アクションステータスをtrueにしてターゲットを更新する
     *
     * @param {number} userIndex
     * @param {number} target
     * @returns {Promise<void>}
     * @memberof Action
     */
    act(userIndex, target) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateActionStateTrue(userIndex);
            this.updateTarget(userIndex, target);
        });
    }
    /**
     * アクションが完了しているかどうかを返す
     *
     * @returns {Promise<boolean>}
     * @memberof Action
     */
    isActionCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = true;
            for (const state of this.actionStatus) {
                if (!state) {
                    res = false;
                    break;
                }
            }
            return res;
        });
    }
}
exports.Action = Action;
