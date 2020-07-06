import line = require('@line/bot-sdk');

import * as parts from "./constants/messageParts";
import * as wordWolfParts from "./constants/wordWolfParts";

export const main = async (text: string, wolfNumberOptions: number[]): Promise<line.Message[]> => {

  return [
    {
      type: "text",
      text: `難易度${text}が選ばれました！`
    },
    {
      "type": "flex",
      "altText": "ウルフの人数候補",
      "contents": await wordWolfParts.wolfNumberMessage(wolfNumberOptions)
    }
  ]
}

