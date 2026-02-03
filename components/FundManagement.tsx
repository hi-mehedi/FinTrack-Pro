import React, { useState } from 'react';
import { FundTransaction } from '../types';
import { PlusCircle, ArrowUpRight, ArrowDownRight, History, Edit2, Trash2, X, Save, RotateCcw } from 'lucide-react';

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

  const handleEdit = (t: FundTransaction) => {
    setEditingId(t.id);
    setAmount(t.amount.toString());
    setDescription(t.description);
    setDate(t.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl">
            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest mb-1">Total Available Balance</p>
            <h2 className="text-4xl font-black mb-6">৳{totalFund.toLocaleString()}</h2>
            <div className="space-y-2">
               <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm flex justify-between">
                  <span className="text-xs">Collections</span>
                  <span className="font-bold">৳{transactions.filter(t => t.type === 'COLLECTION').reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
               </div>
               <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm flex justify-between">
                  <span className="text-xs">Payouts & Returns</span>
                  <span className="font-bold">৳{transactions.filter(t => t.type !== 'COLLECTION').reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className={`bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4 ${editingId ? 'border-amber-400' : ''}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800">{editingId ? 'Edit Entry' : 'Add/Return Funds'}</h3>
              {editingId && <button onClick={() => {setEditingId(null); setAmount(''); setDescription('');}} className="p-2 text-rose-500"><X size={18}/></button>}
            </div>
            <input type="number" placeholder="Amount TK" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={amount} onChange={e=>setAmount(e.target.value)} />
            <input placeholder="Description" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={description} onChange={e=>setDescription(e.target.value)} />
            <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={date} onChange={e=>setDate(e.target.value)} />
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleAction('COLLECTION')} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg">
                {editingId ? 'Update' : 'Add Cash'}
              </button>
              <button onClick={() => handleAction('RETURN')} className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg flex items-center justify-center space-x-2">
                <RotateCcw size={14}/> <span>{editingId ? 'Change' : 'Return'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden flex flex-col h-[500px]">
             <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">History</h3>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">Real-time Feed</span>
             </div>
             <div className="flex-1 overflow-y-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                    <tr>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-6 py-4">Details</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-8 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.sort((a,b)=>new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                      <tr key={t.id} className={`hover:bg-slate-50 ${editingId === t.id ? 'bg-amber-50' : ''}`}>
                        <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-6 py-5">
                           <p className="text-sm font-black text-slate-800">{t.description}</p>
                           <span className="text-[9px] font-bold uppercase text-slate-400">{t.type}</span>
                        </td>
                        <td className={`px-6 py-5 font-black ${t.type === 'COLLECTION' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {t.type === 'COLLECTION' ? '+' : '-'}৳{t.amount.toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-center">
                          {t.type !== 'PAYMENT' && t.type !== 'BAZAR' ? (
                            <div className="flex justify-center space-x-2">
                              <button onClick={() => handleEdit(t)} className="p-2 text-indigo-400 hover:text-indigo-600"><Edit2 size={14}/></button>
                              <button onClick={() => onDeleteCollection(t.id)} className="p-2 text-rose-400 hover:text-rose-600"><Trash2 size={14}/></button>
                            </div>
                          ) : <span className="text-[9px] text-slate-300">Auto-Generated</span>}
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