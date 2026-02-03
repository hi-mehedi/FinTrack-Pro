import React from 'react';
import { View, AuthUser } from '../types';
import { LayoutDashboard, Users, CreditCard, Wallet, LogOut, Code2, Sparkles } from 'lucide-react';

const SidebarIcon: React.FC<{ name: View; active: boolean; children: React.ReactNode }> = ({ active, children }) => (
  <div className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer group ${
    active 
      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
      : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
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
    <aside className="w-full md:w-72 glass-card border-r border-slate-200/50 p-6 flex flex-col h-screen overflow-hidden sticky top-0">
      <div className="flex items-center space-x-4 px-2 mb-12">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-white">
          <Wallet size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">FinTrack</h1>
          <div className="flex items-center mt-1">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">PRO EDITION</span>
            <Sparkles size={8} className="ml-1 text-indigo-400 fill-indigo-400" />
          </div>
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
            <span className="font-bold text-sm">Staff Management</span>
          </SidebarIcon>
        </div>
        <div onClick={() => setView('PAYMENTS')}>
          <SidebarIcon name="PAYMENTS" active={currentView === 'PAYMENTS'}>
            <CreditCard size={20} />
            <span className="font-bold text-sm">Transaction Logs</span>
          </SidebarIcon>
        </div>
        <div onClick={() => setView('FUNDS')}>
          <SidebarIcon name="FUNDS" active={currentView === 'FUNDS'}>
            <Wallet size={20} />
            <span className="font-bold text-sm">Fund Capital</span>
          </SidebarIcon>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 space-y-6">
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group relative overflow-hidden transition-all hover:bg-white">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Architect</p>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
              MS
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">M. H. Soumik</p>
              <p className="text-[9px] text-slate-400 font-bold">SQA Engineer</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3 min-w-0">
            <img 
              src={user?.picture} 
              alt="Profile" 
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-50" 
            />
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">{user?.name}</p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Account</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active-scale"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;