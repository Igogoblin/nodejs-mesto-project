/* eslint-disable no-console */
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
// import path from 'path';
import userRoutes from './routes/users';
import cardRoutes from './routes/cards';
import User from './models/user';

interface TempRequest extends Request {
  user?: {
    _id: string;
  };
}

const app = express();
app.use(express.json());

const TEMP_USER_ID = '5d8b8592978f8bd833ca8133';

mongoose
  .connect('mongodb://localhost:27017/mestodb')
  .then(async () => {
    console.log('MongoDB connected');

    // Создаём временного пользователя, если его нет
    const existingUser = await User.findById(TEMP_USER_ID);
    if (!existingUser) {
      await User.create({
        _id: TEMP_USER_ID,
        name: 'Тестовый пользователь',
        about: 'Временный',
        avatar: 'https://example.com/avatar.png',
      });
      console.log('Temporary user created');
    } else {
      console.log('Temporary user already exists');
    }
  })
  .catch((err) => console.error('Mongo error:', err));

// Временная авторизация для всех запросов
app.use((req: TempRequest, _res: Response, next: NextFunction) => {
  req.user = { _id: TEMP_USER_ID };
  console.log(req.method, req.path, req.body);
  next();
});

app.use('/users', userRoutes);
app.use('/cards', cardRoutes);

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'На сервере произошла ошибка';

  if (err && typeof err === 'object' && 'statusCode' in err) {
    statusCode = (err as { statusCode?: number }).statusCode || 500;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    message = (err as { message?: string }).message || message;
  }
  res.status(statusCode).send({ message });
  next();
});

app.listen(3000, () => console.log('Server running on port 3000'));
