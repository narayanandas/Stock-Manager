
import React, { useState } from 'react';
import { db } from '../db';
import { 
  Cloud, 
  ShieldCheck, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  FileText,
  Lock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useTranslation } from '../App';

interface SettingsPageProps {
  onLogout: () => void;
}

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const user = JSON.parse(localStorage.getItem('ss_user') || '{}');
  const syncState = JSON.parse(localStorage.getItem(`ss_${user.email}_sync_state`) || '{}');

  const handlePush = async () => {
    if (!user.accessToken) {
      setMessage({ text: "Cloud sync requires Google Login. Please re-login.", type: 'error' });
      return;
    }
    setIsPushing(true);
    const success = await db.cloud.sync(user.accessToken);
    setIsPushing(false);
    if (success) setMessage({ text: "Local data pushed to Cloud successfully!", type: 'success' });
    else setMessage({ text: "Cloud push failed. Check internet connection.", type: 'error' });
    setTimeout(() => setMessage(null), 4000);
  };

  const handlePull = async () => {
    if (!user.accessToken) {
      setMessage({ text: "Cloud sync requires Google Login. Please re-login.", type: 'error' });
      return;
    }
    if (confirm("Pulling cloud data will OVERWRITE your current local data. Proceed?")) {
      setIsPulling(true);
      const success = await db.cloud.pull(user.accessToken);
      setIsPulling(false);
      if (success) {
        setMessage({ text: "Cloud data pulled successfully! Refreshing...", type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ text: "No cloud data found or pull failed.", type: 'error' });
      }
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="no-print">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cloud Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Sync your business across all devices.</p>
      </div>

      {message && (
        <div className={`no-print p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in zoom-in-95 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* User Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-orange-100 rounded-3xl overflow-hidden">
            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-orange-600">{user.name?.charAt(0)}</div>}
          </div>
          <div>
            <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                <div className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg flex items-center space-x-1 border dark:border-slate-700">
                    <Lock size={10} className="text-orange-500" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Isolated</span>
                </div>
            </div>
            <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl font-bold text-sm flex items-center space-x-2">
          <LogOut size={20} /><span className="hidden md:inline">Sign Out</span>
        </button>
      </div>

      {/* Sync Engine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
              <Cloud size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cloud Bridge</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Store your local records in your private Google Drive space. This file is encrypted and accessible only by you.
            </p>

            <div className="space-y-3">
              <button 
                onClick={handlePush}
                disabled={isPushing}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isPushing ? <RefreshCw size={20} className="animate-spin" /> : <ArrowUp size={20} />}
                <span>{isPushing ? 'Uploading...' : 'Push to Cloud'}</span>
              </button>
              
              <button 
                onClick={handlePull}
                disabled={isPulling}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                {isPulling ? <RefreshCw size={20} className="animate-spin" /> : <ArrowDown size={20} />}
                <span>{isPulling ? 'Downloading...' : 'Pull from Cloud'}</span>
              </button>
              
              {syncState.lastSync && (
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  Last Sync: {new Date(syncState.lastSync).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <FileText size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Audit Report</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">Generate a professional PDF statement of your business activity for tax or sharing.</p>
          <button onClick={() => window.print()} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-orange-700">
            <FileText size={20} />
            <span>Generate PDF Audit</span>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/50">
        <div className="flex items-start space-x-4">
          <ShieldCheck size={24} className="text-blue-600 shrink-0" />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-300">Device Mobility</h4>
            <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
              To move to another device: 1. Sign in with the same email. 2. Authorize Drive access. 3. Go to Settings and click <b>Pull from Cloud</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
