
import React, { useMemo } from 'react';
import { User, PaymentRecord, FundTransaction, BazarCost } from '../types';
import { TrendingUp, Calendar as CalendarIcon, ShoppingCart, UserCheck, ArrowDownCircle, ArrowUpCircle, Wallet, CreditCard } from 'lucide-react';

interface DashboardProps {
  users: User[];
  payments: PaymentRecord[];
  totalFund: number;
  transactions: FundTransaction[];
  bazarCosts: BazarCost[];
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ users, payments, transactions, bazarCosts, selectedMonth, setSelectedMonth }) => {
  const currentYear = new Date().getFullYear();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Strictly filter all data by the selected month
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
    });
  }, [payments, selectedMonth, currentYear]);

  const filteredBazar = useMemo(() => {
    return bazarCosts.filter(b => {
      const d = new Date(b.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
    });
  }, [bazarCosts, selectedMonth, currentYear]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, selectedMonth, currentYear]);

  const monthInflow = filteredTransactions.reduce((acc, t) => t.type === 'COLLECTION' ? acc + t.amount : acc, 0);
  const monthOutflow = filteredTransactions.reduce((acc, t) => (t.type === 'PAYMENT' || t.type === 'BAZAR' || t.type === 'RETURN') ? acc + t.amount : acc, 0);
  const monthBazar = filteredBazar.reduce((a, b) => a + b.amount, 0);
  const monthPaid = filteredPayments.reduce((a, b) => a + b.amountPaid, 0);
  const monthNet = monthInflow - monthOutflow;

  return (
    <div className="space-y-8 view-animate pb-10">
      <div className="flex flex-col space-y-2">
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Operational Overview</p>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Dashboard</h2>
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
            <CalendarIcon size={14} className="text-slate-400" />
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value))} 
              className="bg-transparent border-none p-0 text-xs font-bold text-slate-600 outline-none !bg-white cursor-pointer"
            >
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        <StatCard 
          title="Month Inflow" 
          value={`৳${monthInflow.toLocaleString()}`} 
          subtitle={`${months[selectedMonth]} Deposits`}
          icon={<ArrowUpCircle size={20}/>} 
          color="text-emerald-600" 
        />
        <StatCard 
          title="Month Outflow" 
          value={`৳${monthOutflow.toLocaleString()}`} 
          subtitle={`${months[selectedMonth]} Deductions`}
          icon={<ArrowDownCircle size={20}/>} 
          color="text-rose-600" 
        />
        <StatCard 
          title="Monthly Paid" 
          value={`৳${monthPaid.toLocaleString()}`} 
          subtitle="All Staff Salary Paid"
          icon={<CreditCard size={20}/>} 
          color="text-indigo-600" 
        />
        <StatCard 
          title="Month Bazar" 
          value={`৳${monthBazar.toLocaleString()}`} 
          subtitle="Total Bazar Costs"
          icon={<ShoppingCart size={20}/>} 
          color="text-amber-600" 
        />
        <StatCard 
          title="Monthly Net" 
          value={`৳${monthNet.toLocaleString()}`} 
          subtitle="Inflow - Outflow"
          icon={<Wallet size={20}/>} 
          color={monthNet >= 0 ? "text-indigo-600" : "text-rose-600"} 
        />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Monthly Staff Summary</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Calculated for {months[selectedMonth]}</p>
          </div>
          <UserCheck size={20} className="text-slate-200" />
        </div>

        <div className="space-y-10">
          {users.length === 0 ? (
            <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">
              No staff members registered.
            </div>
          ) : users.map(u => {
            const uPayments = filteredPayments.filter(p => p.userId === u.id);
            const uPaid = uPayments.reduce((a, b) => a + b.amountPaid, 0);
            const uDays = uPayments.reduce((a, b) => a + (b.daysPaid || 0), 0);
            const expectedSalary = u.dailyTarget * uDays; // Logic: Daily Income * Working Days recorded in month
            const percentage = expectedSalary > 0 ? (uPaid / expectedSalary) * 100 : (uPaid > 0 ? 100 : 0);
            const balance = expectedSalary - uPaid;

            return (
              <div key={u.id} className="group">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-sm border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {u.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-base font-black text-slate-800 tracking-tight leading-none mb-1">{u.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        Paid: ৳{uPaid.toLocaleString()} ({uDays} Days Worked)
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className={`text-sm font-black ${balance <= 0 ? (balance === 0 ? 'text-slate-500' : 'text-emerald-600') : 'text-rose-500'}`}>
                      {balance <= 0 ? (balance === 0 ? 'Settled' : `৳${Math.abs(balance)} Extra`) : `৳${balance.toLocaleString()} Due`}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Target: ৳{expectedSalary.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ease-out ${percentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                     style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                   />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 py-10 text-center border-t border-slate-50">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Developed By</p>
        <p className="text-xs font-black text-slate-800 mt-1 uppercase tracking-wider">Mehedi Hasan Soumik</p>
      </div>
    </div>
  );
};

const StatCard = ({title, value, subtitle, icon, color}: any) => (
  <div className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm bg-white relative overflow-hidden transition-all hover:border-slate-200">
    <div className={`w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 ${color}`}>
      {icon}
    </div>
    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400">{title}</p>
    <p className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-2 truncate">{value}</p>
    <p className="text-[10px] font-bold text-slate-400">{subtitle}</p>
  </div>
);

export default Dashboard;
