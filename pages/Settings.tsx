
import React, { useState, useMemo } from 'react';
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
  ArrowDown,
  Download,
  Printer,
  TrendingUp,
  Banknote,
  Users,
  Package
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

  // Calculate Business Stats for Export/Audit
  const auditData = useMemo(() => {
    const customers = db.customers.getAll();
    const products = db.products.getAll();
    const logs = db.logs.getAll();

    const getProductBalance = (productId: string) => {
      return logs.reduce((acc, log) => {
        if (log.productId !== productId) return acc;
        return log.type === 'IN' ? acc + log.quantity : acc - log.quantity;
      }, 0);
    };

    const revenue = logs.filter(l => l.type === 'OUT').reduce((acc, curr) => {
      const p = products.find(prod => prod.id === curr.productId);
      return acc + (curr.quantity * (p?.unitPrice || 0));
    }, 0);

    const profit = logs.filter(l => l.type === 'OUT').reduce((acc, curr) => {
      const p = products.find(prod => prod.id === curr.productId);
      const margin = (p?.unitPrice || 0) - (p?.costPrice || 0);
      return acc + (curr.quantity * margin);
    }, 0);

    const invValue = products.reduce((acc, p) => {
      return acc + (getProductBalance(p.id) * p.costPrice);
    }, 0);

    const receivables = logs.filter(l => l.type === 'OUT' && l.paymentStatus === 'PENDING').reduce((acc, curr) => {
      const p = products.find(prod => prod.id === curr.productId);
      return acc + (curr.quantity * (p?.unitPrice || 0));
    }, 0);

    return {
      revenue,
      profit,
      invValue,
      receivables,
      customerCount: customers.length,
      productCount: products.length,
      tradeCount: logs.length,
      timestamp: new Date().toLocaleString()
    };
  }, []);

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

  const downloadJson = () => {
    const data = db.utils.exportFullDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annachi_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Printable Audit View (Hidden on screen) */}
      <div className="hidden print:block print-area p-10 bg-white text-black">
         <div className="border-b-4 border-orange-600 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Annachi Business Audit</h1>
              <p className="text-slate-500 font-bold">Generated for: {user.name} ({user.email})</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase text-slate-400">Date Generated</p>
              <p className="font-bold">{auditData.timestamp}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="p-6 bg-slate-50 rounded-2xl border">
               <p className="text-xs font-black text-slate-400 uppercase mb-1">Total Revenue</p>
               <h2 className="text-3xl font-black text-slate-900">{formatINR(auditData.revenue)}</h2>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border">
               <p className="text-xs font-black text-slate-400 uppercase mb-1">Estimated Profit</p>
               <h2 className="text-3xl font-black text-emerald-600">{formatINR(auditData.profit)}</h2>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border">
               <p className="text-xs font-black text-slate-400 uppercase mb-1">Inventory Value</p>
               <h2 className="text-3xl font-black text-indigo-600">{formatINR(auditData.invValue)}</h2>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border">
               <p className="text-xs font-black text-slate-400 uppercase mb-1">Pending Receivables</p>
               <h2 className="text-3xl font-black text-orange-600">{formatINR(auditData.receivables)}</h2>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">Business Health Metrics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
               <div className="py-4 border rounded-xl">
                  <p className="text-3xl font-black">{auditData.customerCount}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Customers</p>
               </div>
               <div className="py-4 border rounded-xl">
                  <p className="text-3xl font-black">{auditData.productCount}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Catalog Items</p>
               </div>
               <div className="py-4 border rounded-xl">
                  <p className="text-3xl font-black">{auditData.tradeCount}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Transactions</p>
               </div>
            </div>
         </div>

         <div className="mt-20 pt-10 border-t text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
            Digital Signature Verified • Annachi Trade Intelligence
         </div>
      </div>

      <div className="no-print space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cloud Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Sync your business across all devices.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in zoom-in-95 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span className="font-bold text-sm">{message.text}</span>
          </div>
        )}

        {/* User Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-3xl overflow-hidden flex items-center justify-center">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-orange-600 uppercase">{user.name?.charAt(0)}</div>}
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
                Store your local records in your private Google Drive space. This file is accessible only by you.
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

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm flex flex-col">
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <FileText size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Audit Reports</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Export your business performance data and financial summaries.</p>
            
            <div className="space-y-3 mt-auto">
              <button 
                onClick={() => window.print()} 
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-orange-700 shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95"
              >
                <Printer size={20} />
                <span>Print PDF Audit Report</span>
              </button>
              
              <button 
                onClick={downloadJson}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Download size={20} />
                <span>Export JSON Backup</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-start space-x-4">
            <ShieldCheck size={24} className="text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-300">Data Integrity</h4>
              <p className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
                The Audit Report pulls live data from your dashboard. For a full migration to another device, use <b>Export JSON Backup</b> then import it on your new device, or use the <b>Cloud Bridge</b>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
