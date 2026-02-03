
import React, { useState, useMemo } from 'react';
import { User, PaymentRecord, FundTransaction, BazarCost } from '../types';
import { TrendingUp, DollarSign, Clock, Calendar as CalendarIcon, Filter, ShoppingBag, LayoutGrid } from 'lucide-react';

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Summary Dashboard</h2>
          <p className="text-slate-500 text-xs font-medium">Monitoring finances for {months[selectedMonth]} {selectedYear}</p>
        </div>
        <div className="flex space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <CalendarIcon size={16} className="text-slate-400 ml-2 mt-2" />
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent text-xs font-black outline-none py-2 pr-4 appearance-none cursor-pointer">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Cash in Hand" value={`৳${totalFund.toLocaleString()}`} icon={<DollarSign size={18}/>} color="bg-indigo-600 text-white" />
        <StatCard title="Monthly Bazar" value={`৳${monthBazar.toLocaleString()}`} icon={<ShoppingBag size={18}/>} color="bg-white text-amber-600 border border-slate-100" />
        <StatCard title="Monthly Payout" value={`৳${monthPaid.toLocaleString()}`} icon={<TrendingUp size={18}/>} color="bg-white text-emerald-600 border border-slate-100" />
        <StatCard title="Total Staff" value={`${users.length} Employees`} icon={<LayoutGrid size={18}/>} color="bg-white text-indigo-600 border border-slate-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black mb-6 flex items-center space-x-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
            <span>Staff Salary Progress</span>
          </h3>
          {users.length === 0 ? (
            <div className="py-20 text-center space-y-3">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <LayoutGrid size={32} />
               </div>
               <p className="text-sm font-bold text-slate-400">No staff members found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {users.map(u => {
                const uPaid = filteredPayments.filter(p => p.userId === u.id).reduce((a, b) => a + b.amountPaid, 0);
                const target = u.dailyTarget * u.daysWorked;
                const perc = target > 0 ? (uPaid / target) * 100 : 0;
                return (
                  <div key={u.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-black text-slate-700">
                      <span className="uppercase tracking-wider">{u.name}</span>
                      <span className="text-slate-400">৳{uPaid.toLocaleString()} / ৳{target.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className={`h-full rounded-full transition-all duration-1000 ${perc >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{width: `${Math.min(100, perc)}%`}}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black mb-6 flex items-center space-x-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            <span>Monthly Bazar Ledger</span>
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredBazar.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <ShoppingBag size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400">No bazar items recorded this month.</p>
              </div>
            ) : (
              filteredBazar.sort((a,b)=>new Date(b.date).getTime() - new Date(a.date).getTime()).map(b => (
                <div key={b.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-white hover:border-slate-200 transition-all">
                  <div>
                    <p className="text-sm font-black text-slate-800">{b.items}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(b.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                  </div>
                  <span className="font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg text-sm">৳{b.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({title, value, icon, color}: any) => (
  <div className={`p-6 rounded-[2rem] shadow-sm transition-transform hover:scale-[1.02] duration-300 ${color.includes('bg-indigo') ? 'shadow-indigo-100' : 'bg-white border shadow-slate-100'}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color.includes('bg-indigo') ? 'bg-white/20 text-white' : 'bg-slate-50'}`}>
      {icon}
    </div>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${color.includes('bg-indigo') ? 'text-indigo-100' : 'text-slate-400'}`}>{title}</p>
    <p className={`text-2xl font-black ${color.includes('bg-indigo') ? 'text-white' : 'text-slate-900'}`}>{value}</p>
  </div>
);

export default Dashboard;
