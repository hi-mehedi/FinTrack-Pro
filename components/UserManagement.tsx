
import React, { useState } from 'react';
import { User, PaymentRecord } from '../types';
import { Plus, Edit2, Trash2, UserPlus, Calculator, Users, History, X, TrendingUp, AlertCircle } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  payments: PaymentRecord[];
  onAdd: (name: string, dailyTarget: number, daysWorked: number) => void;
  onUpdate: (id: string, name: string, dailyTarget: number, daysWorked: number) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, payments, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', dailyTarget: '', daysWorked: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(formData.dailyTarget);
    const days = parseInt(formData.daysWorked);
    if (!formData.name || isNaN(target)) return;

    if (editingUser) {
      onUpdate(editingUser.id, formData.name, target, days || 0);
    } else {
      onAdd(formData.name, target, days || 0);
    }
    setIsModalOpen(false);
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, dailyTarget: user.dailyTarget.toString(), daysWorked: user.daysWorked.toString() });
    } else {
      setEditingUser(null);
      setFormData({ name: '', dailyTarget: '', daysWorked: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Employees</h2>
          <p className="text-slate-500 font-medium">Target-based salary management.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100">
          <UserPlus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => {
          const totalSalary = user.dailyTarget * user.daysWorked;
          const userPayments = payments.filter(p => p.userId === user.id);
          const paid = userPayments.reduce((a, b) => a + b.amountPaid, 0);
          const due = totalSalary - paid;

          return (
            <div key={user.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group">
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">{user.name.charAt(0)}</div>
                <div className="flex space-x-2">
                  <button onClick={() => openModal(user)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(user.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-800">{user.name}</h3>
              <p className="text-xs text-slate-400 mb-4 font-bold uppercase tracking-widest">{user.daysWorked} Days Worked</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Daily Target</p>
                  <p className="font-bold text-slate-800">৳{user.dailyTarget}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-xl">
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Real Salary</p>
                  <p className="font-black text-indigo-700">৳{totalSalary}</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl flex justify-between items-center ${due > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest">{due > 0 ? 'Pending Due' : 'Cleared'}</span>
                <span className="font-black">৳{Math.abs(due)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-6">{editingUser ? 'Edit Staff' : 'New Staff'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                placeholder="Full Name" 
                className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" placeholder="Daily Target" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold"
                  value={formData.dailyTarget}
                  onChange={e => setFormData({...formData, dailyTarget: e.target.value})}
                />
                <input 
                  type="number" placeholder="Days Worked" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold"
                  value={formData.daysWorked}
                  onChange={e => setFormData({...formData, daysWorked: e.target.value})}
                />
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-800 font-bold text-sm">
                Total Salary: ৳{(parseFloat(formData.dailyTarget) || 0) * (parseInt(formData.daysWorked) || 0)}
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
