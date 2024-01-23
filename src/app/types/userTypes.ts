export interface User {
  _id?: string;
  email: string;
  password?: string;
  image?: string;
  isActive: boolean;
  balance: number;
  action?: 'create' | 'login';
  isBanned: boolean;
}

export interface Credentials {
  email: string;
  password: string;
}
