
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Customer } from '../types';
// Fix: Added 'Users' to imports from lucide-react
import { Plus, Search, MoreVertical, Trash2, Edit2, Mail, Phone, MapPin, Users } from 'lucide-react';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
    if (confirm('Are you sure you want to delete this customer?')) {
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
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage your business client relationships.</p>
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
          placeholder="Search customers by name or phone..." 
          className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(customer => (
          <div key={customer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                {customer.name.charAt(0)}
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(customer)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(customer.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{customer.name}</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <Phone size={14} /> <span>{customer.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} /> <span>{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} /> <span>{customer.address}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No customers found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-md rounded-3xl shadow-2xl p-8 transform animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none"
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Business Way..."
                />
              </div>
            </div>
            <div className="mt-8 flex space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
