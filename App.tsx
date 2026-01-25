
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
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
  Languages,
  Home,
  Cloud
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

// Local Logo Path
const LOGO_URL = "./logo.png";

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

const NavItem = ({ to, icon: Icon, label, active, onClick }: { to: string, icon: any, label: string, active: boolean, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
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

const MobileTab = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
      active ? 'text-orange-600' : 'text-slate-400 dark:text-slate-500'
    }`}
  >
    <div className={`p-1.5 rounded-xl ${active ? 'bg-orange-50 dark:bg-orange-950/30' : ''}`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={`text-[9px] mt-1 font-black uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-60'}`}>
      {label}
    </span>
  </Link>
);

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string; accessToken?: string } | null>(() => {
    const saved = localStorage.getItem('ss_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('ss_lang') as Language) || 'en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ss_dark') === 'true');
  const location = useLocation();

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('ss_dark', String(darkMode));
  }, [darkMode]);

  const t = (key: keyof typeof translations.en) => translations[lang][key] || key;

  const handleLogin = (userData: { name: string; email: string; avatar?: string; accessToken?: string }) => {
    setUser(userData);
    localStorage.setItem('ss_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ss_user');
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, darkMode }}>
      <div className={`flex flex-col md:flex-row min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        
        {/* Mobile Top Bar */}
        <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-500 bg-white">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-slate-800 dark:text-white text-lg tracking-tighter">Annachi</span>
          </Link>
          <div className="flex items-center space-x-1">
             <div className={`p-2 ${user.accessToken ? 'text-emerald-500' : 'text-slate-300'}`} title={user.accessToken ? 'Cloud Ready' : 'Local Only'}>
                <Cloud size={18} />
             </div>
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`fixed inset-0 z-[60] md:relative md:z-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 w-72 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col`}>
          <div className="hidden md:flex items-center space-x-3 p-6 mb-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-orange-500 shadow-xl bg-white">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tighter dark:text-white">Annachi</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto">
            <NavItem to="/" icon={LayoutDashboard} label={t('dashboard')} active={location.pathname === '/'} onClick={closeMenu} />
            <NavItem to="/customers" icon={Users} label={t('customers')} active={location.pathname === '/customers'} onClick={closeMenu} />
            <NavItem to="/products" icon={ShoppingBag} label={t('products')} active={location.pathname === '/products'} onClick={closeMenu} />
            <NavItem to="/stock" icon={ArrowDownLeft} label={t('stockIn')} active={location.pathname === '/stock'} onClick={closeMenu} />
            <NavItem to="/sales" icon={ArrowUpRight} label={t('stockOut')} active={location.pathname === '/sales'} onClick={closeMenu} />
            <NavItem to="/payments" icon={CreditCard} label={t('payments')} active={location.pathname === '/payments'} onClick={closeMenu} />
            <NavItem to="/reports" icon={BarChart3} label={t('reports')} active={location.pathname === '/reports'} onClick={closeMenu} />
            <NavItem to="/settings" icon={Settings} label={t('settings')} active={location.pathname === '/settings'} onClick={closeMenu} />
          </nav>

          <div className="p-4 border-t dark:border-slate-800">
            <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
               <div className="w-8 h-8 bg-orange-100 rounded-full overflow-hidden shrink-0">
                 {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-orange-600">{user.name.charAt(0)}</div>}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
                 <div className="flex items-center space-x-1">
                   <Cloud size={10} className={user.accessToken ? 'text-emerald-500' : 'text-slate-300'} />
                   <span className="text-[9px] uppercase font-black text-slate-400">{user.accessToken ? 'Sync On' : 'Local Only'}</span>
                 </div>
               </div>
            </div>
          </div>
        </aside>

        {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden" onClick={closeMenu} />}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
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

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t dark:border-slate-800 px-2 pb-safe-area-inset-bottom">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            <MobileTab to="/" icon={Home} label={t('dashboard')} active={location.pathname === '/'} />
            <MobileTab to="/customers" icon={Users} label={t('customers')} active={location.pathname === '/customers'} />
            <MobileTab to="/products" icon={ShoppingBag} label={t('products')} active={location.pathname === '/products'} />
            <MobileTab to="/sales" icon={ArrowUpRight} label={t('stockOut')} active={location.pathname === '/sales'} />
            <MobileTab to="/settings" icon={Settings} label={t('settings')} active={location.pathname === '/settings'} />
          </div>
        </div>
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
