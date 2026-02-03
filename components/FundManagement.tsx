import React, { useState } from 'react';
import { FundTransaction } from '../types';
import { PlusCircle, Edit2, Trash2, X, RotateCcw, ArrowUpRight, ArrowDownRight, History, Save, TrendingUp, TrendingDown, ReceiptText } from 'lucide-react';

interface FundManagementProps {
  transactions: FundTransaction[];
  totalFund: number;
  onAddCollection: (amount: number, date: string, desc: string, type: 'COLLECTION' | 'RETURN') => void;
  onUpdateCollection: (id: string, amount: number, date: string, desc: string) => void;
  onDeleteCollection: (id: string) => void;
}

const FundManagement: React.FC<FundManagementProps> = ({ transactions, totalFund, onAddCollection, onUpdateCollection, onDeleteCollection }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAction = (type: 'COLLECTION' | 'RETURN') => {
    if (!amount) return;
    if (editingId) {
      onUpdateCollection(editingId, parseFloat(amount), date, description);
      setEditingId(null);
    } else {
      onAddCollection(parseFloat(amount), date, description, type);
    }
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const startEdit = (t: FundTransaction) => {
    setEditingId(t.id);
    setAmount(t.amount.toString());
    setDescription(t.description);
    setDate(t.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredHistory = transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-10 animate-reveal pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 text-white/5 group-hover:scale-125 transition-transform duration-1000">
               <TrendingUp size={160} />
            </div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1.5">Liquid Capital</p>
            <h2 className="text-5xl font-black mb-10 tracking-tight">৳{totalFund.toLocaleString()}</h2>
            <div className="space-y-4">
               <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex justify-between items-center backdrop-blur-md">
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <TrendingUp size={20} />
                     </div>
                     <span className="text-xs font-bold text-slate-300">Total Inflow</span>
                  </div>
                  <span className="font-black text-xl text-emerald-400">৳{transactions.filter(t => t.type === 'COLLECTION').reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
               </div>
               <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex justify-between items-center backdrop-blur-md">
                  <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <TrendingDown size={20} />
                     </div>
                     <span className="text-xs font-bold text-slate-300">Total Outflow</span>
                  </div>
                  <span className="font-black text-xl text-rose-400">৳{transactions.filter(t => t.type !== 'COLLECTION').reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className={`bg-white p-10 rounded-[4rem] border shadow-sm space-y-8 transition-all duration-500 ${editingId ? 'ring-8 ring-indigo-500/5' : ''}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">{editingId ? 'Modify Entry' : 'Fund Manager'}</h3>
              {editingId && <button onClick={() => { setEditingId(null); setAmount(''); }} className="p-3 bg-rose-50 text-rose-500 rounded-2xl transition-all active-scale"><X size={20}/></button>}
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Entry Amount (৳)</label>
                <input type="number" placeholder="0.00" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-black text-xl outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner" value={amount} onChange={e=>setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Description</label>
                <input placeholder="Note for reference..." className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner" value={description} onChange={e=>setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Transaction Date</label>
                <input type="date" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleAction('COLLECTION')} className="py-5 bg-emerald-600 text-white rounded-[1.75rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center justify-center space-x-3 active-scale transition-all">
                {editingId ? <Save size={18}/> : <PlusCircle size={18}/>}
                <span>{editingId ? 'Update' : 'Add Fund'}</span>
              </button>
              <button onClick={() => handleAction('RETURN')} className="py-5 bg-rose-600 text-white rounded-[1.75rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 flex items-center justify-center space-x-3 active-scale transition-all">
                <RotateCcw size={18}/> <span>{editingId ? 'Return' : 'Withdraw'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[4rem] border shadow-sm overflow-hidden flex flex-col h-[850px]">
             <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                    <ReceiptText size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none">Capital Ledger</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Audit Trail</p>
                  </div>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-10 py-6">Timeline</th>
                      <th className="px-6 py-6">Classification</th>
                      <th className="px-6 py-6">Monetary Flow</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map(t => {
                      const isAuto = t.type === 'PAYMENT' || t.type === 'BAZAR';
                      const entryDate = new Date(t.date);
                      return (
                        <tr key={t.id} className={`hover:bg-slate-50/30 transition-colors ${editingId === t.id ? 'bg-indigo-50/50' : ''}`}>
                          <td className="px-10 py-8">
                             <p className="text-sm font-black text-slate-800">{entryDate.toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{entryDate.getFullYear()}</p>
                          </td>
                          <td className="px-6 py-8">
                             <p className="text-sm font-black text-slate-800 leading-tight mb-1.5">{t.description}</p>
                             <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border-2 shadow-sm ${t.type === 'COLLECTION' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                               {t.type}
                             </span>
                          </td>
                          <td className={`px-6 py-8 font-black text-xl tracking-tight ${t.type === 'COLLECTION' ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {t.type === 'COLLECTION' ? '+' : '-'}৳{t.amount.toLocaleString()}
                          </td>
                          <td className="px-10 py-8 text-right">
                            {!isAuto ? (
                              <div className="flex justify-end space-x-1">
                                <button onClick={() => startEdit(t)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all active-scale"><Edit2 size={16}/></button>
                                <button onClick={() => onDeleteCollection(t.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all active-scale"><Trash2 size={16}/></button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-black text-slate-300 uppercase italic opacity-40">AUTO LOG</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
               {filteredHistory.length === 0 && (
                 <div className="p-32 text-center space-y-4 opacity-20">
                    <History size={60} className="mx-auto" />
                    <p className="font-bold text-lg">No fund records.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundManagement;