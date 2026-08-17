import React, { useState } from 'react';
import { 
  Home,
  Briefcase,
  Landmark,
  ShoppingCart,
  Package,
  HardDrive,
  Users,
  BookOpen,
  FileSpreadsheet,
  BookMarked,
  ShieldCheck,
  Download,
  Plus,
  X,
  BarChart2,
  Clock,
  List,
  User
} from 'lucide-react';

// Types for BAS & KeepinCRM Finance System
type BasPanel = 
  | 'main'          // Головне
  | 'executive'     // Керівнику
  | 'bank_cash'     // Банк і каса
  | 'sales'         // Продажі
  | 'purchases'     // Купівлі
  | 'fixed_assets'  // ОЗ і НМА
  | 'payroll'       // Зарплата і кадри
  | 'operations'    // Операції
  | 'reports'       // Звіти
  | 'dictionaries'  // Довідники
  | 'admin';        // Адміністрування

interface LedgerEntry {
  id: string;
  date: string;
  dt: string; // Дебет
  kt: string; // Кредит
  sum: number;
  type: 'income' | 'expense';
  description: string;
  document: string;
  party: string;
  user: string;
  category: string;
  wallet: string;
}

export const Finance: React.FC = () => {
  const [activePanel, setActivePanel] = useState<BasPanel>('main');
  const [viewMode, setViewMode] = useState<'journal' | 'planned' | 'analytics'>('journal');

  // Slide-over Export Drawer State
  const [showExportDrawer, setShowExportDrawer] = useState(false);
  const [exportMode, setExportMode] = useState<'all' | 'filtered'>('filtered');
  const [exportFields, setExportFields] = useState<Record<string, boolean>>({
    date: true,
    paymentType: true,
    quantity: true,
    currency: true,
    client: true,
    creator: false,
    branch: true,
    category: true,
    wallet: true,
    deal: true,
    dealType: true,
    segment: true,
    comment: false
  });

  // Clear legacy cache if old structure detected
  React.useEffect(() => {
    const saved = localStorage.getItem('crm_finance_records');
    if (saved && (saved.includes('F-1"') || saved.includes('Готівка каса"'))) {
      localStorage.removeItem('crm_finance_records');
    }
  }, []);

  // --- Wallets & Accounts ---
  const [wallets] = useState([
    { id: 'W-1', name: '31101 - ПриватБанк ФОП (Основний)', balance: 142500, currency: 'UAH', accountType: 'bank' },
    { id: 'W-2', name: '31102 - Монобанк ФОП', balance: 48300, currency: 'UAH', accountType: 'bank' },
    { id: 'W-3', name: '30101 - Готівкова каса друкарні', balance: 18450, currency: 'UAH', accountType: 'cash' },
    { id: 'W-4', name: '31301 - Термінал POS Checkbox', balance: 12900, currency: 'UAH', accountType: 'pos' }
  ]);

  // General Ledger entries
  const [ledgerEntries] = useState<LedgerEntry[]>([
    { id: 'ORD-1001', date: '16.01.2026', dt: '311 (ПриватБанк)', kt: '361 (Замовники)', sum: 72000, type: 'income', description: 'Оплата рахунку за тираж бланки А4 1000 шт', document: 'Банківська виписка №142', party: 'Feeling Good', user: 'Анна', category: 'Продаж товарів', wallet: 'ПриватБанк ФОП' },
    { id: 'ORD-1002', date: '16.01.2026', dt: '311 (ПриватБанк)', kt: '361 (Замовники)', sum: 65000, type: 'income', description: 'Передплата за виготовлення брошур', document: 'Банківська виписка №143', party: 'Марина Губенко', user: 'Анна', category: 'Продаж товарів', wallet: 'ПриватБанк ФОП' },
    { id: 'ORD-1003', date: '16.01.2026', dt: '311 (Монобанк)', kt: '361 (Замовники)', sum: 70000, type: 'income', description: 'Оплата за поліграфічні послуги', document: 'Банківська виписка №144', party: 'Петро Петренко', user: 'Анна', category: 'Продаж товарів', wallet: 'Монобанк ФОП' },
    { id: 'ORD-1004', date: '15.01.2026', dt: '311 (ПриватБанк)', kt: '361 (Замовники)', sum: 105000, type: 'income', description: 'Оплата за каталоги A4', document: 'Виписка №99', party: 'Visitable Kitchen', user: 'Анна', category: 'Продаж товарів', wallet: 'ПриватБанк ФОП' },
    { id: 'ORD-1005', date: '15.01.2026', dt: '201 (Сировина)', kt: '631 (Постачальники)', sum: 12750, type: 'expense', description: 'Закупівля крейдованого паперу 130г', document: 'Накладна №П-884', party: 'ТОВ Папір-Світ', user: 'Іван', category: 'Закупівля матеріалів', wallet: 'Готівкова каса' },
    { id: 'ORD-1006', date: '15.01.2026', dt: '92 (Адмінвитрати)', kt: '631 (Постачальники)', sum: 374000, type: 'expense', description: 'Оренда та лізинг друкарської машини Xerox', document: 'Акт №А-12', party: 'ТОВ Сервіс-Принт', user: 'Іван', category: 'Закупівля матеріалів', wallet: 'ПриватБанк ФОП' },
    { id: 'ORD-1007', date: '12.01.2026', dt: '311 (ПриватБанк)', kt: '361 (Замовники)', sum: 33000, type: 'income', description: 'Оплата візиток та буклетів', document: 'Виписка №140', party: 'Марина Губенко', user: 'Анна', category: 'Продаж товарів', wallet: 'ПриватБанк ФОП' },
    { id: 'ORD-1008', date: '11.01.2026', dt: '301 (Каса)', kt: '702 (Дохід роздріб)', sum: 5000, type: 'income', description: 'Роздрібний продаж поліграфії', document: 'ПКО №332', party: 'Світлана', user: 'Іван', category: 'Продаж товарів', wallet: 'Готівкова каса' }
  ]);

  const nonCashTotal = wallets.filter(w => w.accountType === 'bank' || w.accountType === 'pos').reduce((sum, w) => sum + w.balance, 0);
  const cashTotal = wallets.filter(w => w.accountType === 'cash').reduce((sum, w) => sum + w.balance, 0);

  const toggleAllExportFields = (checked: boolean) => {
    const updated: Record<string, boolean> = {};
    Object.keys(exportFields).forEach(k => { updated[k] = checked; });
    setExportFields(updated);
  };

  const handleRunExport = () => {
    const selectedList = Object.keys(exportFields).filter(k => exportFields[k]).join(', ');
    alert(`Розпочато фоновий експорт фінансів у format CSV/Excel!\nРежим: ${exportMode === 'all' ? 'Всі дані' : 'Відфільтровані'}\nПоля: ${selectedList || 'Всі'}`);
    setShowExportDrawer(false);
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto', position: 'relative' }}>
      
      {/* Header Banner */}
      <div className="header-title-container">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '14px', fontWeight: '900' }}>CRM</span>
            Фінанси & BAS Бухгалтерія підприємства
          </h1>
          <p className="subtitle">Управлінський та бухгалтерський облік грошових потоків, кас, рахунків та експорту</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => setShowExportDrawer(true)} 
            className="ios-btn ios-btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
          >
            <Download size={15} style={{ color: '#10b981' }} />
            Експорт фінансів
          </button>
          <button 
            onClick={() => alert('Створення нової фінансової проводки Дт/Кт...')} 
            className="ios-btn ios-btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', borderColor: '#10b981' }}
          >
            <Plus size={15} />
            Створити операцію
          </button>
        </div>
      </div>

      {/* BAS 11 Navigation Sub-tabs Menu Card Header */}
      <div className="ios-card" style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-light)', 
        padding: '10px 14px', 
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          overflowX: 'auto', 
          paddingBottom: '4px',
          whiteSpace: 'nowrap',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setActivePanel('main')}
            className={`ios-btn ${activePanel === 'main' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Home size={14} />
            Головне
          </button>

          <button
            onClick={() => setActivePanel('executive')}
            className={`ios-btn ${activePanel === 'executive' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Briefcase size={14} />
            Керівнику
          </button>

          <button
            onClick={() => setActivePanel('bank_cash')}
            className={`ios-btn ${activePanel === 'bank_cash' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Landmark size={14} />
            Банк і каса
          </button>

          <button
            onClick={() => setActivePanel('sales')}
            className={`ios-btn ${activePanel === 'sales' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <ShoppingCart size={14} />
            Продажі
          </button>

          <button
            onClick={() => setActivePanel('purchases')}
            className={`ios-btn ${activePanel === 'purchases' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Package size={14} />
            Купівлі
          </button>

          <button
            onClick={() => setActivePanel('fixed_assets')}
            className={`ios-btn ${activePanel === 'fixed_assets' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <HardDrive size={14} />
            ОЗ і НМА
          </button>

          <button
            onClick={() => setActivePanel('payroll')}
            className={`ios-btn ${activePanel === 'payroll' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Users size={14} />
            Зарплата і кадри
          </button>

          <button
            onClick={() => setActivePanel('operations')}
            className={`ios-btn ${activePanel === 'operations' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <BookOpen size={14} />
            Операції
          </button>

          <button
            onClick={() => setActivePanel('reports')}
            className={`ios-btn ${activePanel === 'reports' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <FileSpreadsheet size={14} />
            Звіти
          </button>

          <button
            onClick={() => setActivePanel('dictionaries')}
            className={`ios-btn ${activePanel === 'dictionaries' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <BookMarked size={14} />
            Довідники
          </button>

          <button
            onClick={() => setActivePanel('admin')}
            className={`ios-btn ${activePanel === 'admin' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <ShieldCheck size={14} />
            Адміністрування
          </button>
        </div>
      </div>

      {/* KeepinCRM Top Summary Cards (Безготівка & Готівка) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)', display: 'block' }}>Безготівка</span>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
            {nonCashTotal.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
          </h2>
        </div>

        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)', display: 'block' }}>Готівка</span>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
            {cashTotal.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
          </h2>
        </div>
      </div>

      {/* KeepinCRM Financial Ledger Table */}
      <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>
            Журнал фінансових операцій KeepinCRM
          </h2>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setViewMode('journal')} className={`ios-btn ${viewMode === 'journal' ? 'ios-btn-primary' : 'ios-btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '11px' }}>
              <List size={14} /> Журнал
            </button>
            <button onClick={() => setViewMode('planned')} className={`ios-btn ${viewMode === 'planned' ? 'ios-btn-primary' : 'ios-btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '11px' }}>
              <Clock size={14} /> Планові
            </button>
            <button onClick={() => setViewMode('analytics')} className={`ios-btn ${viewMode === 'analytics' ? 'ios-btn-primary' : 'ios-btn-secondary'}`} style={{ padding: '4px 8px', fontSize: '11px' }}>
              <BarChart2 size={14} /> Аналітика
            </button>
          </div>
        </div>

        <div className="ios-table-container">
          <table className="ios-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-card-subtle)' }}>
                <th style={{ width: '30px' }}>⋮</th>
                <th style={{ color: 'var(--text-medium)' }}>Дата ⬍</th>
                <th style={{ color: 'var(--text-medium)' }}>Сума ⬍</th>
                <th style={{ color: 'var(--text-medium)' }}>Контрагент ⬍</th>
                <th style={{ color: 'var(--text-medium)' }}>Користувач ⬍</th>
                <th style={{ color: 'var(--text-medium)' }}>Категорія ⬍</th>
                <th style={{ color: 'var(--text-medium)' }}>Гаманець</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ color: 'var(--text-medium)', textAlign: 'center' }}>⋮</td>
                  <td style={{ color: 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>{entry.date}</td>
                  <td style={{ fontWeight: '800', color: entry.type === 'income' ? '#10b981' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
                    {entry.type === 'income' ? '⬇ ' : '⬆ '}{entry.sum.toLocaleString('uk-UA')} ₴
                  </td>
                  <td style={{ fontWeight: '700', color: '#007AFF' }}>{entry.party}</td>
                  <td style={{ color: 'var(--text-dark)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-card-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                        <User size={12} />
                      </div>
                      <span>{entry.user}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-dark)', fontWeight: '600' }}>{entry.category}</td>
                  <td style={{ color: 'var(--text-medium)', fontSize: '11px' }}>{entry.wallet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RIGHT SLIDE-OVER DRAWER (ЕКСПОРТ ФІНАНСІВ) --- */}
      {showExportDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            width: '500px',
            maxWidth: '90vw',
            height: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px',
            overflowY: 'auto',
            animation: 'slideInRight 0.25s ease-out'
          }}>
            <div>
              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#10b981' }}>➔|</span> Експорт
                </h2>
                <button 
                  onClick={() => setShowExportDrawer(false)}
                  style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Description Box */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                color: '#475569',
                lineHeight: '1.5',
                marginBottom: '20px'
              }}>
                Виберіть, які дані потрібно експортувати. Якщо обрано "Експортувати всі", то вивантажуються фінанси за весь період. Експорт проводиться у фоновому режимі, якщо даних багато, то це може зайняти деякий час.
              </div>

              {/* Radio Export Modes */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  <input 
                    type="radio" 
                    name="exportMode" 
                    checked={exportMode === 'all'} 
                    onChange={() => setExportMode('all')}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <span>Завантажити всі</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  <input 
                    type="radio" 
                    name="exportMode" 
                    checked={exportMode === 'filtered'} 
                    onChange={() => setExportMode('filtered')}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <span>Завантажити відфільтровані</span>
                </label>
              </div>

              {/* Fields Selector Checkboxes Header */}
              <div style={{ fontSize: '12px', fontWeight: '750', color: '#64748b', marginBottom: '12px' }}>
                Пошук та вибір полів експорту:
              </div>

              {/* Checkboxes Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: '#1e293b' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={Object.values(exportFields).every(Boolean)} 
                    onChange={(e) => toggleAllExportFields(e.target.checked)}
                    style={{ accentColor: '#10b981' }}
                  />
                  <strong>Всі</strong>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.date} 
                    onChange={(e) => setExportFields({ ...exportFields, date: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Дата</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.paymentType} 
                    onChange={(e) => setExportFields({ ...exportFields, paymentType: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Тип платежу</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.quantity} 
                    onChange={(e) => setExportFields({ ...exportFields, quantity: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ К-сть</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.currency} 
                    onChange={(e) => setExportFields({ ...exportFields, currency: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Валюта</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.client} 
                    onChange={(e) => setExportFields({ ...exportFields, client: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Клієнт</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.creator} 
                    onChange={(e) => setExportFields({ ...exportFields, creator: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>Створив</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.branch} 
                    onChange={(e) => setExportFields({ ...exportFields, branch: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Філія</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.category} 
                    onChange={(e) => setExportFields({ ...exportFields, category: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Категорія</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.wallet} 
                    onChange={(e) => setExportFields({ ...exportFields, wallet: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Гаманець</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.deal} 
                    onChange={(e) => setExportFields({ ...exportFields, deal: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Угода</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.dealType} 
                    onChange={(e) => setExportFields({ ...exportFields, dealType: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Тип (угода або запис)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.segment} 
                    onChange={(e) => setExportFields({ ...exportFields, segment: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>✓ Сегмент</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={exportFields.comment} 
                    onChange={(e) => setExportFields({ ...exportFields, comment: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>Коментар</span>
                </label>
              </div>
            </div>

            {/* Bottom Footer Actions */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '20px' }}>
              <button 
                onClick={handleRunExport}
                style={{ 
                  flexGrow: 1, 
                  height: '42px', 
                  backgroundColor: '#10b981', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: '750', 
                  fontSize: '14px', 
                  cursor: 'pointer' 
                }}
              >
                Експорт
              </button>
              <button 
                onClick={() => setShowExportDrawer(false)}
                style={{ 
                  flexGrow: 1, 
                  height: '42px', 
                  backgroundColor: '#ffffff', 
                  color: '#475569', 
                  border: '1px solid #cbd5e1', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  fontSize: '14px', 
                  cursor: 'pointer' 
                }}
              >
                Скасувати
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
