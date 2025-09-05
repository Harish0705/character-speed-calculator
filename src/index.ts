import express from 'express';
import dotenv from 'dotenv';
import { calculate_final_speed } from './speedCalculator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Character Speed Calculator API' });
});

app.post('/calculate-speed', (req, res) => {
  try {
    const result = calculate_final_speed(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});