
export interface User {
  id: string;
  name: string;
  monthlySalary: number;
  dailyWage: number;
  createdAt: number;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  date: string; // ISO format
  amountPaid: number;
  dueAmount: number;
  expectedAmount: number;
}

export interface FundTransaction {
  id: string;
  type: 'COLLECTION' | 'PAYMENT';
  amount: number;
  date: string;
  description: string;
  referenceId?: string; // userId for payments
}

export interface AuthUser {
  name: string;
  email: string;
  picture: string;
}

export type View = 'DASHBOARD' | 'USERS' | 'PAYMENTS' | 'FUNDS' | 'REPORTS';
