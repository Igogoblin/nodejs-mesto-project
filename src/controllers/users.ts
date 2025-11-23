import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import {
  STATUS_NOT_FOUND,
  STATUS_BAD_REQUEST,
  STATUS_SERVER_ERROR,
  STATUS_CREATED,
  // STATUS_OK,
  MESSAGE_USER_NOT_FOUND,
  STATUS_UNAUTHORIZED,
  MESSAGE_SERVER_ERROR,
  MESSAGE_INVALID_ID,
  MESSAGE_INVALID_USER_DATA,
  MESSAGE_INVALID_AVATAR,
  MESSAGE_INVALID_CREDENTIALS,
} from '../constants/constants';

const { JWT_SECRET = 'your_secret_key' } = process.env;

export const handleErrors = (err: unknown, res: Response, validationMessage?: string) => {
  if (err instanceof mongoose.Error.CastError) {
    return res.status(STATUS_BAD_REQUEST).send({ message: MESSAGE_INVALID_ID });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res
      .status(STATUS_BAD_REQUEST)
      .send({ message: validationMessage || MESSAGE_INVALID_USER_DATA });
  }
  return res.status(STATUS_SERVER_ERROR).send({ message: MESSAGE_SERVER_ERROR });
};

const updateUser = async (
  id: string,
  update: Partial<{ name: string; about: string; avatar: string }>,
  res: Response,
  validationMessage?: string,
) => {
  try {
    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!user) {
      return res.status(STATUS_NOT_FOUND).send({ message: MESSAGE_USER_NOT_FOUND });
    }
    return res.send(user);
  } catch (err) {
    return handleErrors(err, res, validationMessage);
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.send(users);
  } catch (err) {
    return handleErrors(err, res);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(STATUS_NOT_FOUND).send({ message: MESSAGE_USER_NOT_FOUND });
    }
    return res.send(user);
  } catch (err) {
    return handleErrors(err, res);
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, about, avatar } = req.body;
  try {
    const user = await User.create({ name, about, avatar });
    return res.status(STATUS_CREATED).send(user);
  } catch (err) {
    return handleErrors(err, res, MESSAGE_INVALID_USER_DATA);
  }
};

export const updateProfile = async (req: Request & { user?: { _id: string } }, res: Response) => {
  return updateUser(
    req.user!._id,
    { name: req.body.name, about: req.body.about },
    res,
    MESSAGE_INVALID_USER_DATA,
  );
};

export const updateAvatar = async (req: Request & { user?: { _id: string } }, res: Response) => {
  return updateUser(req.user!._id, { avatar: req.body.avatar }, res, MESSAGE_INVALID_AVATAR);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password'); // включаем password
    if (!user) {
      return res.status(STATUS_UNAUTHORIZED).send({ message: MESSAGE_INVALID_CREDENTIALS });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(STATUS_UNAUTHORIZED).send({ message: MESSAGE_INVALID_CREDENTIALS });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d',
    });

    return res.send({ token });
  } catch (err) {
    return res.status(500).send({ message: 'Ошибка сервера' });
  }
};

export const getCurrentUser = async (req: Request & { user?: { _id: string } }, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).send({ message: 'Пользователь не найден' });
    }

    return res.send(user);
  } catch (err) {
    return handleErrors(err, res);
  }
};
