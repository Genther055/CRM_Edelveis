import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutGrid, 
  Users, 
  User as UserIcon, 
  Briefcase, 
  FolderKanban, 
  Truck, 
  Calculator, 
  Archive, 
  Layers, 
  CheckSquare, 
  FileSignature, 
  Coins, 
  Sliders, 
  Zap,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, theme, toggleTheme } = useApp();
  const role = currentUser?.role || 'operator';

  // KeepinCRM Modules List with role visibility guards
  const menuItems = [
    { id: 'dashboard', name: 'Робочий стіл', icon: LayoutGrid, visible: true },
    { id: 'leads', name: 'Запити', icon: Sliders, visible: ['admin', 'manager'].includes(role) },
    { id: 'clients', name: 'Замовники', icon: Users, visible: ['admin', 'manager'].includes(role) },
    { id: 'employees', name: 'Співробітники', icon: UserIcon, visible: ['admin', 'manager'].includes(role) },
    { id: 'pm', name: 'Дизайн макетів', icon: Briefcase, visible: ['admin', 'manager'].includes(role) },
    { id: 'deals', name: 'Угоди', icon: FolderKanban, visible: ['admin', 'manager'].includes(role) },
    { id: 'delivery', name: 'Доставка', icon: Truck, visible: ['admin', 'manager'].includes(role) },
    { id: 'calculator', name: 'Калькулятор', icon: Calculator, visible: true },
    { id: 'warehouse', name: 'Склад', icon: Archive, visible: true },
    { id: 'production', name: 'Виробництво', icon: Layers, visible: true },
    { id: 'tasks', name: 'Завдання', icon: CheckSquare, visible: true },
    { id: 'documents', name: 'Документи', icon: FileSignature, visible: true },
    { id: 'finance', name: 'BAS Бухгалтерія', icon: Coins, visible: true },
    { id: 'triggers', name: 'Автоматизація', icon: Zap, visible: ['admin', 'manager'].includes(role) },
    { id: 'settings', name: 'Налаштування', icon: SettingsIcon, visible: ['admin'].includes(role) }
  ];

  const isDark = theme === 'dark';

  return (
    <div style={{
      width: '230px',
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: isDark ? '#111827' : '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      flexShrink: 0,
      borderRight: isDark ? '1px solid #1f2937' : '1px solid var(--border-light)',
      zIndex: 40,
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', minHeight: 0, flexGrow: 1 }}>
        {/* User Profile Avatar at the top */}
        <div 
          onClick={() => setActiveTab('profile')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            width: '100%', 
            cursor: 'pointer',
            padding: '8px 10px',
            borderRadius: '8px',
            backgroundColor: activeTab === 'profile' 
              ? (isDark ? '#1f2937' : 'rgba(0,122,255,0.08)') 
              : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'transparent'),
            border: isDark ? '1px solid #374151' : 'none',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          <div 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#374151' : '#f4f4f6',
              border: activeTab === 'profile' 
                ? (isDark ? '2px solid #3b82f6' : '2px solid var(--primary)') 
                : (isDark ? '1px solid #4b5563' : '1px solid var(--border-light)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#f3f4f6' : 'var(--text-dark)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <UserIcon size={17} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '12px', fontWeight: '750', color: isDark ? '#f3f4f6' : 'var(--text-dark)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser?.name || 'Гість'}
            </span>
            <span style={{ fontSize: '10px', color: isDark ? '#9ca3af' : 'var(--text-medium)', fontWeight: '500' }}>
              {role === 'admin' ? 'Адміністратор' : role === 'manager' ? 'Менеджер' : 'Оператор'}
            </span>
          </div>
        </div>

        {/* Navigation Items - Scrollable List */}
        <div style={{
          width: '100%',
          overflowY: 'auto',
          flexGrow: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }} className="sidebar-scroll-container">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
            {menuItems.map(item => {
              if (!item.visible) return null;
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isActive 
                      ? (isDark ? 'rgba(59, 130, 246, 0.16)' : 'var(--primary)') 
                      : 'transparent',
                    color: isActive 
                      ? (isDark ? '#60a5fa' : '#ffffff') 
                      : (isDark ? '#9ca3af' : 'var(--text-dark)'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontWeight: isActive ? '750' : '500',
                    fontSize: '12px',
                    textAlign: 'left',
                    borderLeft: isActive && isDark ? '3px solid #3b82f6' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f4f4f6';
                      if (isDark) e.currentTarget.style.color = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      if (isDark) e.currentTarget.style.color = '#9ca3af';
                    }
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0, color: isActive ? (isDark ? '#60a5fa' : '#ffffff') : 'inherit' }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Theme & Logout Buttons Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={toggleTheme}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '8px 12px',
            backgroundColor: theme === 'dark' ? '#334155' : 'rgba(120, 120, 128, 0.1)',
            color: theme === 'dark' ? '#f8fafc' : 'var(--text-dark)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontSize: '12px',
            fontWeight: '750'
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} className="text-amber-400" style={{ flexShrink: 0 }} />
              <span>Світла тема</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-indigo-600" style={{ flexShrink: 0 }} />
              <span>Темна тема</span>
            </>
          )}
        </button>

        <button
          onClick={logout}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 59, 48, 0.08)',
            color: 'var(--danger)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontSize: '12px',
            fontWeight: '750'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.08)'}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <span>Вийти</span>
        </button>
      </div>
    </div>
  );
};
