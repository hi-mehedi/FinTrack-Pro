import React, { useState } from 'react';
import { FundTransaction } from '../types';
import { PlusCircle, ArrowUpRight, ArrowDownRight, History, Info, Edit2, Trash2, X, Save } from 'lucide-react';

interface FundManagementProps {
  transactions: FundTransaction[];
  totalFund: number;
  onAddCollection: (amount: number, date: string, desc: string) => void;
  onUpdateCollection: (id: string, amount: number, date: string, desc: string) => void;
  onDeleteCollection: (id: string) => void;
}

const FundManagement: React.FC<FundManagementProps> = ({ 
  transactions, 
  totalFund, 
  onAddCollection,
  onUpdateCollection,
  onDeleteCollection
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    if (editingId) {
      onUpdateCollection(editingId, parseFloat(amount), date, description);
      setEditingId(null);
    } else {
      onAddCollection(parseFloat(amount), date, description);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const handleEdit = (t: FundTransaction) => {
    setEditingId(t.id);
    setAmount(t.amount.toString());
    setDescription(t.description);
    setDate(t.date);
    // Scroll to form for better visibility
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.2em] mb-1">Total Available Balance</p>
            <h2 className="text-4xl font-black mb-6">৳{totalFund.toLocaleString()}</h2>
            <div className="flex space-x-4">
              <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Inflow</p>
                <p className="text-lg font-bold">৳{transactions.filter(t => t.type === 'COLLECTION').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Outflow</p>
                <p className="text-lg font-bold">৳{transactions.filter(t => t.type === 'PAYMENT').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className={`bg-white p-8 rounded-[2.5rem] border transition-all ${editingId ? 'border-amber-400 ring-2 ring-amber-50 shadow-xl' : 'border-slate-200 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                {editingId ? <Edit2 className="mr-2 text-amber-500" size={20} /> : <PlusCircle className="mr-2 text-indigo-600" size={20} />}
                {editingId ? 'Update Entry' : 'Add to Collector Fund'}
              </h3>
              {editingId && (
                <button onClick={resetForm} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount (TK)</label>
                <input 
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <input 
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800"
                  placeholder="e.g. Daily Collection"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Transaction Date</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800"
                />
              </div>
              <button 
                type="submit"
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-2 ${
                  editingId 
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100 text-white' 
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200 text-white'
                }`}
              >
                {editingId ? <Save size={18} /> : <PlusCircle size={18} />}
                <span>{editingId ? 'Save Changes' : 'Confirm Entry'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transaction Log */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center">
                  <History className="mr-3 text-indigo-600" size={24} />
                  Fund History
                </h3>
              </div>
              <div className="hidden sm:flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Info size={12} className="mr-2 text-indigo-400" />
                Manual edits enabled for Collections
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-left">Date</th>
                    <th className="px-6 py-5 text-left">Details</th>
                    <th className="px-6 py-5 text-center">Flow</th>
                    <th className="px-6 py-5 text-right">Amount</th>
                    <th className="px-8 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-medium">
                        No transactions found. Start by adding a collection.
                      </td>
                    </tr>
                  ) : (
                    sortedTransactions.map(t => (
                      <tr key={t.id} className={`hover:bg-slate-50/50 transition-colors ${editingId === t.id ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm font-black text-slate-800 leading-tight mb-1">{t.description}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                            t.type === 'PAYMENT' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {t.type === 'PAYMENT' ? 'Auto-Payout' : 'Manual Entry'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            t.type === 'COLLECTION' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {t.type === 'COLLECTION' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                            {t.type}
                          </div>
                        </td>
                        <td className={`px-6 py-6 text-right font-black text-base ${t.type === 'COLLECTION' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'COLLECTION' ? '+' : '-'}৳{t.amount.toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-center">
                          {t.type === 'COLLECTION' ? (
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => handleEdit(t)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Edit Entry"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => onDeleteCollection(t.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Entry"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 italic">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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