
import React, { useState, useMemo } from 'react';
import { User, PaymentRecord, BazarCost } from '../types';
import { Search, Calendar, CreditCard, ShoppingBag, PlusCircle, History } from 'lucide-react';

interface PaymentTrackingProps {
  users: User[];
  payments: PaymentRecord[];
  bazarCosts: BazarCost[];
  onAddPayment: (userId: string, date: string, amount: number) => void;
  onAddBazar: (items: string, amount: number, date: string) => void;
  onUpdatePayment: (paymentId: string, amount: number, date: string) => void;
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ users, payments, bazarCosts, onAddPayment, onAddBazar }) => {
  const [activeTab, setActiveTab] = useState<'PAYMENT' | 'BAZAR'>('PAYMENT');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [bazarAmount, setBazarAmount] = useState('');
  const [bazarItems, setBazarItems] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !paymentAmount) return;
    onAddPayment(selectedUserId, date, parseFloat(paymentAmount));
    setPaymentAmount('');
    setSelectedUserId('');
  };

  const handleBazarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bazarAmount || !bazarItems) return;
    onAddBazar(bazarItems, parseFloat(bazarAmount), date);
    setBazarAmount('');
    setBazarItems('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
          <div className="flex bg-slate-50 border-b">
            <button onClick={() => setActiveTab('PAYMENT')} className={`flex-1 py-4 font-black text-xs uppercase tracking-widest ${activeTab === 'PAYMENT' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Staff Payment</button>
            <button onClick={() => setActiveTab('BAZAR')} className={`flex-1 py-4 font-black text-xs uppercase tracking-widest ${activeTab === 'BAZAR' ? 'bg-white text-amber-600 border-b-2 border-amber-600' : 'text-slate-400'}`}>Daily Bazar</button>
          </div>

          <div className="p-8">
            {activeTab === 'PAYMENT' ? (
              <form onSubmit={handlePaySubmit} className="space-y-4">
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold">
                  <option value="">Select Employee</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} (Daily: ৳{u.dailyTarget})</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                   <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" />
                   <input type="number" placeholder="Amount TK" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" />
                </div>
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">Submit Payment</button>
              </form>
            ) : (
              <form onSubmit={handleBazarSubmit} className="space-y-4">
                <input placeholder="Items (e.g. Fish, Vegetables)" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={bazarItems} onChange={e => setBazarItems(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                   <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" />
                   <input type="number" placeholder="Cost TK" value={bazarAmount} onChange={e => setBazarAmount(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" />
                </div>
                <button className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg">Log Bazar Cost</button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <h3 className="text-xl font-black mb-6">Daily Activity Log</h3>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {[...payments, ...bazarCosts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item: any) => (
            <div key={item.id} className="flex items-center p-4 bg-slate-50 rounded-2xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${item.items ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {item.items ? <ShoppingBag size={18}/> : <CreditCard size={18}/>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{item.items || users.find(u => u.id === item.userId)?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <span className={`font-black ${item.items ? 'text-rose-600' : 'text-emerald-600'}`}>৳{item.amount || item.amountPaid}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentTracking;
