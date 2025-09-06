import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GamingApiStackProps extends cdk.StackProps {
  cognitoUserPoolId: string;
  cognitoClientId: string;
}

export class GamingApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GamingApiStackProps) {
    super(scope, id, props);

    // Create secret for Cognito client secret
    const cognitoSecret = new secretsmanager.Secret(this, 'CognitoClientSecret', {
      secretName: 'gaming-api/cognito-client-secret',
      description: 'Cognito client secret for gaming API'
    });

    // Create Lambda function
    const gamingApiLambda = new lambda.Function(this, 'GamingApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset('dist'),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      environment: {
        NODE_ENV: 'production',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      }
    });

    // Add permissions for Systems Manager Parameter Store
    gamingApiLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ssm:GetParameter',
        'ssm:GetParameters',
        'ssm:GetParametersByPath'
      ],
      resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/gaming-api/*`]
    }));

    // Add permissions for Secrets Manager
    gamingApiLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: [cognitoSecret.secretArn]
    }));

    // Add permissions for Cognito
    gamingApiLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cognito-idp:AdminConfirmSignUp',
        'cognito-idp:InitiateAuth',
        'cognito-idp:SignUp',
        'cognito-idp:AdminGetUser',
        'cognito-idp:AdminSetUserPassword'
      ],
      resources: [`arn:aws:cognito-idp:${this.region}:${this.account}:userpool/*`]
    }));

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'GamingApi', {
      restApiName: 'Gaming Character Speed Calculator',
      description: 'API for calculating gaming character speed',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // Create Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(gamingApiLambda);

    // Add proxy resource to handle all routes
    api.root.addProxy({
      defaultIntegration: lambdaIntegration,
      anyMethod: true
    });

    // Store parameters in Systems Manager
    new ssm.StringParameter(this, 'CognitoUserPoolId', {
      parameterName: '/gaming-api/COGNITO_USER_POOL_ID',
      stringValue: props.cognitoUserPoolId
    });

    new ssm.StringParameter(this, 'CognitoClientId', {
      parameterName: '/gaming-api/COGNITO_CLIENT_ID',
      stringValue: props.cognitoClientId
    });

    new ssm.StringParameter(this, 'AwsRegion', {
      parameterName: '/gaming-api/AWS_REGION',
      stringValue: this.region
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Gaming API URL'
    });
  }
}