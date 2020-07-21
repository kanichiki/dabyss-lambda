import line = require('@line/bot-sdk');

import * as parts from "../dabyss-module/constants/messageParts";
import * as wordWolfParts from "../wordwolf-module/constants/wordWolfParts";

export const main = async (wolfNumber: number, lunaticNumberOptions: number[]): Promise<line.Message[]> => {

  return [
    {
      type: "text",
      text: `ウルフは${wolfNumber}人ですね！`
    },
    {
      "type": "flex",
      "altText": "狂人の人数候補",
      "contents": await wordWolfParts.lunaticNumberMessage(lunaticNumberOptions)
    }
  ]
}