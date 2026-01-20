
import React, { useState } from 'react';
import { Package, Mail, ShieldCheck, ArrowRight, Lock, Key } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

type LoginStep = 'INITIAL' | 'VERIFY';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<LoginStep>('INITIAL');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid business email.');
      return;
    }
    setError('');
    setIsVerifying(true);
    // Simulate sending a verification code
    setTimeout(() => {
      setStep('VERIFY');
      setIsVerifying(false);
    }, 1500);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }
    setError('');
    setIsVerifying(true);
    // Simulate verifying the code
    setTimeout(() => {
      onLogin(email);
      setIsVerifying(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300 overflow-hidden border border-slate-100">
        <div className="bg-orange-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Package size={140} />
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md ring-4 ring-white/10">
              <Package size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SmartStock Pro</h1>
            <p className="text-orange-100 text-sm mt-2 font-medium">B2B Inventory Management • India</p>
          </div>
        </div>

        <div className="p-10">
          {step === 'INITIAL' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Account Access</h2>
                <p className="text-slate-500 text-sm mt-1">Enter your email to receive a secure login code.</p>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={20} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Business Email ID"
                    className="w-full bg-slate-50 border-2 border-transparent pl-12 pr-4 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-700 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-bold pl-2">{error}</p>}
                
                <button 
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  <span>{isVerifying ? 'Sending Code...' : 'Request Verification Code'}</span>
                  {!isVerifying && <ArrowRight size={20} />}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 text-center">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Verification</h2>
                <p className="text-slate-500 text-sm mt-1">We sent a 4-digit code to <b>{email}</b></p>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key size={20} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    maxLength={4}
                    placeholder="Enter 4-digit code"
                    className="w-full bg-slate-50 border-2 border-transparent pl-12 pr-4 py-5 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-700 font-bold text-center text-2xl tracking-[1rem]"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                
                <button 
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 disabled:opacity-50"
                >
                  <span>{isVerifying ? 'Verifying...' : 'Verify & Login'}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setStep('INITIAL')}
                  className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                >
                  Back to Email Entry
                </button>
              </form>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center space-x-3 text-slate-400">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span className="text-xs font-bold tracking-tight">ISO 27001 SECURE DATA PROTECTION</span>
          </div>
        </div>
      </div>
      <p className="mt-10 text-slate-400 text-[10px] text-center max-w-xs leading-relaxed uppercase font-bold tracking-widest">
        Powered by SmartStock Cloud Infrastructure <br /> 
        Security Protocol v4.2 Active
      </p>
    </div>
  );
};

export default LoginPage;
