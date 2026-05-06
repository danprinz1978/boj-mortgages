import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  AWS_REGION: Joi.string().required(),
  SECRET_NAME: Joi.string().required(),
  SECRET_REFRESH_INTERVAL: Joi.number().default(4 * 60 * 60 * 1000), // time in milliseconds
  CORS_ORIGINS: Joi.string().required(),
});
