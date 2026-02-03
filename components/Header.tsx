
import React from 'react';

interface HeaderProps {
  totalFund: number;
}

const Header: React.FC<HeaderProps> = ({ totalFund }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-sm font-medium text-slate-500">Welcome Back</h2>
        <p className="text-xl font-bold text-slate-900">Expense Overview</p>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cash in Hand</p>
          <p className={`text-xl font-black ${totalFund >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ৳{totalFund.toLocaleString()}
          </p>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
          <img src="https://picsum.photos/40/40" alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Header;
