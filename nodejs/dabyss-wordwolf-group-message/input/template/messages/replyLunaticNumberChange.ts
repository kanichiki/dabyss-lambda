import line = require('@line/bot-sdk');

import * as parts from "./constants/messageParts";
import * as wordWolfParts from "./constants/wordWolfParts";

export const main = async (lunaticNumberOptions: number[]): Promise<line.FlexMessage> => {

  return {
    "type": "flex",
    "altText": "狂人の人数候補",
    "contents": await wordWolfParts.lunaticNumberMessage(lunaticNumberOptions)
  }
}