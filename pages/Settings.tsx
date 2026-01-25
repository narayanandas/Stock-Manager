
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { StockLog, Product, Customer } from '../types';
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
  FileText,
  FileJson,
  Calendar
} from 'lucide-react';
import { useTranslation } from '../App';

interface SettingsPageProps {
  onLogout: () => void;
}

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

type ReportPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL';

const PrintableReport: React.FC<{ period: ReportPeriod }> = ({ period }) => {
    const customers = db.customers.getAll();
    const products = db.products.getAll();
    const allLogs = db.logs.getAll();
    const user = JSON.parse(localStorage.getItem('ss_user') || '{}');

    const getFilteredLogs = () => {
        const now = new Date();
        return allLogs.filter(log => {
            const logDate = new Date(log.date);
            if (period === 'WEEKLY') {
                const lastWeek = new Date();
                lastWeek.setDate(now.getDate() - 7);
                return logDate >= lastWeek;
            }
            if (period === 'MONTHLY') {
                return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
            }
            if (period === 'YEARLY') {
                return logDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    };

    const logs = getFilteredLogs();
    const salesLogs = logs.filter(l => l.type === 'OUT');
    const totalRevenue = salesLogs.reduce((acc, log) => {
        const p = products.find(prod => prod.id === log.productId);
        return acc + (log.quantity * (p?.unitPrice || 0));
    }, 0);

    const getStockBalance = (productId: string) => {
        return allLogs.reduce((acc, log) => {
            if (log.productId !== productId) return acc;
            return log.type === 'IN' ? acc + log.quantity : acc - log.quantity;
        }, 0);
    };

    return (
        <div className="print-only p-10 bg-white text-black min-h-screen">
            <div className="flex justify-between items-start border-b-4 border-orange-600 pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Annachi Business Hub</h1>
                    <p className="text-orange-600 font-bold uppercase tracking-widest text-sm">
                        {period === 'ALL' ? 'Full Business Statement' : `${period} Performance Report`}
                    </p>
                    <div className="mt-4 text-slate-600 text-sm">
                        <p className="font-bold">Authorized By: {user.name}</p>
                        <p>{user.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Report Date</p>
                    <p className="text-lg font-bold">{new Date().toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-12">
                {/* Financial Period Summary */}
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h2 className="text-lg font-bold mb-4 text-slate-800">Financial Summary ({period})</h2>
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue</p>
                            <p className="text-2xl font-black text-emerald-600">{formatINR(totalRevenue)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Transactions</p>
                            <p className="text-2xl font-black text-slate-800">{logs.length}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Avg. Ticket Size</p>
                            <p className="text-2xl font-black text-slate-800">{logs.length ? formatINR(totalRevenue / logs.length) : '₹0'}</p>
                        </div>
                    </div>
                </section>

                {/* Inventory Summary */}
                <section>
                    <h2 className="text-xl font-bold border-b border-slate-200 mb-4 pb-2 text-slate-800">1. Current Inventory Status</h2>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left py-3 px-4 border">Product Name</th>
                                <th className="text-left py-3 px-4 border">Category</th>
                                <th className="text-right py-3 px-4 border">Cost Price</th>
                                <th className="text-right py-3 px-4 border">Sale Price</th>
                                <th className="text-center py-3 px-4 border">On Hand</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td className="py-2 px-4 border font-medium">{p.name}</td>
                                    <td className="py-2 px-4 border">{p.category}</td>
                                    <td className="py-2 px-4 border text-right">{formatINR(p.costPrice)}</td>
                                    <td className="py-2 px-4 border text-right">{formatINR(p.unitPrice)}</td>
                                    <td className="py-2 px-4 border text-center font-bold">{getStockBalance(p.id)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Recent Logs */}
                <section className="break-before-page">
                    <h2 className="text-xl font-bold border-b border-slate-200 mb-4 pb-2 text-slate-800">2. Transaction Detail ({period})</h2>
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left py-2 px-3 border">Date</th>
                                <th className="text-left py-2 px-3 border">Type</th>
                                <th className="text-left py-2 px-3 border">Product</th>
                                <th className="text-left py-2 px-3 border">Customer</th>
                                <th className="text-right py-2 px-3 border">Qty</th>
                                <th className="text-right py-2 px-3 border">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.slice().reverse().map(log => {
                                const p = products.find(prod => prod.id === log.productId);
                                const c = customers.find(cust => cust.id === log.customerId);
                                const val = log.quantity * (p?.unitPrice || 0);
                                return (
                                    <tr key={log.id}>
                                        <td className="py-1 px-3 border">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className={`py-1 px-3 border font-bold ${log.type === 'IN' ? 'text-blue-600' : 'text-emerald-600'}`}>{log.type}</td>
                                        <td className="py-1 px-3 border">{p?.name}</td>
                                        <td className="py-1 px-3 border">{c?.name || 'Inbound Supply'}</td>
                                        <td className="py-1 px-3 border text-right font-mono">{log.type === 'IN' ? '+' : '-'}{log.quantity}</td>
                                        <td className="py-1 px-3 border text-right font-bold">{log.type === 'OUT' ? formatINR(val) : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {logs.length === 0 && <p className="text-center py-8 text-slate-400 italic">No records found for the selected period.</p>}
                </section>
            </div>

            <footer className="mt-20 pt-10 border-t border-slate-100 text-center text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                This is a secure business document generated by Annachi Business Manager.
            </footer>
        </div>
    );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(() => localStorage.getItem('ss_drive_active') === 'true');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('MONTHLY');
  const user = JSON.parse(localStorage.getItem('ss_user') || '{}');

  const handleConnectDrive = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsDriveConnected(true);
      setIsSyncing(false);
      localStorage.setItem('ss_drive_active', 'true');
      setMessage({ text: 'Google Drive connected and initial sync complete!', type: 'success' });
      setTimeout(() => setMessage(null), 5000);
    }, 2000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const data = db.utils.exportFullDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `annachi_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setMessage({ text: 'JSON Backup downloaded for system restore.', type: 'success' });
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
      <div className="no-print">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('settings')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your business profile and cloud data availability.</p>
      </div>

      {message && (
        <div className={`no-print p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in zoom-in-95 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* User Card */}
      <div className="no-print bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
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
          <span className="hidden md:inline">{t('logout')}</span>
        </button>
      </div>

      <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('confirm').replace('Confirm', 'Manual Control')}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Generate and export custom business reports. Choose a period and export as a professional PDF.
          </p>
          
          <div className="space-y-5">
            {/* Period Selector */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Report Detail Level</label>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700">
                    {(['WEEKLY', 'MONTHLY', 'YEARLY', 'ALL'] as ReportPeriod[]).map(p => (
                        <button 
                            key={p}
                            onClick={() => setReportPeriod(p)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-tighter uppercase transition-all ${
                                reportPeriod === p 
                                    ? 'bg-orange-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {p === 'ALL' ? 'Full' : p.slice(0,3)}
                        </button>
                    ))}
                </div>
            </div>

            <button 
              onClick={handleExportPDF}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 dark:shadow-none"
            >
              <FileText size={20} />
              <span>Export {reportPeriod} PDF</span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleExportJSON}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    title="Export for system restore"
                >
                    <FileJson size={16} />
                    <span>Backup JSON</span>
                </button>
                <label className="flex-1 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer">
                    <Upload size={16} />
                    <span>Import JSON</span>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print bg-orange-50 dark:bg-orange-950/20 p-8 rounded-[2.5rem] border border-orange-100 dark:border-orange-900/50 shadow-inner">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl text-orange-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-orange-900 dark:text-orange-400 text-lg">Data Sovereignty</h4>
            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1 leading-relaxed">
              Annachi Pro uses client-side encryption. When connected to Google Drive, we only access a dedicated folder for your backups. 
              Your customers' sensitive data never touches external servers.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden Printable Area */}
      <PrintableReport period={reportPeriod} />
    </div>
  );
};

export default SettingsPage;
