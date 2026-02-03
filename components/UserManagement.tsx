
import React, { useState } from 'react';
import { User, PaymentRecord } from '../types';
import { 
  Plus, Edit2, Trash2, UserPlus, Calculator, Users, 
  History, X, TrendingDown, TrendingUp, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  payments: PaymentRecord[];
  onAdd: (name: string, salary: number) => void;
  onUpdate: (id: string, name: string, salary: number) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, payments, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', salary: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salaryNum = parseFloat(formData.salary);
    if (!formData.name || isNaN(salaryNum)) return;

    if (editingUser) {
      onUpdate(editingUser.id, formData.name, salaryNum);
    } else {
      onAdd(formData.name, salaryNum);
    }
    closeModal();
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, salary: user.monthlySalary.toString() });
    } else {
      setEditingUser(null);
      setFormData({ name: '', salary: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', salary: '' });
  };

  const openHistory = (user: User) => {
    setHistoryUser(user);
  };

  const closeHistory = () => {
    setHistoryUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Directory</h2>
          <p className="text-slate-500">Manage employees and view their financial history.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <UserPlus size={20} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.length === 0 ? (
          <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
            <Users size={48} className="mb-4 opacity-20" />
            <p>No users found. Start by adding one!</p>
          </div>
        ) : (
          users.map(user => {
            const userPayments = payments.filter(p => p.userId === user.id);
            const totalPaid = userPayments.reduce((acc, p) => acc + p.amountPaid, 0);
            const totalDue = userPayments.reduce((acc, p) => acc + p.dueAmount, 0);

            return (
              <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col group hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openHistory(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View History">
                      <History size={16} />
                    </button>
                    <button onClick={() => openModal(user)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit User">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(user.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete User">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">{user.name}</h4>
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${totalDue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {totalDue > 0 ? `৳${Math.round(totalDue)} Due` : totalDue < 0 ? `৳${Math.abs(Math.round(totalDue))} Extra` : 'Paid Full'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly</p>
                    <p className="text-base font-bold text-slate-800">৳{user.monthlySalary.toLocaleString()}</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Paid to date</p>
                    <p className="text-base font-bold text-indigo-700">৳{totalPaid.toLocaleString()}</p>
                  </div>
                </div>

                <button 
                  onClick={() => openHistory(user)}
                  className="mt-auto w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center space-x-2"
                >
                  <History size={16} />
                  <span>Detailed History</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {editingUser ? 'Update User' : 'New User Profile'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Rahim Ahmed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Salary (TK)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. 15000"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ৳
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 flex items-center">
                    <Calculator size={12} className="mr-1" />
                    Daily wage will be: ৳{formData.salary ? Math.round(parseFloat(formData.salary) / 30) : 0}
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    {editingUser ? 'Save Changes' : 'Create Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                  {historyUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{historyUser.name}'s History</h3>
                  <p className="text-xs text-slate-500 font-medium">Monthly Salary: ৳{historyUser.monthlySalary.toLocaleString()} (Daily: ৳{Math.round(historyUser.dailyWage)})</p>
                </div>
              </div>
              <button onClick={closeHistory} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {(() => {
                  const userPayments = payments.filter(p => p.userId === historyUser.id);
                  const totalPaid = userPayments.reduce((acc, p) => acc + p.amountPaid, 0);
                  const totalDue = userPayments.reduce((acc, p) => acc + p.dueAmount, 0);
                  return (
                    <>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><TrendingUp size={20} /></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
                          <p className="text-lg font-black text-slate-800">৳{totalPaid.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalDue >= 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {totalDue >= 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{totalDue >= 0 ? 'Current Due' : 'Balance Extra'}</p>
                          <p className={`text-lg font-black ${totalDue >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>৳{Math.abs(Math.round(totalDue)).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                          <p className="text-lg font-black text-slate-800">{totalDue <= 0 ? 'Clear' : 'Pending'}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Daily Target</th>
                      <th className="px-6 py-4">Amount Paid</th>
                      <th className="px-6 py-4 text-right">Balance Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments
                      .filter(p => p.userId === historyUser.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((p, idx) => {
                        const isDue = p.dueAmount > 0;
                        const isExtra = p.dueAmount < 0;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                              {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                              ৳{Math.round(p.expectedAmount)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-black text-slate-900">৳{p.amountPaid}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isDue ? (
                                <span className="inline-flex items-center text-rose-600 font-bold text-xs bg-rose-50 px-2 py-1 rounded-lg">
                                  <AlertCircle size={12} className="mr-1" />
                                  ৳{Math.round(p.dueAmount)} Due
                                </span>
                              ) : isExtra ? (
                                <span className="inline-flex items-center text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                                  <TrendingUp size={12} className="mr-1" />
                                  ৳{Math.abs(Math.round(p.dueAmount))} Extra
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                                  <CheckCircle2 size={12} className="mr-1" />
                                  Paid Full
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    }
                    {payments.filter(p => p.userId === historyUser.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No transaction history found for this user.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-white border-t border-slate-100 flex justify-end sticky bottom-0 z-10">
              <button 
                onClick={closeHistory}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
