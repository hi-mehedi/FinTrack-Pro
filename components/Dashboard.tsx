import React, { useState, useMemo } from 'react';
import { User, PaymentRecord, FundTransaction } from '../types';
import { TrendingUp, Users, DollarSign, Clock, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  users: User[];
  payments: PaymentRecord[];
  totalFund: number;
  transactions: FundTransaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ users, payments, totalFund, transactions }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = useMemo(() => {
    const yrs = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) yrs.push(i);
    return yrs;
  }, [currentYear]);

  // Filtered data based on selection
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [payments, selectedMonth, selectedYear]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const monthPaid = filteredPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  const monthDue = filteredPayments.reduce((acc, p) => acc + p.dueAmount, 0);
  
  const monthInflow = filteredTransactions
    .filter(t => t.type === 'COLLECTION')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const monthOutflow = filteredTransactions
    .filter(t => t.type === 'PAYMENT')
    .reduce((acc, t) => acc + t.amount, 0);

  const chartData = users.map(user => {
    const userPayments = filteredPayments.filter(p => p.userId === user.id);
    const paid = userPayments.reduce((acc, p) => acc + p.amountPaid, 0);
    return {
      name: user.name,
      paid: paid,
    };
  }).filter(data => data.paid > 0 || users.length < 10); // Show active or all if list is small

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Month/Year Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Analytics Dashboard</h2>
          <p className="text-slate-500 font-medium">Viewing performance for {months[selectedMonth]} {selectedYear}</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center px-3 border-r border-slate-100">
            <Filter size={16} className="text-slate-400 mr-2" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center px-3">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Cash in Hand" 
          subtitle="Lifetime Balance"
          value={`৳${totalFund.toLocaleString()}`} 
          icon={<DollarSign className="text-indigo-600" />} 
          color="bg-indigo-50" 
        />
        <StatCard 
          title="Paid this Month" 
          subtitle={`${months[selectedMonth]} Payouts`}
          value={`৳${monthPaid.toLocaleString()}`} 
          icon={<TrendingUp className="text-emerald-600" />} 
          color="bg-emerald-50" 
        />
        <StatCard 
          title="Monthly Dues" 
          subtitle="Pending for period"
          value={`৳${monthDue.toLocaleString()}`} 
          icon={<Clock className="text-rose-600" />} 
          color="bg-rose-50" 
        />
        <StatCard 
          title="Month Activity" 
          subtitle="Inflow vs Outflow"
          value={`+৳${(monthInflow - monthOutflow).toLocaleString()}`} 
          icon={<CalendarIcon className="text-amber-600" />} 
          color="bg-amber-50" 
          trend={monthInflow >= monthOutflow ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Payouts: {months[selectedMonth]}</h3>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Employee Breakdown</span>
          </div>
          <div className="h-80 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">
                <p>No transactions recorded for this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                  />
                  <Bar dataKey="paid" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Breakdown List */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Staff Progress</h3>
          <div className="flex-1 space-y-5 overflow-y-auto max-h-[320px] pr-2">
            {users.length === 0 ? (
              <p className="text-slate-400 text-center py-8 italic">No users registered.</p>
            ) : (
              users.map(user => {
                const userPayments = filteredPayments.filter(p => p.userId === user.id);
                const paid = userPayments.reduce((acc, p) => acc + p.amountPaid, 0);
                const percentage = Math.min(100, (paid / user.monthlySalary) * 100);
                return (
                  <div key={user.id} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-700">{user.name}</span>
                      <span className="text-indigo-600">৳{paid.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${percentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{Math.round(percentage)}% of Salary</span>
                      <span>Goal: ৳{user.monthlySalary.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-100">
            Export {months[selectedMonth]} Report
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  subtitle: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string;
  trend?: 'up' | 'down'
}> = ({ title, subtitle, value, icon, color, trend }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend === 'up' ? 'Surplus' : 'Deficit'}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-400 italic">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;