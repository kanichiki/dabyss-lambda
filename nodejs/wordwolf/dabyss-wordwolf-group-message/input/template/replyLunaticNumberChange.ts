import line = require('@line/bot-sdk');

import * as parts from "../dabyss-module/constants/messageParts";
import * as wordWolfParts from "../wordwolf-module/constants/wordWolfParts";

export const main = async (lunaticNumberOptions: number[]): Promise<line.FlexMessage> => {

  return {
    "type": "flex",
    "altText": "狂人の人数候補",
    "contents": await wordWolfParts.lunaticNumberMessage(lunaticNumberOptions)
  }
}