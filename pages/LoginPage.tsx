
import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, Mail, Key, Cloud } from 'lucide-react';

const GOOGLE_CLIENT_ID = "127960470889-0hee1q04h5cgpuorh5rp8q5frk2gji7m.apps.googleusercontent.com";

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; avatar?: string; accessToken?: string }) => void;
}

// Local Logo Path
const LOGO_URL = "/logo.png";

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
  const [tempUser, setTempUser] = useState<any>(null);

  useEffect(() => {
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          const userData = parseJwt(response.credential);
          setTempUser(userData);
          
          // Now get token for Drive access
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
        }
      });

      const btn = document.getElementById("googleBtn");
      if (btn) google.accounts.id.renderButton(btn, { theme: "filled_blue", size: "large", width: 320, shape: "pill" });
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
        <div className="bg-orange-600 p-10 text-white text-center">
          <div className="w-28 h-28 bg-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl border-4 border-orange-400 p-1 overflow-hidden">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Annachi</h1>
          <p className="text-orange-100 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Cloud Trade Manager</p>
        </div>

        <div className="p-8 md:p-12">
          {step === 'form' ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Business Access</h2>
                <p className="text-slate-500 text-xs mt-1">Sign in to sync across your devices</p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div id="googleBtn" className="w-full flex justify-center"></div>

                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
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
                      <input type="email" required placeholder="Business Email" className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                   </div>
                   <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase text-xs">Email Login (Local Only)</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center space-y-6 text-center">
               <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-white">Connecting Cloud...</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
