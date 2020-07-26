import line = require('@line/bot-sdk');
import dabyss = require('dabyss');
import jinro_module = require('jinro');

export const main = async (): Promise<line.FlexMessage> => {

  return {
    "type": "flex",
    "altText": "議論時間変更",
    "contents": await jinro_module.timerMessage()
  }

}