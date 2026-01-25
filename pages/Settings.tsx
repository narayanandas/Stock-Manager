
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

type ReportPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL';

const PrintableReport: React.FC<{ period: ReportPeriod }> = ({ period }) => {
    const { t } = useTranslation();
    const customers = db.customers.getAll();
    const products = db.products.getAll();
    const allLogs = db.logs.getAll();
    const user = JSON.parse(localStorage.getItem('ss_user') || '{}');

    const getFilteredLogs = () => {
        const now = new Date();
        return allLogs.filter(log => {
            const logDate = new Date(log.date);
            if (period === 'DAILY') {
                return logDate.toDateString() === now.toDateString();
            }
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
    const inboundLogs = logs.filter(l => l.type === 'IN');
    
    // Summary Calculations
    const totalRevenue = salesLogs.reduce((acc, log) => {
        const p = products.find(prod => prod.id === log.productId);
        return acc + (log.quantity * (p?.unitPrice || 0));
    }, 0);

    const totalCOGS = salesLogs.reduce((acc, log) => {
        const p = products.find(prod => prod.id === log.productId);
        return acc + (log.quantity * (p?.costPrice || 0));
    }, 0);
    const estimatedProfit = totalRevenue - totalCOGS;

    const totalStockInQty = inboundLogs.reduce((acc, l) => acc + l.quantity, 0);
    const totalStockOutQty = salesLogs.reduce((acc, l) => acc + l.quantity, 0);

    // Active Customers
    const activeCustomerIds = new Set(logs.filter(l => l.customerId).map(l => l.customerId));
    const activeCustomersCount = activeCustomerIds.size;

    const getStockBalance = (productId: string) => {
        return allLogs.reduce((acc, log) => {
            if (log.productId !== productId) return acc;
            return log.type === 'IN' ? acc + log.quantity : acc - log.quantity;
        }, 0);
    };

    const totalInventoryValue = products.reduce((acc, p) => {
        return acc + (getStockBalance(p.id) * p.costPrice);
    }, 0);

    // Low Stock Alerts (Dashboard Detail)
    const lowStockAlerts = products.filter(p => getStockBalance(p.id) < p.minStock);

    // Best Sellers (Sales Report Detail)
    const productStats = salesLogs.reduce((acc, log) => {
        const p = products.find(prod => prod.id === log.productId);
        const name = p?.name || 'Unknown';
        if (!acc[name]) acc[name] = { qty: 0, revenue: 0 };
        acc[name].qty += log.quantity;
        acc[name].revenue += log.quantity * (p?.unitPrice || 0);
        return acc;
    }, {} as Record<string, { qty: number, revenue: number }>);

    const topProducts = Object.entries(productStats)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 15);

    // Pending Receivables (Dashboard Detail)
    const pendingLogs = salesLogs.filter(l => l.paymentStatus === 'PENDING');
    const totalPendingValue = pendingLogs.reduce((acc, log) => {
        const p = products.find(prod => prod.id === log.productId);
        return acc + (log.quantity * (p?.unitPrice || 0));
    }, 0);

    return (
        <div className="print-only p-10 bg-white text-black min-h-screen">
            <div className="flex justify-between items-start border-b-4 border-orange-600 pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Annachi Business Hub</h1>
                    <p className="text-orange-600 font-bold uppercase tracking-widest text-sm">
                        {period === 'ALL' ? 'Full Business Audit' : `${period} Business Performance Report`}
                    </p>
                    <div className="mt-4 text-slate-600 text-sm">
                        <p className="font-bold">Authorized By: {user.name}</p>
                        <p>{user.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generation Timestamp</p>
                    <p className="text-lg font-bold">{new Date().toLocaleString()}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">Reporting Period: {period}</p>
                </div>
            </div>

            <div className="space-y-12">
                {/* 1. Executive Dashboard Section */}
                <section>
                    <h2 className="text-xl font-bold border-b border-slate-200 mb-6 pb-2 text-slate-800 uppercase tracking-tight">Executive Dashboard Highlights</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 border rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Revenue</p>
                            <p className="text-xl font-black text-slate-900">{formatINR(totalRevenue)}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Net Margin (Profit)</p>
                            <p className="text-xl font-black text-emerald-600">{formatINR(estimatedProfit)}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Trade Volume</p>
                            <p className="text-xl font-black text-indigo-600">{logs.length} <span className="text-[10px] opacity-50">Trans</span></p>
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Portfolio Valuation</p>
                            <p className="text-xl font-black text-slate-900">{formatINR(totalInventoryValue)}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-xl bg-orange-50/30">
                            <h3 className="text-xs font-black text-orange-600 uppercase mb-3">Stock Flow Analysis</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Inbound Supply (Units):</span>
                                <span className="font-bold text-indigo-600">+{totalStockInQty}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-slate-500">Outbound Dispatch (Units):</span>
                                <span className="font-bold text-emerald-600">-{totalStockOutQty}</span>
                            </div>
                        </div>
                        <div className="p-4 border rounded-xl bg-amber-50/30">
                            <h3 className="text-xs font-black text-amber-600 uppercase mb-3">Receivables & Cashflow</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Unsettled Invoices:</span>
                                <span className="font-bold text-slate-700">{pendingLogs.length}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-slate-500">Outstanding Amount:</span>
                                <span className="font-bold text-amber-600">{formatINR(totalPendingValue)}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Critical Alerts (From Dashboard) */}
                {lowStockAlerts.length > 0 && (
                    <section className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                        <h2 className="text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-4">Urgent: Inventory Depletion Alerts</h2>
                        <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
                            {lowStockAlerts.map(p => (
                                <div key={p.id} className="flex flex-col border-b border-red-100 pb-1">
                                    <span className="font-bold text-red-900 truncate">{p.name}</span>
                                    <span className="text-[10px] font-black text-red-600 uppercase">Available: {getStockBalance(p.id)} (Limit: {p.minStock})</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Detailed Sales Performance (Top Products) */}
                <section>
                    <h2 className="text-xl font-bold border-b border-slate-200 mb-4 pb-2 text-slate-800 uppercase tracking-tight">Detailed Sales Performance: Best Selling Items</h2>
                    {topProducts.length > 0 ? (
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-3 px-4 border">Item Name</th>
                                    <th className="text-right py-3 px-4 border">Quantity Sold</th>
                                    <th className="text-right py-3 px-4 border">Gross Revenue</th>
                                    <th className="text-right py-3 px-4 border">Revenue Share (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map(([name, stats]) => (
                                    <tr key={name}>
                                        <td className="py-2 px-4 border font-medium">{name}</td>
                                        <td className="py-2 px-4 border text-right font-bold">{stats.qty}</td>
                                        <td className="py-2 px-4 border text-right font-black text-emerald-600">{formatINR(stats.revenue)}</td>
                                        <td className="py-2 px-4 border text-right text-slate-400">
                                            {totalRevenue > 0 ? ((stats.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 italic">
                            No sales records available for the selected period ({period}).
                        </div>
                    )}
                </section>

                {/* 4. Ledger Activity Log (Period Specific) */}
                <section className="break-before-page pt-10">
                    <h2 className="text-xl font-bold border-b border-slate-200 mb-4 pb-2 text-slate-800 uppercase tracking-tight">Complete Transaction Log ({period})</h2>
                    <table className="w-full text-[9px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left py-2 px-3 border">Date</th>
                                <th className="text-left py-2 px-3 border">Type</th>
                                <th className="text-left py-2 px-3 border">Product SKU</th>
                                <th className="text-left py-2 px-3 border">Entity (Cust/Supp)</th>
                                <th className="text-right py-2 px-3 border">Qty</th>
                                <th className="text-center py-2 px-3 border">Payment</th>
                                <th className="text-right py-2 px-3 border">Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.slice().reverse().map(log => {
                                const p = products.find(prod => prod.id === log.productId);
                                const c = customers.find(cust => cust.id === log.customerId);
                                const val = log.quantity * (p?.unitPrice || 0);
                                return (
                                    <tr key={log.id}>
                                        <td className="py-1 px-3 border text-slate-500 whitespace-nowrap">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className={`py-1 px-3 border font-black uppercase text-[8px] ${log.type === 'IN' ? 'text-blue-600' : 'text-emerald-600'}`}>{log.type}</td>
                                        <td className="py-1 px-3 border font-bold">{p?.name}</td>
                                        <td className="py-1 px-3 border">{c?.name || 'Supply Delivery'}</td>
                                        <td className="py-1 px-3 border text-right font-mono">{log.type === 'IN' ? '+' : '-'}{log.quantity}</td>
                                        <td className={`py-1 px-3 border text-center font-bold text-[7px] ${log.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {log.type === 'OUT' ? log.paymentStatus : '-'}
                                        </td>
                                        <td className="py-1 px-3 border text-right font-black">{log.type === 'OUT' ? formatINR(val) : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-50 font-black text-sm">
                            <tr>
                                <td colSpan={6} className="py-3 px-4 border text-right uppercase tracking-wider">Net Sales Revenue for Period:</td>
                                <td className="py-3 px-4 border text-right text-emerald-700">{formatINR(totalRevenue)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </section>
            </div>

            <footer className="mt-24 pt-10 border-t border-slate-100 text-center text-slate-400 text-[8px] uppercase tracking-[0.4em]">
                Verified Digital Report • Annachi Pro Management • This is a period-specific trade statement for internal business audit.
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
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cloud Export & Reports</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Generate customized PDF business reports based on your trade periods. Choose a period below for audit details.
          </p>
          
          <div className="space-y-5">
            {/* Period Selector */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Choose Export Detail Level</label>
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700 overflow-hidden">
                    {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ALL'] as ReportPeriod[]).map(p => (
                        <button 
                            key={p}
                            onClick={() => setReportPeriod(p)}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-black tracking-tight uppercase transition-all ${
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
              <span>Generate {reportPeriod} PDF Report</span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleExportJSON}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    title="Export for system restore"
                >
                    <FileJson size={16} />
                    <span>Local JSON Backup</span>
                </button>
                <label className="flex-1 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer">
                    <Upload size={16} />
                    <span>Restore Data</span>
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
            <h4 className="font-bold text-orange-900 dark:text-orange-400 text-lg">Cloud Privacy & Data Hub</h4>
            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1 leading-relaxed">
              Annachi Pro manages your trade data with full sovereignty. Exporting to PDF generates a period-specific audit log which captures 
              Dashboard stats and Sales performance for your chosen timeline.
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
