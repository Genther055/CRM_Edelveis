import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Calculator } from './components/Calculator';
import { Clients } from './components/Clients';
import { Production } from './components/Production';
import { Warehouse } from './components/Warehouse';
import { Leads } from './components/Leads';
import { Deals } from './components/Deals';
import { Delivery } from './components/Delivery';
import { Tasks } from './components/Tasks';
import { Chats } from './components/Chats';
import { Documents } from './components/Documents';
import { Finance } from './components/Finance';
import { Triggers } from './components/Triggers';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import { Employees } from './components/Employees';
import { PM } from './components/PM';
import './App.css';
import './mobile.css';

function AppContent() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return <Login />;
  }

  const role = currentUser.role;

  const moduleTitles: Record<string, string> = {
    dashboard: 'Робочий стіл',
    leads: 'Запити',
    clients: 'Замовники',
    employees: 'Співробітники',
    pm: 'Дизайн макетів',
    deals: 'Угоди',
    delivery: 'Доставка',
    calculator: 'Калькулятор',
    warehouse: 'Склад',
    production: 'Виробництво',
    tasks: 'Завдання',
    chats: 'Чати',
    documents: 'Документи',
    finance: 'BAS Бухгалтерія',
    triggers: 'Автоматизація',
    settings: 'Налаштування',
    profile: 'Профіль'
  };

  return (
    <div className="app-container">
      {/* Mobile Top App Bar (< 768px, strictly hidden on desktop via .mobile-top-bar) */}
      <header className="mobile-top-bar">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            title="Відкрити меню"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {moduleTitles[activeTab] || 'Поліграфія CRM'}
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 leading-none">
              Едельвейс CRM
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
          title="Профіль"
        >
          {currentUser?.name?.slice(0, 1) || 'U'}
        </button>
      </header>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpenOnMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      
      {activeTab === 'dashboard' && (
        <Dashboard setActiveTab={setActiveTab} />
      )}
      
      {activeTab === 'leads' && ['admin', 'manager'].includes(role) && (
        <Leads />
      )}

      {activeTab === 'clients' && ['admin', 'manager'].includes(role) && (
        <Clients />
      )}

      {activeTab === 'employees' && ['admin', 'manager'].includes(role) && (
        <Employees />
      )}

      {activeTab === 'pm' && ['admin', 'manager'].includes(role) && (
        <PM />
      )}

      {activeTab === 'deals' && ['admin', 'manager'].includes(role) && (
        <Deals />
      )}

      {activeTab === 'delivery' && ['admin', 'manager'].includes(role) && (
        <Delivery />
      )}
      
      {activeTab === 'calculator' && (
        <Calculator />
      )}
      
      {activeTab === 'warehouse' && (
        <Warehouse />
      )}

      {activeTab === 'production' && (
        <Production />
      )}

      {activeTab === 'tasks' && (
        <Tasks />
      )}

      {activeTab === 'chats' && ['admin', 'manager'].includes(role) && (
        <Chats />
      )}

      {activeTab === 'documents' && (
        <Documents />
      )}

      {activeTab === 'finance' && (
        <Finance />
      )}

      {activeTab === 'triggers' && ['admin'].includes(role) && (
        <Triggers />
      )}

      {activeTab === 'settings' && ['admin'].includes(role) && (
        <Settings />
      )}

      {activeTab === 'profile' && (
        <Profile />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
