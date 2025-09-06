import serverless from 'serverless-http';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { calculate_final_speed } from './speedCalculator';
import authRoutes from './auth/authRoutes';
import { authenticateToken } from './auth/middleware';
import { specs } from './swagger';

// Load parameters from AWS Systems Manager and Secrets Manager
const loadParameters = async () => {
  const region = process.env.AWS_REGION || 'us-east-1';
  const ssmClient = new SSMClient({ region });
  const secretsClient = new SecretsManagerClient({ region });
  
  // Load SSM parameters
  const ssmCommand = new GetParametersCommand({
    Names: [
      '/gaming-api/COGNITO_USER_POOL_ID',
      '/gaming-api/COGNITO_CLIENT_ID',
      '/gaming-api/AWS_REGION'
    ],
    WithDecryption: true
  });
  
  const ssmResponse = await ssmClient.send(ssmCommand);
  
  ssmResponse.Parameters?.forEach(param => {
    const key = param.Name?.split('/').pop();
    if (key && param.Value) {
      process.env[key] = param.Value;
    }
  });
  
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
    appInstance.use(express.json());
    
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
      try {
        const result = calculate_final_speed(req.body);
        res.json(result);
      } catch (error:any) {
        res.status(400).json({ error: error.message });
      }
    });
  }
  return appInstance;
};

export const handler = async (event: any, context: any) => {
  const app = await createApp();
  return serverless(app)(event, context);
};