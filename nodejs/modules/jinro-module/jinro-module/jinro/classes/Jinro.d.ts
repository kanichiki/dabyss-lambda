import dabyss = require('dabyss');
/**
 * みんな狂ってるッ！！
 *
 * @export
 * @class Jinro
 * @extends {Game}
 */
export declare class Jinro extends dabyss.Game {
    settingNames: string[];
    defaultSettingStatus: boolean[];
    positionNames: {
        [key: string]: string;
    };
    talkType: number;
    /**
     * Jinroインスタンス作成
     *
     * @constructor
     * @extends Game
     * @param {string} groupId
     * @memberof Jinro
     */
    constructor(groupId: string);
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof Jinro
     */
    init(): Promise<void>;
    /**
     * インスタンス作成
     *
     * @static
     * @param {string} groupId
     * @returns {Promise<Jinro>}
     * @memberof Jinro
     */
    static createInstance(groupId: string): Promise<Jinro>;
    chooseMadmanNumber(): Promise<number>;
    chooseDetectiveNumber(): Promise<number>;
    chooseSpNumber(): Promise<number>;
    updatePositions(): Promise<void>;
    getPosition(userIndex: number): Promise<string>;
    updateTalkType(type: number): Promise<void>;
    switchZeroWerewolf(): Promise<void>;
    switchZeroDetective(): Promise<void>;
    updateDefaultAliveStatus(): Promise<void>;
    isAlive(index: number): Promise<boolean>;
    getAliveNumber(): Promise<number>;
    isDeadCompleted(): Promise<boolean>;
    updateAliveStateFalse(index: number): Promise<void>;
    isWerewolf(index: number): Promise<boolean>;
    getWinnerIndexes(): Promise<number[]>;
}
