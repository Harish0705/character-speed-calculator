import express from 'express';
import { ValidationError } from './errors/validation-error';

export const setupJsonParser = () => {
  return express.json({
    verify: (req: any, res: any, buf: Buffer) => {
      try {
        JSON.parse(buf.toString());
      } catch (e: any) {
        if (e.message.includes('Unexpected token')) {
          const error = new Error('Invalid JSON format. Check for trailing commas or syntax errors.');
          (error as any).status = 400;
          throw error;
        }
        throw e;
      }
    }
  });
};

export const validateSpeedCalculationInput = (body: any) => {
  const { initialSpeed, inclines } = body;

  // Validate initial speed
  if (typeof initialSpeed !== 'number' || initialSpeed < 0) {
    throw new ValidationError('Initial speed must be a non-negative number');
  }

  // Validate inclines array
  if (!Array.isArray(inclines)) {
    throw new ValidationError('Inclines must be an array');
  }

  // Filter out null, undefined, empty values and validate
  const validInclines = inclines.filter((incline, index) => {
    if (incline === null || incline === undefined || incline === '') {
      return false; // Skip empty values from trailing commas
    }
    
    if (typeof incline !== 'number' || isNaN(incline)) {
      throw new ValidationError(`Invalid incline at position ${index}: '${incline}'. All inclines must be valid numbers.`);
    }
    
    if (Math.abs(incline) >= 90) {
      throw new ValidationError(`Invalid incline at position ${index}: ${incline}. Magnitude must be less than 90 degrees.`);
    }
    
    return true;
  });

  return { initialSpeed, inclines: validInclines };
};