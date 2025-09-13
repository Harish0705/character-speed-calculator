import express from 'express';
import serverless from 'serverless-http';
import 'express-async-errors';
import swaggerUi from 'swagger-ui-express';
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { calculate_final_speed } from './speedCalculator';
import authRoutes from './auth/authRoutes';
import { authenticateToken } from './auth/middleware';
import { specs } from './swagger';
import { validateSpeedCalculationInput, setupJsonParser } from './validation';
import notFound from './errors/not-found-middleware';
import errorHandler from './errors/error-handler-middleware';


// Load parameters from AWS Systems Manager and Secrets Manager
const loadParameters = async () => {
  const region = process.env.AWS_REGION || 'us-east-1';
  const ssmClient = new SSMClient({ region });
  const secretsClient = new SecretsManagerClient({ region });
  
  // Load SSM parameters
  const ssmCommand = new GetParametersCommand({
    Names: [
      '/cdk/cognito-user-pool-id',
      '/cdk/cognito-client-id'
    ],
    WithDecryption: true
  });
  
  const ssmResponse = await ssmClient.send(ssmCommand);
  
  ssmResponse.Parameters?.forEach(param => {
    if (param.Name === '/cdk/cognito-user-pool-id') {
      process.env.COGNITO_USER_POOL_ID = param.Value;
    } else if (param.Name === '/cdk/cognito-client-id') {
      process.env.COGNITO_CLIENT_ID = param.Value;
    }
  });
  
  // Set region from environment
  process.env.AWS_REGION = region;
  
  // Load client secret from Secrets Manager
  try {
    const secretCommand = new GetSecretValueCommand({
      SecretId: 'gaming-api/cognito-client-secret'
    });
    const secretResponse = await secretsClient.send(secretCommand);
    if (secretResponse.SecretString) {
      process.env.COGNITO_CLIENT_SECRET = secretResponse.SecretString;
    }
  } catch (error) {
    console.log('No client secret found, proceeding without it');
  }
};

let appInstance: express.Application;

const createApp = async () => {
  if (!appInstance) {
    await loadParameters();
    
    appInstance = express();
    // Setup JSON parsing with error handling
    appInstance.use(setupJsonParser());
    
    appInstance.get('/', (req, res) => {
      res.json({ 
        message: 'Character Speed Calculator API',
        documentation: '/api-docs'
      });
    });

    // Swagger UI
    appInstance.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Gaming API Documentation'
    }));
    
    appInstance.use('/auth', authRoutes);
    
    appInstance.post('/calculate-speed', authenticateToken, (req, res) => {
      const validatedInput = validateSpeedCalculationInput(req.body);
      const result = calculate_final_speed(validatedInput);
      res.json(result);
    });

    // 404 handler for unmatched routes
    appInstance.use(notFound);
    
    // Global error handler
    appInstance.use(errorHandler);
  }
  return appInstance;
};

export const handler = async (event: any, context: any) => {
  const app = await createApp();
  return serverless(app)(event, context);
};