
import { Customer, Product, StockLog } from './types';

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
    SYNC_STATE: `ss_${email}_sync_state`,
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

const performMigration = () => {
  const keys = getKeys();
  const email = getActiveUserEmail();
  if (email === 'guest') return;
  const migratedKey = `ss_migrated_${email}`;
  if (localStorage.getItem(migratedKey)) return;
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

// Drive API helper
const DRIVE_FILE_NAME = "annachi_trade_data.json";

export const db = {
  customers: {
    getAll: () => { performMigration(); return get<Customer[]>(getKeys().CUSTOMERS, []); },
    add: (c: Omit<Customer, 'id'>) => {
      const keys = getKeys();
      const newCustomer = { ...c, id: crypto.randomUUID() };
      save(keys.CUSTOMERS, [...db.customers.getAll(), newCustomer]);
      return newCustomer;
    },
    update: (id: string, updates: Partial<Customer>) => {
      save(getKeys().CUSTOMERS, db.customers.getAll().map(c => c.id === id ? { ...c, ...updates } : c));
    },
    delete: (id: string) => {
      save(getKeys().CUSTOMERS, db.customers.getAll().filter(c => c.id !== id));
    }
  },
  products: {
    getAll: () => { performMigration(); return get<Product[]>(getKeys().PRODUCTS, []); },
    add: (p: Omit<Product, 'id'>) => {
      const keys = getKeys();
      const newProduct = { ...p, id: crypto.randomUUID() };
      save(keys.PRODUCTS, [...db.products.getAll(), newProduct]);
      return newProduct;
    },
    update: (id: string, updates: Partial<Product>) => {
      save(getKeys().PRODUCTS, db.products.getAll().map(p => p.id === id ? { ...p, ...updates } : p));
    },
    delete: (id: string) => {
      save(getKeys().PRODUCTS, db.products.getAll().filter(p => p.id !== id));
    }
  },
  logs: {
    getAll: () => { performMigration(); return get<StockLog[]>(getKeys().LOGS, []); },
    add: (l: Omit<StockLog, 'id' | 'date'>) => {
      const keys = getKeys();
      const newLog = { ...l, id: crypto.randomUUID(), date: new Date().toISOString() };
      save(keys.LOGS, [...db.logs.getAll(), newLog]);
      return newLog;
    },
    update: (id: string, updates: Partial<StockLog>) => {
      save(getKeys().LOGS, db.logs.getAll().map(l => l.id === id ? { ...l, ...updates } : l));
    },
    delete: (id: string) => {
      save(getKeys().LOGS, db.logs.getAll().filter(l => l.id !== id));
    }
  },
  utils: {
    exportFullDatabase: () => {
      return JSON.stringify({
        customers: db.customers.getAll(),
        products: db.products.getAll(),
        logs: db.logs.getAll(),
        exportedAt: new Date().toISOString(),
        owner: getActiveUserEmail()
      });
    },
    importFullDatabase: (jsonString: string) => {
      try {
        const keys = getKeys();
        const data = JSON.parse(jsonString);
        if (data.customers) save(keys.CUSTOMERS, data.customers);
        if (data.products) save(keys.PRODUCTS, data.products);
        if (data.logs) save(keys.LOGS, data.logs);
        return true;
      } catch { return false; }
    }
  },
  cloud: {
    // Real Google Drive Sync
    sync: async (accessToken: string) => {
      try {
        // 1. Find the file in Drive
        const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
        const listResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const listData = await listResponse.json();
        const file = listData.files?.[0];

        const localData = db.utils.exportFullDatabase();

        if (file) {
          // Update existing file
          await fetch(`https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: localData
          });
        } else {
          // Create new file
          const metadata = { name: DRIVE_FILE_NAME, mimeType: 'application/json' };
          const form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          form.append('file', new Blob([localData], { type: 'application/json' }));
          
          await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form
          });
        }
        save(getKeys().SYNC_STATE, { lastSync: new Date().toISOString() });
        return true;
      } catch (e) {
        console.error("Cloud push failed", e);
        return false;
      }
    },
    pull: async (accessToken: string) => {
      try {
        const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
        const listResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const listData = await listResponse.json();
        const file = listData.files?.[0];
        
        if (!file) return false;

        const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const remoteData = await contentResponse.text();
        return db.utils.importFullDatabase(remoteData);
      } catch (e) {
        console.error("Cloud pull failed", e);
        return false;
      }
    }
  }
};
