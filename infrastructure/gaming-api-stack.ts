import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class GamingApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        AWS_REGION: this.region,
        COGNITO_USER_POOL_ID: 'us-east-1_Eh2WlYG03',
        COGNITO_CLIENT_ID: '18p1ahbbohrqqnh4ohe9kum76e'
      }
    });

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

    // Create request validator
    const requestValidator = new apigateway.RequestValidator(this, 'RequestValidator', {
      restApi: api,
      validateRequestBody: true,
      validateRequestParameters: true
    });

    // Speed calculation model
    const speedCalculationModel = new apigateway.Model(this, 'SpeedCalculationModel', {
      restApi: api,
      contentType: 'application/json',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          initialSpeed: {
            type: apigateway.JsonSchemaType.NUMBER,
            minimum: 0,
            maximum: 1000
          },
          inclines: {
            type: apigateway.JsonSchemaType.ARRAY,
            items: {
              type: apigateway.JsonSchemaType.NUMBER,
              minimum: -89,
              maximum: 89
            },
            minItems: 1,
            maxItems: 100
          }
        },
        required: ['initialSpeed', 'inclines']
      }
    });

    // User registration model
    const userRegistrationModel = new apigateway.Model(this, 'UserRegistrationModel', {
      restApi: api,
      contentType: 'application/json',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          email: {
            type: apigateway.JsonSchemaType.STRING,
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
          },
          password: {
            type: apigateway.JsonSchemaType.STRING,
            minLength: 8,
            maxLength: 50
          }
        },
        required: ['email', 'password']
      }
    });

    // User login model
    const userLoginModel = new apigateway.Model(this, 'UserLoginModel', {
      restApi: api,
      contentType: 'application/json',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          email: {
            type: apigateway.JsonSchemaType.STRING,
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
          },
          password: {
            type: apigateway.JsonSchemaType.STRING,
            minLength: 1
          }
        },
        required: ['email', 'password']
      }
    });

    // Create Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(gamingApiLambda);

    // Add specific resources with validation
    const authResource = api.root.addResource('auth');
    const registerResource = authResource.addResource('register');
    const loginResource = authResource.addResource('login');
    const calculateResource = api.root.addResource('calculate-speed');

    // Add methods with validation
    registerResource.addMethod('POST', lambdaIntegration, {
      requestModels: {
        'application/json': userRegistrationModel
      },
      requestValidator: requestValidator
    });

    loginResource.addMethod('POST', lambdaIntegration, {
      requestModels: {
        'application/json': userLoginModel
      },
      requestValidator: requestValidator
    });

    calculateResource.addMethod('POST', lambdaIntegration, {
      requestModels: {
        'application/json': speedCalculationModel
      },
      requestValidator: requestValidator,
      requestParameters: {
        'method.request.header.Authorization': true
      }
    });


    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Gaming API URL'
    });
  }
}