import line = require('@line/bot-sdk');
export declare const werewolf = "\u6559\u7956";
export declare const madman = "\u72C2\u4FE1\u8005";
export declare const forecaster = "\u63A2\u5075";
export declare const citizen = "\u5E02\u6C11";
export declare const typeOptions: line.FlexBubble;
export declare const settingConfirmMessage: (userNumber: number, type: number, timer: string, zeroWerewolf: boolean, zeroForecaster: boolean) => Promise<line.FlexBubble>;
export declare const timerMessage: () => Promise<line.FlexBubble>;
export declare const positionNumberMessage: (userNumber: number, werewolfNumber: number, forecasterNumber: number, psychicNumber: number, hunterNumber: number, madmanNumber: number) => Promise<line.FlexBubble>;
