import { Router } from 'express';
import { CognitoService } from './cognitoService';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const cognitoService = new CognitoService();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await cognitoService.register({ email, password });
    
    // Auto-confirm the user after registration
    await cognitoService.adminConfirmSignUp(email);
    
    res.json({ 
      message: 'Registration successful. You can now login.',
      userSub: result.UserSub 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await cognitoService.login({ email, password });
    res.json({
      message: 'Login successful',
      accessToken: result.AuthenticationResult?.AccessToken,
      refreshToken: result.AuthenticationResult?.RefreshToken,
      idToken: result.AuthenticationResult?.IdToken
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});



export default router;