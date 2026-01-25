
import { Customer, Product, StockLog } from './types';

// Helper to get current active user email for key prefixing
const getActiveUserEmail = () => {
  const userStr = localStorage.getItem('ss_user');
  if (!userStr) return 'guest';
  try {
    const user = JSON.parse(userStr);
    return user.email || 'guest';
  } catch {
    return 'guest';
  }
};

const getKeys = () => {
  const email = getActiveUserEmail();
  return {
    CUSTOMERS: `ss_${email}_customers`,
    PRODUCTS: `ss_${email}_products`,
    LOGS: `ss_${email}_logs`,
    // Reference to legacy keys for migration
    LEGACY_CUSTOMERS: 'ss_customers',
    LEGACY_PRODUCTS: 'ss_products',
    LEGACY_LOGS: 'ss_logs'
  };
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const save = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Check and perform migration from legacy keys to user-specific keys
const performMigration = () => {
  const keys = getKeys();
  const email = getActiveUserEmail();
  
  if (email === 'guest') return;

  const migratedKey = `ss_migrated_${email}`;
  if (localStorage.getItem(migratedKey)) return;

  // If specific storage is empty but legacy has data, migrate it
  if (!localStorage.getItem(keys.CUSTOMERS) && localStorage.getItem(keys.LEGACY_CUSTOMERS)) {
    localStorage.setItem(keys.CUSTOMERS, localStorage.getItem(keys.LEGACY_CUSTOMERS)!);
  }
  if (!localStorage.getItem(keys.PRODUCTS) && localStorage.getItem(keys.LEGACY_PRODUCTS)) {
    localStorage.setItem(keys.PRODUCTS, localStorage.getItem(keys.LEGACY_PRODUCTS)!);
  }
  if (!localStorage.getItem(keys.LOGS) && localStorage.getItem(keys.LEGACY_LOGS)) {
    localStorage.setItem(keys.LOGS, localStorage.getItem(keys.LEGACY_LOGS)!);
  }

  localStorage.setItem(migratedKey, 'true');
};

export const db = {
  customers: {
    getAll: () => {
      performMigration();
      return get<Customer[]>(getKeys().CUSTOMERS, []);
    },
    add: (c: Omit<Customer, 'id'>) => {
      const keys = getKeys();
      const customers = db.customers.getAll();
      const newCustomer = { ...c, id: crypto.randomUUID() };
      save(keys.CUSTOMERS, [...customers, newCustomer]);
      return newCustomer;
    },
    update: (id: string, updates: Partial<Customer>) => {
      const keys = getKeys();
      const customers = db.customers.getAll();
      const updated = customers.map(c => c.id === id ? { ...c, ...updates } : c);
      save(keys.CUSTOMERS, updated);
    },
    delete: (id: string) => {
      const keys = getKeys();
      const customers = db.customers.getAll();
      save(keys.CUSTOMERS, customers.filter(c => c.id !== id));
    }
  },
  products: {
    getAll: () => {
      performMigration();
      return get<Product[]>(getKeys().PRODUCTS, [
        { id: '1', name: 'Sample Item', category: 'General', costPrice: 80, unitPrice: 120, minStock: 5 }
      ]);
    },
    add: (p: Omit<Product, 'id'>) => {
      const keys = getKeys();
      const products = db.products.getAll();
      const newProduct = { ...p, id: crypto.randomUUID() };
      save(keys.PRODUCTS, [...products, newProduct]);
      return newProduct;
    },
    update: (id: string, updates: Partial<Product>) => {
      const keys = getKeys();
      const products = db.products.getAll();
      const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
      save(keys.PRODUCTS, updated);
    },
    delete: (id: string) => {
      const keys = getKeys();
      const products = db.products.getAll();
      save(keys.PRODUCTS, products.filter(p => p.id !== id));
    }
  },
  logs: {
    getAll: () => {
      performMigration();
      return get<StockLog[]>(getKeys().LOGS, []);
    },
    add: (l: Omit<StockLog, 'id' | 'date'>) => {
      const keys = getKeys();
      const logs = db.logs.getAll();
      const newLog = { ...l, id: crypto.randomUUID(), date: new Date().toISOString() };
      save(keys.LOGS, [...logs, newLog]);
      return newLog;
    },
    update: (id: string, updates: Partial<StockLog>) => {
      const keys = getKeys();
      const logs = db.logs.getAll();
      const updated = logs.map(l => l.id === id ? { ...l, ...updates } : l);
      save(keys.LOGS, updated);
    },
    delete: (id: string) => {
      const keys = getKeys();
      const logs = db.logs.getAll();
      save(keys.LOGS, logs.filter(l => l.id !== id));
    }
  },
  utils: {
    exportFullDatabase: () => {
      const data = {
        customers: db.customers.getAll(),
        products: db.products.getAll(),
        logs: db.logs.getAll(),
        exportedAt: new Date().toISOString(),
        version: "1.0",
        owner: getActiveUserEmail()
      };
      return JSON.stringify(data, null, 2);
    },
    importFullDatabase: (jsonString: string) => {
      try {
        const keys = getKeys();
        const data = JSON.parse(jsonString);
        if (data.customers) save(keys.CUSTOMERS, data.customers);
        if (data.products) save(keys.PRODUCTS, data.products);
        if (data.logs) save(keys.LOGS, data.logs);
        return true;
      } catch (e) {
        console.error("Import failed", e);
        return false;
      }
    }
  }
};
