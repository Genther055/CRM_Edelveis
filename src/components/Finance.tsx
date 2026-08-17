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
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  Download,
  Calendar
} from 'lucide-react';

// Types for BAS Accounting System
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
  dt: string; // Дебет рахунку
  kt: string; // Кредит рахунку
  sum: number;
  description: string;
  document: string;
  party: string;
}

interface FixedAsset {
  id: string;
  code: string;
  name: string;
  initialValue: number;
  wearValue: number;
  residualValue: number;
  location: string;
  commissioningDate: string;
}

interface EmployeeSalary {
  id: string;
  name: string;
  role: string;
  baseSalary: number;
  bonus: number;
  pitTax: number;  // ПДФО 18%
  militaryTax: number; // ВЗ 1.5%
  ssuTax: number; // ЄСВ 22%
  netPay: number;
}

export const Finance: React.FC = () => {
  const [activePanel, setActivePanel] = useState<BasPanel>('main');

  // --- BAS State & Mock Accounting Data ---
  const [wallets] = useState([
    { id: 'W-1', name: '31101 - ПриватБанк ФОП (Основний)', balance: 142500, currency: 'UAH', accountType: 'bank' },
    { id: 'W-2', name: '31102 - Монобанк ФОП', balance: 48300, currency: 'UAH', accountType: 'bank' },
    { id: 'W-3', name: '30101 - Готівкова каса друкарні', balance: 18450, currency: 'UAH', accountType: 'cash' },
    { id: 'W-4', name: '31301 - Термінал POS Checkbox', balance: 12900, currency: 'UAH', accountType: 'pos' }
  ]);

  // General Ledger entries (Проводки Дт / Кт)
  const [ledgerEntries] = useState<LedgerEntry[]>([
    { id: 'ORD-1001', date: '2026-08-17', dt: '311 (ПриватБанк)', kt: '361 (Замовники)', sum: 14000, description: 'Оплата рахунку за тираж бланки А4 1000 шт', document: 'Банківська виписка №142', party: 'ТОВ «ФармаТрейд»' },
    { id: 'ORD-1002', date: '2026-08-16', dt: '201 (Сировина)', kt: '631 (Постачальники)', sum: 18500, description: 'Надходження паперу крейдованого 130г (5000 арк)', document: 'Накладна №П-884', party: 'ТОВ Папір-Світ' },
    { id: 'ORD-1003', date: '2026-08-15', dt: '311 (Монобанк)', kt: '361 (Замовники)', sum: 8500, description: 'Передплата за виготовлення каталогів А4', document: 'Банківська виписка №99', party: 'ПРАТ «ЕкоСок»' },
    { id: 'ORD-1004', date: '2026-08-14', dt: '92 (Адмінвитрати)', kt: '631 (Постачальники)', sum: 24000, description: 'Аренда друкарського цеху за Серпень 2026', document: 'Акт наданих послуг №А-12', party: 'ТОВ ПромНерухомість' },
    { id: 'ORD-1005', date: '2026-08-14', dt: '301 (Каса)', kt: '702 (Дохід роздріб)', sum: 3200, description: 'Продаж поліграфії роздріб (Чеки POS)', document: 'ПКО №332', party: 'Кінцевий споживач' },
    { id: 'ORD-1006', date: '2026-08-12', dt: '661 (Розрахунки з ЗП)', kt: '301 (Каса)', sum: 12500, description: 'Виплата авансу другу групу працівників цеху', document: 'ВКО №104', party: 'Сергій (Друкар)' },
    { id: 'ORD-1007', date: '2026-08-10', dt: '311 (ПриватБанк)', kt: '361 (Замовники)', sum: 6400, description: 'Оплата за виготовлення ламінованих меню', document: 'Банківська виписка №140', party: 'Кафе «Капучино»' },
    { id: 'ORD-1008', date: '2026-08-08', dt: '91 (Загальновиробничі)', kt: '631 (Постачальники)', sum: 4200, description: 'ТО та заміна тонеру Xerox Versant 180', document: 'Акт виконаних робіт №С-45', party: 'ТОВ Сервіс-Принт' }
  ]);

  // Fixed Assets (Основи засоби / ОЗ)
  const [fixedAssets] = useState<FixedAsset[]>([
    { id: '1', code: 'ОФС-001', name: 'Цифрова друкарська машина Xerox Versant 180', initialValue: 1200000, wearValue: 340000, residualValue: 860000, location: 'Друкарський цех #1', commissioningDate: '2023-04-12' },
    { id: '2', code: 'ОФС-002', name: 'Офсетна машина Heidelberg Speedmaster 74 (4 фарби)', initialValue: 3400000, wearValue: 1300000, residualValue: 2100000, location: 'Друкарський цех #2', commissioningDate: '2021-09-01' },
    { id: '3', code: 'ОФС-003', name: 'Одноножова паперорізальна машина Polar 92 N', initialValue: 650000, wearValue: 180000, residualValue: 470000, location: 'Дільниця порізки', commissioningDate: '2022-11-15' },
    { id: '4', code: 'ОФС-004', name: 'Промисловий ламінатор автоматичний KDFK-720', initialValue: 280000, wearValue: 65000, residualValue: 215000, location: 'Дільниця післядруку', commissioningDate: '2024-02-10' }
  ]);

  // Payroll HR (Зарплата і кадри)
  const [payrollList] = useState<EmployeeSalary[]>([
    { id: 'EMP-1', name: 'Сергій Петренко', role: 'Головний друкар офсету', baseSalary: 28000, bonus: 4500, pitTax: 5850, militaryTax: 487.5, ssuTax: 7150, netPay: 26162.5 },
    { id: 'EMP-2', name: 'Вікторія Ковальчук', role: 'Технолог-кошторисник', baseSalary: 24000, bonus: 2000, pitTax: 4680, militaryTax: 390, ssuTax: 5720, netPay: 20930 },
    { id: 'EMP-3', name: 'Анна Сидоренко', role: 'Менеджер із замовлень', baseSalary: 22000, bonus: 6500, pitTax: 5130, militaryTax: 427.5, ssuTax: 6270, netPay: 22942.5 }
  ]);

  // Total balance calculations
  const totalIncome = ledgerEntries.filter(e => e.dt.includes('311') || e.dt.includes('301')).reduce((sum, e) => sum + e.sum, 0);
  const totalExpense = ledgerEntries.filter(e => e.kt.includes('631') || e.kt.includes('301') || e.dt.includes('92') || e.dt.includes('91')).reduce((sum, e) => sum + e.sum, 0);
  const netProfit = totalIncome - totalExpense;

  // Render sub-panels based on selected BAS tab
  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header Banner */}
      <div className="header-title-container">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '14px', fontWeight: '900' }}>BAS</span>
            BAS Бухгалтерія — Комплексний фінансовий облік
          </h1>
          <p className="subtitle">Облікова система підприємства поліграфії відповідно до НП(С)БО України</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => alert('Формування оборотно-сальдової відомості (ОСВ)...')} className="ios-btn ios-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={14} />
            ОСВ Відомість
          </button>
          <button onClick={() => alert('Експорт даних у format XML/Excel для ДПС України')} className="ios-btn ios-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} />
            Звіт у ДПС
          </button>
        </div>
      </div>

      {/* BAS 11 Navigation Sub-tabs Menu */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        overflowX: 'auto', 
        paddingBottom: '8px', 
        marginBottom: '20px', 
        borderBottom: '1px solid var(--border-light)',
        whiteSpace: 'nowrap'
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

      {/* --- PANEL CONTENT SWITCHER --- */}

      {/* PANEL 1: ГОЛОВНЕ */}
      {activePanel === 'main' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {wallets.map(w => (
              <div key={w.id} className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: '750', color: 'var(--text-medium)', textTransform: 'uppercase', display: 'block' }}>{w.name}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-dark)', margin: '6px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                  {w.balance.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
                </h3>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: 0, borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                Календар бухгалтера & Податковий графік ДПС (Серпень 2026)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Подача Декларації з ПДВ за Липень 2026</h4>
                      <span style={{ fontSize: '10px', color: 'var(--text-medium)' }}>Граничний термін: 20 Серпня 2026</span>
                    </div>
                  </div>
                  <span className="ios-badge ios-badge-green">Здано у ДПС</span>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Сплата ПДФО та Військового збору з заробітної плати</h4>
                      <span style={{ fontSize: '10px', color: 'var(--text-medium)' }}>Термін сплати: до 30 Серпня 2026</span>
                    </div>
                  </div>
                  <span className="ios-badge ios-badge-yellow">Очікує сплати</span>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} style={{ color: 'var(--primary)' }} />
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Реєстрація Податкових Накладних (ПН) в ЄРПН за 1-у половину місяця</h4>
                      <span style={{ fontSize: '10px', color: 'var(--text-medium)' }}>Термін реєстрації: до 31 Серпня 2026</span>
                    </div>
                  </div>
                  <span className="ios-badge ios-badge-blue">В процесі</span>
                </div>
              </div>
            </div>

            {/* Quick Audit Balance Widget */}
            <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: 0, borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                Експрес-перевірка обліку
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                  <span>Сальдо каси (301) відповідає ПКО/ВКО:</span>
                  <strong style={{ color: 'var(--success)' }}>✓ ОК</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                  <span>Відсутні негативні залишки на 201/209:</span>
                  <strong style={{ color: 'var(--success)' }}>✓ ОК</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                  <span>ПДВ кредит узгоджено з ЄРПН:</span>
                  <strong style={{ color: 'var(--success)' }}>✓ 100%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                  <span>Заборгованість по ЗП (661):</span>
                  <strong style={{ color: 'var(--primary)' }}>0.00 ₴</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 2: КЕРІВНИКУ */}
      {activePanel === 'executive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)', textTransform: 'uppercase' }}>Валовий прибуток (Margin)</span>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--success)', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                  +{netProfit.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
                </h3>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)' }}>
                <ArrowUpRight size={24} />
              </div>
            </div>

            <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)', textTransform: 'uppercase' }}>Дебіторка замовників (Рах. 361)</span>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                  22 500,00 ₴
                </h3>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(0, 122, 255, 0.12)', color: 'var(--primary)' }}>
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-medium)', textTransform: 'uppercase' }}>Кредиторка постачальників (Рах. 631)</span>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--danger)', margin: '4px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                  18 500,00 ₴
                </h3>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' }}>
                <ArrowDownRight size={24} />
              </div>
            </div>
          </div>

          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Аналіз рентабельності категорій поліграфічної продукції
            </h2>
            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-medium)' }}>Категорія поліграфії</th>
                    <th style={{ color: 'var(--text-medium)' }}>Дохід (грн)</th>
                    <th style={{ color: 'var(--text-medium)' }}>Собівартість матеріалів</th>
                    <th style={{ color: 'var(--text-medium)' }}>Чиста маржа (грн)</th>
                    <th style={{ color: 'var(--text-medium)' }}>Рентабельність %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>Бланки А4 / А5</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>14 000.00 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>4 900.00 ₴</td>
                    <td style={{ fontWeight: '800', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>9 100.00 ₴</td>
                    <td><span className="ios-badge ios-badge-green">65.0 %</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>Каталоги & Брошури</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>8 500.00 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>4 080.00 ₴</td>
                    <td style={{ fontWeight: '800', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>4 420.00 ₴</td>
                    <td><span className="ios-badge ios-badge-blue">52.0 %</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>Меню ламіновані</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>6 400.00 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>2 432.00 ₴</td>
                    <td style={{ fontWeight: '800', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>3 968.00 ₴</td>
                    <td><span className="ios-badge ios-badge-green">62.0 %</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 3: БАНК І КАСА */}
      {activePanel === 'bank_cash' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={18} style={{ color: 'var(--primary)' }} />
                Банківські виписки та Касові ордери (Рахунки 311, 301)
              </h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => alert('Створення ПКО (Прибутковий касовий ордер)')} className="ios-btn ios-btn-secondary ios-btn-small">+ ПКО</button>
                <button onClick={() => alert('Створення ВКО (Видатковий касовий ордер)')} className="ios-btn ios-btn-secondary ios-btn-small">+ ВКО</button>
              </div>
            </div>

            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-medium)' }}>Дата</th>
                    <th style={{ color: 'var(--text-medium)' }}>Документ / Номер</th>
                    <th style={{ color: 'var(--text-medium)' }}>Рахунок обліку</th>
                    <th style={{ color: 'var(--text-medium)' }}>Контрагент</th>
                    <th style={{ color: 'var(--text-medium)' }}>Сума</th>
                    <th style={{ color: 'var(--text-medium)' }}>Призначення платежу</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map(entry => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ color: 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>{entry.date}</td>
                      <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>{entry.document}</td>
                      <td>
                        <span className="ios-badge ios-badge-blue">{entry.dt.split(' ')[0]}</span>
                      </td>
                      <td style={{ color: 'var(--text-dark)', fontWeight: '600' }}>{entry.party}</td>
                      <td style={{ fontWeight: '800', color: entry.dt.includes('311') || entry.dt.includes('301') ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                        {entry.sum.toFixed(2)} ₴
                      </td>
                      <td style={{ color: 'var(--text-medium)', fontSize: '11px' }}>{entry.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 4: ПРОДАЖІ */}
      {activePanel === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Реєстр реалізацій товарів і послуг (Акти & Накладні / Рахунок 361)
            </h2>
            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-medium)' }}>Замовник</th>
                    <th style={{ color: 'var(--text-medium)' }}>Документ відвантаження</th>
                    <th style={{ color: 'var(--text-medium)' }}>Сума без ПДВ</th>
                    <th style={{ color: 'var(--text-medium)' }}>ПДВ 20%</th>
                    <th style={{ color: 'var(--text-medium)' }}>Всього з ПДВ</th>
                    <th style={{ color: 'var(--text-medium)' }}>Статус ПН в ЄРПН</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>ТОВ «ФармаТрейд»</td>
                    <td>Акт реалізації №Р-142 від 17.08.2026</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>11 666.67 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>2 333.33 ₴</td>
                    <td style={{ fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>14 000.00 ₴</td>
                    <td><span className="ios-badge ios-badge-green">Зареєстровано</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>ПРАТ «ЕкоСок»</td>
                    <td>Видаткова накладна №ВН-98 від 15.08.2026</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>7 083.33 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>1 416.67 ₴</td>
                    <td style={{ fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>8 500.00 ₴</td>
                    <td><span className="ios-badge ios-badge-blue">В черзі ЄРПН</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>Кафе «Капучино»</td>
                    <td>Акт реалізації №А-64 від 10.08.2026</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>5 333.33 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>1 066.67 ₴</td>
                    <td style={{ fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>6 400.00 ₴</td>
                    <td><span className="ios-badge ios-badge-green">Зареєстровано</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 5: КУПІВЛІ */}
      {activePanel === 'purchases' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Надходження товарів та послуг від постачальників (Рахунок 631)
            </h2>
            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-medium)' }}>Постачальник</th>
                    <th style={{ color: 'var(--text-medium)' }}>Вхідний документ</th>
                    <th style={{ color: 'var(--text-medium)' }}>Номенклатура</th>
                    <th style={{ color: 'var(--text-medium)' }}>Сума з ПДВ</th>
                    <th style={{ color: 'var(--text-medium)' }}>Податковий кредит ПДВ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>ТОВ Папір-Світ</td>
                    <td>Накладна постачальника №П-884</td>
                    <td>Папір крейдований 130г (5000 арк)</td>
                    <td style={{ fontWeight: '800', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>18 500.00 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>3 083.33 ₴</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>ТОВ ПромНерухомість</td>
                    <td>Акт оренди №А-12</td>
                    <td>Оренда друкарського цеху за Серпень</td>
                    <td style={{ fontWeight: '800', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>24 000.00 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>4 000.00 ₴</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>ТОВ Сервіс-Принт</td>
                    <td>Акт виконаних робіт №С-45</td>
                    <td>Сервіс Xerox Versant та заміна девелопера</td>
                    <td style={{ fontWeight: '800', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>4 200.00 ₴</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>700.00 ₴</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 6: ОЗ І НМА */}
      {activePanel === 'fixed_assets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive size={18} style={{ color: 'var(--primary)' }} />
                Реєстр Основних Засобів (ОЗ / Рахунки 104, 105, 131)
              </h2>
              <button onClick={() => alert('Нарахування щомісячної амортизації ОЗ виконано.')} className="ios-btn ios-btn-primary ios-btn-small">
                Нарахувати амортизацію
              </button>
            </div>
            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-medium)' }}>Інв. №</th>
                    <th style={{ color: 'var(--text-medium)' }}>Найменування обладнання</th>
                    <th style={{ color: 'var(--text-medium)' }}>Початкова вартість</th>
                    <th style={{ color: 'var(--text-medium)' }}>Нарахований знос</th>
                    <th style={{ color: 'var(--text-medium)' }}>Залишкова вартість</th>
                    <th style={{ color: 'var(--text-medium)' }}>Локація</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedAssets.map(fa => (
                    <tr key={fa.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ fontWeight: '750', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{fa.code}</td>
                      <td style={{ fontWeight: '750', color: 'var(--text-dark)' }}>{fa.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{fa.initialValue.toLocaleString()} ₴</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>{fa.wearValue.toLocaleString()} ₴</td>
                      <td style={{ fontWeight: '800', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{fa.residualValue.toLocaleString()} ₴</td>
                      <td style={{ color: 'var(--text-medium)', fontSize: '11px' }}>{fa.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 7: ЗАРПЛАТА І КАДРИ */}
      {activePanel === 'payroll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Відомість нарахування заробітної плати та податків (Рахунки 661, 6411, 651)
            </h2>
            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-medium)' }}>Співробітник / Посада</th>
                    <th style={{ color: 'var(--text-medium)' }}>Оклад + Премія</th>
                    <th style={{ color: 'var(--text-medium)' }}>ПДФО (18%)</th>
                    <th style={{ color: 'var(--text-medium)' }}>Військовий збір (1.5%)</th>
                    <th style={{ color: 'var(--text-medium)' }}>ЄСВ 22% (Податкове навант.)</th>
                    <th style={{ color: 'var(--text-medium)' }}>До виплати (На руки)</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollList.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td>
                        <div style={{ fontWeight: '750', color: 'var(--text-dark)' }}>{emp.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-medium)' }}>{emp.role}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{(emp.baseSalary + emp.bonus).toLocaleString()} ₴</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>{emp.pitTax.toLocaleString()} ₴</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>{emp.militaryTax.toLocaleString()} ₴</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{emp.ssuTax.toLocaleString()} ₴</td>
                      <td style={{ fontWeight: '900', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{emp.netPay.toLocaleString()} ₴</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 8: ОПЕРАЦІЇ */}
      {activePanel === 'operations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Журнал проводків Дт / Кт (General Ledger)
            </h2>
            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-medium)' }}>Дата</th>
                    <th style={{ color: 'var(--text-medium)' }}>Дебет (Дт)</th>
                    <th style={{ color: 'var(--text-medium)' }}>Кредит (Кт)</th>
                    <th style={{ color: 'var(--text-medium)' }}>Сума (грн)</th>
                    <th style={{ color: 'var(--text-medium)' }}>Зміст господарської операції</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ color: 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>{e.date}</td>
                      <td><span className="ios-badge ios-badge-blue">{e.dt}</span></td>
                      <td><span className="ios-badge ios-badge-yellow">{e.kt}</span></td>
                      <td style={{ fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>{e.sum.toFixed(2)} ₴</td>
                      <td style={{ color: 'var(--text-medium)', fontSize: '11px' }}>{e.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 9: ЗВІТИ */}
      {activePanel === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Баланс (Форма №1) та Фінансові результати (Форма №2)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 10px 0' }}>АКТИВИ ПІДПРИЄМСТВА</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                    <span>Необоротні активи (ОЗ & Обладнання):</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>3 645 000.00 ₴</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                    <span>Запаси сировини та паперу (Рах. 201):</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>184 200.00 ₴</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                    <span>Грошові кошти на рахунках (311, 301):</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>222 150.00 ₴</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-light)', paddingTop: '6px', fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)' }}>
                    <span>БАЛАНС АКТИВУ:</span>
                    <span style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>4 051 350.00 ₴</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 10px 0' }}>ПАСИВИ ПІДПРИЄМСТВА</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                    <span>Статутний та власний капітал:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>3 500 000.00 ₴</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                    <span>Нерозподілений прибуток:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>532 850.00 ₴</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                    <span>Поточна кредиторська заборгованість (631):</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>18 500.00 ₴</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-light)', paddingTop: '6px', fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)' }}>
                    <span>БАЛАНС ПАСИВУ:</span>
                    <span style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>4 051 350.00 ₴</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 10: ДОВІДНИКИ */}
      {activePanel === 'dictionaries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              План рахунків бухгалтерського обліку (НП(С)БО)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', fontSize: '11px' }}>
                <strong style={{ color: 'var(--primary)', display: 'block' }}>311 - Поточні рахунки в банку</strong>
                <span style={{ color: 'var(--text-medium)' }}>Облік грошей на банківських рахунках ФОП / ТОВ</span>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', fontSize: '11px' }}>
                <strong style={{ color: 'var(--primary)', display: 'block' }}>301 - Каса в національній валюті</strong>
                <span style={{ color: 'var(--text-medium)' }}>Готівкові кошти в касі друкарні</span>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', fontSize: '11px' }}>
                <strong style={{ color: 'var(--primary)', display: 'block' }}>361 - Розрахунки з вітчизняними покупцями</strong>
                <span style={{ color: 'var(--text-medium)' }}>Дебіторська заборгованість замовників</span>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', fontSize: '11px' }}>
                <strong style={{ color: 'var(--primary)', display: 'block' }}>631 - Розрахунки з вітчизняними постачальниками</strong>
                <span style={{ color: 'var(--text-medium)' }}>Кредиторська заборгованість за матеріали</span>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', fontSize: '11px' }}>
                <strong style={{ color: 'var(--primary)', display: 'block' }}>201 - Сировина й матеріали</strong>
                <span style={{ color: 'var(--text-medium)' }}>Облік паперу, тонеру, фарб і плівок</span>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', fontSize: '11px' }}>
                <strong style={{ color: 'var(--primary)', display: 'block' }}>661 - Розрахунки за виплатами працівникам</strong>
                <span style={{ color: 'var(--text-medium)' }}>Заробітна плата та премії персоналу</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 11: АДМІНІСТРУВАННЯ */}
      {activePanel === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 14px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              Налаштування облікової політики та податкових параметрів
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Система оподаткування</label>
                <select style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                  <option value="vat">Загальна система (ПДВ 20% + Податок на прибуток 18%)</option>
                  <option value="fop3">ФОП 3 група (5% від доходу)</option>
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Основний метод оцінки вибуття запасів</label>
                <select style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                  <option value="fifo">FIFO (Перша партія на вибуття)</option>
                  <option value="wavg">Середньозважена собівартість</option>
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Шляхи інтеграції з Клієнт-Банком</label>
                <input value="Приват24 / Монобанк Auto-Import API (Активно)" readOnly style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
              </div>

              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Резервне копіювання бази даних BAS</label>
                <input value="Щоденно о 03:00 в Хмару (Активно)" readOnly style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }} />
              </div>
            </div>
            <button onClick={() => alert('Налаштування облікової політики збережено!')} className="ios-btn ios-btn-primary" style={{ marginTop: '16px' }}>
              Зберегти параметри обліку
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
