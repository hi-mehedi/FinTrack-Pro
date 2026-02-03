
import React, { useState } from 'react';
import { User, PaymentRecord, BazarCost } from '../types';
import { ShoppingBag, CreditCard, Edit2, Trash2, X, Save, AlertCircle, History, Calendar, CheckCircle2, UserCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
       if (window.confirm(`${user?.name} already has a payment record for ${date}. Update that entry instead?`)) {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 pb-10">
      <div className="space-y-6">
        <div className={`bg-white rounded-[3rem] border shadow-sm overflow-hidden transition-all ${editingId ? 'ring-2 ring-indigo-500 shadow-indigo-100' : ''}`}>
          <div className="flex bg-slate-50 border-b">
            <button 
              onClick={() => { setActiveTab('PAYMENT'); setEditingId(null); }} 
              className={`flex-1 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'PAYMENT' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {editingId ? 'Edit Salary' : 'New Payout'}
            </button>
            {!editingId && (
              <button 
                onClick={() => setActiveTab('BAZAR')} 
                className={`flex-1 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'BAZAR' ? 'bg-white text-amber-600 border-b-2 border-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Market Entry
              </button>
            )}
          </div>

          <div className="p-8 sm:p-10">
            {activeTab === 'PAYMENT' ? (
              <form onSubmit={handlePaySubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Select Staff Member</label>
                  <div className="relative">
                    <UserCircle2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select 
                      disabled={!!editingId}
                      value={selectedUserId} 
                      onChange={e => setSelectedUserId(e.target.value)} 
                      className="w-full pl-12 pr-4 py-4.5 bg-slate-50 border rounded-2xl outline-none font-bold appearance-none disabled:opacity-50 transition-all focus:bg-white focus:border-indigo-500 text-sm"
                    >
                      <option value="">Select Employee...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} (Rate: ৳{u.dailyTarget})</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4.5 bg-slate-50 border rounded-2xl outline-none font-bold focus:bg-white text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Amount Paid (৳)</label>
                    <input type="number" placeholder="Enter Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4.5 bg-slate-50 border rounded-2xl outline-none font-bold focus:bg-white text-sm" />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setAmount(''); setSelectedUserId(''); }} className="flex-1 py-4.5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Cancel</button>
                  )}
                  <button className="flex-[2] py-4.5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg uppercase text-[10px] tracking-widest flex items-center justify-center space-x-3 active:scale-95 transition-all">
                    {editingId ? <Save size={18}/> : <CheckCircle2 size={18}/>}
                    <span>{editingId ? 'Update Record' : 'Log Salary'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBazarSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Bazar Details</label>
                  <input placeholder="Items purchased..." className="w-full p-4.5 bg-slate-50 border rounded-2xl outline-none font-bold focus:bg-white text-sm" value={items} onChange={e => setItems(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4.5 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cost (৳)</label>
                    <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4.5 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" />
                  </div>
                </div>
                <button className="w-full py-4.5 bg-amber-500 text-white rounded-2xl font-black shadow-lg uppercase text-[10px] tracking-widest active:scale-95 transition-all">Save Market Entry</button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-start space-x-5 shadow-sm">
           <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl flex-shrink-0">
             <AlertCircle size={24}/>
           </div>
           <div>
             <h4 className="font-black text-slate-800 text-sm mb-1">System Guard</h4>
             <p className="text-xs font-bold text-slate-500 leading-relaxed">
               Every daily payment is checked against the employee's target. Only one payment entry per person is allowed per day.
             </p>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[3rem] border shadow-sm flex flex-col h-[700px] sm:h-[800px] overflow-hidden">
        <h3 className="text-xl font-black mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <History className="mr-3 text-indigo-300" /> 
            <span>Global Activity Stream</span>
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">Real-time Feed</span>
        </h3>
        
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {combinedLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 text-center">
               <History size={60} className="opacity-10 mx-auto" />
               <p className="font-bold">Waiting for your first entry...</p>
            </div>
          ) : combinedLogs.map((log: any) => {
            const isBazar = log.logType === 'BAZAR';
            const user = !isBazar ? users.find(u => u.id === log.userId) : null;
            const diff = !isBazar && user ? (log.amountPaid - user.dailyTarget) : 0;
            const entryDate = new Date(log.date);
            
            return (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center p-6 bg-slate-50 rounded-[2.5rem] group relative hover:bg-white border border-transparent hover:border-slate-100 transition-all duration-300 gap-4">
                <div className="flex items-center flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shrink-0 ${isBazar ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600 shadow-sm'}`}>
                    {isBazar ? <ShoppingBag size={24}/> : <CreditCard size={24}/>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-base font-black text-slate-800 truncate">{isBazar ? log.items : user?.name || 'Manual Entry'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <Calendar size={12} className="mr-1"/> {entryDate.toLocaleDateString(undefined, {month:'short', day:'numeric', year: 'numeric'})}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${isBazar ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'}`}>
                        {isBazar ? 'Market Expense' : 'Salary Payout'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                  <div className="text-left sm:text-right shrink-0">
                    <p className={`font-black text-xl leading-none ${isBazar ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ৳{(log.amount || log.amountPaid).toLocaleString()}
                    </p>
                    {!isBazar && user && (
                       <div className="mt-2 flex justify-end">
                         {diff > 0 ? (
                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 flex items-center">
                              <ArrowUpRight size={10} className="mr-1"/> ৳{diff} Extra
                            </span>
                         ) : diff < 0 ? (
                            <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-2 py-1 rounded-lg border border-rose-200 flex items-center">
                              <ArrowDownRight size={10} className="mr-1"/> ৳{Math.abs(diff)} Due
                            </span>
                         ) : (
                            <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Balanced Day</span>
                         )}
                       </div>
                    )}
                  </div>
                  <div className="flex opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all sm:translate-x-4 group-hover:translate-x-0">
                    {!isBazar ? (
                      <button onClick={() => startEditPayment(log)} className="p-3 text-indigo-400 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"><Edit2 size={18}/></button>
                    ) : null}
                    <button onClick={() => isBazar ? onDeleteBazar(log.id) : onDeletePayment(log.id)} className="p-3 text-rose-400 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"><Trash2 size={18}/></button>
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
