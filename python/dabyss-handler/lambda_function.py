from __future__ import print_function
import os
import boto3
import json

client = boto3.client('stepfunctions')


def lambda_handler(event, context):
    body = json.loads(event["body"])
    events = body["events"]
    print(events)
    for lineEvent in events:
        client.start_execution(
            **{
                'input': '{"event":' + json.dumps(lineEvent) + '}',
                'stateMachineArn': os.environ['stateMachineArn']
            }
        )
