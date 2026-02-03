
import React from 'react';
import { View, AuthUser } from '../types';
import { LayoutDashboard, Users, CreditCard, Wallet, LogOut } from 'lucide-react';

const SidebarIcon: React.FC<{ name: View; active: boolean; children: React.ReactNode }> = ({ active, children }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
    active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
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
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
      <div className="flex items-center space-x-3 px-4 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          <Wallet size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">FinTrack Pro</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <div onClick={() => setView('DASHBOARD')}>
          <SidebarIcon name="DASHBOARD" active={currentView === 'DASHBOARD'}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </SidebarIcon>
        </div>
        <div onClick={() => setView('USERS')}>
          <SidebarIcon name="USERS" active={currentView === 'USERS'}>
            <Users size={20} />
            <span className="font-medium">User Management</span>
          </SidebarIcon>
        </div>
        <div onClick={() => setView('PAYMENTS')}>
          <SidebarIcon name="PAYMENTS" active={currentView === 'PAYMENTS'}>
            <CreditCard size={20} />
            <span className="font-medium">Daily Payments</span>
          </SidebarIcon>
        </div>
        <div onClick={() => setView('FUNDS')}>
          <SidebarIcon name="FUNDS" active={currentView === 'FUNDS'}>
            <Wallet size={20} />
            <span className="font-medium">Fund Tracking</span>
          </SidebarIcon>
        </div>
      </nav>

      <div className="mt-8 space-y-4">
        {/* Attribution Section */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System Developer</p>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              MS
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Mehedi Hasan Soumik</p>
              <p className="text-[10px] text-indigo-600 font-bold">SQA Engineer</p>
            </div>
          </div>
        </div>

        {/* User Profile / Logout */}
        <div className="flex items-center justify-between px-2 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 overflow-hidden">
            <img src={user?.picture} alt="Profile" className="w-8 h-8 rounded-full flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700 truncate">{user?.name}</span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
