import line = require('@line/bot-sdk');

import * as parts from "../dabyss-module/constants/messageParts";
import * as wordWolfParts from "../wordwolf-module/constants/wordWolfParts";

export const main = async (wolfNumberOptions: number[]): Promise<line.FlexMessage> => {

  return {
    "type": "flex",
    "altText": "ウルフの人数候補",
    "contents": await wordWolfParts.wolfNumberMessage(wolfNumberOptions)
  }
}

