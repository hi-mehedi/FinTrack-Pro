import React, { useState } from 'react';
import { User, PaymentRecord, BazarCost } from '../types';
import { ShoppingBag, CreditCard, Edit2, Trash2, X, Save, AlertCircle, History, Calendar, CheckCircle2, UserCircle2, ArrowUpRight, ArrowDownRight, ArrowRight, Zap } from 'lucide-react';

interface PaymentTrackingProps {
  users: User[];
  payments: PaymentRecord[];
  bazarCosts: BazarCost[];
  onAddPayment: (userId: string, date: string, amount: number) => void;
  onUpdatePayment: (paymentId: string, amount: number, date: string) => void;
  onDeletePayment: (paymentId: string) => void;
  onAddBazar: (items: string, amount: number, date: string) => void;
  onDeleteBazar: (id: string) => void;
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ 
  users, payments, bazarCosts, onAddPayment, onUpdatePayment, onDeletePayment, onAddBazar, onDeleteBazar 
}) => {
  const [activeTab, setActiveTab] = useState<'PAYMENT' | 'BAZAR'>('PAYMENT');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount) return;
    
    const existing = payments.find(p => p.userId === selectedUserId && p.date === date);
    if (existing && !editingId) {
       const user = users.find(u=>u.id===selectedUserId);
       if (window.confirm(`${user?.name} already has a payout record for ${date}. Update that existing record?`)) {
          setEditingId(existing.id);
          setAmount(existing.amountPaid.toString());
          return;
       } else {
         return;
       }
    }

    if (editingId) {
      onUpdatePayment(editingId, parseFloat(amount), date);
      setEditingId(null);
    } else {
      onAddPayment(selectedUserId, date, parseFloat(amount));
    }
    setAmount('');
    setSelectedUserId('');
  };

  const handleBazarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !items) return;
    onAddBazar(items, parseFloat(amount), date);
    setAmount('');
    setItems('');
  };

  const startEditPayment = (p: PaymentRecord) => {
    setActiveTab('PAYMENT');
    setEditingId(p.id);
    setSelectedUserId(p.userId);
    setAmount(p.amountPaid.toString());
    setDate(p.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const combinedLogs = [
    ...payments.map(p => ({ ...p, logType: 'PAYMENT' })),
    ...bazarCosts.map(b => ({ ...b, logType: 'BAZAR' }))
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-reveal pb-12">
      <div className="space-y-8">
        <div className={`bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-500 ${editingId ? 'ring-8 ring-indigo-500/5' : ''}`}>
          <div className="flex bg-slate-50/50 p-4">
            <button 
              onClick={() => { setActiveTab('PAYMENT'); setEditingId(null); }} 
              className={`flex-1 py-5 rounded-[1.75rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-3 ${activeTab === 'PAYMENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <CreditCard size={18} />
              <span>{editingId ? 'Edit Payout' : 'Daily Payout'}</span>
            </button>
            {!editingId && (
              <button 
                onClick={() => setActiveTab('BAZAR')} 
                className={`flex-1 py-5 rounded-[1.75rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-3 ${activeTab === 'BAZAR' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ShoppingBag size={18} />
                <span>Market Cost</span>
              </button>
            )}
          </div>

          <div className="p-10 sm:p-12">
            {activeTab === 'PAYMENT' ? (
              <form onSubmit={handlePaySubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Employee Selection</label>
                  <div className="relative group">
                    <UserCircle2 size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <select 
                      disabled={!!editingId}
                      value={selectedUserId} 
                      onChange={e => setSelectedUserId(e.target.value)} 
                      className="w-full pl-16 pr-10 py-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] outline-none font-bold appearance-none transition-all focus:bg-white focus:border-indigo-500 text-lg shadow-inner"
                    >
                      <option value="">Choose personnel...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} (৳{u.dailyTarget})</option>)}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <ArrowRight size={20} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Transaction Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] outline-none font-bold focus:bg-white focus:border-indigo-500 text-lg shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Disbursed (৳)</label>
                    <input type="number" placeholder="৳ 0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] outline-none font-bold focus:bg-white focus:border-indigo-500 text-lg shadow-inner" />
                  </div>
                </div>
                <div className="flex space-x-4 pt-4">
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setAmount(''); setSelectedUserId(''); }} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-bold text-sm tracking-widest active-scale uppercase">Cancel</button>
                  )}
                  <button className="flex-[2] py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-200 uppercase text-xs tracking-[0.2em] flex items-center justify-center space-x-3 active-scale transition-all">
                    {editingId ? <Save size={20}/> : <Zap size={20}/>}
                    <span>{editingId ? 'Submit Update' : 'Log Daily Salary'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBazarSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Expenditure Narrative</label>
                  <input placeholder="Items or reason for expense..." className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] outline-none font-bold focus:bg-white focus:border-amber-500 text-lg shadow-inner" value={items} onChange={e => setItems(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] outline-none font-bold text-lg shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Total Cost (৳)</label>
                    <input type="number" placeholder="৳ 0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2.5rem] outline-none font-bold text-lg shadow-inner" />
                  </div>
                </div>
                <button className="w-full py-6 bg-amber-500 text-white rounded-[2rem] font-black shadow-2xl shadow-amber-200 uppercase text-xs tracking-[0.2em] active-scale transition-all">Record Market Entry</button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[4rem] flex items-start space-x-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute -bottom-10 -right-10 text-white/5 rotate-12 transition-transform duration-1000 group-hover:scale-150">
             <Zap size={200} />
           </div>
           <div className="p-4 bg-white/10 text-white rounded-[1.75rem] backdrop-blur-md border border-white/10">
             <AlertCircle size={32}/>
           </div>
           <div>
             <h4 className="font-black text-white text-xl mb-2">Internal Policy Guard</h4>
             <p className="text-sm font-medium text-slate-400 leading-relaxed">
               System automatically validates daily payout amounts against personnel wage profiles. <strong>Manual overrides</strong> are logged for audit transparency.
             </p>
           </div>
        </div>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-[4.5rem] border border-slate-100 shadow-sm flex flex-col h-[850px] overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-slate-50 rounded-[2rem] flex items-center justify-center text-indigo-400 mr-5 shadow-inner">
              <History size={26} strokeWidth={2.5} /> 
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 leading-none">Universal Stream</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Combined Ledger View</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Sync Active</span>
        </div>
        
        <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
          {combinedLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 text-center space-y-6">
               <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center">
                 <History size={48} className="opacity-10" />
               </div>
               <p className="text-lg font-bold">No recent activity detected.</p>
            </div>
          ) : combinedLogs.map((log: any) => {
            const isBazar = log.logType === 'BAZAR';
            const user = !isBazar ? users.find(u => u.id === log.userId) : null;
            const entryDate = new Date(log.date);
            
            // Logic for daily status showing exact extra/due amount
            let statusBadge = null;
            if (!isBazar && user) {
               const diff = log.amountPaid - user.dailyTarget;
               if (diff > 0) {
                 statusBadge = (
                   <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-xl border border-emerald-200/50 flex items-center">
                     <ArrowUpRight size={12} className="mr-1.5"/> ৳{diff} Extra
                   </span>
                 );
               } else if (diff < 0) {
                 statusBadge = (
                   <span className="text-[10px] font-black text-rose-700 bg-rose-100/50 px-3 py-1.5 rounded-xl border border-rose-200/50 flex items-center">
                     <ArrowDownRight size={12} className="mr-1.5"/> ৳{Math.abs(diff)} Due
                   </span>
                 );
               } else {
                 statusBadge = (
                   <span className="text-[10px] font-black text-slate-400 bg-slate-100/50 px-3 py-1.5 rounded-xl flex items-center">
                     <CheckCircle2 size={12} className="mr-1.5"/> Balanced Day
                   </span>
                 );
               }
            }

            return (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center p-6 bg-slate-50/50 rounded-[3rem] group relative hover:bg-white border-2 border-transparent hover:border-slate-100 transition-all duration-300 gap-6">
                <div className="flex items-center flex-1 min-w-0">
                  <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center mr-5 shrink-0 transition-all group-hover:scale-105 ${isBazar ? 'bg-amber-100 text-amber-600 shadow-lg shadow-amber-50' : 'bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-50'}`}>
                    {isBazar ? <ShoppingBag size={28}/> : <CreditCard size={28}/>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-lg font-black text-slate-900 truncate">{isBazar ? log.items : user?.name || 'Manual Log'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <Calendar size={12} className="mr-1.5"/> {entryDate.toLocaleDateString(undefined, {month:'short', day:'numeric', year: 'numeric'})}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border-2 shadow-sm ${isBazar ? 'bg-amber-50/50 text-amber-600 border-amber-100' : 'bg-indigo-50/50 text-indigo-600 border-indigo-100'}`}>
                        {isBazar ? 'MARKET EXPENSE' : 'SALARY PAYOUT'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-6 sm:pt-0">
                  <div className="text-left sm:text-right shrink-0">
                    <p className={`font-black text-2xl leading-none ${isBazar ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ৳{(log.amount || log.amountPaid).toLocaleString()}
                    </p>
                    <div className="mt-3 flex justify-end">
                       {statusBadge}
                    </div>
                  </div>
                  <div className="flex opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all sm:translate-x-4 group-hover:translate-x-0">
                    {!isBazar ? (
                      <button onClick={() => startEditPayment(log)} className="p-4 text-indigo-400 hover:bg-white rounded-[1.5rem] shadow-sm transition-all active-scale"><Edit2 size={20}/></button>
                    ) : null}
                    <button onClick={() => isBazar ? onDeleteBazar(log.id) : onDeletePayment(log.id)} className="p-4 text-rose-400 hover:bg-white rounded-[1.5rem] shadow-sm transition-all active-scale"><Trash2 size={20}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaymentTracking;