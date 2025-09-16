import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

interface DefaultError  {
  statusCode: number;
  message: string;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Enhanced logging with request context
  console.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  const defaultError: DefaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong. Try again later."
  };

  res.status(defaultError.statusCode).json({ error: defaultError.message });
};

export default errorHandler;