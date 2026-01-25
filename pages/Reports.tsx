
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product, StockLog } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  IndianRupee, 
  Calendar,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>('DAILY');
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLogs(db.logs.getAll().filter(l => l.type === 'OUT'));
    setProducts(db.products.getAll());
  }, []);

  const getFilteredLogs = () => {
    const now = new Date();
    return logs.filter(log => {
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

  const filteredLogs = getFilteredLogs();
  
  const totalRevenue = filteredLogs.reduce((acc, log) => {
    const p = products.find(prod => prod.id === log.productId);
    return acc + (log.quantity * (p?.unitPrice || 0));
  }, 0);

  const totalUnits = filteredLogs.reduce((acc, log) => acc + log.quantity, 0);

  // Top products calculation
  const productStats = filteredLogs.reduce((acc, log) => {
    const p = products.find(prod => prod.id === log.productId);
    const name = p?.name || 'Unknown';
    if (!acc[name]) acc[name] = { qty: 0, revenue: 0 };
    acc[name].qty += log.quantity;
    acc[name].revenue += log.quantity * (p?.unitPrice || 0);
    return acc;
  }, {} as Record<string, { qty: number, revenue: number }>);

  const topProducts = (Object.entries(productStats) as [string, { qty: number; revenue: number }][])
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Sales Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-semibold text-lg">Detailed performance insights for your business periods.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex overflow-x-auto no-scrollbar">
          {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                period === p 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
            <IndianRupee size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{formatINR(totalRevenue)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
            <ShoppingBag size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Units Dispatched</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{totalUnits} <span className="text-sm font-bold text-slate-400">units</span></h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trade Count</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{filteredLogs.length} <span className="text-sm font-bold text-slate-400">sales</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <ShoppingBag size={20} className="mr-3 text-orange-600" />
              Best Sellers ({period.toLowerCase()})
            </h3>
          </div>
          <div className="p-4">
            {topProducts.length === 0 ? (
              <div className="py-20 text-center text-slate-400 italic">No sales data for this period.</div>
            ) : (
              <div className="space-y-3">
                {topProducts.map(([name, stats], idx) => (
                  <div key={name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center font-black text-slate-400 border dark:border-slate-800">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{name}</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{stats.qty} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">{formatINR(stats.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <Calendar size={20} className="mr-3 text-blue-600" />
              Recent Logs
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
             {filteredLogs.length === 0 ? (
               <div className="py-20 text-center text-slate-400 italic">No transactions recorded.</div>
             ) : (
               filteredLogs.slice().reverse().map(log => {
                 const p = products.find(prod => prod.id === log.productId);
                 return (
                   <div key={log.id} className="flex items-center justify-between p-4 border dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <div>
                       <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
                       <p className="font-bold text-slate-800 dark:text-white">{p?.name}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-black text-emerald-600">{formatINR(log.quantity * (p?.unitPrice || 0))}</p>
                       <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{log.paymentStatus}</p>
                     </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
