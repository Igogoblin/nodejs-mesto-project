import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import {
  MESSAGE_INVALID_CARD_DATA,
  MESSAGE_CARD_NOT_FOUND,
  STATUS_NOT_FOUND,
  STATUS_CREATED,
} from '../constants/constants';
import { handleErrors } from './users';

interface AuthRequest extends Request {
  user?: { _id: string };
}

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

export const deleteCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { cardId } = req.params;

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }

    if (card.owner.toString() !== req.user?._id) {
      return res.status(403).send({ message: 'Нет прав на удаление этой карточки' });
    }

    await card.deleteOne();
    return res.send({ message: 'Карточка удалена' });
  } catch (err) {
    return next(err);
  }
};

export const likeCard = async (req: Request & { user?: { _id: string } }, res: Response) => {
  return updateCard(req.params.cardId, { $addToSet: { likes: req.user!._id } }, res);
};

export const dislikeCard = async (req: Request & { user?: { _id: string } }, res: Response) => {
  return updateCard(req.params.cardId, { $pull: { likes: req.user!._id } }, res);
};
