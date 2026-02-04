
import React, { useState, useMemo } from 'react';
import { FundTransaction } from '../types';
import { PlusCircle, Trash2, RotateCcw, Wallet, CheckCircle2, ShoppingCart, CreditCard, ArrowLeftRight } from 'lucide-react';

interface FundManagementProps {
  transactions: FundTransaction[];
  totalFund: number;
  selectedMonth: number;
  onAddCollection: (amount: number, date: string, desc: string, type: 'COLLECTION' | 'RETURN') => void;
  onDeleteCollection: (id: string) => void;
}

const FundManagement: React.FC<FundManagementProps> = ({ transactions, totalFund, selectedMonth, onAddCollection, onDeleteCollection }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeType, setActiveType] = useState<'COLLECTION' | 'RETURN'>('COLLECTION');

  const currentYear = new Date().getFullYear();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Strictly filter by the globally selected month
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, selectedMonth, currentYear]);

  const monthInflow = filteredTransactions.reduce((acc, t) => t.type === 'COLLECTION' ? acc + t.amount : acc, 0);
  const monthOutflow = filteredTransactions.reduce((acc, t) => (t.type === 'PAYMENT' || t.type === 'BAZAR' || t.type === 'RETURN') ? acc + t.amount : acc, 0);

  const handleAction = () => {
    if (!amount) return;
    onAddCollection(parseFloat(amount), date, description, activeType);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-10 view-animate pb-20">
      <div className="flex flex-col space-y-2">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Financial Management</p>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Wallet Control</h2>
          <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
            {months[selectedMonth]} Auditing
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
           <Wallet size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-slate-400">Net Wallet Balance</p>
          <h2 className="text-6xl font-black tracking-tighter mb-10">৳{totalFund.toLocaleString()}</h2>
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-white/10 p-6 rounded-[1.75rem] backdrop-blur-md border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{months[selectedMonth]} Deposit</p>
                <p className="text-xl font-black text-emerald-400">৳{monthInflow.toLocaleString()}</p>
             </div>
             <div className="bg-white/10 p-6 rounded-[1.75rem] backdrop-blur-md border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{months[selectedMonth]} Deductions</p>
                <p className="text-xl font-black text-rose-400">৳{monthOutflow.toLocaleString()}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center space-x-4">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-colors ${activeType === 'COLLECTION' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
              {activeType === 'COLLECTION' ? <PlusCircle size={24}/> : <RotateCcw size={24}/>}
           </div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tight">Manual Transaction</h3>
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-full max-w-sm mx-auto mb-8 shadow-inner">
          <button 
            onClick={() => setActiveType('COLLECTION')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeType === 'COLLECTION' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            <PlusCircle size={14} />
            <span>Deposit Fund</span>
          </button>
          <button 
            onClick={() => setActiveType('RETURN')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeType === 'RETURN' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
          >
            <RotateCcw size={14} />
            <span>Return Fund</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Amount (৳)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className={`w-full text-lg !py-4 font-black ${activeType === 'COLLECTION' ? 'text-emerald-600' : 'text-rose-600'}`} 
                value={amount} 
                onChange={e=>setAmount(e.target.value)} 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Memo/Reference</label>
              <input 
                placeholder={activeType === 'COLLECTION' ? "Daily Intake..." : "Returning to owner..."} 
                className="w-full !py-4" 
                value={description} 
                onChange={e=>setDescription(e.target.value)} 
              />
            </div>
          </div>
          <div className="space-y-3">
             <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Transaction Date</label>
             <input type="date" className="w-full !py-4" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <button 
            onClick={handleAction}
            className={`w-full py-6 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active-scale flex items-center justify-center space-x-4 ${activeType === 'COLLECTION' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
          >
            <CheckCircle2 size={20} />
            <span>Confirm {activeType === 'RETURN' ? 'TK Return' : 'Fund Deposit'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-slate-900">{months[selectedMonth]} Transaction Audit</h3>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{filteredTransactions.length} Entries</span>
        </div>

        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No wallet activity for {months[selectedMonth]}</p>
            </div>
          ) : filteredTransactions.slice().reverse().map(t => {
            const isManual = ['COLLECTION', 'RETURN'].includes(t.type);
            const isIncoming = t.type === 'COLLECTION';
            
            return (
              <div key={t.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                <div className="flex items-center space-x-5 flex-1 min-w-0">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-lg shadow-sm border ${
                    t.type === 'COLLECTION' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    t.type === 'RETURN' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    t.type === 'BAZAR' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {t.type === 'COLLECTION' ? <PlusCircle size={22}/> : 
                     t.type === 'RETURN' ? <RotateCcw size={22}/> :
                     t.type === 'BAZAR' ? <ShoppingCart size={22}/> :
                     <CreditCard size={22}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 text-base mb-1 truncate leading-tight">{t.description || 'System Audit'}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.date).toLocaleDateString()}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                         t.type === 'RETURN' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500'
                      }`}>
                         {t.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className={`text-xl font-black tracking-tight leading-none ${isIncoming ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncoming ? '+' : '-'}৳{t.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                      {isIncoming ? 'Fund In' : 'Fund Out'}
                    </p>
                  </div>
                  {isManual && (
                    <button onClick={() => onDeleteCollection(t.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl active-scale transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="py-10 text-center border-t border-slate-50">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Developed By</p>
        <p className="text-xs font-black text-slate-800 mt-1 uppercase tracking-wider">Mehedi Hasan Soumik</p>
      </div>
    </div>
  );
};

export default FundManagement;
