import line = require('@line/bot-sdk');

import * as parts from "./constants/messageParts";
import * as wordWolfParts from "./constants/wordWolfParts";

export const main = async (wolfNumberOptions: number[]): Promise<line.FlexMessage> => {

  return {
    "type": "flex",
    "altText": "ウルフの人数候補",
    "contents": await wordWolfParts.wolfNumberMessage(wolfNumberOptions)
  }
}

