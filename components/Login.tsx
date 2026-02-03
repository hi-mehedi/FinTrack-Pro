import React, { useState } from 'react';
import { Wallet, LogIn } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLogin?: () => void;
}

const Login: React.FC<LoginProps> = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Failed to sign in with Google.");
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
          <p className="text-slate-500 font-medium">Cloud Expense & Salary System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all group disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <img 
                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
                alt="Google Logo" 
                className="w-6 h-6 object-contain"
              />
            )}
            <span className="text-slate-700 font-bold">{loading ? "Connecting..." : "Continue with Google"}</span>
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-black tracking-widest">Firebase Secured</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-slate-400 px-4 leading-relaxed">
            FinTrack Pro uses real-time Firestore database for secure, cross-device data management.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Developed by</p>
          <p className="text-sm font-black text-slate-800">Mehedi Hasan Soumik</p>
          <p className="text-xs text-indigo-600 font-bold">SQA Engineer</p>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm">© 2025 FinTrack Pro Cloud. Powered by Firebase.</p>
    </div>
  );
};

export default Login;