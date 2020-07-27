import line = require('@line/bot-sdk');
import dabyss = require('dabyss');
import jinro_module = require('jinro');

export const main = async (userNumber: number, mode: string, type: number, timer: string, zeroWerewolf: boolean, zeroForecaster: boolean): Promise<line.Message[]> => {
  return [
    {
      "type": "flex",
      "altText": "設定確認",
      "contents": await jinro_module.settingConfirmMessage(userNumber, mode, type, timer, zeroWerewolf, zeroForecaster)
    }
  ]
}