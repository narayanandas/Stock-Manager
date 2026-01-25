
import React, { useEffect, useState } from 'react';
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

  const stats = {
    totalCustomers: data.customers.length,
    stockIn: data.logs.filter(l => l.type === 'IN').reduce((acc, curr) => acc + curr.quantity, 0),
    stockOut: data.logs.filter(l => l.type === 'OUT').reduce((acc, curr) => acc + curr.quantity, 0),
    totalSalesVal: data.logs.filter(l => l.type === 'OUT').reduce((acc, curr) => {
      const p = data.products.find(prod => prod.id === curr.productId);
      return acc + (curr.quantity * (p?.unitPrice || 0));
    }, 0),
    totalProfit: data.logs.filter(l => l.type === 'OUT').reduce((acc, curr) => {
      const p = data.products.find(prod => prod.id === curr.productId);
      const margin = (p?.unitPrice || 0) - (p?.costPrice || 0);
      return acc + (curr.quantity * margin);
    }, 0),
  };

  const balance = stats.stockIn - stats.stockOut;
  
  const totalUnits = data.products.reduce((acc, p) => {
    return acc + getProductBalance(p.id);
  }, 0);

  const invValue = data.products.reduce((acc, p) => {
    return acc + (getProductBalance(p.id) * p.costPrice);
  }, 0);

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('businessIntel')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-semibold text-lg">
            {t('realTimeAnalysis')}
          </p>
        </div>
        <button 
          onClick={refreshData}
          className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-orange-600 rounded-2xl shadow-sm border dark:border-slate-700 transition-all active:scale-90"
          title="Refresh Dashboard Data"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('inventoryValue')} 
          value={invValue} 
          icon={Banknote} 
          color="bg-indigo-600" 
          currency 
          extra={`${totalUnits} ${t('totalUnits')}`}
        />
        <StatCard title={t('estimatedProfit')} value={stats.totalProfit} icon={TrendingUp} color="bg-emerald-600" currency />
        <StatCard title={t('revenue')} value={stats.totalSalesVal} icon={Wallet} color="bg-orange-600" currency />
        <StatCard title={t('activeCustomers')} value={stats.totalCustomers} icon={Users} color="bg-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Column */}
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

          {/* Recent Activity Section */}
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

        {/* Sidebar Column: Low Stock & Pending Payments */}
        <div className="space-y-8">
          {/* Low Stock Alerts */}
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

          {/* Pending Receivables */}
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
  );
};

export default Dashboard;
