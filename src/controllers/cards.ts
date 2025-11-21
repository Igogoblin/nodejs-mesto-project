import { Request, Response } from 'express';
import Card from '../models/card';
import {
  MESSAGE_INVALID_CARD_DATA,
  MESSAGE_CARD_NOT_FOUND,
  STATUS_NOT_FOUND,
  STATUS_CREATED,
} from '../constants/constants';
import { handleErrors } from './users';

const updateCard = async (cardId: string, update: object, res: Response) => {
  try {
    const card = await Card.findByIdAndUpdate(cardId, update, { new: true });
    if (!card) {
      return res.status(STATUS_NOT_FOUND).send({ message: MESSAGE_CARD_NOT_FOUND });
    }
    return res.send(card);
  } catch (err) {
    return handleErrors(err, res);
  }
};

export const getCards = async (_req: Request, res: Response) => {
  try {
    const cards = await Card.find();
    return res.send(cards);
  } catch (err) {
    return handleErrors(err, res);
  }
};

export const createCard = async (req: Request & { user?: { _id: string } }, res: Response) => {
  const { name, link } = req.body;
  try {
    const card = await Card.create({ name, link, owner: req.user!._id });
    return res.status(STATUS_CREATED).send(card);
  } catch (err) {
    return handleErrors(err, res, MESSAGE_INVALID_CARD_DATA);
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (!card) {
      return res.status(STATUS_NOT_FOUND).send({ message: MESSAGE_CARD_NOT_FOUND });
    }
    return res.send({ message: 'Карточка удалена' });
  } catch (err) {
    return handleErrors(err, res);
  }
};

export const likeCard = async (req: Request & { user?: { _id: string } }, res: Response) => {
  return updateCard(req.params.cardId, { $addToSet: { likes: req.user!._id } }, res);
};

export const dislikeCard = async (req: Request & { user?: { _id: string } }, res: Response) => {
  return updateCard(req.params.cardId, { $pull: { likes: req.user!._id } }, res);
};
