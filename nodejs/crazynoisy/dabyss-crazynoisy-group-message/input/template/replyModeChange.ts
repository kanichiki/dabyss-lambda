import line = require('@line/bot-sdk');
import dabyss = require('dabyss');
import crazynoisy = require('crazynoisy');

export const main = async (): Promise<line.Message[]> => {

  return [
    {
      "type": "flex",
      "altText": "モード",
      "contents": crazynoisy.modeOptions
    }

  ]

}