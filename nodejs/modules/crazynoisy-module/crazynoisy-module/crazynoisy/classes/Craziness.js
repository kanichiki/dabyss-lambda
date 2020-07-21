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
exports.Craziness = void 0;
const dabyss = require("dabyss");
const crazinessTable = "dabyss-dev-craziness";
class Craziness {
    constructor(crazinessId) {
        this.crazinessId = crazinessId;
        this.crazinessKey = {
            craziness_id: this.crazinessId
        };
        this.content = "";
        this.remark = "";
        this.type = -1;
        this.level = -1;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield dabyss.dynamoGet(crazinessTable, this.crazinessKey);
                if (data.Item != undefined) {
                    const craziness = data.Item;
                    this.content = craziness.content;
                    this.remark = craziness.remark;
                    this.type = craziness.type;
                    this.level = craziness.level;
                }
                else {
                    throw new Error("データが見つかりません");
                }
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    static createInstance(crazinessId) {
        return __awaiter(this, void 0, void 0, function* () {
            const craziness = new Craziness(crazinessId);
            yield craziness.init();
            return craziness;
        });
    }
    static getCrazinessIdsMatchType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const secondaryIndex = "type-craziness_id-index";
            const crazinessIds = [];
            for (let i = 1; i <= type; i++) {
                const data = yield dabyss.dynamoQuerySecondaryIndex(crazinessTable, secondaryIndex, "type", i);
                if (data.Items != undefined) {
                    for (let item of data.Items) {
                        crazinessIds.push(item.craziness_id);
                    }
                }
            }
            return crazinessIds;
        });
    }
}
exports.Craziness = Craziness;
