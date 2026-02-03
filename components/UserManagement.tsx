import React, { useState } from 'react';
import { User, PaymentRecord } from '../types';
import { UserPlus, Edit2, Trash2, X, ChevronRight, Calendar, Info, ArrowUpRight, ArrowDownRight, CheckCircle2, History, Users, Wallet, Plus, Star } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  payments: PaymentRecord[];
  onAdd: (name: string, dailyTarget: number, daysWorked: number) => void;
  onUpdate: (id: string, name: string, dailyTarget: number, daysWorked: number) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, payments, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', dailyTarget: '', daysWorked: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dailyTarget) return;
    if (selectedUser && !isLedgerOpen) {
      onUpdate(selectedUser.id, formData.name, parseFloat(formData.dailyTarget), parseInt(formData.daysWorked) || 0);
    } else {
      onAdd(formData.name, parseFloat(formData.dailyTarget), parseInt(formData.daysWorked) || 0);
    }
    setIsModalOpen(false);
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, dailyTarget: user.dailyTarget.toString(), daysWorked: user.daysWorked.toString() });
    setIsLedgerOpen(false);
    setIsModalOpen(true);
  };

  const openLedger = (user: User) => {
    setSelectedUser(user);
    setIsLedgerOpen(true);
  };

  return (
    <div className="space-y-8 animate-reveal">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Staff Directory</h2>
          <p className="text-slate-500 font-semibold text-sm mt-1">Manage personnel and detailed salary disbursements.</p>
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setFormData({name:'', dailyTarget:'', daysWorked:''}); setIsModalOpen(true); }} 
          className="flex items-center justify-center space-x-3 bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-bold shadow-2xl shadow-slate-200 transition-all hover:bg-slate-800 active-scale group"
        >
          <div className="p-1 bg-white/20 rounded-full group-hover:rotate-90 transition-transform">
            <Plus size={20} strokeWidth={3} />
          </div>
          <span>Register Employee</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.length === 0 ? (
          <div className="col-span-full py-32 bg-white/50 backdrop-blur rounded-[4rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
            <Users size={60} className="mb-6 opacity-20" />
            <p className="text-lg font-bold">No active employees recorded.</p>
          </div>
        ) : users.map(user => {
          const userPayments = payments.filter(p => p.userId === user.id);
          const totalPaid = userPayments.reduce((a, b) => a + b.amountPaid, 0);
          const totalExpected = user.dailyTarget * user.daysWorked;
          const balanceAmount = totalExpected - totalPaid;
          const isExtra = balanceAmount < 0;
          const isBalanced = balanceAmount === 0;
          const isDue = balanceAmount > 0;

          return (
            <div key={user.id} className="bento-card bg-white p-8 rounded-[4rem] border border-slate-100 shadow-sm relative group">
              <div className={`absolute top-0 left-0 w-full h-2.5 rounded-t-[4rem] transition-colors ${isExtra ? 'bg-emerald-500' : isBalanced ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center font-black text-2xl text-slate-900 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  {user.name.charAt(0)}
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => openEdit(user)} className="p-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active-scale"><Edit2 size={20} /></button>
                  <button onClick={() => onDelete(user.id)} className="p-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active-scale"><Trash2 size={20} /></button>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 mb-1 leading-tight">{user.name}</h3>
              <div className="flex items-center text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-8">
                <Calendar size={14} className="mr-2 text-indigo-400"/> {user.daysWorked} Working Days
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-[2.5rem] border border-white">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Wage Rate</p>
                  <p className="text-xl font-black text-slate-900 leading-none">৳{user.dailyTarget}</p>
                </div>
                <div className="bg-indigo-50 p-5 rounded-[2.5rem] border border-indigo-100/30">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Earned</p>
                  <p className="text-xl font-black text-indigo-700 leading-none">৳{totalExpected}</p>
                </div>
              </div>

              <button 
                onClick={() => openLedger(user)}
                className={`w-full p-6 rounded-[2.5rem] flex justify-between items-center transition-all hover:shadow-lg active-scale ${
                  isExtra ? 'bg-emerald-50 text-emerald-700' : isBalanced ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                     {isExtra ? 'Extra Paid' : isBalanced ? 'Settled Status' : 'Due Amount'}
                   </p>
                   <p className="font-black text-2xl leading-none mt-1">৳{Math.abs(balanceAmount).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <ChevronRight size={20} strokeWidth={3} className={isExtra ? 'text-emerald-500' : isBalanced ? 'text-indigo-500' : 'text-rose-500'} />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Ledger Modal */}
      {isLedgerOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-0 sm:p-6 animate-reveal">
          <div className="bg-white w-full max-w-2xl sm:rounded-[4rem] shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[90vh] overflow-hidden">
            <div className="px-8 py-10 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-slate-900 rounded-[2.25rem] flex items-center justify-center text-white shadow-xl">
                   <Star size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedUser.name}</h3>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Salary Transaction Ledger</p>
                </div>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="p-4 bg-white rounded-3xl shadow-sm hover:bg-slate-100 border transition-all active-scale"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Per Day Wage</p>
                      <p className="text-2xl font-black text-slate-900">৳{selectedUser.dailyTarget}</p>
                   </div>
                   <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 text-center">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Total Paid</p>
                      <p className="text-2xl font-black text-emerald-700">৳{payments.filter(p => p.userId === selectedUser.id).reduce((a,b)=>a+b.amountPaid,0).toLocaleString()}</p>
                   </div>
                   <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 text-center">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Attendance</p>
                      <p className="text-2xl font-black text-indigo-700">{selectedUser.daysWorked} Days</p>
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
                      <History className="mr-3" size={16}/> Daily Activity Log
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {payments
                      .filter(p => p.userId === selectedUser.id)
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(p => {
                        const dailyDiff = p.amountPaid - selectedUser.dailyTarget;
                        const isExtraDay = dailyDiff > 0;
                        const isDueDay = dailyDiff < 0;

                        return (
                          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] hover:bg-white border border-transparent hover:border-slate-100 transition-all hover:shadow-md gap-6">
                            <div className="flex items-center space-x-5">
                              <div className="w-14 h-14 bg-white rounded-[1.75rem] flex items-center justify-center text-slate-300 shadow-sm border border-slate-50">
                                <Calendar size={24}/>
                              </div>
                              <div>
                                <p className="text-lg font-black text-slate-800">{new Date(p.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry UID: #{p.id.slice(0,8)}</p>
                              </div>
                            </div>
                            <div className="flex sm:flex-col justify-between items-center sm:items-end gap-2">
                               <p className="text-2xl font-black text-slate-900">৳{p.amountPaid.toLocaleString()}</p>
                               {isExtraDay ? (
                                 <span className="flex items-center text-[10px] font-black bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl uppercase border border-emerald-200">
                                   <ArrowUpRight size={12} className="mr-1.5"/> ৳{dailyDiff} Extra
                                 </span>
                               ) : isDueDay ? (
                                 <span className="flex items-center text-[10px] font-black bg-rose-100 text-rose-700 px-4 py-2 rounded-2xl uppercase border border-rose-200">
                                   <ArrowDownRight size={12} className="mr-1.5"/> ৳{Math.abs(dailyDiff)} Due
                                 </span>
                               ) : (
                                 <span className="flex items-center text-[10px] font-black bg-slate-100 text-slate-500 px-4 py-2 rounded-2xl uppercase">
                                   <CheckCircle2 size={12} className="mr-1.5"/> Balanced Day
                                 </span>
                               )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security: End-to-End Encrypted</p>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-10 animate-reveal">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedUser ? 'Edit Details' : 'New Employee'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Employee Name</label>
                <input 
                  autoFocus
                  placeholder="Full Name" 
                  className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none font-bold focus:bg-white focus:border-indigo-500 transition-all text-lg shadow-inner"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Daily Rate (৳)</label>
                  <input 
                    type="number" placeholder="500" 
                    className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none font-bold focus:bg-white focus:border-indigo-500 transition-all text-lg shadow-inner"
                    value={formData.dailyTarget}
                    onChange={e => setFormData({...formData, dailyTarget: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">Days Logged</label>
                  <input 
                    type="number" placeholder="0" 
                    className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none font-bold focus:bg-white focus:border-indigo-500 transition-all text-lg shadow-inner"
                    value={formData.daysWorked}
                    onChange={e => setFormData({...formData, daysWorked: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="p-6 bg-indigo-50 rounded-[2.5rem] flex items-center space-x-5 border border-indigo-100/50 shadow-inner">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                  <Info size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Calculated Payout</p>
                  <p className="text-2xl font-black text-indigo-900 leading-none mt-1">৳{(parseFloat(formData.dailyTarget) || 0) * (parseInt(formData.daysWorked) || 0)}</p>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                <button type="submit" className="flex-[2] py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl shadow-slate-100 transition-all active-scale">
                  {selectedUser ? 'Save Update' : 'Finish Setup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;