import { ObjectId } from 'mongodb';

export interface User {
  _id?: string;
  email: string;
  password?: string;
  image?: string;
  isActive: boolean;
  balance: number;
  action?: 'create' | 'login';
  isBanned: boolean;
  // wagers?: ObjectId[];
  // winnings?: ObjectId[];
}

export interface Credentials {
  email: string;
  // password: string;
}

// TEST IMPLEMENTATION
export interface Wager {
  _id?: string;
  userID: string;
  auctionID: string;
  priceGuessed: number;
  wagerAmount: number;
  createdAt?: Date;
  isActive: boolean;
}

// TEST IMPLEMENTATION
export interface Winning {
  _id?: string;
  userID: string;
  auctionID: string;
  wagerID: string;
  prizeAmount: number;
  rank: number;
  winningDate: Date;
}
