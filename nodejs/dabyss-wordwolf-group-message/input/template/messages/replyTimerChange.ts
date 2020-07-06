import line = require('@line/bot-sdk');

import * as parts from "./constants/messageParts";
import * as wordWolfParts from "./constants/wordWolfParts";

export const main = async (): Promise<line.FlexMessage> => {

  return {
    "type": "flex",
    "altText": "議論時間変更",
    "contents": await wordWolfParts.timerMessage()
  }

}