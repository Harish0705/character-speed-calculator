import express from "express";
import serverless from "serverless-http";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { calculate_final_speed } from "./speedCalculator";
import authRoutes from "./auth/authRoutes";
import { authenticateToken } from "./auth/middleware";
import { specs } from "./swagger";
import { validateSpeedCalculationInput } from "./validation";
import notFound from "./errors/not-found-middleware";
import errorHandler from "./errors/error-handler-middleware";

// Load only the secret from AWS (IDs come from environment variables)
const loadParameters = async () => {
  // User Pool ID, Client ID, and Region are set as environment variables in CDK
  // Only load the client secret from Secrets Manager (sensitive)

  try {
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION,
    });
    const secretCommand = new GetSecretValueCommand({
      SecretId: "gaming-api/cognito-client-secret",
    });
    const secretResponse = await secretsClient.send(secretCommand);
    if (secretResponse.SecretString) {
      process.env.COGNITO_CLIENT_SECRET = secretResponse.SecretString;
    }
  } catch (error) {
    console.log("No client secret found, proceeding without it");
  }
};

let appInstance: express.Application;

const createApp = async () => {
  if (!appInstance) {
    await loadParameters();

    appInstance = express();

    appInstance.use(express.json());

    appInstance.get("/", (req, res) => {
      res.json({
        message: "Character Speed Calculator API",
        documentation: "/api-docs",
      });
    });

    // Swagger UI
    appInstance.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Gaming API Documentation",
      })
    );

    // Auth routes (validation handled by API Gateway)
    appInstance.use("/auth", authRoutes);

    // Calculate speed route (validation handled by API Gateway)
    appInstance.post("/calculate-speed", authenticateToken, (req, res) => {
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
