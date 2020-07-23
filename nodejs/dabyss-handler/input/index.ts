import line = require('@line/bot-sdk');
import aws = require('aws-sdk');
import dabyss = require('dabyss');
import { StartExecutionInput } from 'aws-sdk/clients/stepfunctions';

exports.handler = async (event: any, context: any): Promise<void> => {
    const obj = JSON.parse(event.body);
    const lineEvents: (line.MessageEvent | line.PostbackEvent)[] = obj.events;
    console.log(lineEvents);
    const stepFunctions = new aws.StepFunctions();
    for (const lineEvent of lineEvents) {
        if (lineEvent.replyToken != undefined) {
            const eventObject: { [key: string]: line.WebhookEvent } = {
                event: lineEvent
            }
            const input: StartExecutionInput = {
                stateMachineArn: "arn:aws:states:ap-northeast-1:126640255293:stateMachine:dabyss-dev-state-machine",
                input: JSON.stringify(eventObject)
            }
            await stepFunctions.startExecution(input, (err, data) => {

            }).promise();
        }
    }
    return;
}
