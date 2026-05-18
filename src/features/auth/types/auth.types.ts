export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}
