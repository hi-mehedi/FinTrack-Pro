import React, { useState } from 'react';
import { FundTransaction } from '../types';
import { PlusCircle, Edit2, Trash2, X, RotateCcw, ArrowUpRight, ArrowDownRight, History, Save } from 'lucide-react';

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><PlusCircle size={80}/></div>
            <p className="text-indigo-100 font-black uppercase text-[10px] tracking-[0.2em] mb-1">Cash in Hand</p>
            <h2 className="text-5xl font-black mb-8">৳{totalFund.toLocaleString()}</h2>
            <div className="space-y-3">
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                     <span className="text-xs font-bold">Total Collected</span>
                  </div>
                  <span className="font-black text-lg">৳{transactions.filter(t => t.type === 'COLLECTION').reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
               </div>
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                     <span className="text-xs font-bold">Total Expenses</span>
                  </div>
                  <span className="font-black text-lg">৳{transactions.filter(t => t.type !== 'COLLECTION').reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className={`bg-white p-10 rounded-[3rem] border shadow-sm space-y-6 transition-all ${editingId ? 'ring-2 ring-indigo-500' : ''}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">{editingId ? 'Edit Entry' : 'Fund Manager'}</h3>
              {editingId && <button onClick={() => { setEditingId(null); setAmount(''); }} className="p-2 text-rose-500"><X size={20}/></button>}
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Amount (TK)</label>
                <input type="number" placeholder="0.00" className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-lg outline-none" value={amount} onChange={e=>setAmount(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Note/Description</label>
                <input placeholder="Optional details..." className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={description} onChange={e=>setDescription(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Transaction Date</label>
                <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleAction('COLLECTION')} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center space-x-2">
                {editingId ? <Save size={16}/> : null}
                <span>{editingId ? 'Update' : 'Add Cash'}</span>
              </button>
              <button onClick={() => handleAction('RETURN')} className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center space-x-2">
                <RotateCcw size={14}/> <span>{editingId ? 'Return' : 'Withdraw'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden flex flex-col h-[750px]">
             <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Financial History</h3>
                <div className="flex space-x-2">
                   <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg uppercase tracking-wider">All Transactions</span>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 z-10">
                    <tr>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-6 py-5">Activity</th>
                      <th className="px-6 py-5">Amount</th>
                      <th className="px-8 py-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map(t => {
                      const isAuto = t.type === 'PAYMENT' || t.type === 'BAZAR';
                      return (
                        <tr key={t.id} className={`hover:bg-slate-50/50 transition-colors ${editingId === t.id ? 'bg-indigo-50/50' : ''}`}>
                          <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-6">
                             <p className="text-sm font-black text-slate-800">{t.description}</p>
                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${t.type === 'COLLECTION' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                               {t.type}
                             </span>
                          </td>
                          <td className={`px-6 py-6 font-black text-lg ${t.type === 'COLLECTION' ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {t.type === 'COLLECTION' ? '+' : '-'}৳{t.amount.toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-center">
                            {!isAuto ? (
                              <div className="flex justify-center space-x-1">
                                <button onClick={() => startEdit(t)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all"><Edit2 size={14}/></button>
                                <button onClick={() => onDeleteCollection(t.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all"><Trash2 size={14}/></button>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black text-slate-300 uppercase italic">Auto Log</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
               {filteredHistory.length === 0 && (
                 <div className="p-20 text-center space-y-4">
                    <History size={60} className="mx-auto text-slate-200" />
                    <p className="font-bold text-slate-400">No transactions recorded yet.</p>
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