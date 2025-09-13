import express from 'express';
import dotenv from 'dotenv';
import 'express-async-errors';
import swaggerUi from 'swagger-ui-express';
import { calculate_final_speed } from './speedCalculator';
import authRoutes from './auth/authRoutes';
import { authenticateToken } from './auth/middleware';
import { specs } from './swagger';
import { validateSpeedCalculationInput, setupJsonParser } from './validation';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup JSON parsing with error handling
app.use(setupJsonParser());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Character Speed Calculator API',
    documentation: '/api-docs'
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gaming API Documentation'
}));

// Authentication routes
app.use('/auth', authRoutes);

// Protected speed calculation route
app.post('/calculate-speed', authenticateToken, (req, res) => {
  const validatedInput = validateSpeedCalculationInput(req.body);
  const result = calculate_final_speed(validatedInput);
  res.json(result);
});

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
  res.status(400).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});