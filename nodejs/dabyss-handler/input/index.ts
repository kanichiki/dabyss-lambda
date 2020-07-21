import line = require('@line/bot-sdk');
import aws = require('aws-sdk');
import dabyss = require('dabyss');
import { StartExecutionInput } from 'aws-sdk/clients/stepfunctions';
import { PromiseResult } from 'aws-sdk/lib/request';

exports.handler = async (event: any, context: any): Promise<void> => {
    const obj = JSON.parse(event.body);
    const promises: Promise<PromiseResult<aws.StepFunctions.StartExecutionOutput, aws.AWSError>>[] = [];
    const lineEvents: line.WebhookEvent[] = obj.events;
    const stepFunctions: aws.StepFunctions = new aws.StepFunctions();
    for (const lineEvent of lineEvents) {
        const eventObject: { [key: string]: line.WebhookEvent } = {
            event: lineEvent
        }
        const input: StartExecutionInput = {
            stateMachineArn: "arn:aws:states:ap-northeast-1:126640255293:stateMachine:dabyss-dev-state-machine",
            input: JSON.stringify(eventObject)
        }
        promises.push(stepFunctions.startExecution(input, (err, data) => {

        }).promise());
    }
    await Promise.all(promises);
    return;
}
