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
exports.Group = void 0;
const aws = require("../clients/awsClient");
const Game_1 = require("./Game");
/**
 *
 *
 * @export
 * @class Group
 */
class Group {
    /**
     * Creates an instance of Group.
     * @param {string} groupId
     * @memberof Group
     */
    constructor(groupId) {
        this.groupTable = "dabyss-dev-group";
        this.groupId = groupId;
        this.groupKey = {
            group_id: groupId
        };
        this.exists = false;
        this.status = "";
        this.isRestarting = false;
        this.isFinishing = false;
    }
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield aws.dynamoQuery(this.groupTable, "group_id", this.groupId, false);
            if (data.Count != undefined) {
                if (data.Count > 0) {
                    this.exists = true;
                    if (data.Items != undefined) {
                        const group = data.Items[0];
                        this.status = group.status;
                        this.isRestarting = group.is_restarting;
                        this.isFinishing = group.is_finishing;
                    }
                }
            }
        });
    }
    /**
     * Groupインスタンス作成
     *
     * @static
     * @param {string} groupId
     * @returns {Promise<Group>}
     * @memberof Group
     */
    static createInstance(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = new Group(groupId);
            yield group.init();
            return group;
        });
    }
    /**
     * groupを作成
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    putGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = {
                    group_id: this.groupId,
                    status: "recruit",
                    is_restarting: false,
                    is_finishing: false
                };
                // groupデータをputできたらsequenceをプラス１
                aws.dynamoPut(this.groupTable, item);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    /**
     * ステータスを更新
     *
     * @param {string} status
     * @returns {Promise<void>}
     * @memberof Group
     */
    updateStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            aws.dynamoUpdate(this.groupTable, this.groupKey, "status", status);
            this.status = status;
        });
    }
    /**
     * リスタート状態をtrueに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    updateIsRestartingTrue() {
        return __awaiter(this, void 0, void 0, function* () {
            aws.dynamoUpdate(this.groupTable, this.groupKey, "is_restarting", true);
            this.isRestarting = true;
        });
    }
    /**
     * リスタート状態をfalseに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    updateIsRestartingFalse() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                aws.dynamoUpdate(this.groupTable, this.groupKey, "is_restarting", false);
                this.isRestarting = false;
            }
            catch (err) {
                console.log(err);
                console.log("グループのリスタート状態をfalseにできませんでした");
            }
        });
    }
    /**
     * 強制終了状態をtrueに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    updateIsFinishingTrue() {
        return __awaiter(this, void 0, void 0, function* () {
            aws.dynamoUpdate(this.groupTable, this.groupKey, "is_finishing", true);
            this.isFinishing = true;
        });
    }
    /**
     * 強制終了状態をfalseに
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    updateIsFinishingFalse() {
        return __awaiter(this, void 0, void 0, function* () {
            aws.dynamoUpdate(this.groupTable, this.groupKey, "is_finishing", false);
            this.isFinishing = false;
        });
    }
    /**
     * 全部終わらせる
     * 全部falseにする
     * ただし、ユーザーに関してはまだ参加中が該当のgroupIdのときのみ
     *
     * @returns {Promise<void>}
     * @memberof Group
     */
    finishGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateStatus("finish");
            this.updateIsRestartingFalse();
            this.updateIsFinishingFalse();
            const game = yield Game_1.Game.createInstance(this.groupId);
            game.deleteUsersGroupId();
        });
    }
}
exports.Group = Group;
