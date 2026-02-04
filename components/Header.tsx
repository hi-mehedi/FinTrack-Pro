
import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  totalFund: number;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ totalFund, onLogout }) => {
  return (
    <header className="h-14 bg-white border-b border-slate-100 px-5 flex items-center justify-between sticky top-0 z-40">
      <div className="min-w-0">
        <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] leading-none mb-1">Financial core</h2>
        <p className="text-sm font-extrabold text-slate-900 leading-none">Live Monitor</p>
      </div>
      
      <div className="flex items-center space-x-3 md:space-x-4">
        <div className="flex flex-col items-end">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Net Balance</p>
          <p className={`text-xs md:text-sm font-extrabold leading-none ${totalFund >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            ৳{totalFund.toLocaleString()}
          </p>
        </div>
        
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
          <img src="https://api.dicebear.com/7.x/shapes/svg?seed=fintrack&backgroundColor=4f46e5" alt="Profile" className="w-full h-full scale-125" />
        </div>

        <button 
          onClick={onLogout}
          aria-label="Logout"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active-scale md:hidden"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
