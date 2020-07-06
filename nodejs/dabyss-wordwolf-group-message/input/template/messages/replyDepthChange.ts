import line = require('@line/bot-sdk');

import * as parts from "./constants/messageParts";
import * as wordWolfParts from "./constants/wordWolfParts";

export const main = async (): Promise<line.FlexMessage> => {
  return {
    "type": "flex",
    "altText": "ワードの難易度",
    "contents": wordWolfParts.depthOptions
  }

}