export const JWT_SECRET_NAME_IN_SECRETS_MANAGER = 'SESSION_JWT_SECRET';

export const JWT_DEV_FALLBACK_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET || 'dev-session-jwt-secret';

