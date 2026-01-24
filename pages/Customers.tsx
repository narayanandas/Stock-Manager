
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Customer, Product, StockLog } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Mail, 
  Phone, 
  MapPin, 
  History, 
  X, 
  ShoppingBag, 
  CreditCard, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => setCustomers(db.customers.getAll());

  const handleOpenModal = (c?: Customer) => {
    if (c) {
      setEditingId(c.id);
      setFormData({ name: c.name, phone: c.phone, email: c.email, address: c.address });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenLedger = (c: Customer) => {
    setSelectedCustomer(c);
    setIsLedgerOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      db.customers.update(editingId, formData);
    } else {
      db.customers.add(formData);
    }
    loadCustomers();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer? All their history will still remain in logs.')) {
      db.customers.delete(id);
      loadCustomers();
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customers</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your business client relationships.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search customers..." 
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all shadow-sm text-black dark:text-white font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(customer => (
          <div key={customer.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-900/50">
                {customer.name.charAt(0)}
              </div>
              <div className="flex space-x-1">
                <button onClick={() => handleOpenModal(customer)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(customer.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{customer.name}</h3>
            
            <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <Phone size={14} className="opacity-70" /> <span>{customer.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} className="opacity-70" /> <span className="truncate">{customer.address}</span>
              </div>
            </div>

            <button 
              onClick={() => handleOpenLedger(customer)}
              className="mt-6 w-full py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all border border-transparent hover:border-orange-100 dark:hover:border-orange-900/50"
            >
              <History size={16} />
              <span>View Ledger</span>
            </button>
          </div>
        ))}
      </div>

      {/* Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 transform animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-medium"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Phone Number</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-medium"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email Address</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all text-black dark:text-white font-medium"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Address</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none transition-all resize-none text-black dark:text-white font-medium"
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Business Way..."
                />
              </div>
            </div>
            <div className="mt-8 flex space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger View (Slide-over / Modal) */}
      {isLedgerOpen && selectedCustomer && (
        <CustomerLedger 
          customer={selectedCustomer} 
          onClose={() => setIsLedgerOpen(false)} 
        />
      )}
    </div>
  );
};

// Component for Individual Customer Ledger
const CustomerLedger = ({ customer, onClose }: { customer: Customer, onClose: () => void }) => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLogs(db.logs.getAll().filter(l => l.customerId === customer.id));
    setProducts(db.products.getAll());
  }, [customer]);

  const totalValue = logs.reduce((acc, log) => {
    const p = products.find(prod => prod.id === log.productId);
    return acc + (log.quantity * (p?.unitPrice || 0));
  }, 0);

  const pendingAmount = logs.reduce((acc, log) => {
    if (log.paymentStatus === 'PENDING') {
      const p = products.find(prod => prod.id === log.productId);
      return acc + (log.quantity * (p?.unitPrice || 0));
    }
    return acc;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-950 h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{customer.name}</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Customer Ledger Statement</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800">
              <ShoppingBag className="text-blue-500 mb-2" size={20} />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Sales</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-white">{logs.length}</h4>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800">
              <TrendingUp className="text-emerald-500 mb-2" size={20} />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Value</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-white">{formatINR(totalValue)}</h4>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800">
              <CreditCard className="text-amber-500 mb-2" size={20} />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
              <h4 className="text-xl font-black text-amber-600">{formatINR(pendingAmount)}</h4>
            </div>
          </div>

          {/* History Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
              <History size={18} className="mr-2 text-orange-500" />
              Transaction Timeline
            </h3>
            
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border-2 border-dashed dark:border-slate-800">
                  <AlertCircle size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-400 italic">No transactions found for this customer.</p>
                </div>
              ) : (
                logs.slice().reverse().map(log => {
                  const p = products.find(prod => prod.id === log.productId);
                  const price = p?.unitPrice || 0;
                  const lineTotal = log.quantity * price;

                  return (
                    <div key={log.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 flex items-center justify-between group">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {log.paymentStatus === 'PAID' ? <ChevronRight size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800 dark:text-white">{p?.name || 'Item'}</span>
                            <span className="text-xs font-bold text-slate-400">× {log.quantity}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                            {new Date(log.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800 dark:text-white">{formatINR(lineTotal)}</p>
                        <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md ${log.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {log.paymentStatus}
                        </span>
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

export default CustomersPage;
