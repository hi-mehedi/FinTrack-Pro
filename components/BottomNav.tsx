import React from 'react';
import { View } from '../types';
import { LayoutDashboard, Users, CreditCard, Wallet } from 'lucide-react';

interface BottomNavProps {
  currentView: View;
  setView: (v: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const NavItem = ({ name, icon: Icon, label }: { name: View; icon: any; label: string }) => {
    const active = currentView === name;
    return (
      <button 
        onClick={() => setView(name)}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
          active ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <div className={`p-2 rounded-2xl transition-all duration-300 active-scale ${
          active ? 'bg-indigo-50' : 'bg-transparent'
        }`}>
          <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className={`text-[9px] font-extrabold mt-1 uppercase tracking-tight transition-all ${
          active ? 'opacity-100' : 'opacity-60'
        }`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-3 pb-safe flex items-center justify-around z-50">
      <NavItem name="DASHBOARD" icon={LayoutDashboard} label="Home" />
      <NavItem name="USERS" icon={Users} label="Staff" />
      <NavItem name="PAYMENTS" icon={CreditCard} label="Pay" />
      <NavItem name="FUNDS" icon={Wallet} label="Wallet" />
    </nav>
  );
};

export default BottomNav;