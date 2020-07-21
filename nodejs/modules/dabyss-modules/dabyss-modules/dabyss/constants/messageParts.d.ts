import line = require('@line/bot-sdk');
export declare const mainColor = "#E83b10";
export declare const subColor = "#036568";
export declare const voteMessage: (userIndexes: number[], displayNames: string[]) => Promise<line.FlexBubble[]>;
export declare const revoteMessage: (displayNames: string[], userIds: string[], userIndexes: number[]) => Promise<line.FlexBubble[]>;
export declare const gamesMessage: () => Promise<line.FlexCarousel>;
