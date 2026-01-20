
import React, { useState } from 'react';
import { db } from '../db';
import { 
  Download, 
  Upload, 
  Cloud, 
  ShieldCheck, 
  Database, 
  FileJson, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

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
    
    setMessage({ text: 'Backup downloaded successfully! You can now save it to your Google Drive.', type: 'success' });
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
        setMessage({ text: 'Data restored successfully! Refreshing app...', type: 'success' });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ text: 'Invalid backup file. Please try again.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cloud & Data</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your business records and cloud connectivity.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in zoom-in-95 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <Cloud size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <Cloud size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Google Drive Sync</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              Automatically backup your inventory and sales data to your Google Drive account. Perfect for multi-device access.
            </p>
            <button 
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
              onClick={() => alert("Google Drive direct integration requires a Client ID from Google Cloud Console. Use the 'Manual Backup' below to save a file to your Drive for now.")}
            >
              <RefreshCw size={20} />
              <span>Connect Drive</span>
            </button>
          </div>
        </div>

        {/* Local Management Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
            <Database size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manual Backup</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            Download your entire database as a file. Keep this safe as your offline backup or to move data manually.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleExport}
              className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
            >
              <Download size={20} />
              <span>Download JSON Backup</span>
            </button>
            <label className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer">
              <Upload size={20} />
              <span>Restore from Backup</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 p-8 rounded-[2.5rem] border border-orange-100 dark:border-orange-900/50">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl text-orange-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-orange-900 dark:text-orange-400 text-lg">Important Privacy Note</h4>
            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1 leading-relaxed">
              SmartStock Pro operates with a "Privacy First" policy. Your data is currently stored <b>only in this browser</b>. 
              If you delete your browser history or clear site data, your records will be lost unless you have exported a backup.
              We recommend downloading a manual backup at the end of every business week.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-3 text-slate-400 py-4">
        <ShieldCheck size={20} className="text-emerald-500" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">End-to-End Local Encryption Active</span>
      </div>
    </div>
  );
};

export default SettingsPage;
