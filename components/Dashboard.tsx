
import React from 'react';
import { User, PaymentRecord, FundTransaction } from '../types';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  users: User[];
  payments: PaymentRecord[];
  totalFund: number;
  transactions: FundTransaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ users, payments, totalFund, transactions }) => {
  const totalPaid = payments.reduce((acc, p) => acc + p.amountPaid, 0);
  const totalDue = payments.reduce((acc, p) => acc + p.dueAmount, 0);

  const chartData = users.map(user => {
    const userPayments = payments.filter(p => p.userId === user.id);
    const paid = userPayments.reduce((acc, p) => acc + p.amountPaid, 0);
    return {
      name: user.name,
      paid: paid,
      salary: user.monthlySalary
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Fund" 
          value={`৳${totalFund.toLocaleString()}`} 
          icon={<DollarSign className="text-indigo-600" />} 
          color="bg-indigo-50" 
        />
        <StatCard 
          title="Total Paid" 
          value={`৳${totalPaid.toLocaleString()}`} 
          icon={<TrendingUp className="text-emerald-600" />} 
          color="bg-emerald-50" 
        />
        <StatCard 
          title="Total Dues" 
          value={`৳${totalDue.toLocaleString()}`} 
          icon={<Clock className="text-rose-600" />} 
          color="bg-rose-50" 
        />
        <StatCard 
          title="Active Users" 
          value={users.length.toString()} 
          icon={<Users className="text-amber-600" />} 
          color="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">User Payment Summary</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="paid" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Breakdown List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Highlights</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px] pr-2">
            {users.length === 0 ? (
              <p className="text-slate-400 text-center py-8 italic">No users registered yet.</p>
            ) : (
              users.map(user => {
                const userPayments = payments.filter(p => p.userId === user.id);
                const paid = userPayments.reduce((acc, p) => acc + p.amountPaid, 0);
                const percentage = Math.min(100, (paid / user.monthlySalary) * 100);
                return (
                  <div key={user.id} className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-700">{user.name}</span>
                      <span className="text-slate-500">৳{paid.toLocaleString()} / ৳{user.monthlySalary.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button className="mt-6 w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors">
            Generate Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

export default Dashboard;
