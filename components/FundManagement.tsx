
import React, { useState } from 'react';
import { FundTransaction } from '../types';
import { PlusCircle, ArrowUpRight, ArrowDownRight, History, Info } from 'lucide-react';

interface FundManagementProps {
  transactions: FundTransaction[];
  totalFund: number;
  onAddCollection: (amount: number, date: string, desc: string) => void;
}

const FundManagement: React.FC<FundManagementProps> = ({ transactions, totalFund, onAddCollection }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onAddCollection(parseFloat(amount), date, description);
    setAmount('');
    setDescription('');
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
            <p className="text-indigo-100 font-medium mb-1">Total Available Balance</p>
            <h2 className="text-4xl font-black mb-6">৳{totalFund.toLocaleString()}</h2>
            <div className="flex space-x-4">
              <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md">
                <p className="text-xs text-indigo-200 mb-1">Total Inflow</p>
                <p className="font-bold">৳{transactions.filter(t => t.type === 'COLLECTION').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md">
                <p className="text-xs text-indigo-200 mb-1">Total Outflow</p>
                <p className="font-bold">৳{transactions.filter(t => t.type === 'PAYMENT').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <PlusCircle className="mr-2 text-indigo-600" size={20} />
              Add to Collector Fund
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Received (TK)</label>
                <input 
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <input 
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Daily Collection"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Add to Fund
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transaction Log */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 flex items-center">
                <History className="mr-3 text-indigo-600" size={24} />
                Fund History
              </h3>
              <div className="flex items-center text-xs text-slate-400 font-medium">
                <Info size={14} className="mr-1" />
                All transactions are logged here
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px]">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-8 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Description</th>
                    <th className="px-6 py-4 text-center">Type</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    sortedTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-medium text-slate-600 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-800 leading-tight">{t.description}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight">{t.type === 'PAYMENT' ? 'Auto-deducted' : 'Manual entry'}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                            t.type === 'COLLECTION' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {t.type === 'COLLECTION' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                            {t.type}
                          </span>
                        </td>
                        <td className={`px-8 py-5 text-right font-black ${t.type === 'COLLECTION' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'COLLECTION' ? '+' : '-'}৳{t.amount.toLocaleString()}
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
