export interface AuthToken {
  userId: string;
  refreshToken: string;
  createdAt: any;
  expiresAt: any;
}

export interface SessionInfo {
  accessTokenExpiresAt: string | Date;
  refreshTokenExpiresAt: string | Date;
}

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
  img_url?: string;
  last_active?: string;
}

export interface RefreshTokenPayload {
  token?: string;
}
