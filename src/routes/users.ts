import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import auth from '../middlewares/auth';
import {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getCurrentUser,
} from '../controllers/users';
import {
  updateProfileValidation,
  updateAvatarValidation,
  // cardIdValidation,
} from '../middlewares/validators';

const router = Router();

router.use(auth); // Все маршруты пользователей защищены, кроме регистрации/логина

router.get('/me', getCurrentUser);

router.get('/', getUsers);
router.get(
  '/:userId',
  celebrate({
    [Segments.PARAMS]: Joi.object({ userId: Joi.string().hex().length(24).required() }),
  }),
  getUserById,
);

router.patch('/me', celebrate(updateProfileValidation), updateProfile);
router.patch('/me/avatar', celebrate(updateAvatarValidation), updateAvatar);

export default router;
