import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  /** Base URL for boj-static-data-service (MAT table / currency symbols). */
  STATIC_DATA_BASE_URL: Joi.string().uri().optional(),
  AWS_REGION: Joi.string().required(),
  SECRET_NAME: Joi.string().required(),
  SECRET_REFRESH_INTERVAL: Joi.number().default(4 * 60 * 60 * 1000), // time in milliseconds
  CORS_ORIGINS: Joi.string().required(),
});
