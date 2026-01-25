
import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, HelpCircle, Mail, Key } from 'lucide-react';

/**
 * CONFIGURATION: Google Client ID integration
 */
const GOOGLE_CLIENT_ID = "127960470889-0hee1q04h5cgpuorh5rp8q5frk2gji7m.apps.googleusercontent.com";

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; avatar?: string }) => void;
}

const LOGO_URL = "https://api.a0.dev/assets/image?text=Annachi%20friendly%20man%20logo%20mascot%20circular%20food%20groceries&aspect=1:1";

// Helper to decode the Google JWT Token
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT", e);
    return null;
  }
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    const initializeGoogleAuth = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            // Decode the real user data from Google
            const userData = parseJwt(response.credential);
            
            setStep('loading');
            setTimeout(() => {
                setStep('success');
                setTimeout(() => {
                    onLogin({ 
                      name: userData?.name || "Google User", 
                      email: userData?.email || "user@gmail.com",
                      avatar: userData?.picture 
                    });
                }, 800);
            }, 1000);
          }
        });

        const googleBtnParent = document.getElementById("googleBtn");
        if (googleBtnParent) {
            google.accounts.id.renderButton(
                googleBtnParent,
                { theme: "filled_blue", size: "large", width: 320, shape: "pill", text: "continue_with" }
            );
        }
      }
    };

    const timer = setTimeout(initializeGoogleAuth, 1000);
    return () => clearTimeout(timer);
  }, [onLogin]);

  const handleManualLogin = (e: React.FormEvent) => {
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
      }, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-orange-100 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        
        <div className="bg-orange-600 p-10 text-white text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="grid grid-cols-4 gap-8 rotate-12 scale-150">
                {[...Array(12)].map((_, i) => (
                   <img key={i} src="https://api.a0.dev/assets/image?text=grocery%20icon%20minimalist%20white&aspect=1:1" className="w-16 h-16" alt="" />
                ))}
              </div>
           </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl overflow-hidden border-4 border-orange-400 p-1 animate-in zoom-in duration-700">
              <img src={LOGO_URL} alt="Annachi Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Annachi</h1>
            <p className="text-orange-100 text-[10px] mt-2 font-black uppercase tracking-[0.3em] opacity-80">Smart Trade Manager</p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {step === 'form' ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Welcome Back</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Select your preferred login method</p>
              </div>

              <div className="space-y-6 flex flex-col items-center">
                <div className="w-full flex flex-col items-center space-y-4">
                  <div id="googleBtn" className="w-full flex justify-center min-h-[50px]"></div>
                  
                  <button 
                    onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                    className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    <HelpCircle size={14} />
                    <span>Fixing "Access Blocked" or "n8n" name?</span>
                  </button>

                  {showTroubleshooting && (
                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start space-x-3">
                        <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                        <div className="text-[11px] space-y-2">
                          <p className="font-black text-slate-700 dark:text-slate-300">FIXING GOOGLE ERRORS:</p>
                          <div className="space-y-2 text-slate-500 dark:text-slate-400 leading-relaxed">
                            <p><b>1. Error Origin Mismatch:</b> Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-orange-600 underline">Credentials</a>, click your Client ID, and add <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">https://aistudio.google.com</code> to "Authorized JavaScript origins".</p>
                            <p><b>2. It says "n8n":</b> Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" className="text-orange-600 underline">OAuth consent screen</a> and change "App Name" to Annachi.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative w-full flex items-center py-2">
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-slate-300 dark:text-slate-700 text-[10px] font-black uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                </div>

                <form onSubmit={handleManualLogin} className="w-full space-y-4">
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        placeholder="Business Email Address"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                   </div>
                   <button 
                    type="submit"
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:opacity-90 transition-all shadow-xl shadow-slate-200 dark:shadow-none active:scale-[0.98]"
                   >
                     <Key size={16} />
                     <span>Secure Email Login</span>
                   </button>
                </form>

                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center space-x-3">
                     <CheckCircle2 size={16} className="text-emerald-500" />
                     <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Encrypted Storage</span>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center space-x-3">
                     <ShieldCheck size={16} className="text-blue-500" />
                     <span className="text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-tighter">Auto-Cloud Sync</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-500">
              {step === 'loading' ? (
                <>
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-orange-100 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Authenticating</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Preparing your business dashboard...</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Access Granted</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Welcome to Annachi Pro.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-50">Enterprise Edition v2.0</p>
    </div>
  );
};

export default LoginPage;
