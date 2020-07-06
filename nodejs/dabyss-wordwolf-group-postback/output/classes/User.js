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
exports.User = void 0;
const aws = require("../clients/awsClient");
const line = require("../clients/lineClient");
/**
 * Userクラス
 *
 * @export
 * @class User
 */
class User {
    /**
     * Creates an instance of User.
     *
     * テーブル構造は以下の通り
     * @param {string} userId : userId
     * group_id : 参加中のgroup_id。ゲーム終了時に削除するようにする
     * is_restarting : group_idがあるときに他のゲームに参加しようとしたら確認をするが、その保留ステータス
     */
    constructor(userId) {
        this.userTable = "dabyss-dev-user";
        this.userId = userId;
        this.userKey = {
            user_id: userId
        };
        this.exists = false;
        this.groupId = "";
        this.isRestarting = false;
    }
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield aws.dynamoQuery(this.userTable, "user_id", this.userId, false);
            if (data.Count != undefined) {
                if (data.Count > 0) {
                    this.exists = true;
                    if (data.Items != undefined) {
                        const user = data.Items[0];
                        this.groupId = user.group_id;
                        this.isRestarting = user.is_restarting;
                    }
                }
            }
        });
    }
    /**
     * userインスタンスを作る
     *
     * @static
     * @param {string} userId
     * @returns {Promise<User>}
     * @memberof User
     */
    static createInstance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new User(userId);
            yield user.init();
            return user;
        });
    }
    /**
     * group_idを持ってるかどうか
     *
     * @returns {Promise<boolean>}
     * @memberof User
     */
    hasGroupId() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = true;
            if (this.groupId == "") {
                res = false;
            }
            return res;
        });
    }
    /**
     * 与えられたgroupIdとユーザーのgroupIdが一致するか否か
     *
     * @param {string} groupId
     * @returns {Promise<boolean>}
     * @memberof User
     */
    isMatchGroupId(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentGroupId = this.groupId;
            let res = false;
            if (groupId == currentGroupId) {
                res = true;
            }
            return res;
        });
    }
    /**
     * ユーザーデータ挿入
     *
     * @param {string} groupId
     * @returns {Promise<void>}
     * @memberof User
     */
    putUser(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = {
                user_id: this.userId,
                group_id: groupId,
                is_restarting: false
            };
            aws.dynamoPut(this.userTable, item);
        });
    }
    /**
     * group_idを削除する（emptyにする）
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    deleteGroupId() {
        return __awaiter(this, void 0, void 0, function* () {
            aws.dynamoUpdate(this.userTable, this.userKey, "group_id", "");
        });
    }
    /**
     * リスタート状態をtrueに
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    updateIsRestartingTrue() {
        return __awaiter(this, void 0, void 0, function* () {
            aws.dynamoUpdate(this.userTable, this.userKey, "is_restarting", true);
            this.isRestarting = true;
        });
    }
    /**
     * リスタート状態をfalseに
     *
     * @returns {Promise<void>}
     * @memberof User
     */
    updateIsRestartingFalse() {
        return __awaiter(this, void 0, void 0, function* () {
            aws.dynamoUpdate(this.userTable, this.userKey, "is_restarting", false);
            this.isRestarting = false;
        });
    }
    /**
     * 表示名を返す
     *
     * @returns {Promise<string>}
     * @memberof User
     */
    getDisplayName() {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield line.getProfile(this.userId);
            const displayName = profile.displayName;
            return displayName;
        });
    }
}
exports.User = User;
