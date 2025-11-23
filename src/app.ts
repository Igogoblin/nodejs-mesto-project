/* eslint-disable no-console */
import express from 'express';
import mongoose from 'mongoose';
import { celebrate } from 'celebrate';
import { signupValidation, signinValidation } from './middlewares/validators';
import errorHandler from './middlewares/errorHandler';
import { requestLogger, errorLogger } from './middlewares/logger';
import userRoutes from './routes/users';
import cardRoutes from './routes/cards';
import { createUser, login } from './controllers/users';
import auth from './middlewares/auth';

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/mestodb';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

mongoose
  .connect(DB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo error:', err));

app.use(requestLogger);

// Регистрация и логин
app.post('/signup', celebrate(signupValidation), createUser);
app.post('/signin', celebrate(signinValidation), login);

app.use(auth);

app.use('/users', userRoutes);
app.use('/cards', cardRoutes);

app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
