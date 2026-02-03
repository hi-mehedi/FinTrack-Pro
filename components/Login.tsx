
import React from 'react';
import { Wallet, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-6">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">FinTrack Pro</h1>
          <p className="text-slate-500 font-medium">Salary & Expense Management System</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onLogin}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all group"
          >
            <img 
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
              alt="Google Logo" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-slate-700 font-bold">Sign in with Google</span>
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-black tracking-widest">Secure Access</span>
            </div>
          </div>
          
          <button 
            onClick={onLogin}
            className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
          >
            <LogIn size={20} />
            <span>Guest Demo Login</span>
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Developed by</p>
          <p className="text-sm font-black text-slate-800">Mehedi Hasan Soumik</p>
          <p className="text-xs text-indigo-600 font-bold">SQA Engineer</p>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm">© 2025 FinTrack Pro. All rights reserved.</p>
    </div>
  );
};

export default Login;
