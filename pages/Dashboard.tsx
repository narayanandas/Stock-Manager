
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../db';
import { Customer, Product, StockLog } from '../types';
import { 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  RefreshCw,
  TrendingUp,
  Banknote,
  AlertTriangle,
  History,
  CreditCard,
  Printer,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTranslation } from '../App';
import { Link } from 'react-router-dom';

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, currency, extra }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start space-x-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-xl ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider truncate">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 truncate">
        {currency ? formatINR(value) : value}
      </h3>
      {(subtitle || extra) && (
        <div className="flex items-center justify-between mt-1">
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{subtitle}</p>}
          {extra && <p className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter shrink-0">{extra}</p>}
        </div>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { t, darkMode } = useTranslation();
  const [data, setData] = useState<{
    customers: Customer[],
    products: Product[],
    logs: StockLog[]
  }>({ customers: [], products: [], logs: [] });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setData({
      customers: db.customers.getAll(),
      products: db.products.getAll(),
      logs: db.logs.getAll()
    });
  };

  const getProductBalance = (productId: string) => {
    return data.logs.reduce((acc, log) => {
      if (log.productId !== productId) return acc;
      return log.type === 'IN' ? acc + log.quantity : acc - log.quantity;
    }, 0);
  };

  const stats = useMemo(() => {
    const stockIn = data.logs.filter(l => l.type === 'IN').reduce((acc, curr) => acc + curr.quantity, 0);
    const stockOut = data.logs.filter(l => l.type === 'OUT').reduce((acc, curr) => acc + curr.quantity, 0);
    const totalSalesVal = data.logs.filter(l => l.type === 'OUT').reduce((acc, curr) => {
      const p = data.products.find(prod => prod.id === curr.productId);
      return acc + (curr.quantity * (p?.unitPrice || 0));
    }, 0);
    const totalProfit = data.logs.filter(l => l.type === 'OUT').reduce((acc, curr) => {
      const p = data.products.find(prod => prod.id === curr.productId);
      const margin = (p?.unitPrice || 0) - (p?.costPrice || 0);
      return acc + (curr.quantity * margin);
    }, 0);
    const invValue = data.products.reduce((acc, p) => {
      return acc + (getProductBalance(p.id) * p.costPrice);
    }, 0);
    const totalUnits = data.products.reduce((acc, p) => acc + getProductBalance(p.id), 0);

    return { stockIn, stockOut, totalSalesVal, totalProfit, invValue, totalUnits };
  }, [data]);

  const balance = stats.stockIn - stats.stockOut;
  
  // Low Stock Items
  const lowStockItems = data.products
    .map(p => ({ ...p, balance: getProductBalance(p.id) }))
    .filter(p => p.balance < p.minStock)
    .slice(0, 5);

  // Pending Payments
  const pendingPayments = data.logs
    .filter(l => l.type === 'OUT' && l.paymentStatus === 'PENDING')
    .slice(0, 5);

  const chartData = [
    { name: t('stockIn'), value: stats.stockIn },
    { name: t('stockOut'), value: stats.stockOut },
    { name: 'Balance', value: balance },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {/* Hidden Print Area for Dashboard Summary */}
      <div className="print-area p-10 bg-white text-black min-h-screen">
         <div className="border-b-8 border-orange-600 pb-6 mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter">Business Summary</h1>
              <p className="text-slate-500 font-bold mt-1 text-lg">Annachi Trade Intelligence System</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase text-slate-400">Date Generated</p>
              <p className="font-bold text-lg">{new Date().toLocaleString()}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="p-8 border-2 rounded-3xl">
               <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Total Sales Revenue</p>
               <h2 className="text-4xl font-black">{formatINR(stats.totalSalesVal)}</h2>
            </div>
            <div className="p-8 border-2 rounded-3xl">
               <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Net Business Profit</p>
               <h2 className="text-4xl font-black text-emerald-600">{formatINR(stats.totalProfit)}</h2>
            </div>
            <div className="p-8 border-2 rounded-3xl">
               <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Live Inventory Value</p>
               <h2 className="text-4xl font-black text-indigo-600">{formatINR(stats.invValue)}</h2>
            </div>
            <div className="p-8 border-2 rounded-3xl">
               <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Customer Base</p>
               <h2 className="text-4xl font-black text-blue-600">{data.customers.length} Accounts</h2>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-2xl font-black border-b-2 pb-2">Inventory Ledger Summary</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-4 font-black uppercase text-xs text-slate-400">Indicator</th>
                  <th className="py-4 font-black uppercase text-xs text-slate-400 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-4 font-bold">Total Stock Units Inward</td><td className="py-4 text-right font-black">{stats.stockIn}</td></tr>
                <tr><td className="py-4 font-bold">Total Stock Units Outward</td><td className="py-4 text-right font-black">{stats.stockOut}</td></tr>
                <tr><td className="py-4 font-bold">Currently Holding (Units)</td><td className="py-4 text-right font-black">{stats.totalUnits}</td></tr>
              </tbody>
            </table>
         </div>

         <div className="mt-auto pt-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Verified System Data • Confidential Report</p>
         </div>
      </div>

      <header className="flex justify-between items-end no-print">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('businessIntel')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-semibold text-lg">
            {t('realTimeAnalysis')}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => window.print()}
            className="p-3 bg-orange-600 text-white hover:bg-orange-700 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-90"
            title="Print Summary Report"
          >
            <Printer size={20} />
          </button>
          <button 
            onClick={refreshData}
            className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-orange-600 rounded-2xl shadow-sm border dark:border-slate-700 transition-all active:scale-90"
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Screen Only Content */}
      <div className="space-y-8 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title={t('inventoryValue')} 
            value={stats.invValue} 
            icon={Banknote} 
            color="bg-indigo-600" 
            currency 
            extra={`${stats.totalUnits} ${t('totalUnits')}`}
          />
          <StatCard title={t('estimatedProfit')} value={stats.totalProfit} icon={TrendingUp} color="bg-emerald-600" currency />
          <StatCard title={t('revenue')} value={stats.totalSalesVal} icon={Wallet} color="bg-orange-600" currency />
          <StatCard title={t('activeCustomers')} value={data.customers.length} icon={Users} color="bg-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                  <TrendingUp size={18} className="mr-2 text-orange-500" />
                  Inventory Analysis
                </h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: darkMode ? '#94a3b8' : '#475569', fontSize: 12, fontWeight: 'bold'}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: darkMode ? '#94a3b8' : '#475569', fontSize: 12, fontWeight: 'bold'}} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
                      }}
                      itemStyle={{ color: darkMode ? '#ffffff' : '#0f172a', fontWeight: 'bold' }}
                      labelStyle={{ color: darkMode ? '#ffffff' : '#0f172a', fontWeight: 'black', marginBottom: '4px' }}
                      cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        fill={darkMode ? "#ffffff" : "#0f172a"} 
                        fontWeight="black" 
                        fontSize={14} 
                      />
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : index === 1 ? '#10b981' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                  <History size={18} className="mr-2 text-indigo-500" />
                  {t('recentActivity')}
                </h3>
                <Link to="/reports" className="text-xs font-bold text-orange-600 hover:underline uppercase tracking-widest">{t('viewAll')}</Link>
              </div>
              <div className="divide-y dark:divide-slate-800">
                {data.logs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic text-sm">{t('noData')}</div>
                ) : (
                  data.logs.slice().reverse().slice(0, 5).map(log => {
                    const p = data.products.find(prod => prod.id === log.productId);
                    const c = data.customers.find(cust => cust.id === log.customerId);
                    return (
                      <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${log.type === 'IN' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                            {log.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{p?.name || 'Unknown'}</p>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                              {log.type === 'IN' ? t('stockIn') : t('stockOut')} • {c?.name || 'Supplier'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black ${log.type === 'IN' ? 'text-blue-600' : 'text-emerald-600'}`}>
                            {log.type === 'IN' ? '+' : '-'}{log.quantity}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(log.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-red-50/30 dark:bg-red-900/10">
                <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center text-sm">
                  <AlertTriangle size={16} className="mr-2" />
                  {t('lowStock')}
                </h3>
              </div>
              <div className="divide-y dark:divide-slate-800">
                {lowStockItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm italic">{t('noData')}</div>
                ) : (
                  lowStockItems.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{t('minStock')}: {item.minStock}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-red-600">{item.balance}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">{t('totalUnits')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-amber-50/30 dark:bg-amber-900/10">
                <h3 className="font-bold text-amber-600 dark:text-amber-400 flex items-center text-sm">
                  <CreditCard size={16} className="mr-2" />
                  {t('receivables')}
                </h3>
                <Link to="/payments" className="text-[10px] font-black text-amber-600 hover:underline uppercase tracking-tighter">{t('viewAll')}</Link>
              </div>
              <div className="divide-y dark:divide-slate-800">
                {pendingPayments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm italic">{t('noData')}</div>
                ) : (
                  pendingPayments.map(log => {
                    const cust = data.customers.find(c => c.id === log.customerId);
                    const prod = data.products.find(p => p.id === log.productId);
                    const val = log.quantity * (prod?.unitPrice || 0);
                    return (
                      <div key={log.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{cust?.name || 'Walk-in'}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{prod?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-white">{formatINR(val)}</p>
                          <p className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">{t('pending')}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
