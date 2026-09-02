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
  Sun,
  X,
  Palette
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isOpenOnMobile = false,
  onCloseMobile
}) => {
  const { currentUser, logout, theme, toggleTheme } = useApp();
  const role = currentUser?.role || 'operator';

  // KeepinCRM Modules List with role visibility guards
  const menuItems = [
    { id: 'dashboard', name: 'Робочий стіл', icon: LayoutGrid, visible: true },
    { id: 'leads', name: 'Запити', icon: Sliders, visible: ['admin', 'manager'].includes(role) },
    { id: 'clients', name: 'Замовники', icon: Users, visible: ['admin', 'manager'].includes(role) },
    { id: 'employees', name: 'Співробітники', icon: UserIcon, visible: ['admin', 'manager'].includes(role) },
    { id: 'designer', name: 'Дизайнерська', icon: Palette, visible: true },
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

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* 1. Mobile Drawer Modal (ONLY rendered in DOM on mobile when isOpenOnMobile is true) */}
      {isOpenOnMobile && (
        <div 
          className="fixed inset-0 z-50 md:hidden flex"
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        >
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
          />

          {/* Slide-out Menu Panel */}
          <div 
            className="relative w-[270px] max-w-[85vw] h-full flex flex-col justify-between p-4 shadow-2xl overflow-y-auto"
            style={{
              position: 'relative',
              width: '270px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderRight: isDark ? '1px solid #1f2937' : '1px solid var(--border-light)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', minHeight: 0, flexGrow: 1 }}>
              {/* Mobile Header with Title and Close Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: isDark ? '#f3f4f6' : '#1e293b' }}>
                  Меню CRM
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isDark ? '#374151' : '#f1f5f9',
                    color: isDark ? '#f3f4f6' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* User Profile Avatar */}
              <div 
                onClick={() => handleSelectTab('profile')}
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

              {/* Navigation Items */}
              <div style={{ width: '100%', overflowY: 'auto', flexGrow: 1, minHeight: 0 }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
                  {menuItems.map(item => {
                    if (!item.visible) return null;
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: isActive 
                            ? (isDark ? 'rgba(59, 130, 246, 0.16)' : 'var(--primary)') 
                            : 'transparent',
                          color: isActive 
                            ? (isDark ? '#3b82f6' : '#ffffff') 
                            : (isDark ? '#9ca3af' : 'var(--text-dark)'),
                          cursor: 'pointer',
                          fontSize: '12.5px',
                          fontWeight: isActive ? '750' : '600',
                          textAlign: 'left'
                        }}
                      >
                        <Icon size={17} style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              borderTop: isDark ? '1px solid #1f2937' : '1px solid var(--border-light)',
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '100%',
              flexShrink: 0
            }}>
              <button
                onClick={toggleTheme}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  color: isDark ? '#f3f4f6' : 'var(--text-dark)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
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
                  fontSize: '12px',
                  fontWeight: '750'
                }}
              >
                <LogOut size={16} style={{ flexShrink: 0 }} />
                <span>Вийти</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Desktop Sidebar (STRICTLY hidden on mobile < 768px via className="sidebar-desktop-container") */}
      <aside 
        className="sidebar-desktop-container"
        style={{
          width: '230px',
          height: '100vh',
          maxHeight: '100vh',
          backgroundColor: isDark ? '#111827' : '#ffffff',
          flexDirection: 'column',
          padding: '16px 12px',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          flexShrink: 0,
          borderRight: isDark ? '1px solid #1f2937' : '1px solid var(--border-light)',
          zIndex: 40,
          overflowY: 'auto'
        }}
      >
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
                        ? (isDark ? '#3b82f6' : '#ffffff') 
                        : (isDark ? '#9ca3af' : 'var(--text-dark)'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontSize: '12px',
                      fontWeight: isActive ? '750' : '600',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.color = isDark ? '#ffffff' : 'var(--text-dark)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isDark ? '#9ca3af' : 'var(--text-dark)';
                      }
                    }}
                  >
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer / Theme & Logout */}
        <div style={{
          borderTop: isDark ? '1px solid #1f2937' : '1px solid var(--border-light)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: '100%',
          flexShrink: 0
        }}>
          <button
            onClick={toggleTheme}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 12px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              color: isDark ? '#f3f4f6' : 'var(--text-dark)',
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
      </aside>
    </>
  );
};
