import { Router, Request, Response } from 'express';
import Card from '../models/card';
import {
  STATUS_OK,
  STATUS_CREATED,
  STATUS_NOT_FOUND,
  MESSAGE_CARD_NOT_FOUND,
  MESSAGE_INVALID_CARD_DATA,
} from '../constants/constants';

import { handleErrors } from '../controllers/users';

const router = Router();

const updateCard = async (cardId: string, update: object, res: Response) => {
  try {
    const card = await Card.findByIdAndUpdate(cardId, update, { new: true });
    if (!card) return res.status(STATUS_NOT_FOUND).send({ message: MESSAGE_CARD_NOT_FOUND });
    return res.status(STATUS_OK).send(card);
  } catch (err) {
    return handleErrors(err, res);
  }
};

// GET /cards
router.get('/', async (_req, res) => {
  try {
    const cards = await Card.find();
    return res.status(STATUS_OK).send(cards);
  } catch (err) {
    return handleErrors(err, res);
  }
});

// POST /cards
router.post('/', async (req: Request & { user?: { _id: string } }, res) => {
  const { name, link } = req.body;
  try {
    const card = await Card.create({ name, link, owner: req.user!._id });
    return res.status(STATUS_CREATED).send(card);
  } catch (err) {
    return handleErrors(err, res, MESSAGE_INVALID_CARD_DATA);
  }
});

// DELETE /cards/:cardId
router.delete('/:cardId', async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (!card) return res.status(STATUS_NOT_FOUND).send({ message: MESSAGE_CARD_NOT_FOUND });
    return res.status(STATUS_OK).send({ message: 'Карточка удалена' });
  } catch (err) {
    return handleErrors(err, res);
  }
});

// PUT /cards/:cardId/likes
router.put('/:cardId/likes', async (req: Request & { user?: { _id: string } }, res) => {
  return updateCard(req.params.cardId, { $addToSet: { likes: req.user!._id } }, res);
});

// DELETE /cards/:cardId/likes
router.delete('/:cardId/likes', async (req: Request & { user?: { _id: string } }, res) => {
  return updateCard(req.params.cardId, { $pull: { likes: req.user!._id } }, res);
});

export default router;
