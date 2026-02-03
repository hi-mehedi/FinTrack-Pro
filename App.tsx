import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  where
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
  
  const isLocalDemoRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isLocalDemoRef.current && !user) {
        setLoading(false);
        return;
      }
      if (user) {
        isLocalDemoRef.current = false;
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
        isLocalDemoRef.current = false;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !authUser || authUser.uid === 'local-demo') return;
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
      unsubUsers(); unsubPayments(); unsubTransactions(); unsubBazar();
    };
  }, [isLoggedIn, authUser]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout from FinTrack Pro?")) {
      await signOut(auth);
      setIsLoggedIn(false);
      setAuthUser(null);
      isLocalDemoRef.current = false;
      if (authUser?.uid === 'local-demo') {
        setUsers([]); setPayments([]); setTransactions([]); setBazarCosts([]);
      }
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (e) {
      isLocalDemoRef.current = true;
      setAuthUser({ uid: 'local-demo', name: 'Guest Explorer', email: 'local@demo.site', picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=explorer`, isDemo: true });
      setIsLoggedIn(true);
      // Seed Demo Data
      const demoId = 'local-demo';
      setUsers([{ id: 'u1', ownerId: demoId, name: 'Karim Ahmed', dailyTarget: 600, daysWorked: 15, createdAt: Date.now() }, { id: 'u2', ownerId: demoId, name: 'Rahim Sheikh', dailyTarget: 500, daysWorked: 10, createdAt: Date.now() }]);
      setTransactions([{ id: 't1', ownerId: demoId, type: 'COLLECTION', amount: 50000, date: new Date().toISOString().split('T')[0], description: 'Initial Fund Collection' }]);
    } finally {
      setLoading(false);
    }
  };

  const totalFund = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'COLLECTION' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const handleAddUser = async (name: string, dailyTarget: number, daysWorked: number) => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    const newUser: User = { id, ownerId: authUser.uid, name, dailyTarget, daysWorked, createdAt: Date.now() };
    if (authUser.uid === 'local-demo') setUsers(prev => [...prev, newUser]);
    else await setDoc(doc(db, "users", id), newUser);
  };

  const handleUpdateUser = async (id: string, name: string, dailyTarget: number, daysWorked: number) => {
    if (authUser?.uid === 'local-demo') setUsers(prev => prev.map(u => u.id === id ? { ...u, name, dailyTarget, daysWorked } : u));
    else await updateDoc(doc(db, "users", id), { name, dailyTarget, daysWorked });
  };

  const handleAddPayment = async (userId: string, date: string, amount: number) => {
    if (!authUser) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const paymentId = crypto.randomUUID();
    const transId = crypto.randomUUID();
    const expected = user.dailyTarget;
    const due = expected - amount;
    
    const newPayment: PaymentRecord = { id: paymentId, ownerId: authUser.uid, userId, date, amountPaid: amount, dueAmount: due, expectedAmount: expected };
    const newTrans: FundTransaction = { id: transId, ownerId: authUser.uid, type: 'PAYMENT', amount, date, description: `Salary: ${user.name}`, referenceId: paymentId };

    if (authUser.uid === 'local-demo') {
      setPayments(prev => [...prev, newPayment]);
      setTransactions(prev => [...prev, newTrans]);
    } else {
      await setDoc(doc(db, "payments", paymentId), newPayment);
      await setDoc(doc(db, "transactions", transId), newTrans);
    }
  };

  const handleUpdatePayment = async (paymentId: string, amount: number, date: string) => {
    if (!authUser) return;
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    const user = users.find(u => u.id === payment.userId);
    if (!user) return;
    const due = user.dailyTarget - amount;

    if (authUser.uid === 'local-demo') {
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, amountPaid: amount, date, dueAmount: due } : p));
      setTransactions(prev => prev.map(t => t.referenceId === paymentId ? { ...t, amount, date } : t));
    } else {
      await updateDoc(doc(db, "payments", paymentId), { amountPaid: amount, date, dueAmount: due });
      const trans = transactions.find(t => t.referenceId === paymentId);
      if (trans) await updateDoc(doc(db, "transactions", trans.id), { amount, date });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("Delete this salary payout record?")) return;
    if (authUser?.uid === 'local-demo') {
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      setTransactions(prev => prev.filter(t => t.referenceId !== paymentId));
    } else {
      await deleteDoc(doc(db, "payments", paymentId));
      const trans = transactions.find(t => t.referenceId === paymentId);
      if (trans) await deleteDoc(doc(db, "transactions", trans.id));
    }
  };

  const handleAddCollection = async (amount: number, date: string, desc: string, type: 'COLLECTION' | 'RETURN') => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    const newTrans: FundTransaction = { id, ownerId: authUser.uid, type, amount, date, description: desc || (type === 'COLLECTION' ? 'Collection' : 'Return') };
    if (authUser.uid === 'local-demo') setTransactions(prev => [...prev, newTrans]);
    else await setDoc(doc(db, "transactions", id), newTrans);
  };

  const handleUpdateCollection = async (id: string, amount: number, date: string, desc: string) => {
    if (authUser?.uid === 'local-demo') {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, amount, date, description: desc } : t));
    } else {
      await updateDoc(doc(db, "transactions", id), { amount, date, description: desc });
    }
  };

  const handleAddBazar = async (items: string, amount: number, date: string) => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    const transId = crypto.randomUUID();
    const newBazar: BazarCost = { id, ownerId: authUser.uid, items, amount, date };
    const newTrans: FundTransaction = { id: transId, ownerId: authUser.uid, type: 'BAZAR', amount, date, description: `Bazar: ${items}`, referenceId: id };
    if (authUser.uid === 'local-demo') {
      setBazarCosts(prev => [...prev, newBazar]);
      setTransactions(prev => [...prev, newTrans]);
    } else {
      await setDoc(doc(db, "bazar", id), newBazar);
      await setDoc(doc(db, "transactions", transId), newTrans);
    }
  };

  const handleDeleteBazar = async (id: string) => {
    if (!window.confirm("Delete this bazar entry?")) return;
    if (authUser?.uid === 'local-demo') {
      setBazarCosts(prev => prev.filter(b => b.id !== id));
      setTransactions(prev => prev.filter(t => t.referenceId !== id));
    } else {
      await deleteDoc(doc(db, "bazar", id));
      const trans = transactions.find(t => t.referenceId === id);
      if (trans) await deleteDoc(doc(db, "transactions", trans.id));
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] animate-pulse">FinTrack Pro</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {!isLoggedIn ? <Login onDemoLogin={handleDemoLogin} /> : (
        <>
          <Sidebar currentView={view} setView={setView} user={authUser} onLogout={handleLogout} />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header totalFund={totalFund} />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto space-y-8 pb-12">
                {authUser?.isDemo && (
                  <div className="bg-indigo-600 text-white p-2 text-center text-[10px] font-black uppercase tracking-widest rounded-xl mb-4 shadow-lg animate-in slide-in-from-top duration-700">
                    {authUser.uid === 'local-demo' ? "Explorer Mode • Refresh to clear data" : "Demo Session • Cloud Sync Active"}
                  </div>
                )}
                {view === 'DASHBOARD' && <Dashboard users={users} payments={payments} totalFund={totalFund} transactions={transactions} bazarCosts={bazarCosts} />}
                {view === 'USERS' && <UserManagement users={users} payments={payments} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={(id) => authUser.uid === 'local-demo' ? setUsers(users.filter(u=>u.id!==id)) : deleteDoc(doc(db, "users", id))} />}
                {view === 'PAYMENTS' && <PaymentTracking users={users} payments={payments} bazarCosts={bazarCosts} onAddPayment={handleAddPayment} onUpdatePayment={handleUpdatePayment} onDeletePayment={handleDeletePayment} onAddBazar={handleAddBazar} onDeleteBazar={handleDeleteBazar} />}
                {view === 'FUNDS' && <FundManagement transactions={transactions} totalFund={totalFund} onAddCollection={handleAddCollection} onUpdateCollection={handleUpdateCollection} onDeleteCollection={(id) => authUser.uid === 'local-demo' ? setTransactions(transactions.filter(t=>t.id!==id)) : deleteDoc(doc(db, "transactions", id))} />}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;