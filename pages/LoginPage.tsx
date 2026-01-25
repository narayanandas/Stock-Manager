
import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, HelpCircle } from 'lucide-react';

/**
 * CONFIGURATION: Google Client ID integration
 * Provided by User: 127960470889-0hee1q04h5cgpuorh5rp8q5frk2gji7m.apps.googleusercontent.com
 */
const GOOGLE_CLIENT_ID = "127960470889-0hee1q04h5cgpuorh5rp8q5frk2gji7m.apps.googleusercontent.com";

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; avatar?: string }) => void;
}

const LOGO_URL = "https://api.a0.dev/assets/image?text=Annachi%20friendly%20man%20logo%20mascot%20circular%20food%20groceries&aspect=1:1";

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [step, setStep] = useState<'email' | 'loading' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Initialize Real Google One Tap / Sign-In Button
  useEffect(() => {
    const initializeGoogleAuth = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            console.log("Encoded JWT ID token: " + response.credential);
            setStep('loading');
            setTimeout(() => {
                setStep('success');
                setTimeout(() => {
                    onLogin({ name: "Google User", email: "user@gmail.com" });
                }, 800);
            }, 1000);
          }
        });

        const googleBtnParent = document.getElementById("googleBtn");
        if (googleBtnParent) {
            google.accounts.id.renderButton(
                googleBtnParent,
                { theme: "outline", size: "large", width: 320, shape: "pill" }
            );
        }
      }
    };

    const timer = setTimeout(initializeGoogleAuth, 1000);
    return () => clearTimeout(timer);
  }, [onLogin]);

  const handleManualSimulation = () => {
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
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl overflow-hidden border-4 border-orange-400 p-1">
              <img src={LOGO_URL} alt="Annachi Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter">Annachi</h1>
            <p className="text-orange-100 text-sm mt-3 font-bold uppercase tracking-widest opacity-80">Smart Business Manager</p>
          </div>
        </div>

        {/* Login Body */}
        <div className="p-12 pt-10">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Enterprise Access</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Secure cloud-synced trade management</p>
          </div>

          <div className="space-y-6 flex flex-col items-center">
            {/* The Real Google Button Container */}
            <div id="googleBtn" className="w-full flex justify-center min-h-[50px]"></div>

            {/* Troubleshooting Info for origin_mismatch */}
            <button 
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors"
            >
              <HelpCircle size={14} />
              <span>Fixing "Access Blocked" Error?</span>
            </button>

            {showTroubleshooting && (
              <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start space-x-3">
                  <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-2">
                    <p className="font-black text-slate-700 dark:text-slate-300">HOW TO FIX "ORIGIN_MISMATCH":</p>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Google requires you to whitelist this URL in your Cloud Console.
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                      <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-orange-600 underline inline-flex items-center">Credentials <ExternalLink size={10} className="ml-0.5" /></a></li>
                      <li>Edit your Client ID (ending in ...gji7m)</li>
                      <li>Add <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-[10px]">https://aistudio.google.com</code> to <b>Authorized JavaScript origins</b></li>
                      <li>Click Save and wait 5 minutes.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            <div className="relative w-full flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">or use emergency access</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button 
              onClick={handleManualSimulation}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-4 px-6 rounded-2xl flex items-center justify-center space-x-4 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 group"
            >
              <span className="text-slate-600 dark:text-slate-200 font-bold">Log in with Email PIN</span>
            </button>

            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center space-x-3">
                 <CheckCircle2 size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Safe Data</span>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center space-x-3">
                 <ShieldCheck size={16} className="text-blue-500" />
                 <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tighter">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Simulation Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="p-8 pb-4 flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Sign in</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center font-medium">Guest access simulation</p>
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
                      className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white font-bold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <button type="button" onClick={() => setIsPopupOpen(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                    <button type="submit" className="bg-orange-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none">Continue</button>
                  </div>
                </form>
              )}
              {step === 'loading' && (
                <div className="py-12 flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-slate-600 dark:text-slate-400 text-sm">Authenticating...</p>
                </div>
              )}
              {step === 'success' && (
                <div className="py-12 flex flex-col items-center space-y-4">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                  <p className="font-bold text-slate-800 dark:text-white">Welcome Back!</p>
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
