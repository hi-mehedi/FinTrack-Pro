
import React, { useState, useEffect, useMemo } from 'react';
import { User, PaymentRecord, FundTransaction, View, AuthUser, BazarCost } from './types';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import PaymentTracking from './components/PaymentTracking';
import FundManagement from './components/FundManagement';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [view, setView] = useState<View>('DASHBOARD');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [bazarCosts, setBazarCosts] = useState<BazarCost[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setAuthUser({
          uid: user.uid,
          name: user.displayName || (user.isAnonymous ? "Demo User" : "User"),
          email: user.email || "No email",
          picture: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          isDemo: user.isAnonymous
        });
      } else {
        setIsLoggedIn(false);
        setAuthUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Real-time Listeners with Owner Filtering
  useEffect(() => {
    if (!isLoggedIn || !authUser) return;

    const uid = authUser.uid;

    const unsubUsers = onSnapshot(query(collection(db, "users"), where("ownerId", "==", uid)), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });

    const unsubPayments = onSnapshot(query(collection(db, "payments"), where("ownerId", "==", uid)), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord)));
    });

    const unsubTransactions = onSnapshot(query(collection(db, "transactions"), where("ownerId", "==", uid)), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundTransaction)));
    });

    const unsubBazar = onSnapshot(query(collection(db, "bazar"), where("ownerId", "==", uid)), (snapshot) => {
      setBazarCosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BazarCost)));
    });

    return () => {
      unsubUsers();
      unsubPayments();
      unsubTransactions();
      unsubBazar();
    };
  }, [isLoggedIn, authUser]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (e) {
      alert("Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Fund Calculation Logic
  const totalFund = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'COLLECTION') return acc + t.amount;
      return acc - t.amount;
    }, 0);
  }, [transactions]);

  // Actions
  const handleAddUser = async (name: string, dailyTarget: number, daysWorked: number) => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    const newUser: User = {
      id,
      ownerId: authUser.uid,
      name,
      dailyTarget,
      daysWorked,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "users", id), newUser);
  };

  const handleUpdateUser = async (id: string, name: string, dailyTarget: number, daysWorked: number) => {
    await updateDoc(doc(db, "users", id), { name, dailyTarget, daysWorked });
  };

  const handleAddPayment = async (userId: string, date: string, amount: number) => {
    if (!authUser) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const expected = user.dailyTarget;
    const due = expected - amount;
    const paymentId = crypto.randomUUID();

    await setDoc(doc(db, "payments", paymentId), {
      id: paymentId,
      ownerId: authUser.uid,
      userId,
      date,
      amountPaid: amount,
      dueAmount: due,
      expectedAmount: expected
    });

    const transactionId = crypto.randomUUID();
    await setDoc(doc(db, "transactions", transactionId), {
      id: transactionId,
      ownerId: authUser.uid,
      type: 'PAYMENT',
      amount,
      date,
      description: `Salary to ${user.name}`,
      referenceId: paymentId
    });
  };

  const handleAddCollection = async (amount: number, date: string, desc: string, type: 'COLLECTION' | 'RETURN') => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, "transactions", id), {
      id,
      ownerId: authUser.uid,
      type,
      amount,
      date,
      description: desc || (type === 'COLLECTION' ? 'Fund Collection' : 'Return to Collector'),
    });
  };

  const handleAddBazar = async (items: string, amount: number, date: string) => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, "bazar", id), {
      id,
      ownerId: authUser.uid,
      items,
      amount,
      date
    });

    const transId = crypto.randomUUID();
    await setDoc(doc(db, "transactions", transId), {
      id: transId,
      ownerId: authUser.uid,
      type: 'BAZAR',
      amount,
      date,
      description: `Bazar: ${items}`,
      referenceId: id
    });
  };

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return <Dashboard users={users} payments={payments} totalFund={totalFund} transactions={transactions} bazarCosts={bazarCosts} />;
      case 'USERS':
        return <UserManagement users={users} payments={payments} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={(id) => deleteDoc(doc(db, "users", id))} />;
      case 'PAYMENTS':
        return <PaymentTracking users={users} payments={payments} bazarCosts={bazarCosts} onAddPayment={handleAddPayment} onAddBazar={handleAddBazar} onUpdatePayment={()=>{}} />;
      case 'FUNDS':
        return <FundManagement 
          transactions={transactions} 
          totalFund={totalFund} 
          onAddCollection={handleAddCollection}
          onUpdateCollection={()=>{}}
          onDeleteCollection={(id) => deleteDoc(doc(db, "transactions", id))}
        />;
      default:
        return <Dashboard users={users} payments={payments} totalFund={totalFund} transactions={transactions} bazarCosts={bazarCosts} />;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!isLoggedIn) {
    return <Login onDemoLogin={handleDemoLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar currentView={view} setView={setView} user={authUser} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header totalFund={totalFund} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {authUser?.isDemo && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
                <p className="text-amber-800 text-xs font-bold">You are in <strong>Demo Mode</strong>. Data is private to this session.</p>
                <button onClick={handleLogout} className="text-amber-900 underline text-xs font-black">Sign Up for Cloud Save</button>
              </div>
            )}
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
