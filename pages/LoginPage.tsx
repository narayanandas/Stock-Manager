
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Cloud, Loader2, AlertCircle, HelpCircle, ExternalLink, ChevronRight } from 'lucide-react';

const GOOGLE_CLIENT_ID = "127960470889-0hee1q04h5cgpuorh5rp8q5frk2gji7m.apps.googleusercontent.com";

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; avatar?: string; accessToken?: string }) => void;
}

const LOGO_URL = "./logo.png";

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch { return null; }
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const buttonRendered = useRef(false);

  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 30; 

    const initGoogle = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && !buttonRendered.current) {
        setIsGoogleReady(true);
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: any) => {
              const userData = parseJwt(response.credential);
              
              const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (tokenResponse: any) => {
                  if (tokenResponse.error !== undefined) throw (tokenResponse);
                  
                  setStep('loading');
                  setTimeout(() => {
                    setStep('success');
                    setTimeout(() => {
                      onLogin({ 
                        name: userData?.name || "User", 
                        email: userData?.email || "user@gmail.com",
                        avatar: userData?.picture,
                        accessToken: tokenResponse.access_token
                      });
                    }, 800);
                  }, 1000);
                },
              });
              tokenClient.requestAccessToken();
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const btn = document.getElementById("googleBtn");
          if (btn) {
            google.accounts.id.renderButton(btn, { 
              theme: "filled_blue", 
              size: "large", 
              width: 320, 
              shape: "pill",
              text: "signin_with" 
            });
            buttonRendered.current = true;
          }
        } catch (err) {
          console.error("Google Init Error:", err);
        }
        return true;
      }
      return false;
    };

    if (!initGoogle()) {
      const interval = setInterval(() => {
        pollCount++;
        if (initGoogle() || pollCount >= maxPolls) {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [onLogin]);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    const namePart = email.split('@')[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    setTimeout(() => {
      setStep('success');
      setTimeout(() => onLogin({ name, email }), 800);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border dark:border-slate-800">
        <div className="bg-orange-600 p-10 text-white text-center relative">
          <div className="w-28 h-28 bg-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl border-4 border-orange-400 p-1 overflow-hidden">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" onError={(e) => {
               (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Annachi&background=ea580c&color=fff";
            }} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Annachi</h1>
          <p className="text-orange-100 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Cloud Trade Manager</p>
        </div>

        <div className="p-8 md:p-12">
          {step === 'form' ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Business Access</h2>
                <p className="text-slate-500 text-xs mt-1 font-semibold">Sign in to sync across your devices</p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="min-h-[44px] w-full flex flex-col items-center justify-center">
                  {!isGoogleReady && (
                    <div className="flex items-center space-x-2 text-slate-400 text-xs animate-pulse">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Initializing Google Sign-In...</span>
                    </div>
                  )}
                  <div id="googleBtn" className={`w-full flex justify-center transition-opacity duration-500 ${isGoogleReady ? 'opacity-100' : 'opacity-0'}`}></div>
                </div>

                {isGoogleReady && (
                  <button 
                    onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                    className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-wider"
                  >
                    <HelpCircle size={12} />
                    <span>Seeing "Access Blocked"? Click here</span>
                  </button>
                )}

                {showTroubleshoot && (
                  <div className="w-full p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 rounded-2xl animate-in slide-in-from-top-2">
                    <h4 className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase mb-2 flex items-center">
                      <AlertCircle size={14} className="mr-1" /> Fix Access Blocked
                    </h4>
                    <ol className="text-[11px] text-orange-800 dark:text-orange-300 space-y-2 font-medium">
                      <li className="flex items-start space-x-2">
                        <span className="bg-orange-200 dark:bg-orange-800 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]">1</span>
                        <span>Open <b>Google Cloud Console</b></span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-orange-200 dark:bg-orange-800 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]">2</span>
                        <span>Add <code>{window.location.origin}</code> to <b>Authorized JavaScript origins</b></span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-orange-200 dark:bg-orange-800 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]">3</span>
                        <span>Save changes and wait 5 minutes.</span>
                      </li>
                    </ol>
                    <a 
                      href="https://console.cloud.google.com/apis/credentials" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center space-x-1 text-[10px] font-black text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      <span>GO TO GOOGLE CONSOLE</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  <Cloud size={14} />
                  <span>Enables Cross-Device Sync</span>
                </div>

                <div className="relative w-full flex items-center py-2">
                  <div className="flex-grow border-t dark:border-slate-800"></div>
                  <span className="mx-4 text-slate-300 text-[10px] font-black uppercase">or</span>
                  <div className="flex-grow border-t dark:border-slate-800"></div>
                </div>

                <form onSubmit={handleManualLogin} className="w-full space-y-4">
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required 
                        placeholder="Business Email" 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                      />
                   </div>
                   <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                     Email Login (Local Only)
                   </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center space-y-6 text-center">
               <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                 {step === 'loading' ? 'Authenticating...' : 'Welcome Back!'}
               </h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Preparing your business dashboard</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
