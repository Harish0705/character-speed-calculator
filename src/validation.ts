import express from "express";

export const setupJsonParser = () => {
  return express.json({
    verify: (req: any, res: any, buf: Buffer) => {
      try {
        JSON.parse(buf.toString());
      } catch (e: any) {
        if (e.message.includes("Unexpected token")) {
          const error = new Error(
            "Invalid JSON format. Check for trailing commas or syntax errors."
          );
          (error as any).status = 400;
          throw error;
        }
        throw e;
      }
    },
  });
};

export const validateSpeedCalculationInput = (body: any) => {
  // validated complex logic in the back-end, simple validation on API gateway

  const { initialSpeed, inclines } = body;

  const validInclines = inclines.filter((incline: number) => {
    if (incline === null || incline === undefined) {
      return false; // Skip null/undefined values
    }

    return true;
  });

  return { initialSpeed, inclines: validInclines };
};
