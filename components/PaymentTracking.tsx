
import React, { useState, useMemo } from 'react';
import { User, PaymentRecord } from '../types';
import { Search, Calendar, CreditCard, ChevronRight, AlertCircle, Edit2, X, AlertTriangle } from 'lucide-react';

interface PaymentTrackingProps {
  users: User[];
  payments: PaymentRecord[];
  onAddPayment: (userId: string, date: string, amount: number) => void;
  onUpdatePayment: (paymentId: string, amount: number, date: string) => void;
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ users, payments, onAddPayment, onUpdatePayment }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  const selectedUser = users.find(u => u.id === selectedUserId);

  // Check if a payment already exists for this user on this date
  const existingPaymentOnDate = useMemo(() => {
    if (!selectedUserId || !paymentDate) return null;
    return payments.find(p => p.userId === selectedUserId && p.date === paymentDate);
  }, [payments, selectedUserId, paymentDate]);

  const isDuplicate = !!existingPaymentOnDate && editingPaymentId !== existingPaymentOnDate.id;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !paymentAmount || isDuplicate) return;

    if (editingPaymentId) {
      onUpdatePayment(editingPaymentId, parseFloat(paymentAmount), paymentDate);
    } else {
      onAddPayment(selectedUserId, paymentDate, parseFloat(paymentAmount));
    }

    resetForm();
  };

  const resetForm = () => {
    setPaymentAmount('');
    setSelectedUserId('');
    setEditingPaymentId(null);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setSearchTerm('');
  };

  const startEdit = (payment: PaymentRecord) => {
    setEditingPaymentId(payment.id);
    setSelectedUserId(payment.userId);
    setPaymentAmount(payment.amountPaid.toString());
    setPaymentDate(payment.date);
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Get recent history
  const history = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Payment Form */}
      <div className="space-y-6">
        <div className={`bg-white p-8 rounded-3xl border ${editingPaymentId ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-xl' : 'border-slate-200 shadow-sm'} transition-all`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <CreditCard className={`mr-2 ${editingPaymentId ? 'text-indigo-600' : 'text-slate-400'}`} size={24} />
              {editingPaymentId ? 'Update Payment Entry' : 'Daily Payment Entry'}
            </h3>
            {editingPaymentId && (
              <button 
                onClick={resetForm}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                title="Cancel Edit"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          <form onSubmit={handlePay} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {editingPaymentId ? 'Updating Payment for:' : 'Select User'}
              </label>
              
              {!editingPaymentId ? (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Search user..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">No matching users found.</p>
                    ) : (
                      filteredUsers.map(user => (
                        <label 
                          key={user.id} 
                          className={`flex items-center p-3 cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}
                        >
                          <input 
                            type="radio" 
                            name="user" 
                            className="hidden" 
                            onChange={() => setSelectedUserId(user.id)}
                            checked={selectedUserId === user.id}
                          />
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold mr-3">
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold">{user.name}</p>
                            <p className="text-xs opacity-60">Daily Wage: ৳{Math.round(user.dailyWage)}</p>
                          </div>
                          {selectedUserId === user.id && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                        </label>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                   <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-lg mr-4">
                    {selectedUser?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-indigo-900">{selectedUser?.name}</p>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Editing Entry</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                  <Calendar size={14} className="mr-1" /> Payment Date
                </label>
                <input 
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${isDuplicate ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount to Pay (TK)</label>
                <input 
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={`Daily: ৳${selectedUser ? Math.round(selectedUser.dailyWage) : 0}`}
                />
              </div>
            </div>

            {isDuplicate && !editingPaymentId && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertTriangle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-rose-800">Payment already exists!</p>
                  <p className="text-xs text-rose-600">An entry for <strong>{selectedUser?.name}</strong> on <strong>{new Date(paymentDate).toLocaleDateString()}</strong> is already recorded. Please update it from the history log instead.</p>
                </div>
              </div>
            )}

            {selectedUser && paymentAmount && !isDuplicate && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-600 font-medium">Expected Payment:</span>
                  <span className="font-bold">৳{Math.round(selectedUser.dailyWage)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-600 font-medium">Actual Paid:</span>
                  <span className="font-bold">৳{paymentAmount}</span>
                </div>
                <div className="h-px bg-indigo-200 my-2"></div>
                <div className="flex justify-between text-base">
                  <span className="font-bold text-indigo-900">
                    {parseFloat(paymentAmount) < selectedUser.dailyWage ? 'New Due Amount:' : 'Extra Paid:'}
                  </span>
                  <span className={`font-black ${parseFloat(paymentAmount) < selectedUser.dailyWage ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ৳{Math.abs(Math.round(selectedUser.dailyWage - parseFloat(paymentAmount)))}
                  </span>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={!selectedUserId || isDuplicate}
              className={`w-full py-4 text-white rounded-2xl font-black text-lg transition-all shadow-xl ${
                editingPaymentId 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
              } disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed`}
            >
              {editingPaymentId ? 'Save Changes' : 'Complete Payment'}
            </button>
          </form>
        </div>
      </div>

      {/* History Log */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
            <div className="flex space-x-2">
               <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">History</span>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-2">
            {history.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
                <p>No payments recorded yet.</p>
              </div>
            ) : (
              history.map(p => {
                const user = users.find(u => u.id === p.userId);
                const isCurrentEdit = editingPaymentId === p.id;
                return (
                  <div 
                    key={p.id} 
                    className={`flex items-center p-4 rounded-2xl border transition-all ${
                      isCurrentEdit 
                      ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200' 
                      : 'bg-slate-50 border-slate-100 hover:border-indigo-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 font-black border border-slate-100 mr-4">
                      {user?.name.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-bold text-slate-800">{user?.name || 'Deleted User'}</p>
                        <p className="font-black text-emerald-600">৳{p.amountPaid.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-slate-500 font-medium">
                          {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center space-x-2">
                          {p.dueAmount > 0 ? (
                            <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Due: ৳{Math.round(p.dueAmount)}</span>
                          ) : p.dueAmount < 0 ? (
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Extra: ৳{Math.abs(Math.round(p.dueAmount))}</span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Paid Full</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => startEdit(p)}
                      disabled={!user}
                      className="ml-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all disabled:opacity-30"
                      title="Edit this entry"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracking;
