import React from 'react';
import { View, AuthUser } from '../types';
import { LayoutDashboard, Users, CreditCard, Wallet, LogOut } from 'lucide-react';

const SidebarIcon: React.FC<{ name: View; active: boolean; children: React.ReactNode }> = ({ active, children }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
    active 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
  }`}>
    {children}
  </div>
);

interface SidebarProps {
  currentView: View;
  setView: (v: View) => void;
  user: AuthUser | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 p-6 flex-col h-screen sticky top-0 z-30">
      <div className="flex items-center space-x-3 mb-12">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <Wallet size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">FinTrack</h1>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">PRO EDITION</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <div onClick={() => setView('DASHBOARD')}>
          <SidebarIcon name="DASHBOARD" active={currentView === 'DASHBOARD'}>
            <LayoutDashboard size={20} />
            <span className="font-bold text-sm">Dashboard</span>
          </SidebarIcon>
        </div>
        <div onClick={() => setView('USERS')}>
          <SidebarIcon name="USERS" active={currentView === 'USERS'}>
            <Users size={20} />
            <span className="font-bold text-sm">Staff Directory</span>
          </SidebarIcon>
        </div>
        <div onClick={() => setView('PAYMENTS')}>
          <SidebarIcon name="PAYMENTS" active={currentView === 'PAYMENTS'}>
            <CreditCard size={20} />
            <span className="font-bold text-sm">Ledger</span>
          </SidebarIcon>
        </div>
        <div onClick={() => setView('FUNDS')}>
          <SidebarIcon name="FUNDS" active={currentView === 'FUNDS'}>
            <Wallet size={20} />
            <span className="font-bold text-sm">Funds</span>
          </SidebarIcon>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 space-y-6">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Developed By</p>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
              MS
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">M. Hasan Soumik</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase">SQA Engineer</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-3 min-w-0">
            <img 
              src={user?.picture} 
              alt="Profile" 
              className="w-10 h-10 rounded-xl border border-slate-200" 
            />
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 truncate leading-none">{user?.name}</p>
              <p className="text-[9px] font-extrabold text-emerald-600 uppercase mt-1">Authorized</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active-scale"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;