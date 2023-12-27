export interface User {
  _id?: string;
  email: string;
  password?: string;
  image?: string;
  isActive: boolean;
  balance: number;
}

export interface Credentials {
  email: string;
  password: string;
}
