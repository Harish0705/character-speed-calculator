import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { calculate_final_speed } from './speedCalculator';
import authRoutes from './auth/authRoutes';
import { authenticateToken } from './auth/middleware';
import { specs } from './swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
  try {
    const result = calculate_final_speed(req.body);
    res.json(result);
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});