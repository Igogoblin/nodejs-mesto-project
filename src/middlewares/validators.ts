import { Joi, Segments } from 'celebrate';

// Валидация регистрации пользователя
export const signupValidation = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(200),
    avatar: Joi.string().pattern(/^(https?:\/\/)(www\.)?[\w\d\-._~:/?#@!$&'()*+,;=]+#?$/),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

// Валидация входа пользователя
export const signinValidation = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

// Валидация обновления профиля
export const updateProfileValidation = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(200).required(),
  }),
};

// Валидация обновления аватара
export const updateAvatarValidation = {
  [Segments.BODY]: Joi.object().keys({
    avatar: Joi.string()
      .pattern(/^(https?:\/\/)(www\.)?[\w\d\-._~:/?#@!$&'()*+,;=]+#?$/)
      .required(),
  }),
};

// Валидация создания карточки
export const createCardValidation = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string()
      .pattern(/^(https?:\/\/)(www\.)?[\w\d\-._~:/?#@!$&'()*+,;=]+#?$/)
      .required(),
  }),
};

// Валидация параметра cardId в роуте
export const cardIdValidation = {
  [Segments.PARAMS]: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
};
