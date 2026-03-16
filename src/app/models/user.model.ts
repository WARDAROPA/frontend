export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  userId?: number;
}
