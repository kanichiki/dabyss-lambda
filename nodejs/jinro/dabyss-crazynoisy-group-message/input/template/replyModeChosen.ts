import line = require('@line/bot-sdk');
import dabyss = require('dabyss');
import crazynoisy = require('crazynoisy');

export const main = async (text: string): Promise<line.Message[]> => {

  return [
    {
      type: "text",
      text: `${text}モードが選択されました！`
    },
    {
      "type": "flex",
      "altText": "話し合い方法",
      "contents": crazynoisy.typeOptions
    }

  ]

}