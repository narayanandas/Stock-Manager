
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Menu, 
  X,
  ShoppingBag,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/Customers';
import ProductsPage from './pages/Products';
import StockPage from './pages/Stock';
import SalesPage from './pages/Sales';
import PaymentsPage from './pages/Payments';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
        : 'text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ss_dark') === 'true');
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ss_dark', String(darkMode));
  }, [darkMode]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
            <Package size={18} />
          </div>
          <span className="font-bold text-slate-800 dark:text-white">SmartStock</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:z-0
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        transition-transform duration-300 ease-in-out
        w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col
      `}>
        <div className="hidden md:flex items-center space-x-3 p-6 mb-4">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Package size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">SmartStock Pro</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <NavItem to="/customers" icon={Users} label="Customers" active={location.pathname === '/customers'} />
          <NavItem to="/products" icon={ShoppingBag} label="Products" active={location.pathname === '/products'} />
          <NavItem to="/stock" icon={ArrowDownLeft} label="Stock In" active={location.pathname === '/stock'} />
          <NavItem to="/sales" icon={ArrowUpRight} label="Stock Out" active={location.pathname === '/sales'} />
          <NavItem to="/payments" icon={CreditCard} label="Payments" active={location.pathname === '/payments'} />
        </nav>

        <div className="p-4 border-t dark:border-slate-800 space-y-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <span className="text-sm font-medium">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div className="flex items-center space-x-2 px-2 text-slate-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Local Session Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8" onClick={closeMenu}>
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex justify-around p-2 z-40">
        <Link to="/" className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600"><LayoutDashboard size={24} /></Link>
        <Link to="/products" className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600"><ShoppingBag size={24} /></Link>
        <Link to="/sales" className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600"><ArrowUpRight size={24} /></Link>
        <Link to="/payments" className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600"><CreditCard size={24} /></Link>
      </div>
    </div>
  );
};

const AppWrapper = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

export default AppWrapper;
