export interface AuthAccessTokenPayload {
  sub: string; // userId
  sid: string; // internal session id

  meta?: {
    issuedAt?: number;

    user?: {
      id: string;
    };

    session?: {
      sid: string;
      createdAt?: number;
    };

    bank?: {
      sessionId?: string;
      expiresAt?: number;
    };
  };

  iat?: number;
  exp?: number;
}

