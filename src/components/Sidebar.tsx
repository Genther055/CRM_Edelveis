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
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useApp();
  const role = currentUser?.role || 'operator';

  // KeepinCRM Modules List with role visibility guards
  const menuItems = [
    { id: 'dashboard', name: 'Робочий стіл', icon: LayoutGrid, visible: true },
    { id: 'leads', name: 'Запити', icon: Sliders, visible: ['admin', 'manager'].includes(role) },
    { id: 'clients', name: 'Клієнти', icon: Users, visible: ['admin', 'manager'].includes(role) },
    { id: 'employees', name: 'Співробітники', icon: UserIcon, visible: ['admin', 'manager'].includes(role) },
    { id: 'pm', name: 'Дизайн макетів (PM)', icon: Briefcase, visible: ['admin', 'manager'].includes(role) },
    { id: 'deals', name: 'Угоди', icon: FolderKanban, visible: ['admin', 'manager'].includes(role) },
    { id: 'delivery', name: 'Доставка', icon: Truck, visible: ['admin', 'manager'].includes(role) },
    { id: 'calculator', name: 'Калькулятор', icon: Calculator, visible: ['admin', 'manager'].includes(role) },
    { id: 'warehouse', name: 'Склад', icon: Archive, visible: ['admin', 'manager'].includes(role) },
    { id: 'production', name: 'Виробництво', icon: Layers, visible: true },
    { id: 'tasks', name: 'Завдання', icon: CheckSquare, visible: true },
    { id: 'documents', name: 'Документи', icon: FileSignature, visible: ['admin', 'manager'].includes(role) },
    { id: 'finance', name: 'Фінанси', icon: Coins, visible: ['admin', 'manager'].includes(role) },
    { id: 'triggers', name: 'Тригери', icon: Sliders, visible: ['admin'].includes(role) },
    { id: 'settings', name: 'Налаштування', icon: SettingsIcon, visible: ['admin'].includes(role) }
  ];

  return (
    <div style={{
      width: '230px',
      height: '100%',
      backgroundColor: '#ffffff', // Clean premium white sidebar
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      flexShrink: 0,
      borderRight: '1px solid var(--border-light)',
      zIndex: 40
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        {/* User Profile Avatar at the top (Shows Name and Role next to it) */}
        <div 
          onClick={() => setActiveTab('profile')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            width: '100%', 
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '10px',
            backgroundColor: activeTab === 'profile' ? 'rgba(0,122,255,0.08)' : 'transparent',
            transition: 'background-color 0.2s ease'
          }}
        >
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f4f4f6',
              border: activeTab === 'profile' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dark)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <UserIcon size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser?.name || 'Гість'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-medium)', opacity: 0.7 }}>
              {role === 'admin' ? 'Адміністратор' : role === 'manager' ? 'Менеджер' : 'Оператор'}
            </span>
          </div>
        </div>

        {/* Navigation Items - Scrollable List */}
        <div style={{
          width: '100%',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 170px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }} className="sidebar-scroll-container">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
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
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-dark)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontWeight: isActive ? '750' : '500',
                    fontSize: '12px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f4f4f6';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout button at the bottom */}
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
  );
};
