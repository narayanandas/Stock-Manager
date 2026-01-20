
import React, { useState } from 'react';
import { Package, ShieldCheck, Chrome, User, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; avatar?: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleGoogleClick = () => {
    setIsPopupOpen(true);
  };

  const selectAccount = (name: string, email: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      onLogin({ name, email });
      setIsVerifying(false);
      setIsPopupOpen(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-orange-100">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-slate-300 overflow-hidden border border-white">
        {/* Brand Header */}
        <div className="bg-orange-600 p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Package size={160} />
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md ring-8 ring-white/5">
              <Package size={42} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">SmartStock Pro</h1>
            <p className="text-orange-100 text-sm mt-2 font-bold uppercase tracking-widest opacity-80">Enterprise Inventory</p>
          </div>
        </div>

        {/* Login Body */}
        <div className="p-10 pt-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Business Login</h2>
            <p className="text-slate-500 text-sm mt-2">Access your secure dashboard and cloud sync.</p>
          </div>

          <div className="space-y-4">
            {/* Real-looking Google Button */}
            <button 
              onClick={handleGoogleClick}
              className="w-full bg-white border border-slate-200 py-4 px-6 rounded-2xl flex items-center justify-center space-x-4 hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
            >
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span className="text-slate-700 font-bold">Sign in with Google</span>
            </button>

            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Partner Access</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <button className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors flex items-center justify-center space-x-2">
              <span>Login with Work ID</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center space-x-3 text-slate-400">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">SSL Secure Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Simulated Google Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
              <Chrome className="text-blue-500" size={24} />
              <span className="font-bold text-slate-700">Choose an account</span>
            </div>
            
            <div className="p-2">
              {isVerifying ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-bold text-slate-500">Signing you in...</p>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => selectAccount('Admin User', 'admin@business.com')}
                    className="w-full flex items-center p-4 space-x-4 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">A</div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 text-sm">Admin User</p>
                      <p className="text-xs text-slate-500">admin@business.com</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => selectAccount('Guest Manager', 'manager@guest.com')}
                    className="w-full flex items-center p-4 space-x-4 hover:bg-slate-50 rounded-xl transition-all border-t border-slate-50"
                  >
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">G</div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800 text-sm">Guest Manager</p>
                      <p className="text-xs text-slate-500">manager@guest.com</p>
                    </div>
                  </button>
                  <div className="p-4 border-t border-slate-50">
                    <button onClick={() => setIsPopupOpen(false)} className="text-sm font-bold text-blue-600 hover:underline">Use another account</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
