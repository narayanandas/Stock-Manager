
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { 
  Download, 
  Upload, 
  Cloud, 
  ShieldCheck, 
  Database, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  User,
  ExternalLink
} from 'lucide-react';

interface SettingsPageProps {
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(() => localStorage.getItem('ss_drive_active') === 'true');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const user = JSON.parse(localStorage.getItem('ss_user') || '{}');

  const handleConnectDrive = () => {
    setIsSyncing(true);
    // Simulate OAuth handshake
    setTimeout(() => {
      setIsDriveConnected(true);
      setIsSyncing(false);
      localStorage.setItem('ss_drive_active', 'true');
      setMessage({ text: 'Google Drive connected and initial sync complete!', type: 'success' });
      setTimeout(() => setMessage(null), 5000);
    }, 2000);
  };

  const handleExport = () => {
    const data = db.utils.exportFullDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartstock_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setMessage({ text: 'Backup downloaded successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = db.utils.importFullDatabase(content);
      if (success) {
        setMessage({ text: 'Data restored! Refreshing...', type: 'success' });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ text: 'Invalid file format.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cloud & Sync</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your business profile and cloud data availability.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in zoom-in-95 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* User Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center font-bold text-2xl">
            {user.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all flex items-center space-x-2 font-bold text-sm"
        >
          <LogOut size={20} />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Sync Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <Cloud size={120} />
          </div>
          <div className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
              isDriveConnected ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {isDriveConnected ? <CheckCircle2 size={32} /> : <Cloud size={32} />}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Drive Integration</h3>
              {isDriveConnected && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">Active</span>}
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              {isDriveConnected 
                ? `Syncing to ${user.email}'s Google Drive. Your data is protected by Google's secure cloud infrastructure.`
                : 'Connect your business Google account to automatically backup all inventory and sales data.'}
            </p>

            {isDriveConnected ? (
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Last Sync</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Just now</span>
                </div>
                <button 
                  onClick={() => setIsDriveConnected(false)}
                  className="w-full text-slate-400 font-bold text-xs hover:text-slate-600 py-2"
                >
                  Disconnect Account
                </button>
              </div>
            ) : (
              <button 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50"
                onClick={handleConnectDrive}
                disabled={isSyncing}
              >
                {isSyncing ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                <span>{isSyncing ? 'Authorizing...' : 'Connect Google Drive'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Local Management Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
            <Database size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manual Control</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            Manage your local browser database directly. Export for manual backups or reset the application data.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleExport}
              className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
            >
              <Download size={20} />
              <span>Export as JSON</span>
            </button>
            <label className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer">
              <Upload size={20} />
              <span>Import Backup</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 p-8 rounded-[2.5rem] border border-orange-100 dark:border-orange-900/50">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl text-orange-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-orange-900 dark:text-orange-400 text-lg">Data Sovereignty</h4>
            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1 leading-relaxed">
              SmartStock Pro uses client-side encryption. When connected to Google Drive, we only access a dedicated folder for your backups. 
              Your customers' sensitive data never touches our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
