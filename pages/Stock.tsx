
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product, StockLog } from '../types';
import { Plus, ArrowDownLeft, Package, Calendar, Edit2, Trash2, X, Minus } from 'lucide-react';

const StockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  const handleOpenModal = (log?: StockLog) => {
    if (log) {
      setEditingId(log.id);
      setFormData({
        productId: log.productId,
        quantity: log.quantity
      });
    } else {
      setEditingId(null);
      setFormData({ productId: '', quantity: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.productId || formData.quantity <= 0) return alert('Please select a product and valid quantity');
    
    if (editingId) {
      db.logs.update(editingId, formData);
    } else {
      db.logs.add({
        productId: formData.productId,
        quantity: formData.quantity,
        type: 'IN'
      });
    }
    
    loadData();
    setIsModalOpen(false);
    setFormData({ productId: '', quantity: 0 });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this stock entry? This will adjust the balance.')) {
      db.logs.delete(id);
      loadData();
    }
  };

  const adjustQty = (amount: number) => {
    setFormData(prev => ({ ...prev, quantity: Math.max(0, prev.quantity + amount) }));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-2 duration-300 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Stock In</h1>
          <p className="text-slate-500 dark:text-slate-400">Record incoming inventory deliveries.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 shadow-lg transition-all active:scale-95">
          <Plus size={20} />
          <span>New Delivery</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-4 text-[10px] tracking-widest">Arrival Date</th>
                <th className="px-6 py-4 text-[10px] tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] tracking-widest">Quantity</th>
                <th className="px-6 py-4 text-[10px] tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No incoming stock records found.</td>
                </tr>
              ) : (
                logs.slice().reverse().map((log) => {
                  const prod = products.find(p => p.id === log.productId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{new Date(log.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{prod?.name || 'Deleted Product'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">+{log.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(log)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(log.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-900/10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Entry' : 'Log Arrival'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-widest">Product</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black dark:text-white font-medium appearance-none"
                  value={formData.productId}
                  onChange={e => setFormData({ ...formData, productId: e.target.value })}
                >
                  <option value="">Select Product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-widest">Quantity Delivered</label>
                <div className="flex items-center space-x-4">
                  <button 
                    type="button"
                    onClick={() => adjustQty(-1)}
                    className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors active:scale-95"
                  >
                    <Minus size={20} />
                  </button>
                  <input 
                    type="number" 
                    className="flex-1 px-4 py-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black dark:text-white font-bold text-center" 
                    value={formData.quantity} 
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} 
                  />
                  <button 
                    type="button"
                    onClick={() => adjustQty(1)}
                    className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors active:scale-95"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
              >
                {editingId ? 'Update Record' : 'Confirm Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
