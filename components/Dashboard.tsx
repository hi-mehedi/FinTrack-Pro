import React, { useState, useMemo } from 'react';
import { User, PaymentRecord, FundTransaction, BazarCost } from '../types';
import { TrendingUp, DollarSign, Clock, Calendar as CalendarIcon, Filter, ShoppingBag, LayoutGrid, Users as UsersIcon, ArrowRight, Zap } from 'lucide-react';

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
    <div className="space-y-10 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">FinTrack Insight</h2>
          <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-[0.2em] flex items-center">
            <Zap size={14} className="mr-2 text-indigo-500 fill-indigo-500" /> Professional Dashboard
          </p>
        </div>
        <div className="w-full sm:w-auto flex items-center space-x-3 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
          <CalendarIcon size={18} className="text-indigo-400 ml-3" />
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(parseInt(e.target.value))} 
            className="flex-1 sm:w-auto bg-transparent text-sm font-black text-slate-700 outline-none py-2 pr-10 appearance-none cursor-pointer"
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Cash on Hand" 
          value={`৳${totalFund.toLocaleString()}`} 
          icon={<DollarSign size={24} strokeWidth={3}/>} 
          trend="+4.5% vs last month"
          color="bg-slate-900 text-white shadow-2xl shadow-slate-200" 
        />
        <StatCard 
          title="Market Burn" 
          value={`৳${monthBazar.toLocaleString()}`} 
          icon={<ShoppingBag size={24} strokeWidth={2.5}/>} 
          trend={`${filteredBazar.length} transactions`}
          color="bg-white text-amber-600 border border-slate-100" 
        />
        <StatCard 
          title="Payroll Cost" 
          value={`৳${monthPaid.toLocaleString()}`} 
          icon={<TrendingUp size={24} strokeWidth={2.5}/>} 
          trend="Current Cycle"
          color="bg-white text-emerald-600 border border-slate-100" 
        />
        <StatCard 
          title="Active Staff" 
          value={`${users.length} Employees`} 
          icon={<UsersIcon size={24} strokeWidth={2.5}/>} 
          trend="Live Operations"
          color="bg-white text-indigo-600 border border-slate-100" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Payroll Progress Bento */}
        <div className="lg:col-span-3 bg-white p-10 sm:p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-black text-slate-900 flex items-center">
              <span className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></span>
              Salary Payout Tracker
            </h3>
            <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-4 py-2 rounded-2xl uppercase tracking-[0.2em] border shadow-inner">Monthly Progress</span>
          </div>

          {users.length === 0 ? (
            <div className="py-24 text-center space-y-4">
               <div className="w-24 h-24 bg-slate-50 rounded-[3rem] mx-auto flex items-center justify-center">
                 <LayoutGrid size={48} className="text-slate-200" />
               </div>
               <p className="text-base font-bold text-slate-400">No staff data available for tracking.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {users.map(u => {
                const uPaid = filteredPayments.filter(p => p.userId === u.id).reduce((a, b) => a + b.amountPaid, 0);
                const target = u.dailyTarget * u.daysWorked;
                const perc = target > 0 ? (uPaid / target) * 100 : 0;
                return (
                  <div key={u.id} className="group/item">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-lg font-black text-slate-800 group-hover/item:text-indigo-600 transition-colors">{u.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">৳{u.dailyTarget} Daily Rate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-700">৳{uPaid.toLocaleString()} / <span className="text-slate-400">৳{target.toLocaleString()}</span></p>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border-2 border-slate-50 relative shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-[1.5s] ease-out relative ${perc >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`} 
                        style={{width: `${Math.min(100, perc)}%`}}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Recent Bazar Bento */}
        <div className="lg:col-span-2 bg-slate-50/50 backdrop-blur-md p-10 sm:p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-black text-slate-900 flex items-center">
              <span className="w-2 h-8 bg-amber-500 rounded-full mr-4"></span>
              Market Log
            </h3>
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-slate-100">
               <ShoppingBag size={20} />
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-3 custom-scrollbar">
            {filteredBazar.length === 0 ? (
              <div className="py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-white/50 rounded-[2.5rem] mx-auto flex items-center justify-center border border-white">
                  <ShoppingBag size={40} className="text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-400">No market entries this cycle.</p>
              </div>
            ) : (
              filteredBazar.sort((a,b)=>new Date(b.date).getTime() - new Date(a.date).getTime()).map(b => (
                <div key={b.id} className="bento-card flex justify-between items-center p-6 bg-white rounded-[2.5rem] border border-slate-100/50 shadow-sm">
                  <div className="overflow-hidden">
                    <p className="text-base font-black text-slate-800 truncate">{b.items}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center">
                      <Clock size={12} className="mr-1.5 text-slate-300" /> {new Date(b.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </p>
                  </div>
                  <div className="bg-rose-50 px-5 py-3 rounded-[1.5rem] border border-rose-100/50 shrink-0 ml-4">
                    <span className="font-black text-rose-600 text-base leading-none">৳{b.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-200/50">
             <button className="w-full py-5 bg-white rounded-3xl text-sm font-black text-slate-500 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm flex items-center justify-center space-x-3 group">
               <span>View Full History</span>
               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({title, value, icon, color, trend}: any) => (
  <div className={`bento-card p-8 rounded-[3.5rem] shadow-sm relative overflow-hidden group ${color}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12 ${color.includes('bg-slate-900') ? 'bg-white/10 text-white backdrop-blur-md' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
      {icon}
    </div>
    <div className="space-y-1">
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${color.includes('bg-slate-900') ? 'text-slate-400' : 'text-slate-400'}`}>{title}</p>
      <p className="text-3xl font-black tracking-tight leading-none">{value}</p>
    </div>
    <div className={`mt-6 inline-flex items-center text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${color.includes('bg-slate-900') ? 'bg-white/10 text-emerald-400' : 'bg-slate-50 text-slate-400'}`}>
      {trend}
    </div>
  </div>
);

export default Dashboard;