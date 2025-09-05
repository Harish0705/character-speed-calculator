import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  InitiateAuthCommand, 
  AdminConfirmSignUpCommand 
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export class CognitoService {
  private userPoolId = process.env.COGNITO_USER_POOL_ID!;
  private clientId = process.env.COGNITO_CLIENT_ID!;

  constructor() {
    console.log('Cognito Config:', {
      userPoolId: this.userPoolId,
      clientId: this.clientId,
      region: process.env.AWS_REGION
    });
  }

  private generateSecretHash(email: string): string {
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    if (!clientSecret) return '';
    
    return crypto
      .createHmac('SHA256', clientSecret)
      .update(email + this.clientId)
      .digest('base64');
  }

  async register(userData: RegisterRequest) {
    const secretHash = this.generateSecretHash(userData.email);
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: userData.email,
      Password: userData.password,
      SecretHash: secretHash || undefined
    });

    return cognito.send(command);
  }

  async login(credentials: LoginRequest) {
    const secretHash = this.generateSecretHash(credentials.email);
    const authParams: any = {
      USERNAME: credentials.email,
      PASSWORD: credentials.password
    };
    
    if (secretHash) {
      authParams.SECRET_HASH = secretHash;
    }

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: authParams
    });

    return cognito.send(command);
  }

  async adminConfirmSignUp(email: string) {
    const command = new AdminConfirmSignUpCommand({
      UserPoolId: this.userPoolId,
      Username: email
    });

    return cognito.send(command);
  }
}