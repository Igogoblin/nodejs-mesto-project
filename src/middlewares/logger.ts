/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const requestsLogPath = path.join(logsDir, 'request.log');
const errorsLogPath = path.join(logsDir, 'error.log');

interface LogEntry {
  time: string;
  method: string;
  url: string;
  status?: number;
  body?: any;
  error?: string;
}

// Middleware для логирования всех запросов
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const log: LogEntry = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  };

  try {
    fs.appendFileSync(requestsLogPath, `${JSON.stringify(log)}\n`);
  } catch (err) {
    console.error('Не удалось записать запрос в лог:', err);
  }

  next();
};

// Middleware для логирования ошибок
export const errorLogger = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  const log: LogEntry = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    status: res.statusCode,
    error: err instanceof Error ? err.message : String(err),
  };

  try {
    fs.appendFileSync(errorsLogPath, `${JSON.stringify(log)}\n`);
  } catch (error) {
    console.error('Не удалось записать ошибку в лог:', error);
  }

  next(err);
};
