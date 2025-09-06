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
  region: process.env.AWS_REGION || 'us-east-1'
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
  private userPoolId?: string;
  private clientId?: string;

  private getConfig() {
    if (!this.userPoolId || !this.clientId) {
      this.userPoolId = process.env.COGNITO_USER_POOL_ID;
      this.clientId = process.env.COGNITO_CLIENT_ID;
      
      console.log('Cognito Config:', {
        userPoolId: this.userPoolId,
        clientId: this.clientId,
        region: process.env.AWS_REGION
      });
    }
    
    return {
      userPoolId: this.userPoolId!,
      clientId: this.clientId!
    };
  }

  private generateSecretHash(email: string): string {
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    if (!clientSecret) return '';
    
    const config = this.getConfig();
    return crypto
      .createHmac('SHA256', clientSecret)
      .update(email + config.clientId)
      .digest('base64');
  }

  async register(userData: RegisterRequest) {
    const config = this.getConfig();
    const secretHash = this.generateSecretHash(userData.email);
    const command = new SignUpCommand({
      ClientId: config.clientId,
      Username: userData.email,
      Password: userData.password,
      SecretHash: secretHash || undefined
    });

    return cognito.send(command);
  }

  async login(credentials: LoginRequest) {
    const config = this.getConfig();
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
      ClientId: config.clientId,
      AuthParameters: authParams
    });

    return cognito.send(command);
  }

  async adminConfirmSignUp(email: string) {
    const config = this.getConfig();
    const command = new AdminConfirmSignUpCommand({
      UserPoolId: config.userPoolId,
      Username: email
    });

    return cognito.send(command);
  }
}