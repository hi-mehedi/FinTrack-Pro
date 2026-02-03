
export interface User {
  id: string;
  ownerId: string; // To identify which Google/Demo account owns this data
  name: string;
  dailyTarget: number; // Daily wage
  daysWorked: number; // Total days worked
  createdAt: number;
}

export interface PaymentRecord {
  id: string;
  ownerId: string;
  userId: string;
  date: string; 
  amountPaid: number;
  dueAmount: number;
  expectedAmount: number;
}

export interface BazarCost {
  id: string;
  ownerId: string;
  items: string;
  amount: number;
  date: string;
}

export interface FundTransaction {
  id: string;
  ownerId: string;
  type: 'COLLECTION' | 'PAYMENT' | 'RETURN' | 'BAZAR';
  amount: number;
  date: string;
  description: string;
  referenceId?: string;
}

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  picture: string;
  isDemo?: boolean;
}

export type View = 'DASHBOARD' | 'USERS' | 'PAYMENTS' | 'FUNDS' | 'BAZAR';
