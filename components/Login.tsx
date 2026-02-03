
import React, { useState } from 'react';
import { Wallet, LogIn, AlertCircle, Play } from 'lucide-react';
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
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain Unauthorized: Add this to Firebase Auth domains.");
      } else {
        setError(err.message || "Sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100 animate-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-6">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">FinTrack Pro</h1>
          <p className="text-slate-500 font-medium">Salary & Bazar Management</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-medium flex items-start space-x-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all group disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-6 h-6" />
            <span className="text-slate-700 font-bold">Continue with Google</span>
          </button>

          <button 
            onClick={onDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-slate-900 text-white py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all group disabled:opacity-50"
          >
            <Play size={18} className="fill-white" />
            <span className="font-bold">Explore Demo System</span>
          </button>
          
          <p className="text-xs text-center text-slate-400 px-4 leading-relaxed mt-4">
            Data is strictly private to your account. Demo accounts are temporary.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Developed by</p>
          <p className="text-sm font-black text-slate-800">Mehedi Hasan Soumik</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
