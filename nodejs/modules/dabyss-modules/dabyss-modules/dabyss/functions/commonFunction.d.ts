export declare const makeShuffuleNumberArray: (number: number) => Promise<number[]>;
export declare const calculateMaxNumberLessThanHalf: (number: number) => Promise<number>;
export declare const convertDateToString: (date: Date) => Promise<string>;
export declare const getCurrentTime: () => Promise<string>;
export declare type Interval = {
    hours: number;
    minutes: number;
    seconds: number;
};
export declare const convertIntervalToString: (interval: Interval) => Promise<string>;
export declare const convertIntervalToTimerString: (interval: Interval) => Promise<string>;
export declare const getTimerObject: (timerString: string) => Promise<Interval>;
export declare const getEndTime: (startTimeString: string, timerString: string) => Promise<string>;
export declare const getRemainingTime: (endTimeString: string) => Promise<Interval>;
/**
 * 与えられたuserNumberの数の中からchooseNumberの数だけランダムに選んでその配列を返す
 *
 * @param {*} userNumber
 * @param {*} chooseNumber
 * @returns
 */
export declare const chooseRandomIndexes: (userNumber: number, chooseNumber: number) => Promise<number[]>;
/**
 * 与えられたインデックスの中からchooseNumberの数だけランダムに抽出して配列で返す
 * indexes.length >= chooseNumber
 *
 * @param {*} indexes
 * @param {*} chooseNumber
 */
export declare const getRandomIndexes: (indexes: number[], chooseNumber: number) => Promise<number[]>;
export declare const getRandomNumber: (minNumber: number, maxNumber: number) => Promise<number>;
export declare const getRandomBoolean: () => Promise<boolean>;
