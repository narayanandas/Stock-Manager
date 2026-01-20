
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product, Customer, StockLog } from '../types';
import { Plus, ArrowUpRight, User, ShoppingBag, CreditCard, IndianRupee } from 'lucide-react';

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const SalesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: '',
    customerId: '',
    quantity: 0,
    paymentStatus: 'PENDING' as 'PAID' | 'PENDING'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(db.products.getAll());
    setCustomers(db.customers.getAll());
    setLogs(db.logs.getAll().filter(l => l.type === 'OUT'));
  };

  const handleSave = () => {
    if (!formData.productId || !formData.customerId || formData.quantity <= 0) return alert('Fill all fields');
    db.logs.add({
      productId: formData.productId,
      customerId: formData.customerId,
      quantity: formData.quantity,
      type: 'OUT',
      paymentStatus: formData.paymentStatus
    });
    loadData();
    setIsModalOpen(false);
    setFormData({ productId: '', customerId: '', quantity: 0, paymentStatus: 'PENDING' });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-2 duration-300 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales & Dispatch</h1>
          <p className="text-slate-500 dark:text-slate-400">Track outward stock movements.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-emerald-700 shadow-lg">
          <Plus size={20} />
          <span>Record New Sale</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs font-semibold uppercase">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 text-sm">
              {logs.map((log) => {
                const prod = products.find(p => p.id === log.productId);
                const cust = customers.find(c => c.id === log.customerId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-slate-100">{cust?.name}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{prod?.name}</td>
                    <td className="px-8 py-5 font-mono font-black text-emerald-600">-{log.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl p-12 transform animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10">Dispatch Entry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-3">Customer</label>
                <select className="w-full px-4 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-medium" value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })}>
                  <option value="">Select Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-3">Product</label>
                <select className="w-full px-4 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-medium" value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                  <option value="">Select Product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-3">Quantity</label>
                <input type="number" className="w-full px-6 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-bold" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="mt-12 flex space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl">Finalize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
