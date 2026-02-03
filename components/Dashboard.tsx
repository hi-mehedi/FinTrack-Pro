
import React, { useState, useMemo } from 'react';
import { User, PaymentRecord, FundTransaction, BazarCost } from '../types';
import { TrendingUp, DollarSign, Clock, Calendar as CalendarIcon, Filter, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  users: User[];
  payments: PaymentRecord[];
  totalFund: number;
  transactions: FundTransaction[];
  bazarCosts: BazarCost[];
}

const Dashboard: React.FC<DashboardProps> = ({ users, payments, totalFund, transactions, bazarCosts }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const filteredBazar = useMemo(() => {
    return bazarCosts.filter(b => {
      const d = new Date(b.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [bazarCosts, selectedMonth, selectedYear]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [payments, selectedMonth, selectedYear]);

  const monthBazar = filteredBazar.reduce((a, b) => a + b.amount, 0);
  const monthPaid = filteredPayments.reduce((a, b) => a + b.amountPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Dashboard</h2>
        <div className="flex space-x-2 bg-white p-2 rounded-2xl border">
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent text-sm font-bold outline-none">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Cash in Hand" value={`৳${totalFund.toLocaleString()}`} icon={<DollarSign size={20}/>} color="bg-indigo-50 text-indigo-600" />
        <StatCard title="Monthly Bazar" value={`৳${monthBazar.toLocaleString()}`} icon={<ShoppingBag size={20}/>} color="bg-amber-50 text-amber-600" />
        <StatCard title="Monthly Payout" value={`৳${monthPaid.toLocaleString()}`} icon={<TrendingUp size={20}/>} color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Active Items" value={`${filteredBazar.length} Entries`} icon={<CalendarIcon size={20}/>} color="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border">
          <h3 className="text-lg font-black mb-6">Staff Payments ({months[selectedMonth]})</h3>
          <div className="space-y-4">
            {users.map(u => {
              const uPaid = filteredPayments.filter(p => p.userId === u.id).reduce((a, b) => a + b.amountPaid, 0);
              const target = u.dailyTarget * u.daysWorked;
              const perc = target > 0 ? (uPaid / target) * 100 : 0;
              return (
                <div key={u.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-black">
                    <span>{u.name}</span>
                    <span>৳{uPaid} / ৳{target}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{width: `${Math.min(100, perc)}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border">
          <h3 className="text-lg font-black mb-6">Recent Bazar Items</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {filteredBazar.length === 0 ? <p className="text-slate-400 text-center py-10">No bazar recorded.</p> :
              filteredBazar.map(b => (
                <div key={b.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{b.items}</p>
                    <p className="text-[10px] text-slate-400">{new Date(b.date).toLocaleDateString()}</p>
                  </div>
                  <span className="font-black text-rose-600">৳{b.amount}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({title, value, icon, color}: any) => (
  <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

export default Dashboard;
