
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Product, Customer, StockLog } from '../types';
import { Plus, ArrowUpRight, User, ShoppingBag, CreditCard, IndianRupee, Printer, Maximize } from 'lucide-react';

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

  const selectedProduct = products.find(p => p.id === formData.productId);
  const totalCost = (selectedProduct?.unitPrice || 0) * formData.quantity;

  const handleSave = () => {
    if (!formData.productId || !formData.customerId || formData.quantity <= 0) {
      return alert('Please fill all fields');
    }

    const currentStock = db.logs.getAll().reduce((acc, l) => {
      if (l.productId === formData.productId) {
        return l.type === 'IN' ? acc + l.quantity : acc - l.quantity;
      }
      return acc;
    }, 0);

    if (currentStock < formData.quantity) {
      return alert(`Insufficient stock. Current balance: ${currentStock}`);
    }

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

  const handlePrint = () => {
    window.print();
  };

  const handleScan = () => {
    alert("Requesting camera access for barcode scan...");
    // Future: Integrate a library like html5-qrcode
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => alert("Scanner Ready! Simulating read..."))
      .catch(e => alert("Camera denied or unavailable."));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-2 duration-300 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales & Dispatch</h1>
          <p className="text-slate-500 dark:text-slate-400">Track outward movements and invoices.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleScan}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all flex items-center space-x-2"
          >
            <Maximize size={20} />
            <span className="hidden md:inline font-bold">Scan</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all"
          >
            <Plus size={20} />
            <span>Record New Sale</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Customer Entity</th>
                <th className="px-8 py-5">Product SKU</th>
                <th className="px-8 py-5">Quantity</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 text-sm">
              {logs.map((log) => {
                const prod = products.find(p => p.id === log.productId);
                const cust = customers.find(c => c.id === log.customerId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-8 py-5 text-slate-500 whitespace-nowrap font-medium">
                      {new Date(log.date).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-slate-100">
                      {cust?.name || 'Walk-in Customer'}
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400 font-medium">
                      {prod?.name}
                    </td>
                    <td className="px-8 py-5 font-mono font-black text-emerald-600">
                      -{log.quantity}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        log.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {log.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={handlePrint}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Print Invoice"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    No sales recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl p-12 transform animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10 flex items-center">
              <ArrowUpRight className="mr-3 text-emerald-600" size={32} />
              Dispatch Entry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Client Selection</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={20} className="text-slate-400" />
                  </div>
                  <select 
                    className="w-full px-12 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all appearance-none text-slate-700 dark:text-white font-medium"
                    value={formData.customerId}
                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                  >
                    <option value="">Select Customer Entity...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">SKU Identification</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShoppingBag size={20} className="text-slate-400" />
                  </div>
                  <select 
                    className="w-full px-12 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all appearance-none text-slate-700 dark:text-white font-medium"
                    value={formData.productId}
                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  >
                    <option value="">Select Product from Catalog...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatINR(p.unitPrice)}/unit)</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Unit Count</label>
                <input 
                  type="number"
                  className="w-full px-6 py-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono font-bold text-slate-700 dark:text-white"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Ledger State</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                  <button 
                    onClick={() => setFormData({...formData, paymentStatus: 'PAID'})}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${formData.paymentStatus === 'PAID' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-500'}`}
                  >
                    PAID
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, paymentStatus: 'PENDING'})}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${formData.paymentStatus === 'PENDING' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-slate-500'}`}
                  >
                    PENDING
                  </button>
                </div>
              </div>
              {formData.productId && formData.quantity > 0 && (
                <div className="md:col-span-2 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/50 flex justify-between items-center animate-in zoom-in-95">
                  <div className="flex items-center space-x-3 text-emerald-800 dark:text-emerald-400">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg"><IndianRupee size={20} /></div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Settlement Amount</span>
                  </div>
                  <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{formatINR(totalCost)}</span>
                </div>
              )}
            </div>
            <div className="mt-12 flex space-x-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard size={20} />
                <span>Finalize Transaction</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
