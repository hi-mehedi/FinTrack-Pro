
import React, { useState } from 'react';
import { FundTransaction } from '../types';
import { PlusCircle, ArrowUpRight, ArrowDownRight, History, Info, Edit2, Trash2, X, Save, RotateCcw } from 'lucide-react';

interface FundManagementProps {
  transactions: FundTransaction[];
  totalFund: number;
  onAddCollection: (amount: number, date: string, desc: string, type: 'COLLECTION' | 'RETURN') => void;
  onUpdateCollection: (id: string, amount: number, date: string, desc: string) => void;
  onDeleteCollection: (id: string) => void;
}

const FundManagement: React.FC<FundManagementProps> = ({ transactions, totalFund, onAddCollection, onDeleteCollection }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAction = (type: 'COLLECTION' | 'RETURN') => {
    if (!amount) return;
    onAddCollection(parseFloat(amount), date, description, type);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl">
            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest mb-1">Total Available Balance</p>
            <h2 className="text-4xl font-black mb-6">৳{totalFund.toLocaleString()}</h2>
            <div className="space-y-2">
               <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 flex justify-between">
                  <span className="text-xs">Month Inflow</span>
                  <span className="font-bold">৳{transactions.filter(t => t.type === 'COLLECTION').reduce((a,b)=>a+b.amount,0)}</span>
               </div>
               <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 flex justify-between">
                  <span className="text-xs">Month Outflow</span>
                  <span className="font-bold">৳{transactions.filter(t => t.type !== 'COLLECTION').reduce((a,b)=>a+b.amount,0)}</span>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-800">Manage Liquid Cash</h3>
            <input type="number" placeholder="Amount TK" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={amount} onChange={e=>setAmount(e.target.value)} />
            <input placeholder="Optional Note" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={description} onChange={e=>setDescription(e.target.value)} />
            <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={date} onChange={e=>setDate(e.target.value)} />
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleAction('COLLECTION')} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100">Add Fund</button>
              <button onClick={() => handleAction('RETURN')} className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-rose-100 flex items-center justify-center space-x-2">
                <RotateCcw size={14}/> <span>Return</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden flex flex-col h-full">
             <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Transaction History</h3>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg uppercase">Audit Trail</span>
             </div>
             <div className="flex-1 overflow-y-auto max-h-[600px]">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-6 py-5">Description</th>
                      <th className="px-6 py-5">Type</th>
                      <th className="px-8 py-5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.sort((a,b)=>new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-6 py-6 font-black text-slate-800 text-sm">{t.description}</td>
                        <td className="px-6 py-6">
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${t.type === 'COLLECTION' ? 'bg-indigo-50 text-indigo-600' : t.type === 'BAZAR' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                              {t.type}
                           </span>
                        </td>
                        <td className={`px-8 py-6 text-right font-black ${t.type === 'COLLECTION' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {t.type === 'COLLECTION' ? '+' : '-'}৳{t.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundManagement;
