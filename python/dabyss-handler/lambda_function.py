from __future__ import print_function
import os
import boto3

client = boto3.client('stepfunctions')


def handler(event, context):
    client.start_execution(
        **{
            'input': '{"Comment": "Test"}',
            'stateMachineArn': os.environ['stateMachineArn']
        }
    )
