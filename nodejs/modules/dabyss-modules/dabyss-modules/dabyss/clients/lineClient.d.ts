import line = require('@line/bot-sdk');
export declare const getChannelId: () => Promise<string>;
export declare const replyMessage: (replyToken: string, messages: line.Message | line.Message[]) => Promise<void>;
export declare const pushMessage: (to: string, messages: line.Message | line.Message[]) => Promise<void>;
export declare const getProfile: (userId: string) => Promise<line.Profile>;
