import { SessionInfo } from "./auth.model";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  image: string;
  role: number | string;
  lastActive: string;
  createdAt: any;
}

export interface AuthTokensDto {
  accessToken: string;
  session: SessionInfo;
}

export interface UserDto {
  user: User;
  session?: SessionInfo;
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}