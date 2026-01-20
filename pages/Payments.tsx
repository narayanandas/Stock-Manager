
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Customer, Product, StockLog } from '../types';
import { CreditCard, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';

// Helper for Indian currency formatting
const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const PaymentsPage: React.FC = () => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLogs(db.logs.getAll().filter(l => l.type === 'OUT'));
    setCustomers(db.customers.getAll());
    setProducts(db.products.getAll());
  };

  const markAsPaid = (id: string) => {
    db.logs.update(id, { paymentStatus: 'PAID' });
    loadData();
  };

  const filteredLogs = logs.filter(l => {
    if (filter === 'ALL') return true;
    return l.paymentStatus === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-500">Track paid and pending customer balances in Indian Rupees (₹).</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-fit">
        {['ALL', 'PENDING', 'PAID'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === f 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLogs.map(log => {
          const cust = customers.find(c => c.id === log.customerId);
          const prod = products.find(p => p.id === log.productId);
          const totalValue = log.quantity * (prod?.unitPrice || 0);

          return (
            <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  log.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {log.paymentStatus === 'PAID' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{cust?.name}</h4>
                  <p className="text-xs text-slate-500">{log.quantity}x {prod?.name} @ {formatINR(prod?.unitPrice || 0)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end flex-1 md:space-x-12">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Amount Due</p>
                  <p className="text-xl font-mono font-bold text-slate-900">{formatINR(totalValue)}</p>
                </div>
                
                {log.paymentStatus === 'PENDING' ? (
                  <button 
                    onClick={() => markAsPaid(log.id)}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center space-x-2"
                  >
                    <CreditCard size={16} />
                    <span>Mark Paid</span>
                  </button>
                ) : (
                  <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl">Settled</span>
                )}
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium italic">No payments match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
