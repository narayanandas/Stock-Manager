
import { Customer, Product, StockLog } from './types';

const KEYS = {
  CUSTOMERS: 'ss_customers',
  PRODUCTS: 'ss_products',
  LOGS: 'ss_logs'
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const save = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  customers: {
    getAll: () => get<Customer[]>(KEYS.CUSTOMERS, []),
    add: (c: Omit<Customer, 'id'>) => {
      const customers = db.customers.getAll();
      const newCustomer = { ...c, id: crypto.randomUUID() };
      save(KEYS.CUSTOMERS, [...customers, newCustomer]);
      return newCustomer;
    },
    update: (id: string, updates: Partial<Customer>) => {
      const customers = db.customers.getAll();
      const updated = customers.map(c => c.id === id ? { ...c, ...updates } : c);
      save(KEYS.CUSTOMERS, updated);
    },
    delete: (id: string) => {
      const customers = db.customers.getAll();
      save(KEYS.CUSTOMERS, customers.filter(c => c.id !== id));
    }
  },
  products: {
    getAll: () => get<Product[]>(KEYS.PRODUCTS, [
      { id: '1', name: 'Sample Item', category: 'General', costPrice: 80, unitPrice: 120, minStock: 5 }
    ]),
    add: (p: Omit<Product, 'id'>) => {
      const products = db.products.getAll();
      const newProduct = { ...p, id: crypto.randomUUID() };
      save(KEYS.PRODUCTS, [...products, newProduct]);
      return newProduct;
    },
    update: (id: string, updates: Partial<Product>) => {
      const products = db.products.getAll();
      const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
      save(KEYS.PRODUCTS, updated);
    },
    delete: (id: string) => {
      const products = db.products.getAll();
      save(KEYS.PRODUCTS, products.filter(p => p.id !== id));
    }
  },
  logs: {
    getAll: () => get<StockLog[]>(KEYS.LOGS, []),
    add: (l: Omit<StockLog, 'id' | 'date'>) => {
      const logs = db.logs.getAll();
      const newLog = { ...l, id: crypto.randomUUID(), date: new Date().toISOString() };
      save(KEYS.LOGS, [...logs, newLog]);
      return newLog;
    },
    update: (id: string, updates: Partial<StockLog>) => {
      const logs = db.logs.getAll();
      const updated = logs.map(l => l.id === id ? { ...l, ...updates } : l);
      save(KEYS.LOGS, updated);
    }
  },
  utils: {
    exportFullDatabase: () => {
      const data = {
        customers: db.customers.getAll(),
        products: db.products.getAll(),
        logs: db.logs.getAll(),
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };
      return JSON.stringify(data, null, 2);
    },
    importFullDatabase: (jsonString: string) => {
      try {
        const data = JSON.parse(jsonString);
        if (data.customers) save(KEYS.CUSTOMERS, data.customers);
        if (data.products) save(KEYS.PRODUCTS, data.products);
        if (data.logs) save(KEYS.LOGS, data.logs);
        return true;
      } catch (e) {
        console.error("Import failed", e);
        return false;
      }
    }
  }
};
