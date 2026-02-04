import React, { useState } from 'react';
import { Wallet, AlertCircle, PlayCircle } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onDemoLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onDemoLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in duration-700">
        
        {/* Logo Container */}
        <div className="w-20 h-20 bg-indigo-600 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-8">
          <Wallet size={36} />
        </div>

        {/* Brand */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">FinTrack Pro</h1>
          <p className="text-slate-500 font-medium text-lg leading-snug px-4">
            Cloud Expense & Salary System
          </p>
        </div>

        {/* Login Options Card */}
        <div className="w-full bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/40 mb-10 space-y-3">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-4 bg-white border-2 border-slate-50 py-5 px-6 rounded-[2rem] hover:bg-slate-50 transition-all active-scale group disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-7 h-7" />
            <span className="text-slate-700 font-bold text-lg">Continue with Google</span>
          </button>

          {onDemoLogin && (
            <button 
              onClick={onDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-indigo-50 border-2 border-transparent py-4 px-6 rounded-[2rem] hover:bg-indigo-100 transition-all active-scale group disabled:opacity-50"
            >
              <PlayCircle size={20} className="text-indigo-600" />
              <span className="text-indigo-700 font-black uppercase tracking-widest text-[11px]">Explore Demo Version</span>
            </button>
          )}
        </div>

        {/* Firebase Badge */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center space-x-4 mb-3">
            <div className="h-px w-12 bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Firebase Secured</span>
            <div className="h-px w-12 bg-slate-100"></div>
          </div>
          <p className="text-[11px] text-center text-slate-400 px-10 leading-relaxed font-medium">
            FinTrack Pro uses real-time Firestore database for secure, cross-device data management.
          </p>
        </div>

        {/* Developer Footer */}
        <div className="text-center mt-auto">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Developed By</p>
          <p className="text-sm font-black text-slate-800">Mehedi Hasan Soumik</p>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">SQA Engineer</p>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold flex items-center space-x-2 border border-rose-100">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;