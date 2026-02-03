import React, { useState, useEffect, useMemo } from 'react';
import { User, PaymentRecord, FundTransaction, View, AuthUser } from './types';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import PaymentTracking from './components/PaymentTracking';
import FundManagement from './components/FundManagement';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [view, setView] = useState<View>('DASHBOARD');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setAuthUser({
          name: user.displayName || "User",
          email: user.email || "",
          picture: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        });
      } else {
        setIsLoggedIn(false);
        setAuthUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Real-time Listeners
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });

    const unsubPayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord)));
    });

    const unsubTransactions = onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundTransaction)));
    });

    return () => {
      unsubUsers();
      unsubPayments();
      unsubTransactions();
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
    }
  };

  // Derived Statistics
  const totalFund = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'COLLECTION' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const handleAddUser = async (name: string, salary: number) => {
    const id = crypto.randomUUID();
    const newUser: User = {
      id,
      name,
      monthlySalary: salary,
      dailyWage: salary / 30,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "users", id), newUser);
  };

  const handleUpdateUser = async (id: string, name: string, salary: number) => {
    await updateDoc(doc(db, "users", id), {
      name,
      monthlySalary: salary,
      dailyWage: salary / 30
    });
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure? All data related to this user will be removed from the cloud.")) {
      await deleteDoc(doc(db, "users", id));
    }
  };

  const handleAddPayment = async (userId: string, date: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

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

    await setDoc(doc(db, "payments", paymentId), newPayment);
    await setDoc(doc(db, "transactions", newTransaction.id), newTransaction);
  };

  const handleUpdatePayment = async (paymentId: string, amount: number, date: string) => {
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

    await updateDoc(doc(db, "payments", paymentId), {
      amountPaid: amount,
      dueAmount: due,
      date: date
    });

    if (prevTransaction) {
      await updateDoc(doc(db, "transactions", prevTransaction.id), {
        amount: amount,
        date: date
      });
    }
  };

  const handleAddCollection = async (amount: number, date: string, desc: string) => {
    const id = crypto.randomUUID();
    const newTransaction: FundTransaction = {
      id,
      type: 'COLLECTION',
      amount,
      date,
      description: desc || 'Fund Collection',
    };
    await setDoc(doc(db, "transactions", id), newTransaction);
  };

  const handleUpdateCollection = async (id: string, amount: number, date: string, desc: string) => {
    await updateDoc(doc(db, "transactions", id), {
      amount,
      date,
      description: desc
    });
  };

  const handleDeleteCollection = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this fund entry?")) {
      await deleteDoc(doc(db, "transactions", id));
    }
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
        return <FundManagement 
          transactions={transactions} 
          totalFund={totalFund} 
          onAddCollection={handleAddCollection}
          onUpdateCollection={handleUpdateCollection}
          onDeleteCollection={handleDeleteCollection}
        />;
      default:
        return <Dashboard users={users} payments={payments} totalFund={totalFund} transactions={transactions} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Initializing FinTrack Pro...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar currentView={view} setView={setView} user={authUser} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header totalFund={totalFund} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {renderView()}
            
            <footer className="pt-12 mt-12 border-t border-slate-200 flex flex-col items-center justify-center space-y-2 opacity-60 hover:opacity-100 transition-opacity">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Cloud System Architecture</p>
               <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-slate-900">Mehedi Hasan Soumik</span>
                  <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                  <span className="text-xs font-bold text-indigo-600">SQA Engineer</span>
               </div>
               <p className="text-[10px] text-slate-400 font-medium">FinTrack Pro v1.1.0 (Firebase) © 2025</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;