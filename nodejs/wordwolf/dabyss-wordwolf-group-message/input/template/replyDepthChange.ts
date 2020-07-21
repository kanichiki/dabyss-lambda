import line = require('@line/bot-sdk');

import * as parts from "../dabyss-module/constants/messageParts";
import * as wordWolfParts from "../wordwolf-module/constants/wordWolfParts";

export const main = async (): Promise<line.FlexMessage> => {
  return {
    "type": "flex",
    "altText": "ワードの難易度",
    "contents": await wordWolfParts.depthOptionsMessage()
  }

}