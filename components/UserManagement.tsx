
import React, { useState, useMemo } from 'react';
import { User, PaymentRecord } from '../types';
import { Edit2, Trash2, X, ChevronRight, Plus, History, Calendar, TrendingUp } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  payments: PaymentRecord[];
  selectedMonth: number;
  onAdd: (name: string, dailyTarget: number, daysWorked: number) => void;
  onUpdate: (id: string, name: string, dailyTarget: number, daysWorked: number) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, payments, selectedMonth, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', dailyTarget: '', daysWorked: '' });
  const currentYear = new Date().getFullYear();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dailyTarget) return;
    onUpdate ? (selectedUser && !isLedgerOpen ? onUpdate(selectedUser.id, formData.name, parseFloat(formData.dailyTarget), parseInt(formData.daysWorked) || 0) : onAdd(formData.name, parseFloat(formData.dailyTarget), parseInt(formData.daysWorked) || 0)) : null;
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
    <div className="space-y-8 view-animate pb-10">
      <div className="flex flex-col space-y-2">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Staff Administration</p>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Personnel Directory</h2>
          <div className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            {months[selectedMonth]} {currentYear}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="px-2 text-slate-500 font-bold text-sm">
          Tracking daily income and extra/due payments for <b>{months[selectedMonth]}</b>. Working days auto-counted.
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setFormData({name:'', dailyTarget:'', daysWorked:''}); setIsModalOpen(true); }} 
          className="flex items-center justify-center space-x-3 bg-indigo-600 text-white px-8 py-6 rounded-[2.5rem] font-black active-scale text-sm shadow-xl shadow-indigo-100 uppercase tracking-widest"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add Personnel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => {
          const userPayments = payments.filter(p => p.userId === user.id);
          const monthPayments = userPayments.filter(p => {
            const d = new Date(p.date);
            return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
          });
          
          const monthPaid = monthPayments.reduce((a, b) => a + b.amountPaid, 0);
          const monthDaysWorked = monthPayments.reduce((a, b) => a + (b.daysPaid || 0), 0);
          const expectedMonthIncome = user.dailyTarget * monthDaysWorked;
          const monthBalance = expectedMonthIncome - monthPaid;

          return (
            <div key={user.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group transition-all hover:border-indigo-200">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl border border-indigo-100">
                  {user.name.charAt(0)}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEdit(user)} className="p-3 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"><Edit2 size={18} /></button>
                  <button onClick={() => onDelete(user.id)} className="p-3 text-slate-400 hover:text-rose-600 rounded-2xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-2 truncate leading-tight">{user.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-lg border tracking-[0.1em] ${
                    monthBalance <= 0 ? (monthBalance === 0 ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {monthBalance <= 0 ? (monthBalance === 0 ? 'SETTLED' : `৳${Math.abs(monthBalance)} EXTRA`) : `৳${monthBalance} DUE`}
                  </span>
                  <span className="text-[9px] font-black px-3 py-1 rounded-lg border border-slate-100 bg-slate-50 text-slate-500 uppercase tracking-widest">
                    Daily Income: ৳{user.dailyTarget}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-6 rounded-[1.75rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest leading-none">Working Days</p>
                  <p className="text-lg font-black text-slate-900">{monthDaysWorked} Days</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">This Month</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[1.75rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest leading-none">Total Paid</p>
                  <p className="text-lg font-black text-indigo-600">৳{monthPaid.toLocaleString()}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Expected: ৳{expectedMonthIncome}</p>
                </div>
              </div>

              <button 
                onClick={() => openLedger(user)}
                className="w-full p-6 bg-slate-50 border border-slate-100 text-slate-900 rounded-[1.75rem] flex justify-between items-center transition-all hover:bg-white active-scale group"
              >
                <div className="flex items-center space-x-3">
                  <History size={18} className="text-indigo-500" />
                  <span className="font-black text-xs uppercase tracking-widest">{months[selectedMonth]} Details</span>
                </div>
                <ChevronRight size={18} strokeWidth={3} className="text-slate-300 group-hover:text-indigo-500" />
              </button>
            </div>
          );
        })}
      </div>

      {isLedgerOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4 view-animate">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-10 py-10 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selectedUser.name} History</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Month Audit: {months[selectedMonth]}</p>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="p-3 bg-slate-100 rounded-2xl active-scale"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 no-scrollbar bg-white">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center">
                      <p className="text-[9px] font-black text-indigo-600 uppercase mb-1 tracking-widest">Total Days Worked</p>
                      <p className="text-2xl font-black text-indigo-700">
                        {payments.filter(p => {
                          const d = new Date(p.date);
                          return p.userId === selectedUser.id && d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
                        }).reduce((a, b) => a + (b.daysPaid || 0), 0)}
                      </p>
                   </div>
                   <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
                      <p className="text-[9px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Current Balance</p>
                      <p className="text-xl font-black text-emerald-700">
                        {(() => {
                           const mPayments = payments.filter(p => {
                             const d = new Date(p.date);
                             return p.userId === selectedUser.id && d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
                           });
                           const totalPaid = mPayments.reduce((a, b) => a + b.amountPaid, 0);
                           const totalExpected = mPayments.reduce((a, b) => a + (b.daysPaid * selectedUser.dailyTarget), 0);
                           const bal = totalExpected - totalPaid;
                           return bal <= 0 ? (bal === 0 ? "Settled" : `৳${Math.abs(bal)} Ex`) : `৳${bal} Due`;
                        })()}
                      </p>
                   </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payment Audit (Date-wise)</h4>
                  <div className="space-y-4">
                    {payments
                      .filter(p => {
                        const d = new Date(p.date);
                        return p.userId === selectedUser.id && d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
                      })
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(p => {
                        const expected = p.daysPaid * selectedUser.dailyTarget;
                        const diff = p.amountPaid - expected;
                        const status = diff === 0 ? 'SETTLED' : diff < 0 ? 'DUE' : 'EXTRA';

                        return (
                          <div key={p.id} className="p-6 bg-slate-50/50 rounded-[1.75rem] border border-slate-100 flex flex-col space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-xl text-slate-400 border border-slate-100">
                                  <Calendar size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-900">{new Date(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">{p.daysPaid || 0} Working Days</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-black text-slate-900 leading-none mb-1">৳{p.amountPaid.toLocaleString()}</p>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border inline-block ${
                                  status === 'DUE' ? 'bg-rose-50 text-rose-600 border-rose-100' : status === 'EXTRA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-200 text-slate-500 border-transparent'
                                }`}>
                                  {status === 'DUE' ? `৳${Math.abs(diff)} Due` : status === 'EXTRA' ? `৳${diff} Extra` : 'Settled'}
                                </span>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                               <span>Expected for {p.daysPaid}d: ৳{expected.toLocaleString()}</span>
                               <span className="text-indigo-500 font-black">Wage: ৳{selectedUser.dailyTarget}/d</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-10 py-8 bg-white border-t border-slate-50">
              <button onClick={() => setIsLedgerOpen(false)} className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.75rem] uppercase tracking-widest text-xs active-scale">Close View</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 view-animate">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 border border-slate-100">
            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">{selectedUser ? 'Edit Staff' : 'Register Staff'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Full Name</label>
                <input 
                  placeholder="e.g. Salim Ahmed" 
                  className="w-full"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Daily Income (Wage)</label>
                <input 
                  type="number" placeholder="৳500" 
                  className="w-full"
                  value={formData.dailyTarget}
                  onChange={e => setFormData({...formData, dailyTarget: e.target.value})}
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl">
                  {selectedUser ? 'Save' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="py-10 text-center border-t border-slate-50">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Developed By</p>
        <p className="text-xs font-black text-slate-800 mt-1 uppercase tracking-wider">Mehedi Hasan Soumik</p>
      </div>
    </div>
  );
};

export default UserManagement;
