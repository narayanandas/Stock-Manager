
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product, StockLog } from '../types';
import { Plus, Search, ArrowDownLeft, Package, Trash2, Calendar } from 'lucide-react';

const StockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(db.products.getAll());
    setLogs(db.logs.getAll().filter(l => l.type === 'IN'));
  };

  const handleSave = () => {
    if (!formData.productId || formData.quantity <= 0) return alert('Please select a product and valid quantity');
    db.logs.add({
      productId: formData.productId,
      quantity: formData.quantity,
      type: 'IN'
    });
    loadData();
    setIsModalOpen(false);
    setFormData({ productId: '', quantity: 0 });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-2 duration-300 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Stock In</h1>
          <p className="text-slate-500 dark:text-slate-400">Record incoming inventory deliveries.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={20} />
          <span>New Delivery</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-4">Arrival Date</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 text-sm">
              {logs.map((log) => {
                const prod = products.find(p => p.id === log.productId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <td className="px-6 py-4 flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{new Date(log.date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 dark:text-slate-200">{prod?.name}</div>
                      <div className="text-xs text-slate-400">{prod?.category}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      +{log.quantity}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300 dark:text-slate-600 font-mono">
                      #{log.id.slice(0, 8)}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    No stock deliveries recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 transform animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <ArrowDownLeft className="mr-2 text-indigo-600" />
              Log Stock Arrival
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Select Product</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all appearance-none text-slate-900 dark:text-white font-medium"
                  value={formData.productId}
                  onChange={e => setFormData({ ...formData, productId: e.target.value })}
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Quantity Added</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="number"
                    className="w-full px-10 py-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-mono text-slate-900 dark:text-white font-bold"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Confirm Arrival
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
