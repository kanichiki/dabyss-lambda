import line = require('@line/bot-sdk');
import dabyss = require('dabyss');
import jinro_module = require('jinro');

export const main = async (): Promise<line.Message[]> => {

  return [
    {
      "type": "flex",
      "altText": "話し合い方法",
      "contents": jinro_module.typeOptions
    }

  ]

}