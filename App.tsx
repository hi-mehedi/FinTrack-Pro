import React, { useState, useEffect, useMemo } from 'react';
import { User, PaymentRecord, FundTransaction, View, AuthUser } from './types';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import PaymentTracking from './components/PaymentTracking';
import FundManagement from './components/FundManagement';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';

const STORAGE_KEY = 'fintrack_pro_data';
const AUTH_KEY = 'fintrack_pro_auth';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [view, setView] = useState<View>('DASHBOARD');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);

  // Load auth state
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setIsLoggedIn(true);
        setAuthUser(parsed);
      } catch (e) {
        console.error("Failed to parse auth data", e);
      }
    }
  }, []);

  // Load data from Local Storage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUsers(parsed.users || []);
        setPayments(parsed.payments || []);
        setTransactions(parsed.transactions || []);
      } catch (e) {
        console.error("Failed to parse storage data", e);
      }
    }
  }, []);

  // Save data to Local Storage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, payments, transactions }));
    }
  }, [users, payments, transactions, isLoggedIn]);

  const handleLogin = () => {
    // Simulate Google Login
    const mockUser: AuthUser = {
      name: "Mehedi Hasan Soumik",
      email: "soumik.sqa@gmail.com",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mehedi"
    };
    setIsLoggedIn(true);
    setAuthUser(mockUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setIsLoggedIn(false);
      setAuthUser(null);
      localStorage.removeItem(AUTH_KEY);
    }
  };

  // Derived Statistics
  const totalFund = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'COLLECTION' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const handleAddUser = (name: string, salary: number) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      monthlySalary: salary,
      dailyWage: salary / 30,
      createdAt: Date.now(),
    };
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (id: string, name: string, salary: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, name, monthlySalary: salary, dailyWage: salary / 30 } : u));
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure? All payment history for this user will be lost.")) {
      setUsers(users.filter(u => u.id !== id));
      setPayments(payments.filter(p => p.userId !== id));
      setTransactions(transactions.filter(t => t.referenceId !== id));
    }
  };

  const handleAddPayment = (userId: string, date: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const existing = payments.find(p => p.userId === userId && p.date === date);
    if (existing) {
      alert("A payment record already exists for this user on this date. Please edit the existing record.");
      return;
    }

    if (totalFund < amount) {
      alert("Insufficient funds in Total Fund!");
      return;
    }

    const expected = user.dailyWage;
    const due = expected - amount;
    const paymentId = crypto.randomUUID();

    const newPayment: PaymentRecord = {
      id: paymentId,
      userId,
      date,
      amountPaid: amount,
      dueAmount: due,
      expectedAmount: expected,
    };

    const newTransaction: FundTransaction = {
      id: crypto.randomUUID(),
      type: 'PAYMENT',
      amount,
      date,
      description: `Payment to ${user.name}`,
      referenceId: paymentId,
    };

    setPayments([...payments, newPayment]);
    setTransactions([...transactions, newTransaction]);
  };

  const handleUpdatePayment = (paymentId: string, amount: number, date: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const user = users.find(u => u.id === payment.userId);
    if (!user) return;

    const prevTransaction = transactions.find(t => t.referenceId === paymentId);
    const fundAdjustment = (prevTransaction?.amount || 0) - amount;

    if (totalFund + fundAdjustment < 0) {
      alert("Insufficient funds to update this payment!");
      return;
    }

    const expected = user.dailyWage;
    const due = expected - amount;

    setPayments(payments.map(p => p.id === paymentId ? {
      ...p,
      amountPaid: amount,
      dueAmount: due,
      date: date
    } : p));

    setTransactions(transactions.map(t => t.referenceId === paymentId ? {
      ...t,
      amount: amount,
      date: date
    } : t));
  };

  const handleAddCollection = (amount: number, date: string, desc: string) => {
    const newTransaction: FundTransaction = {
      id: crypto.randomUUID(),
      type: 'COLLECTION',
      amount,
      date,
      description: desc || 'Fund Collection',
    };
    setTransactions([...transactions, newTransaction]);
  };

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return <Dashboard users={users} payments={payments} totalFund={totalFund} transactions={transactions} />;
      case 'USERS':
        return <UserManagement users={users} payments={payments} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />;
      case 'PAYMENTS':
        return <PaymentTracking users={users} payments={payments} onAddPayment={handleAddPayment} onUpdatePayment={handleUpdatePayment} />;
      case 'FUNDS':
        return <FundManagement transactions={transactions} totalFund={totalFund} onAddCollection={handleAddCollection} />;
      default:
        return <Dashboard users={users} payments={payments} totalFund={totalFund} transactions={transactions} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar currentView={view} setView={setView} user={authUser} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header totalFund={totalFund} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {renderView()}
            
            {/* Footer Attribution */}
            <footer className="pt-12 mt-12 border-t border-slate-200 flex flex-col items-center justify-center space-y-2 opacity-60 hover:opacity-100 transition-opacity">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Engineering</p>
               <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-slate-900">Mehedi Hasan Soumik</span>
                  <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                  <span className="text-xs font-bold text-indigo-600">SQA Engineer</span>
               </div>
               <p className="text-[10px] text-slate-400 font-medium">FinTrack Pro v1.0.0 © 2025</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;