import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/user';

import BadRequestError from '../errors/badRequestError';
import UnauthorizedError from '../errors/unauthrizedError';
import NotFoundError from '../errors/notFoundError';
import ConflictError from '../errors/conflictError';

const { JWT_SECRET = 'dev-secret' } = process.env;

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Некорректный ID пользователя');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.send(user);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name, about, avatar } = req.body;

  try {
    if (!email || !password) {
      throw new BadRequestError('Email и пароль обязательны');
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      ...(name && { name }),
      ...(about && { about }),
      ...(avatar && { avatar }),
    });

    const userData = user.toObject();
    delete userData.password;

    return res.status(201).send(userData);
  } catch (err: any) {
    if (err.code === 11000) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }

    if (err instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные'));
    }

    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Неправильная почта или пароль');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedError('Неправильная почта или пароль');
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.send({ token });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (
  req: Request & { user?: { _id: string } },
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.send(user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request & { user?: { _id: string } },
  res: Response,
  next: NextFunction,
) => {
  const { name, about } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError('Переданы некорректные данные профиля'));
    }
    return next(err);
  }
};

export const updateAvatar = async (
  req: Request & { user?: { _id: string } },
  res: Response,
  next: NextFunction,
) => {
  const { avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }

    return res.send(user);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError('Передан некорректный URL аватара'));
    }
    return next(err);
  }
};
