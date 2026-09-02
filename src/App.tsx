import { useState } from 'react';
import { Menu, Printer, MapPin, Phone, Send, Lock, Clock } from 'lucide-react';
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

  // --- CLIENT PORTAL MODE (EXCLUSIVE CALCULATOR ACCESS) ---
  if (role === 'client') {
    return (
      <div className="client-portal-wrapper" style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-system)', color: 'var(--text-dark)', display: 'flex', flexDirection: 'column' }}>
        {/* Premium Full-Width Client Portal Top Header */}
        <header style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%'
        }}>
          <div style={{
            width: '100%',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxSizing: 'border-box'
          }}>
            {/* Left: Brand Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 122, 255, 0.25)',
                flexShrink: 0
              }}>
                <Printer size={22} strokeWidth={2.2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-dark)', letterSpacing: '-0.4px', margin: 0 }}>
                    Поліграфія «Едельвейс і К»
                  </h1>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(0, 122, 255, 0.08)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(0, 122, 255, 0.2)'
                  }}>
                    Онлайн-калькулятор
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', color: 'var(--text-medium)', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span>м. Вінниця, вул. 600-річчя, 17</span>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} style={{ color: 'var(--text-medium)', flexShrink: 0 }} />
                    <span>Пн-Пт 09:00 - 18:00</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Contact & Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <a
                href="https://t.me/edelveis_i_k_bot"
                target="_blank"
                rel="noreferrer"
                className="ios-btn ios-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                <Send size={13} style={{ color: '#0088cc' }} />
                <span>Telegram бот</span>
              </a>

              <a
                href="tel:0678409781"
                className="ios-btn ios-btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(0, 122, 255, 0.25)'
                }}
              >
                <Phone size={13} />
                <span>067 840 9781</span>
              </a>
            </div>
          </div>
        </header>

        {/* Full-Width Main Content */}
        <main style={{ width: '100%', flex: 1, padding: '16px 24px', boxSizing: 'border-box' }}>
          <Calculator />
        </main>

        {/* Client Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-card)',
          padding: '16px 24px 28px 24px',
          fontSize: '11.5px',
          color: 'var(--text-medium)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              © {new Date().getFullYear()} Друкарня «Едельвейс і К». Всі права захищено.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>м. Вінниця, вул. 600-річчя, 17</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('crm_user');
                  window.location.href = window.location.pathname;
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-medium)',
                  fontSize: '11px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Lock size={11} />
                <span>Кабінет працівника</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

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
