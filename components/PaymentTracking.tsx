
import React, { useState, useEffect, useMemo } from 'react';
import { User, PaymentRecord, BazarCost } from '../types';
import { CreditCard, Trash2, UserCircle2, CheckCircle2, AlertTriangle, Calculator, Calendar, ShoppingBag, Plus } from 'lucide-react';

interface PaymentTrackingProps {
  users: User[];
  payments: PaymentRecord[];
  bazarCosts: BazarCost[];
  selectedMonth: number;
  onAddPayment: (userId: string, date: string, amount: number, daysPaid?: number) => void;
  onDeletePayment: (paymentId: string) => void;
  onAddBazar: (items: string, amount: number, date: string) => void;
  onDeleteBazar: (id: string) => void;
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ 
  users, payments, bazarCosts, selectedMonth, onAddPayment, onDeletePayment, onAddBazar, onDeleteBazar
}) => {
  const [activeTab, setActiveTab] = useState<'SALARY' | 'BAZAR'>('SALARY');
  const currentYear = new Date().getFullYear();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [daysCount, setDaysCount] = useState('1');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryDate, setSalaryDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [bazarItem, setBazarItem] = useState('');
  const [bazarAmount, setBazarAmount] = useState('');
  const [bazarDate, setBazarDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedUser = users.find(u => u.id === selectedUserId);

  useEffect(() => {
    if (selectedUser && daysCount) {
      const calculated = selectedUser.dailyTarget * parseFloat(daysCount);
      setSalaryAmount(calculated.toString());
    } else if (!selectedUserId) {
      setSalaryAmount('');
    }
  }, [selectedUserId, daysCount, selectedUser]);

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !salaryAmount || !daysCount) return;
    onAddPayment(selectedUserId, salaryDate, parseFloat(salaryAmount), parseFloat(daysCount));
    setSalaryAmount('');
    setDaysCount('1');
    setSelectedUserId('');
  };

  const handleBazarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bazarItem || !bazarAmount) return;
    onAddBazar(bazarItem, parseFloat(bazarAmount), bazarDate);
    setBazarItem('');
    setBazarAmount('');
  };

  // Strictly filter history lists by the selected month
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
    });
  }, [payments, selectedMonth, currentYear]);

  const filteredBazar = useMemo(() => {
    return bazarCosts.filter(b => {
      const d = new Date(b.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
    });
  }, [bazarCosts, selectedMonth, currentYear]);

  const existingPayment = payments.find(p => p.userId === selectedUserId && p.date === salaryDate);

  return (
    <div className="space-y-10 view-animate pb-20">
      <div className="flex flex-col space-y-2">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Operational Desk</p>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Post</h2>
          <div className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            {months[selectedMonth]} {currentYear}
          </div>
        </div>
      </div>

      <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-full max-w-sm mx-auto shadow-inner">
        <button 
          onClick={() => setActiveTab('SALARY')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-[1.75rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'SALARY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
        >
          <CreditCard size={14} />
          <span>Salary</span>
        </button>
        <button 
          onClick={() => setActiveTab('BAZAR')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-[1.75rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'BAZAR' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
        >
          <ShoppingBag size={14} />
          <span>Bazar</span>
        </button>
      </div>

      {activeTab === 'SALARY' ? (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-500">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
             <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><CreditCard size={24}/></div>
             Payout Entry
          </h3>
          <form onSubmit={handleSalarySubmit} className="space-y-6">
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full">
              <option value="">Select Staff...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} (৳{u.dailyTarget}/d)</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Working Days</label>
                <input type="number" value={daysCount} onChange={e => setDaysCount(e.target.value)} placeholder="Days" className="w-full font-black"/>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Pay Amount ৳</label>
                <input type="number" value={salaryAmount} onChange={e => setSalaryAmount(e.target.value)} placeholder="Pay ৳" className="w-full font-black text-indigo-600"/>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Date</label>
              <input type="date" value={salaryDate} onChange={e => setSalaryDate(e.target.value)} className="w-full"/>
            </div>
            <button 
              disabled={!!existingPayment || !selectedUserId || !salaryAmount}
              className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active-scale ${
                existingPayment || !selectedUserId || !salaryAmount ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-xl'
              }`}
            >
              Process Payment
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-500">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
             <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><ShoppingBag size={24}/></div>
             Bazar Audit
          </h3>
          <form onSubmit={handleBazarSubmit} className="space-y-6">
            <input placeholder="Description..." className="w-full" value={bazarItem} onChange={e => setBazarItem(e.target.value)}/>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Amount ৳" className="w-full font-black text-emerald-600" value={bazarAmount} onChange={e => setBazarAmount(e.target.value)}/>
              <input type="date" className="w-full" value={bazarDate} onChange={e => setBazarDate(e.target.value)}/>
            </div>
            <button disabled={!bazarItem || !bazarAmount} className="w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs bg-emerald-600 text-white shadow-xl active-scale">
              Add Expense
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 px-2">{months[selectedMonth]} Record History</h3>
        <div className="space-y-4">
          {(activeTab === 'SALARY' ? filteredPayments : filteredBazar).length === 0 ? (
            <div className="py-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-xs font-black text-slate-300 uppercase tracking-widest">
              No entries found for {months[selectedMonth]}
            </div>
          ) : (activeTab === 'SALARY' ? filteredPayments : filteredBazar).slice().reverse().map((item: any) => (
            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-xl border ${activeTab === 'SALARY' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'}`}>
                  {activeTab === 'SALARY' ? users.find(u=>u.id===item.userId)?.name.charAt(0) : <ShoppingBag size={24}/>}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base leading-tight">{activeTab === 'SALARY' ? users.find(u=>u.id===item.userId)?.name : item.items}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-xl font-black ${activeTab === 'SALARY' ? 'text-slate-900' : 'text-emerald-600'}`}>৳{item.amountPaid || item.amount}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{activeTab === 'SALARY' ? `${item.daysPaid}d Work` : 'Audit Log'}</p>
                </div>
                <button onClick={() => activeTab === 'SALARY' ? onDeletePayment(item.id) : onDeleteBazar(item.id)} className="p-3 text-slate-300 hover:text-rose-600 active-scale transition-colors"><Trash2 size={20}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-10 text-center border-t border-slate-50">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Developed By</p>
        <p className="text-xs font-black text-slate-800 mt-1 uppercase tracking-wider">Mehedi Hasan Soumik</p>
      </div>
    </div>
  );
};

export default PaymentTracking;
