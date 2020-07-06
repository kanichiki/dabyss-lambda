import line = require('@line/bot-sdk');

import * as parts from "./constants/messageParts";
import * as wordWolfParts from "./constants/wordWolfParts";

export const main = async (userNumber: number, depth: number, wolfNumber: number, lunaticNumber: number, timerString: string): Promise<line.FlexMessage> => {
  return {
    "type": "flex",
    "altText": "設定確認",
    "contents": await wordWolfParts.settingConfirmMessage(userNumber, depth, wolfNumber, lunaticNumber, timerString)
  }

}