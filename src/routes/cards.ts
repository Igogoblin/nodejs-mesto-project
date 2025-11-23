import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getCards, createCard, deleteCard, likeCard, dislikeCard } from '../controllers/cards';
import auth from '../middlewares/auth';
import { createCardValidation, cardIdValidation } from '../middlewares/validators';

const router = Router();

router.use(auth);

router.get('/', getCards);
router.post('/', celebrate(createCardValidation), createCard);
router.delete('/:cardId', celebrate(cardIdValidation), deleteCard);
router.put('/:cardId/likes', celebrate(cardIdValidation), likeCard);
router.delete('/:cardId/likes', celebrate(cardIdValidation), dislikeCard);

export default router;
