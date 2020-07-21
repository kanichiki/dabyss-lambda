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
class Action {
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
    static createInstance(gameId, day) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = new Action(gameId, day);
            yield action.init();
            return action;
        });
    }
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
    isActedUser(index) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.actionStatus[index];
        });
    }
    updateActionState(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.actionStatus[index] = true;
            aws.dynamoUpdate(actionTable, this.actionKey, "action_status", this.actionStatus);
        });
    }
    updateTarget(index, target) {
        return __awaiter(this, void 0, void 0, function* () {
            this.targets[index] = target;
            aws.dynamoUpdate(actionTable, this.actionKey, "targets", this.targets);
        });
    }
    act(userIndex, target) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateActionState(userIndex);
            this.updateTarget(userIndex, target);
        });
    }
}
exports.Action = Action;
