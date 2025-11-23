import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const { JWT_SECRET = 'fallback_secret' } = process.env;

interface AuthRequest extends Request {
  user?: { _id: string };
}

export default function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { _id: string };
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).send({ message: 'Неверный токен' });
  }
}
