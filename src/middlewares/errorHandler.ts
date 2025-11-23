import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

export default function errorHandler(
  err: CustomError,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const status = err.statusCode || 500;
  const message = err.message || 'На сервере произошла ошибка';
  res.status(status).send({ message });
  next();
}
