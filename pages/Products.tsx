
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
      setFormData({ name: p.name, category: p.category, costPrice: p.costPrice, unitPrice: p.unitPrice, minStock: p.minStock });
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
    if (confirm('Delete this product?')) {
      db.products.delete(id);
      loadProducts();
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Product Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage items, pricing, and stock.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-orange-700 shadow-lg transition-all">
          <Plus size={20} />
          <span>Add New Item</span>
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search catalog..." 
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-4 rounded-2xl focus:outline-none transition-all shadow-sm text-black dark:text-white font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(product => (
          <div key={product.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 group relative">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-orange-50 dark:bg-slate-800 text-orange-600 rounded-2xl flex items-center justify-center">
                <ShoppingBag size={28} />
              </div>
              <div className="flex space-x-1">
                <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-xl mb-1">{product.name}</h3>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{product.category}</span>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 transform animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Product Name</label>
                <input className="w-full px-5 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-medium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Cost Price (₹)</label>
                <input type="number" className="w-full px-5 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-bold" value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Sale Price (₹)</label>
                <input type="number" className="w-full px-5 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-bold" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="mt-10 flex space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl">Discard</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
