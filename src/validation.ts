import express from 'express';

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

export const setupJsonErrorHandler = () => {
  return (error: any, req: any, res: any, next: any) => {
    if (error.status === 400 && error.message.includes('JSON')) {
      return res.status(400).json({ 
        error: 'Invalid JSON format. Please check for trailing commas or syntax errors.' 
      });
    }
    next(error);
  };
};

export const validateSpeedCalculationInput = (body: any) => {
  const { initialSpeed, inclines } = body;

  // Validate initial speed
  if (typeof initialSpeed !== 'number' || initialSpeed < 0) {
    throw new Error('Initial speed must be a non-negative number');
  }

  // Validate inclines array
  if (!Array.isArray(inclines)) {
    throw new Error('Inclines must be an array');
  }

  // Filter out null, undefined, empty values and validate
  const validInclines = inclines.filter((incline, index) => {
    if (incline === null || incline === undefined || incline === '') {
      return false; // Skip empty values from trailing commas
    }
    
    if (typeof incline !== 'number' || isNaN(incline)) {
      throw new Error(`Invalid incline at position ${index}: '${incline}'. All inclines must be valid numbers.`);
    }
    
    if (Math.abs(incline) >= 90) {
      throw new Error(`Invalid incline at position ${index}: ${incline}. Magnitude must be less than 90 degrees.`);
    }
    
    return true;
  });

  return { initialSpeed, inclines: validInclines };
};