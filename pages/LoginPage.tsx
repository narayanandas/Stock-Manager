
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; avatar?: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [step, setStep] = useState<'email' | 'loading' | 'success'>('email');
  const [email, setEmail] = useState('');

  const handleGoogleClick = () => {
    setIsPopupOpen(true);
    setStep('email');
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setStep('loading');
    
    const namePart = email.split('@')[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[\._]/g, ' ');

    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onLogin({ name, email });
        setIsPopupOpen(false);
      }, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-orange-100">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        {/* Brand Header */}
        <div className="bg-orange-600 p-12 text-white text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="grid grid-cols-4 gap-8 rotate-12 scale-150">
                {[...Array(12)].map((_, i) => (
                   <img key={i} src="https://api.a0.dev/assets/image?text=grocery%20icon%20minimalist%20white&aspect=1:1" className="w-20 h-20" alt="" />
                ))}
              </div>
           </div>

          <div className="relative z-10">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl overflow-hidden border-4 border-orange-400">
              <img src="https://api.a0.dev/assets/image?text=Annachi%20friendly%20man%20logo%20mascot%20circular%20food%20groceries&aspect=1:1" alt="Annachi Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter">Annachi</h1>
            <p className="text-orange-100 text-sm mt-3 font-bold uppercase tracking-widest opacity-80">Smart Business Manager</p>
          </div>
        </div>

        {/* Login Body */}
        <div className="p-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Enterprise Access</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Your data is synced automatically with your Google profile.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleClick}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-4 px-6 rounded-2xl flex items-center justify-center space-x-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 group"
            >
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span className="text-slate-700 dark:text-white font-bold">Sign in with Google</span>
            </button>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center space-x-3">
                 <CheckCircle2 size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Secure</span>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center space-x-3">
                 <ShieldCheck size={16} className="text-blue-500" />
                 <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Sign-In Popup Simulation */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-8 pb-4 flex flex-col items-center">
              <div className="mb-6">
                <svg className="w-10 h-10" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Sign in</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">to continue to Annachi</p>
            </div>
            <div className="p-8 pt-4">
              {step === 'email' && (
                <form onSubmit={handleContinue} className="space-y-6">
                  <div className="space-y-4">
                    <input 
                      type="email" 
                      required
                      autoFocus
                      placeholder="Email or phone"
                      className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <button type="button" onClick={() => setIsPopupOpen(false)} className="text-sm font-bold text-blue-600">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold">Next</button>
                  </div>
                </form>
              )}
              {step === 'loading' && (
                <div className="py-12 flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-slate-600">Syncing with Google Cloud...</p>
                </div>
              )}
              {step === 'success' && (
                <div className="py-12 flex flex-col items-center space-y-4">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                  <p className="font-bold text-slate-800">Welcome Back!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
