import dabyss = require('dabyss');
/**
 * みんな狂ってるッ！！
 *
 * @export
 * @class CrazyNoisy
 * @extends {Game}
 */
export declare class CrazyNoisy extends dabyss.Game {
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
     * CrazyNoisyインスタンス作成
     *
     * @constructor
     * @extends Game
     * @param {string} groupId
     * @memberof CrazyNoisy
     */
    constructor(groupId: string);
    /**
     * 初期化
     *
     * @returns {Promise<void>}
     * @memberof CrazyNoisy
     */
    init(): Promise<void>;
    /**
     * インスタンス作成
     *
     * @static
     * @param {string} groupId
     * @returns {Promise<CrazyNoisy>}
     * @memberof CrazyNoisy
     */
    static createInstance(groupId: string): Promise<CrazyNoisy>;
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
