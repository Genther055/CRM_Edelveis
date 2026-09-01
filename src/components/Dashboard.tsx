import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calculator as CalcIcon, 
  Users, 
  Columns, 
  Archive, 
  ChevronRight, 
  User, 
  AlertTriangle,
  FolderOpen,
  Zap,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  FileSignature,
  Coins,
  Sliders,
  Settings as SettingsIcon,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { currentUser, orders, clients, materials } = useApp();

  const role = currentUser?.role || 'operator';
  const name = currentUser?.name || 'Гість';

  // Statistics
  const activeOrdersCount = orders.filter(o => o.status !== 'ready').length;
  const readyOrdersCount = orders.filter(o => o.status === 'ready').length;
  const lowStockMaterials = materials.filter(m => (m.quantity - m.reserved) < 1000).length;
  const totalClients = clients.length;

  const roleLabels: Record<string, string> = {
    admin: 'Адміністратор системи',
    manager: 'Менеджер замовлень',
    operator: 'Друкар / Оператор виробництва'
  };

  // Staff performance based on orders count (without revenue figures, excluding Director)
  const staffPerformance = [
    { name: 'Працівник Е (Старший менеджер)', ordersCount: 22 },
    { name: 'Працівник Д (Друкар-оператор)', ordersCount: 18 }
  ];

  // Filter staff by branch (dummy filter since there is only 1 branch)
  const filteredStaff = staffPerformance;

  // Sales Funnel computations
  const stagesList = [
    { key: 'design', label: 'Черга макетування' },
    { key: 'print_queue', label: 'Черга друку' },
    { key: 'printing', label: 'У друці' },
    { key: 'post_press', label: 'Післядрукарська обробка' },
    { key: 'ready', label: 'Готово до видачі' }
  ];

  const funnelStats = stagesList.map(st => {
    const stageOrders = orders.filter(o => o.status === st.key);
    const sum = stageOrders.reduce((acc, curr) => acc + curr.finalPrice, 0);
    return {
      label: st.label,
      count: stageOrders.length,
      amount: sum
    };
  });

  const tools = [
    {
      id: 'leads',
      title: 'Запити та звернення',
      description: 'Журнал вхідних звернень замовників, швидкий запис контактів та обробка первинних запитів.',
      icon: <Zap size={32} style={{ color: 'var(--primary)' }} />,
      badge: 'Запити',
      allowedRoles: ['admin', 'manager'],
      metric: 'Всі звернення',
      color: 'rgba(0, 122, 255, 0.1)'
    },
    {
      id: 'clients',
      title: 'Клієнтська база',
      description: 'Перегляд історії клієнтів, обсягів продажів, додавання нових та налаштування знижок.',
      icon: <Users size={32} style={{ color: '#5856d6' }} />,
      badge: 'Клієнти',
      allowedRoles: ['admin', 'manager'],
      metric: `${totalClients} компаній`,
      color: 'rgba(88, 86, 214, 0.1)'
    },
    {
      id: 'employees',
      title: 'Працівники компанії',
      description: 'Реєстр особових справ працівників друкарні, контактні дані, спеціалізації та дні народження.',
      icon: <User size={32} style={{ color: '#34c759' }} />,
      badge: 'Штат',
      allowedRoles: ['admin', 'manager'],
      metric: '3 працівники',
      color: 'rgba(52, 199, 89, 0.1)'
    },
    {
      id: 'deals',
      title: 'Угоди та контракти',
      description: 'Контроль підписання угод, uzgodzhennya специфікацій та статусів договорів.',
      icon: <FolderKanban size={32} style={{ color: 'var(--primary)' }} />,
      badge: 'Угоди',
      allowedRoles: ['admin', 'manager'],
      metric: 'Активні угоди',
      color: 'rgba(0, 122, 255, 0.1)'
    },
    {
      id: 'calculator',
      title: 'Калькулятор замовлень',
      description: 'Розрахунок вартості тиражу, паперу, фарби, знижок та підготовка рахунків у PDF.',
      icon: <CalcIcon size={32} style={{ color: 'var(--primary)' }} />,
      badge: 'Калькулятор',
      allowedRoles: ['admin', 'manager'],
      metric: `${orders.length} розрахунків`,
      color: 'rgba(0, 122, 255, 0.1)'
    },
    {
      id: 'warehouse',
      title: 'Складський облік',
      description: 'Контроль залишків паперу, облік резервів під замовлення та швидке коригування.',
      icon: <Archive size={32} style={{ color: '#ff9500' }} />,
      badge: 'Склад',
      allowedRoles: ['admin', 'manager'],
      metric: lowStockMaterials > 0 ? `${lowStockMaterials} критично низько` : 'Всі запаси в нормі',
      metricWarning: lowStockMaterials > 0,
      color: 'rgba(255, 149, 0, 0.1)'
    },
    {
      id: 'production',
      title: 'Управління виробництвом',
      description: 'Канбан-дошка завдань: Дизайн, Druk, Послідовність етапів.',
      icon: <Columns size={32} style={{ color: '#34c759' }} />,
      badge: 'Виробництво',
      allowedRoles: ['admin', 'manager', 'operator'],
      metric: `${activeOrdersCount} активних тиражів`,
      color: 'rgba(52, 199, 89, 0.1)'
    },
    {
      id: 'tasks',
      title: 'Завдання друкарні',
      description: 'Календарний план, чек-листи готовності та призначення відповідальних.',
      icon: <CheckSquare size={32} style={{ color: '#0ea5e9' }} />,
      badge: 'Завдання',
      allowedRoles: ['admin', 'manager', 'operator'],
      metric: 'Чек-листи робіт',
      color: 'rgba(14, 165, 233, 0.1)'
    },
    {
      id: 'chats',
      title: 'Вбудовані чати',
      description: 'Швидкі комунікації з клієнтами через месенджери та внутрішні робочі групи.',
      icon: <MessageSquare size={32} style={{ color: 'var(--primary)' }} />,
      badge: 'Чати',
      allowedRoles: ['admin', 'manager'],
      metric: 'Клієнтська підтримка',
      color: 'rgba(0, 122, 255, 0.1)'
    },
    {
      id: 'documents',
      title: 'Генератор документів',
      description: 'Шаблони договорів, автоматичне виставлення рахунків та накладних.',
      icon: <FileSignature size={32} style={{ color: 'var(--primary)' }} />,
      badge: 'Документи',
      allowedRoles: ['admin', 'manager'],
      metric: 'Рахунки в PDF',
      color: 'rgba(0, 122, 255, 0.1)'
    },
    {
      id: 'finance',
      title: 'Фінансовий облік',
      description: 'Облік грошових коштів на рахунках, прибутки та витрати поліграфії.',
      icon: <Coins size={32} style={{ color: '#ff9500' }} />,
      badge: 'Фінанси',
      allowedRoles: ['admin', 'manager'],
      metric: 'Каси та рахунки',
      color: 'rgba(255, 149, 0, 0.1)'
    },
    {
      id: 'triggers',
      title: 'Тригери та Автоматизація',
      description: 'Налаштування робочих процесів, авто-зміна статусів та сповіщень.',
      icon: <Sliders size={32} style={{ color: '#5856d6' }} />,
      badge: 'Тригери',
      allowedRoles: ['admin'],
      metric: 'Робочі сценарії',
      color: 'rgba(88, 86, 214, 0.1)'
    },
    {
      id: 'settings',
      title: 'Системні налаштування',
      description: 'Конфігурація норм виробітку, цін паперу, фарб, форматів та користувачів.',
      icon: <SettingsIcon size={32} style={{ color: '#64748b' }} />,
      badge: 'Налаштування',
      allowedRoles: ['admin'],
      metric: 'Конфігурація ERP',
      color: 'rgba(100, 116, 139, 0.1)'
    }
  ];

  const allowedTools = tools.filter(t => t.allowedRoles.includes(role));

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', height: '100vh', paddingBottom: '40px', backgroundColor: 'var(--bg-system)' }}>
      
      {/* Welcome Banner */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-flat)',
        marginTop: '10px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <User size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)' }}>
              Вітаємо, {name}!
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-medium)', marginTop: '2px' }}>
              {roleLabels[role] || role} • Панель управління ТОВ Едельвейс і К
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-medium)', opacity: 0.8 }}>
              Виготовлено
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)' }}>
              {readyOrdersCount} <span style={{ fontSize: '13px', fontWeight: 'normal' }}>замовлень</span>
            </h3>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--border-light)' }} />
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-medium)', opacity: 0.8 }}>
              У роботі
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
              {activeOrdersCount} <span style={{ fontSize: '13px', fontWeight: 'normal' }}>тиражів</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Analytics & Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Funnel widget */}
        <div className="ios-card space-y-4 lg:col-span-1" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
              Воронка продажів (KeepinCRM)
            </h3>
            <button 
              onClick={() => setActiveTab('deals')}
              style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '750', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              Канбан угод <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {funnelStats.map((st, idx) => {
              const maxVal = Math.max(...funnelStats.map(s => s.amount)) || 1;
              const barPercent = Math.max(18, (st.amount / maxVal) * 100);
              const stageColors = ['#475569', '#eab308', '#f97316', '#6366f1', '#10b981'];

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{idx + 1}. {st.label}</span>
                    <span style={{ fontWeight: '800', color: stageColors[idx % stageColors.length], fontFamily: 'var(--font-mono)' }}>
                      {st.amount.toLocaleString()} ₴ <span style={{ color: 'var(--text-medium)', fontWeight: 'normal' }}>({st.count} шт)</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                    <div style={{ width: `${barPercent}%`, height: '100%', backgroundColor: stageColors[idx % stageColors.length], borderRadius: '3px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Employee Performance by Branch */}
        <div className="ios-card space-y-4 lg:col-span-1" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
          <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={16} style={{ color: 'var(--primary)' }} />
              Ефективність працівників
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredStaff.map((staff, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{staff.name}</span>
                  <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{staff.ordersCount} викон. замовлень</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (staff.ordersCount / 30) * 100)}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px', color: 'var(--text-dark)' }}>
          Робочі модулі та інструменти
        </h3>
        
        {/* Toolbox Grid - Cupertino Style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {allowedTools.map(tool => (
            <div 
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className="ios-card bg-white"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '200px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: tool.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {tool.icon}
                  </div>
                  <span className="ios-badge ios-badge-blue" style={{ fontSize: '11px', padding: '3px 8px' }}>
                    {tool.badge}
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-dark)' }}>
                  {tool.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-medium)', lineHeight: '1.4' }}>
                  {tool.description}
                </p>
              </div>

              {/* Footer of card */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '0.5px solid var(--border-light)',
                paddingTop: '12px',
                marginTop: '16px'
              }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: tool.metricWarning ? 'var(--danger)' : 'var(--text-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {tool.metricWarning && <AlertTriangle size={12} />}
                  {tool.metric}
                </span>
                
                <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '700' }}>
                  Відкрити <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 'auto',
        backgroundColor: 'rgba(60,60,67,0.03)',
        border: '0.5px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        fontSize: '12px',
        color: 'var(--text-medium)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <FolderOpen size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <span>
          <strong>ТОВ Едельвейс і К ERP</strong> працює в автономному режимі. Усі дані розрахунків замовлень, клієнтів та складських залишків зберігаються локально у вашому браузері.
        </span>
      </div>
    </div>
  );
};
