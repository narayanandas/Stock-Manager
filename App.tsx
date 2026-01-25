
import React, { useState, useEffect, createContext, useContext } from 'react';
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
  Settings,
  BarChart3,
  Languages
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/Customers';
import ProductsPage from './pages/Products';
import StockPage from './pages/Stock';
import SalesPage from './pages/Sales';
import PaymentsPage from './pages/Payments';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/LoginPage';
import ReportsPage from './pages/Reports';
import { translations, Language } from './translations';

// Logo Path Constant
const LOGO_URL = "https://api.a0.dev/assets/image?text=Annachi%20friendly%20man%20logo%20mascot%20circular%20food%20groceries&aspect=1:1";

const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  darkMode: boolean;
}>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k as string,
  darkMode: false
});

export const useTranslation = () => useContext(LanguageContext);

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
    <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(() => {
    const saved = localStorage.getItem('ss_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('ss_lang') as Language) || 'en');
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

  useEffect(() => {
    localStorage.setItem('ss_lang', lang);
  }, [lang]);

  const t = (key: keyof typeof translations.en) => translations[lang][key] || key;

  const handleLogin = (userData: { name: string; email: string; avatar?: string }) => {
    setUser(userData);
    localStorage.setItem('ss_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ss_user');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, darkMode }}>
      <div className={`flex flex-col md:flex-row min-h-screen ${lang === 'ta' ? 'tamil-font' : ''} ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {/* Mobile Top Bar */}
        <div className="md:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm">
              <img src={LOGO_URL} alt="Annachi Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-lg">Annachi</span>
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
            <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-orange-500 shadow-xl">
              <img src={LOGO_URL} alt="Annachi Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white">Annachi</span>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto">
            <NavItem to="/" icon={LayoutDashboard} label={t('dashboard')} active={location.pathname === '/'} />
            <NavItem to="/customers" icon={Users} label={t('customers')} active={location.pathname === '/customers'} />
            <NavItem to="/products" icon={ShoppingBag} label={t('products')} active={location.pathname === '/products'} />
            <NavItem to="/stock" icon={ArrowDownLeft} label={t('stockIn')} active={location.pathname === '/stock'} />
            <NavItem to="/sales" icon={ArrowUpRight} label={t('stockOut')} active={location.pathname === '/sales'} />
            <NavItem to="/payments" icon={CreditCard} label={t('payments')} active={location.pathname === '/payments'} />
            <NavItem to="/reports" icon={BarChart3} label={t('reports')} active={location.pathname === '/reports'} />
            <NavItem to="/settings" icon={Settings} label={t('settings')} active={location.pathname === '/settings'} />
          </nav>

          <div className="p-4 border-t dark:border-slate-800 space-y-3">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-orange-100"
            >
              <div className="flex items-center space-x-2">
                <Languages size={18} className="text-orange-500" />
                <span className="text-sm font-bold">{lang === 'en' ? 'தமிழ்' : 'English'}</span>
              </div>
            </button>

            <div className="flex items-center space-x-3 px-3 py-2">
               <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-2 ring-white dark:ring-slate-800">
                 {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" /> : user.name.charAt(0)}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
               </div>
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <span className="text-sm font-medium">{darkMode ? 'Dark' : 'Light'} Mode</span>
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
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
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </LanguageContext.Provider>
  );
};

const AppWrapper = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

export default AppWrapper;
