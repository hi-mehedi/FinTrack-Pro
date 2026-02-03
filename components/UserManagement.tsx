import React, { useState } from 'react';
import { User, PaymentRecord } from '../types';
// Added 'Users' to the lucide-react import list
import { UserPlus, Edit2, Trash2, X, ChevronRight, Calendar, Info, ArrowUpRight, ArrowDownRight, CheckCircle2, History, Users } from 'lucide-react';

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Staff Directory</h2>
          <p className="text-slate-500 font-medium">Manage employees and view their financial ledgers.</p>
        </div>
        <button onClick={() => { setSelectedUser(null); setFormData({name:'', dailyTarget:'', daysWorked:''}); setIsModalOpen(true); }} className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <UserPlus size={20} />
          <span>Add New Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed flex flex-col items-center justify-center text-slate-400">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No staff members added yet.</p>
          </div>
        ) : users.map(user => {
          const userPayments = payments.filter(p => p.userId === user.id);
          const totalPaid = userPayments.reduce((a, b) => a + b.amountPaid, 0);
          const totalExpected = user.dailyTarget * user.daysWorked;
          const totalDue = totalExpected - totalPaid;

          return (
            <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg">{user.name.charAt(0)}</div>
                <div className="flex space-x-1">
                  <button onClick={() => openEdit(user)} className="p-2 text-slate-300 hover:text-indigo-600"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(user.id)} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-1">{user.name}</h3>
              <div className="flex items-center text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                <Calendar size={12} className="mr-1"/> {user.daysWorked} Days Calculated
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Daily Wage</p>
                  <p className="font-black text-slate-800">৳{user.dailyTarget}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Earned Total</p>
                  <p className="font-black text-indigo-700">৳{totalExpected}</p>
                </div>
              </div>

              <button 
                onClick={() => openLedger(user)}
                className={`w-full p-4 rounded-2xl flex justify-between items-center group/btn transition-all ${totalDue > 0 ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
              >
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase tracking-wider">{totalDue > 0 ? 'Balance Due' : 'Status: Cleared'}</p>
                   <p className="font-black text-lg">৳{Math.abs(totalDue).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">
                  <span>View Ledger</span>
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Ledger Modal - Date Wise Details */}
      {isLedgerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-start bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-900">{selectedUser.name}</h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Employee Salary Ledger</p>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-50 border transition-colors"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Expected Rate</p>
                      <p className="text-xl font-black">৳{selectedUser.dailyTarget}</p>
                   </div>
                   <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Paid to Date</p>
                      <p className="text-xl font-black text-emerald-700">৳{payments.filter(p => p.userId === selectedUser.id).reduce((a,b)=>a+b.amountPaid,0).toLocaleString()}</p>
                   </div>
                   <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Working Days</p>
                      <p className="text-xl font-black text-indigo-700">{selectedUser.daysWorked}</p>
                   </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center mb-6">
                    <History className="mr-2" size={14}/> Daily Activity Detail
                  </h4>

                  <div className="space-y-3">
                    {payments
                      .filter(p => p.userId === selectedUser.id)
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(p => {
                        const diff = p.amountPaid - selectedUser.dailyTarget;
                        return (
                          <div key={p.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-100 transition-all hover:shadow-sm">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                                <Calendar size={18}/>
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800">{new Date(p.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference: Manual Payout</p>
                              </div>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-black text-slate-900">৳{p.amountPaid.toLocaleString()}</p>
                               {diff > 0 ? (
                                 <span className="inline-flex items-center text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">
                                   <ArrowUpRight size={10} className="mr-1"/> ৳{diff} Extra
                                 </span>
                               ) : diff < 0 ? (
                                 <span className="inline-flex items-center text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-full uppercase tracking-tighter">
                                   <ArrowDownRight size={10} className="mr-1"/> ৳{Math.abs(diff)} Due
                                 </span>
                               ) : (
                                 <span className="inline-flex items-center text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-tighter">
                                   <CheckCircle2 size={10} className="mr-1"/> Balanced
                                 </span>
                               )}
                            </div>
                          </div>
                        );
                      })}
                    {payments.filter(p => p.userId === selectedUser.id).length === 0 && (
                      <div className="text-center py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                         <History size={40} className="mx-auto mb-3 opacity-10" />
                         <p className="text-sm font-bold text-slate-400">No daily payment history recorded.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t flex justify-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End of Record</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in slide-in-from-bottom duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6">{selectedUser ? 'Edit Profile' : 'New Staff Member'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Display Name</label>
                <input 
                  autoFocus
                  placeholder="Employee Name" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Daily Wage (৳)</label>
                  <input 
                    type="number" placeholder="500" 
                    className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold"
                    value={formData.dailyTarget}
                    onChange={e => setFormData({...formData, dailyTarget: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Total Days</label>
                  <input 
                    type="number" placeholder="0" 
                    className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold"
                    value={formData.daysWorked}
                    onChange={e => setFormData({...formData, daysWorked: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center space-x-4">
                <Info size={20} className="text-indigo-400" />
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase">Calculated Earnings</p>
                  <p className="text-lg font-black text-indigo-900">৳{(parseFloat(formData.dailyTarget) || 0) * (parseInt(formData.daysWorked) || 0)}</p>
                </div>
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                <button type="submit" className="flex-2 py-4 px-8 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;