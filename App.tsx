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
        // Only set loading false if we aren't in a manual local demo state
        if (!authUser?.isDemo) {
          setIsLoggedIn(false);
          setAuthUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [authUser?.isDemo]);

  // Firestore Listeners
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
      unsubUsers();
      unsubPayments();
      unsubTransactions();
      unsubBazar();
    };
  }, [isLoggedIn, authUser]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure?")) {
      await signOut(auth);
      setIsLoggedIn(false);
      setAuthUser(null);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Attempt Firebase Anonymous Auth first
      await signInAnonymously(auth);
    } catch (e: any) {
      console.warn("Firebase Anonymous Login failed. Falling back to Local Demo mode.", e);
      // Fallback: Local Demo (No persistence to cloud)
      setAuthUser({
        uid: 'local-demo',
        name: 'Guest Explorer',
        email: 'local@demo.site',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
        isDemo: true
      });
      setIsLoggedIn(true);
    } finally {
      setLoading(false);
    }
  };

  const totalFund = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'COLLECTION' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  // Handlers (with local state fallback for Demo Mode)
  const handleAddUser = async (name: string, dailyTarget: number, daysWorked: number) => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    const newUser: User = { id, ownerId: authUser.uid, name, dailyTarget, daysWorked, createdAt: Date.now() };
    
    if (authUser.uid === 'local-demo') {
      setUsers([...users, newUser]);
    } else {
      await setDoc(doc(db, "users", id), newUser);
    }
  };

  const handleAddPayment = async (userId: string, date: string, amount: number) => {
    if (!authUser) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const paymentId = crypto.randomUUID();
    const transId = crypto.randomUUID();
    
    const newPayment: PaymentRecord = {
      id: paymentId, ownerId: authUser.uid, userId, date, amountPaid: amount, 
      dueAmount: (user.dailyTarget * user.daysWorked) - amount, expectedAmount: user.dailyTarget
    };
    const newTrans: FundTransaction = {
      id: transId, ownerId: authUser.uid, type: 'PAYMENT', amount, date, 
      description: `Payout: ${user.name}`, referenceId: paymentId
    };

    if (authUser.uid === 'local-demo') {
      setPayments([...payments, newPayment]);
      setTransactions([...transactions, newTrans]);
    } else {
      await setDoc(doc(db, "payments", paymentId), newPayment);
      await setDoc(doc(db, "transactions", transId), newTrans);
    }
  };

  const handleAddCollection = async (amount: number, date: string, desc: string, type: 'COLLECTION' | 'RETURN') => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    const newTrans: FundTransaction = {
      id, ownerId: authUser.uid, type, amount, date, description: desc || (type === 'COLLECTION' ? 'Inward' : 'Outward Return')
    };

    if (authUser.uid === 'local-demo') {
      setTransactions([...transactions, newTrans]);
    } else {
      await setDoc(doc(db, "transactions", id), newTrans);
    }
  };

  const handleAddBazar = async (items: string, amount: number, date: string) => {
    if (!authUser) return;
    const id = crypto.randomUUID();
    const transId = crypto.randomUUID();
    
    const newBazar: BazarCost = { id, ownerId: authUser.uid, items, amount, date };
    const newTrans: FundTransaction = {
      id: transId, ownerId: authUser.uid, type: 'BAZAR', amount, date, description: `Bazar: ${items}`, referenceId: id
    };

    if (authUser.uid === 'local-demo') {
      setBazarCosts([...bazarCosts, newBazar]);
      setTransactions([...transactions, newTrans]);
    } else {
      await setDoc(doc(db, "bazar", id), newBazar);
      await setDoc(doc(db, "transactions", transId), newTrans);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

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
                  <div className="bg-amber-100 p-3 text-center text-xs font-bold rounded-2xl mb-4 border border-amber-200 text-amber-900 shadow-sm animate-in slide-in-from-top duration-500">
                    {authUser.uid === 'local-demo' 
                      ? "Explorer Mode: Changes will not persist after refresh. Enable Anonymous Auth in Firebase for cloud saving."
                      : "Cloud Demo Session: Your data is private and saved to the cloud."}
                  </div>
                )}
                {view === 'DASHBOARD' && <Dashboard users={users} payments={payments} totalFund={totalFund} transactions={transactions} bazarCosts={bazarCosts} />}
                {view === 'USERS' && <UserManagement users={users} payments={payments} onAdd={handleAddUser} onUpdate={()=>{}} onDelete={(id) => authUser.uid === 'local-demo' ? setUsers(users.filter(u=>u.id!==id)) : deleteDoc(doc(db, "users", id))} />}
                {view === 'PAYMENTS' && <PaymentTracking users={users} payments={payments} bazarCosts={bazarCosts} onAddPayment={handleAddPayment} onAddBazar={handleAddBazar} onUpdatePayment={()=>{}} />}
                {view === 'FUNDS' && <FundManagement transactions={transactions} totalFund={totalFund} onAddCollection={handleAddCollection} onUpdateCollection={()=>{}} onDeleteCollection={(id) => authUser.uid === 'local-demo' ? setTransactions(transactions.filter(t=>t.id!==id)) : deleteDoc(doc(db, "transactions", id))} />}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;