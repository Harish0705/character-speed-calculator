import { Request, Response } from "express";
import { CognitoService } from "./cognitoService";

const cognitoService = new CognitoService();

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const result = await cognitoService.register({ email, password });

  // Auto-confirm the user after registration
  try {
    await cognitoService.adminConfirmSignUp(email);
    console.log(`User ${email} confirmed successfully`);
  } catch (confirmError: any) {
    console.error(`Failed to confirm user ${email}:`, confirmError);
    // Continue anyway - user can still login if confirmation fails
  }

  res.json({
    message: "Registration successful. You can now login.",
    userSub: result.UserSub,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const result = await cognitoService.login({ email, password });
  res.json({
    message: "Login successful",
    accessToken: result.AuthenticationResult?.AccessToken,
    refreshToken: result.AuthenticationResult?.RefreshToken,
    idToken: result.AuthenticationResult?.IdToken,
  });
};
