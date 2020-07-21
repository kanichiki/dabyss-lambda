"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws = require("aws-sdk");
exports.handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const obj = JSON.parse(event.body);
    console.log(obj);
    const promises = [];
    const lineEvents = obj.events;
    const stepFunctions = new aws.StepFunctions();
    for (const lineEvent of lineEvents) {
        const eventObject = {
            event: lineEvent
        };
        const input = {
            stateMachineArn: "arn:aws:states:ap-northeast-1:126640255293:stateMachine:dabyss-dev-state-machine",
            input: JSON.stringify(eventObject)
        };
        promises.push(stepFunctions.startExecution(input, (err, data) => {
        }).promise());
    }
    yield Promise.all(promises);
    return;
});
