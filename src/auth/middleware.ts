import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UnauthenticatedError } from '../errors/unauthenticated-error';

let verifier: any;

const getVerifier = () => {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      tokenUse: 'access',
      clientId: process.env.COGNITO_CLIENT_ID!
    });
  }
  return verifier;
};

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthenticatedError('Access token required');
  }

  if (!process.env.COGNITO_USER_POOL_ID || !process.env.COGNITO_CLIENT_ID) {
    return res.status(500).json({ error: 'Cognito configuration missing' });
  }

  try {
    const jwtVerifier = getVerifier();
    const payload = await jwtVerifier.verify(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Invalid or expired token');
  }
};