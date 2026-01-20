
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product } from '../types';
import { Plus, Search, Trash2, Edit2, ShoppingBag, Package, IndianRupee, AlertTriangle } from 'lucide-react';

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    costPrice: 0,
    unitPrice: 0,
    minStock: 5
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => setProducts(db.products.getAll());

  const handleOpenModal = (p?: Product) => {
    if (p) {
      setEditingId(p.id);
      setFormData({ 
        name: p.name, 
        category: p.category, 
        costPrice: p.costPrice, 
        unitPrice: p.unitPrice, 
        minStock: p.minStock 
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', category: 'General', costPrice: 0, unitPrice: 0, minStock: 5 });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return alert('Product name is required');
    if (editingId) {
      db.products.update(editingId, formData);
    } else {
      db.products.add(formData);
    }
    loadProducts();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this product? Warning: This may affect history.')) {
      db.products.delete(id);
      loadProducts();
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Product Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage items, pricing, and stock thresholds.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-orange-700 shadow-lg shadow-orange-200 dark:shadow-none transition-all"
        >
          <Plus size={20} />
          <span>Add New Item</span>
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search items by name or category..." 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm text-slate-700 dark:text-slate-200 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(product => (
          <div key={product.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-orange-200 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-orange-50 dark:bg-slate-800 text-orange-600 rounded-2xl flex items-center justify-center">
                <ShoppingBag size={28} />
              </div>
              <div className="flex space-x-1">
                <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-800 dark:text-white text-xl mb-1">{product.name}</h3>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{product.category}</span>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cost Price</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatINR(product.costPrice)}</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
                <p className="text-[10px] font-bold text-orange-400 uppercase">Sale Price</p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatINR(product.unitPrice)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <AlertTriangle size={14} className="text-amber-500" />
              <span>Min Stock Threshold: <b>{product.minStock} units</b></span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 transform animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Product Name</label>
                <input 
                  className="w-full px-5 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all text-slate-700 dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ultra Fast Charger"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Category</label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all text-slate-700 dark:text-white appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Stationery">Stationery</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Min Stock Alert</label>
                <input 
                  type="number"
                  className="w-full px-5 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all text-slate-700 dark:text-white"
                  value={formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Cost Price (₹)</label>
                <input 
                  type="number"
                  className="w-full px-5 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all text-slate-700 dark:text-white font-bold"
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Sale Price (₹)</label>
                <input 
                  type="number"
                  className="w-full px-5 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all text-slate-700 dark:text-white font-bold"
                  value={formData.unitPrice}
                  onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="mt-10 flex space-x-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-100 dark:shadow-none hover:bg-orange-700 transition-all"
              >
                {editingId ? 'Update Item' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
