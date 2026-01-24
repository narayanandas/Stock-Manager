
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product, Customer, StockLog } from '../types';
import { Plus, Edit2, Trash2, X, ShoppingBag, User, ArrowUpRight, Minus } from 'lucide-react';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    customerId: '',
    quantity: 1,
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

  const handleOpenModal = (log?: StockLog) => {
    if (log) {
      setEditingId(log.id);
      setFormData({
        productId: log.productId,
        customerId: log.customerId || '',
        quantity: log.quantity,
        paymentStatus: log.paymentStatus || 'PENDING'
      });
    } else {
      setEditingId(null);
      setFormData({ productId: '', customerId: '', quantity: 1, paymentStatus: 'PENDING' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.productId || !formData.customerId || formData.quantity <= 0) return alert('Fill all fields correctly');
    
    if (editingId) {
      db.logs.update(editingId, formData);
    } else {
      db.logs.add({
        productId: formData.productId,
        customerId: formData.customerId,
        quantity: formData.quantity,
        type: 'OUT',
        paymentStatus: formData.paymentStatus
      });
    }
    
    loadData();
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this sale record? Inventory balance will be restored.')) {
      db.logs.delete(id);
      loadData();
    }
  };

  const adjustQty = (amount: number) => {
    setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity + amount) }));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-2 duration-300 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales & Dispatch</h1>
          <p className="text-slate-500 dark:text-slate-400">Track outward stock movements and payments.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-emerald-700 shadow-lg transition-all active:scale-95">
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
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">No sales recorded yet.</td>
                </tr>
              ) : (
                logs.slice().reverse().map((log) => {
                  const prod = products.find(p => p.id === log.productId);
                  const cust = customers.find(c => c.id === log.customerId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-8 py-5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{cust?.name || 'Walk-in'}</td>
                      <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{prod?.name}</td>
                      <td className="px-8 py-5">
                        <span className="font-mono font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">-{log.quantity}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(log)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(log.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-emerald-50/30 dark:bg-emerald-900/10">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{editingId ? 'Edit Sale' : 'Finalize Dispatch'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={32} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-widest">Customer</label>
                  <select 
                    className="w-full px-4 py-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-black dark:text-white font-medium appearance-none" 
                    value={formData.customerId} 
                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                  >
                    <option value="">Select Customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-widest">Product</label>
                  <select 
                    className="w-full px-4 py-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-black dark:text-white font-medium appearance-none" 
                    value={formData.productId} 
                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-widest">Quantity</label>
                    <div className="flex items-center space-x-3 w-full">
                      <button 
                        type="button"
                        onClick={() => adjustQty(-1)}
                        className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center active:scale-95 shrink-0"
                      >
                        <Minus size={20} />
                      </button>
                      <input 
                        type="number" 
                        className="flex-1 h-14 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-black dark:text-white font-bold text-center text-xl" 
                        value={formData.quantity} 
                        onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} 
                      />
                      <button 
                        type="button"
                        onClick={() => adjustQty(1)}
                        className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center active:scale-95 shrink-0"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-widest">Initial Payment Status</label>
                    <select 
                      className="w-full h-14 px-6 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-black dark:text-white font-bold appearance-none" 
                      value={formData.paymentStatus} 
                      onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50 dark:bg-slate-800/50 flex space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">Discard</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all">
                {editingId ? 'Update Sale' : 'Dispatch Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
