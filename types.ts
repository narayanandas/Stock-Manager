
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  unitPrice: number; // This is Selling Price
  minStock: number;
}

export interface StockLog {
  id: string;
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  date: string;
  customerId?: string; 
  paymentStatus?: 'PAID' | 'PENDING';
}
