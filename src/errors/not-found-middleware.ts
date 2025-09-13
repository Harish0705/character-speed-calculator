import { Request, Response } from 'express';
import { NotFoundError } from './not-found-error';

const notFound = (_req: Request, res: Response) => {
  throw new NotFoundError('Route not found');
};

export default notFound