
import React, { useState } from 'react';
import { User, PaymentRecord } from '../types';
import { UserPlus, Edit2, Trash2, X, ChevronRight, Calendar, Info, ArrowUpRight, ArrowDownRight, CheckCircle2, History, Users, Wallet } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Staff Management</h2>
          <p className="text-slate-500 font-medium">Manage employees and view detailed daily ledgers.</p>
        </div>
        <button onClick={() => { setSelectedUser(null); setFormData({name:'', dailyTarget:'', daysWorked:''}); setIsModalOpen(true); }} className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          <UserPlus size={20} />
          <span>Add New Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed flex flex-col items-center justify-center text-slate-400">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No staff members found.</p>
          </div>
        ) : users.map(user => {
          const userPayments = payments.filter(p => p.userId === user.id);
          const totalPaid = userPayments.reduce((a, b) => a + b.amountPaid, 0);
          const totalExpected = user.dailyTarget * user.daysWorked;
          const totalDue = totalExpected - totalPaid;

          return (
            <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg">{user.name.charAt(0)}</div>
                <div className="flex space-x-1">
                  <button onClick={() => openEdit(user)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => onDelete(user.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-1">{user.name}</h3>
              <div className="flex items-center text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">
                <Calendar size={12} className="mr-1.5"/> {user.daysWorked} Days Worked
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-white">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Target Rate</p>
                  <p className="font-black text-slate-800">৳{user.dailyTarget}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl border border-white">
                  <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Total Earned</p>
                  <p className="font-black text-indigo-700">৳{totalExpected}</p>
                </div>
              </div>

              <button 
                onClick={() => openLedger(user)}
                className={`w-full p-5 rounded-[1.75rem] flex justify-between items-center group/btn transition-all active:scale-95 ${totalDue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}
              >
                <div className="text-left">
                   <p className="text-[9px] font-black uppercase tracking-wider opacity-60">{totalDue > 0 ? 'Balance Due' : 'Fully Paid'}</p>
                   <p className="font-black text-xl leading-none mt-1">৳{Math.abs(totalDue).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider">Details</span>
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Ledger Modal - Highly Detailed for Mobile */}
      {isLedgerOpen && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl sm:rounded-[3rem] shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white border rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                   <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{selectedUser.name}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] mt-1.5">Date-Wise Payout History</p>
                </div>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-50 border transition-all active:scale-90"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-center sm:text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Per Day</p>
                      <p className="text-xl font-black">৳{selectedUser.dailyTarget}</p>
                   </div>
                   <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 text-center sm:text-left">
                      <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Total Paid</p>
                      <p className="text-xl font-black text-emerald-700">৳{payments.filter(p => p.userId === selectedUser.id).reduce((a,b)=>a+b.amountPaid,0).toLocaleString()}</p>
                   </div>
                   <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 col-span-2 sm:col-span-1 text-center sm:text-left">
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Work Days</p>
                      <p className="text-xl font-black text-indigo-700">{selectedUser.daysWorked} Days</p>
                   </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center">
                      <History className="mr-2" size={14}/> Transaction Log
                    </h4>
                    <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-lg uppercase">Auto Calculated</span>
                  </div>

                  <div className="space-y-3">
                    {payments
                      .filter(p => p.userId === selectedUser.id)
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(p => {
                        const diff = p.amountPaid - selectedUser.dailyTarget;
                        return (
                          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-[2.25rem] hover:border-indigo-100 transition-all shadow-sm hover:shadow-md gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Calendar size={20}/>
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800">{new Date(p.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.date).getFullYear()}</p>
                              </div>
                            </div>
                            <div className="flex sm:flex-col justify-between items-center sm:items-end">
                               <p className="text-xl font-black text-slate-900">৳{p.amountPaid.toLocaleString()}</p>
                               {diff > 0 ? (
                                 <span className="inline-flex items-center text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl uppercase tracking-tighter border border-emerald-200">
                                   <ArrowUpRight size={10} className="mr-1"/> ৳{diff} Extra Paid
                                 </span>
                               ) : diff < 0 ? (
                                 <span className="inline-flex items-center text-[10px] font-black bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl uppercase tracking-tighter border border-rose-200">
                                   <ArrowDownRight size={10} className="mr-1"/> ৳{Math.abs(diff)} Due
                                 </span>
                               ) : (
                                 <span className="inline-flex items-center text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl uppercase tracking-tighter">
                                   <CheckCircle2 size={10} className="mr-1"/> Balanced Payout
                                 </span>
                               )}
                            </div>
                          </div>
                        );
                      })}
                    {payments.filter(p => p.userId === selectedUser.id).length === 0 && (
                      <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                         <History size={40} className="mx-auto mb-4 opacity-10" />
                         <p className="text-sm font-bold text-slate-400">No payment data for this employee.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t flex justify-center sticky bottom-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FinTrack Pro • Secure Ledger</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in slide-in-from-bottom duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6">{selectedUser ? 'Edit Profile' : 'New Staff'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Name</label>
                <input 
                  autoFocus
                  placeholder="Full Name" 
                  className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all border"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Rate (৳)</label>
                  <input 
                    type="number" placeholder="500" 
                    className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none font-bold focus:bg-white border"
                    value={formData.dailyTarget}
                    onChange={e => setFormData({...formData, dailyTarget: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Days</label>
                  <input 
                    type="number" placeholder="0" 
                    className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none font-bold focus:bg-white border"
                    value={formData.daysWorked}
                    onChange={e => setFormData({...formData, daysWorked: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center space-x-4">
                <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Info size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Calculated Payout</p>
                  <p className="text-lg font-black text-indigo-900">৳{(parseFloat(formData.dailyTarget) || 0) * (parseInt(formData.daysWorked) || 0)}</p>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black shadow-lg shadow-indigo-100 transition-all active:scale-95">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
