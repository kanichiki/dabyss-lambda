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
    gameMode: string;
    talkType: number;
    zeroDetective: boolean;
    zeroGuru: boolean;
    brainwashStatus: boolean[];
    crazinessIds: number[][];
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
    chooseFanaticNumber(): Promise<number>;
    chooseDetectiveNumber(): Promise<number>;
    chooseSpNumber(): Promise<number>;
    updatePositions(): Promise<void>;
    getPosition(userIndex: number): Promise<string>;
    updateGameMode(mode: string): Promise<void>;
    updateTalkType(type: number): Promise<void>;
    switchZeroGuru(): Promise<void>;
    switchZeroDetective(): Promise<void>;
    updateDefaultBrainwashStatus(): Promise<void>;
    isBrainwash(index: number): Promise<boolean>;
    getNotBrainwashedNumber(): Promise<number>;
    isBrainwashCompleted(): Promise<boolean>;
    updateBrainwashStateTrue(index: number): Promise<void>;
    chooseCrazinessId(type: number): Promise<number>;
    updateDefaultCrazinessIds(): Promise<void>;
    updateDefaultCrazinessIdsInDemo(): Promise<void>;
    addCrazinessId(index: number): Promise<void>;
    isGuru(index: number): Promise<boolean>;
    getWinnerIndexes(): Promise<number[]>;
}
