
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, currency }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start space-x-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-xl ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
        {currency ? formatINR(value) : value}
      </h3>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
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
  const invValue = data.products.reduce((acc, p) => {
    const pBalance = data.logs.reduce((b, l) => {
       if (l.productId === p.id) return l.type === 'IN' ? b + l.quantity : b - l.quantity;
       return b;
    }, 0);
    return acc + (pBalance * p.costPrice);
  }, 0);

  const chartData = [
    { name: 'Stock In', value: stats.stockIn },
    { name: 'Sold', value: stats.stockOut },
    { name: 'Balance', value: balance },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Business Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time inventory & trade analysis for your enterprise.</p>
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
        <StatCard title="Inventory Value" value={invValue} icon={Banknote} color="bg-indigo-600" currency />
        <StatCard title="Estimated Profit" value={stats.totalProfit} icon={TrendingUp} color="bg-emerald-600" currency />
        <StatCard title="Revenue (Total)" value={stats.totalSalesVal} icon={Wallet} color="bg-orange-600" currency />
        <StatCard title="Active Customers" value={stats.totalCustomers} icon={Users} color="bg-blue-600" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
              <TrendingUp size={18} className="mr-2 text-orange-500" />
              Inventory Volume Distribution
            </h3>
            <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div> Inbound</span>
              <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Outbound</span>
              <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div> Net Stock</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                    backgroundColor: '#1e293b', 
                    color: '#f8fafc' 
                  }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
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
