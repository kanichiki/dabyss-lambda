import line = require('@line/bot-sdk');

import * as parts from "../dabyss-module/constants/messageParts";
import * as wordWolfParts from "../wordwolf-module/constants/wordWolfParts";

export const main = async (displayNames: string[], wolfIndexes: number[], lunaticIndexes: number[], citizenWord: string, wolfWord: string, winner: string): Promise<line.Message[]> => {
  let resultMessage: string = "それぞれの単語は以下の通りです\n\n";

  let result: string[] = [];
  for (let i = 0; i < displayNames.length; i++) {
    let word: string = ""
    if (wolfIndexes.indexOf(i) == -1) {
      if (lunaticIndexes.indexOf(i) == -1) {
        word = "・" + displayNames[i] + " : " + citizenWord;
      } else {
        word = "・" + displayNames[i] + " : " + citizenWord + " ←狂人";
      }
    } else {
      if (lunaticIndexes.indexOf(i) == -1) {
        word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ";
      } else {
        word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ&狂人";
      }
    }
    result.push(word);
  }

  const resultEnter: string = result.join("\n");
  resultMessage = resultMessage + resultEnter;

  let shareMessage: string = encodeURI("Dabyssでワードウルフをプレイしました！") + "%0a%0a" + encodeURI("市民側ワード：") + encodeURI(citizenWord) + "%0a" + encodeURI("ウルフ側ワード：") + encodeURI(wolfWord) + "%0a%0a"
  if (winner == "citizen") {
    shareMessage += encodeURI("市民側の勝利！！") + "%0a%0a"
  } else {
    shareMessage += encodeURI("ウルフ側の勝利！！") + "%0a%0a"
  }

  const shareUrl: string = `https://note.com/m_dabyss/n/n2d85008f4ce0`;
  const shareUri: string = "https://twitter.com/share?text=" + shareMessage + "&hashtags=dabyss&url=" + shareUrl + "&related=m_dabyss";
  const formUri: string = "https://forms.gle/kGHqE924ACYQmTKj7";

  return [
    {
      type: "text",
      text: resultMessage
    },
    {
      "type": "flex",
      "altText": "ゲーム終了",
      "contents": {
        "type": "bubble",
        "size": "mega",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "サービス向上のためフィードバックにご協力ください！",
              "wrap": true
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "uri",
                "label": "フィードバックを書く",
                "uri": formUri,
                "altUri": {
                  "desktop": formUri
                }
              },
              "color": parts.mainColor,
              "style": "primary"
            },
            {
              "type": "button",
              "action": {
                "type": "uri",
                "label": "Twitterでシェア",
                "uri": shareUri,
                "altUri": {
                  "desktop": shareUri
                }
              },
              "color": "#00acee"
            },
            {
              "type": "button",
              "action": {
                "type": "message",
                "label": "ゲーム一覧",
                "text": "ゲーム一覧"
              },
              "color": parts.mainColor,
            }
          ]
        }
      }
    }
  ]
}