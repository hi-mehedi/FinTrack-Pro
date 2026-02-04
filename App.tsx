
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, PaymentRecord, FundTransaction, View, AuthUser, BazarCost } from './types';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import PaymentTracking from './components/PaymentTracking';
import FundManagement from './components/FundManagement';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import BottomNav from './components/BottomNav';
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
  
  // Synchronized month selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      setIsLoggedIn(false);
      setAuthUser(null);
      isLocalDemoRef.current = false;
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (e) {
      isLocalDemoRef.current = true;
      setAuthUser({ uid: 'local-demo', name: 'Demo User', email: 'local@demo.site', picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=explorer`, isDemo: true });
      setIsLoggedIn(true);
    } finally {
      setLoading(false);
    }
  };

  // Fund logic: Collection is PLUS, everything else is MINUS
  const totalFund = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'COLLECTION') return acc + t.amount;
      return acc - t.amount; // PAYMENT, BAZAR, and RETURN deduct from net fund
    }, 0);
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

  const handleAddPayment = async (userId: string, date: string, amount: number, daysPaid?: number) => {
    if (!authUser) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const paymentId = crypto.randomUUID();
    const transId = crypto.randomUUID();
    const expected = user.dailyTarget * (daysPaid || 1);
    const due = expected - amount;
    
    const newPayment: PaymentRecord = { 
      id: paymentId, 
      ownerId: authUser.uid, 
      userId, 
      date, 
      amountPaid: amount, 
      dueAmount: due, 
      expectedAmount: expected,
      daysPaid: daysPaid || 1
    };
    const newTrans: FundTransaction = { id: transId, ownerId: authUser.uid, type: 'PAYMENT', amount, date, description: `Salary: ${user.name} (${daysPaid || 1}d)`, referenceId: paymentId };

    if (authUser.uid === 'local-demo') {
      setPayments(prev => [...prev, newPayment]);
      setTransactions(prev => [...prev, newTrans]);
    } else {
      await setDoc(doc(db, "payments", paymentId), newPayment);
      await setDoc(doc(db, "transactions", transId), newTrans);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("Delete record?")) return;
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
    if (!window.confirm("Delete entry?")) return;
    if (authUser?.uid === 'local-demo') {
      setBazarCosts(prev => prev.filter(b => b.id !== id));
      setTransactions(prev => prev.filter(t => t.referenceId !== id));
    } else {
      await deleteDoc(doc(db, "bazar", id));
      const trans = transactions.find(t => t.referenceId === id);
      if (trans) await deleteDoc(doc(db, "transactions", trans.id));
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden bg-white">
      {!isLoggedIn ? <Login onDemoLogin={handleDemoLogin} /> : (
        <>
          <Sidebar currentView={view} setView={setView} user={authUser} onLogout={handleLogout} />
          <div className="flex-1 flex flex-col h-full relative">
            <Header totalFund={totalFund} />
            <main className="flex-1 overflow-y-auto no-scrollbar pt-6 px-4 md:px-10 pb-24 md:pb-10">
              <div className="max-w-5xl mx-auto view-animate">
                {authUser?.isDemo && (
                  <div className="bg-indigo-600 text-white p-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] rounded-xl mb-6 shadow-md">
                    Demo Mode • Private Access
                  </div>
                )}
                
                {view === 'DASHBOARD' && (
                  <Dashboard 
                    users={users} 
                    payments={payments} 
                    totalFund={totalFund} 
                    transactions={transactions} 
                    bazarCosts={bazarCosts}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                  />
                )}
                {view === 'USERS' && (
                  <UserManagement 
                    users={users} 
                    payments={payments} 
                    selectedMonth={selectedMonth}
                    onAdd={handleAddUser} 
                    onUpdate={handleUpdateUser} 
                    onDelete={(id) => authUser.uid === 'local-demo' ? setUsers(users.filter(u=>u.id!==id)) : deleteDoc(doc(db, "users", id))} 
                  />
                )}
                {view === 'PAYMENTS' && (
                  <PaymentTracking 
                    users={users} 
                    payments={payments} 
                    bazarCosts={bazarCosts} 
                    selectedMonth={selectedMonth}
                    onAddPayment={handleAddPayment} 
                    onDeletePayment={handleDeletePayment} 
                    onAddBazar={handleAddBazar} 
                    onDeleteBazar={handleDeleteBazar} 
                  />
                )}
                {view === 'FUNDS' && (
                  <FundManagement 
                    transactions={transactions} 
                    totalFund={totalFund} 
                    selectedMonth={selectedMonth}
                    onAddCollection={handleAddCollection} 
                    onDeleteCollection={(id) => authUser.uid === 'local-demo' ? setTransactions(transactions.filter(t=>t.id!==id)) : deleteDoc(doc(db, "transactions", id))} 
                  />
                )}
              </div>
            </main>
            <BottomNav currentView={view} setView={setView} />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
