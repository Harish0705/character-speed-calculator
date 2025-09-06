#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GamingApiStack } from './gaming-api-stack';

const app = new cdk.App();

// Get Cognito values from CDK context or environment variables
const cognitoUserPoolId = app.node.tryGetContext('cognitoUserPoolId') || process.env.COGNITO_USER_POOL_ID;
const cognitoClientId = app.node.tryGetContext('cognitoClientId') || process.env.COGNITO_CLIENT_ID;

if (!cognitoUserPoolId || !cognitoClientId) {
  throw new Error('Cognito User Pool ID and Client ID must be provided via CDK context or environment variables');
}

new GamingApiStack(app, 'GamingApiStack', {
  cognitoUserPoolId,
  cognitoClientId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-2'
  }
});

app.synth();