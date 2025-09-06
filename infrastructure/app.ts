#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GamingApiStack } from './gaming-api-stack';

const app = new cdk.App();

new GamingApiStack(app, 'GamingApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-2'
  }
});

app.synth();