
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
  Banknote
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTranslation } from '../App';

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
    <div className="flex-1">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
        {currency ? formatINR(value) : value}
      </h3>
      {(subtitle || extra) && (
        <div className="flex items-center justify-between mt-1">
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
          {extra && <p className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter">{extra}</p>}
        </div>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  // Use darkMode from translation context to handle chart colors
  const { t, lang, darkMode } = useTranslation();
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
    const pBalance = data.logs.reduce((b, l) => {
       if (l.productId === p.id) return l.type === 'IN' ? b + l.quantity : b - l.quantity;
       return b;
    }, 0);
    return acc + pBalance;
  }, 0);

  const invValue = data.products.reduce((acc, p) => {
    const pBalance = data.logs.reduce((b, l) => {
       if (l.productId === p.id) return l.type === 'IN' ? b + l.quantity : b - l.quantity;
       return b;
    }, 0);
    return acc + (pBalance * p.costPrice);
  }, 0);

  const chartData = [
    { name: t('stockIn'), value: stats.stockIn },
    { name: t('stockOut'), value: stats.stockOut },
    { name: 'Balance', value: balance },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('businessIntel')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('realTimeAnalysis')}</p>
        </div>
        <button 
          onClick={refreshData}
          className="p-2 text-slate-400 hover:text-orange-600 transition-colors"
          title="Refresh Dashboard Data"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 gap-8">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: darkMode ? '#ffffff' : '#475569', fontSize: 12, fontWeight: 'bold'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: darkMode ? '#ffffff' : '#475569', fontSize: 12, fontWeight: 'bold'}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                    backgroundColor: '#1e293b', 
                  }}
                  itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'black', marginBottom: '4px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  <LabelList 
                    dataKey="value" 
                    position="center" 
                    fill="#ffffff" 
                    fontWeight="black" 
                    fontSize={16} 
                  />
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : index === 1 ? '#10b981' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
