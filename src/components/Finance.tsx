import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Download,
  CheckCircle2,
  Trash2,
  X,
  Building2,
  Banknote,
  TrendingUp,
  ShoppingCart,
  PackageCheck,
  FileSpreadsheet,
  Users,
  BookOpen,
  Settings,
  AlertCircle,
  ArrowRightLeft,
  Wallet
} from 'lucide-react';
import { useApp, getDefaultMaterialPrice } from '../context/AppContext';
import type { FinanceEntry, UserRole } from '../types';

type BasPanel =
  | 'main'
  | 'executive'
  | 'bank_cash'
  | 'sales'
  | 'purchases'
  | 'fixed_assets'
  | 'payroll'
  | 'operations'
  | 'reports'
  | 'dictionaries'
  | 'admin';

type ViewMode = 'journal' | 'planned' | 'analytics';

const PANEL_ITEMS: Array<{ id: BasPanel; label: string }> = [
  { id: 'main', label: 'Журнал і огляд' },
  { id: 'executive', label: 'Керівнику (P&L)' },
  { id: 'bank_cash', label: 'Банк і каса' },
  { id: 'sales', label: 'Продажі (361)' },
  { id: 'purchases', label: 'Постачальники (631)' },
  { id: 'reports', label: 'Оборотно-сальдова (ОСВ)' },
  { id: 'operations', label: 'Усі проводки Дт/Кт' },
  { id: 'fixed_assets', label: 'Основні засоби (104)' },
  { id: 'payroll', label: 'Зарплата (661)' },
  { id: 'dictionaries', label: 'План рахунків і довідники' },
  { id: 'admin', label: 'Адміністрування та звіт' }
];

const CHART_OF_ACCOUNTS = [
  { code: '301', name: 'Готівка в національній валюті (Каса)', type: 'Активний' },
  { code: '311', name: 'Поточні рахунки в національній валюті (Банк)', type: 'Активний' },
  { code: '361', name: 'Розрахунки з вітчизняними покупцями (Дебіторка)', type: 'Активний' },
  { code: '201', name: 'Сировина й матеріали на складі', type: 'Активний' },
  { code: '104', name: 'Машини та поліграфічне обладнання', type: 'Активний' },
  { code: '131', name: 'Знос основних засобів', type: 'Контрактивний' },
  { code: '631', name: 'Розрахунки з вітчизняними постачальниками', type: 'Пасивний' },
  { code: '661', name: 'Розрахунки за виплатами працівникам', type: 'Пасивний' },
  { code: '702', name: 'Дохід від реалізації поліграфічної продукції', type: 'Дохідний' },
  { code: '902', name: 'Собівартість реалізованої продукції (матеріали)', type: 'Витратний' },
  { code: '92', name: 'Адміністративні та загальновиробничі витрати', type: 'Витратний' }
];

const FIXED_ASSETS_LIST = [
  { id: 'FA-01', name: 'ЦДМ Konica Minolta AccurioPress C4080', inv: 'INV-10401', cost: 1450000, wear: 380000, monthlyAmort: 18500, section: 'Цех оперативного друку' },
  { id: 'FA-02', name: 'Офсетна машина Heidelberg Speedmaster SM 52-4', inv: 'INV-10402', cost: 2800000, wear: 920000, monthlyAmort: 29000, section: 'Офсетний цех' },
  { id: 'FA-03', name: 'Гільйотинний різак Polar 78 X', inv: 'INV-10403', cost: 420000, wear: 145000, monthlyAmort: 5200, section: 'Післядрукарська дільниця' },
  { id: 'FA-04', name: 'Термоклейова лінія Horizon BQ-270V', inv: 'INV-10404', cost: 640000, wear: 190000, monthlyAmort: 7800, section: 'Палітурний цех' }
];

const ROLE_BASE_SALARY: Record<UserRole, number> = {
  admin: 42000,
  manager: 28000,
  operator: 25000,
  client: 0
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Директор / Адміністратор',
  manager: 'Менеджер проєктів',
  operator: 'Друкар-технолог',
  client: 'Клієнт'
};

const formatMoney = (n: number) =>
  `${n.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴`;

export const Finance: React.FC = () => {
  const {
    wallets,
    financeEntries,
    orders,
    clients,
    materials,
    users,
    warehouseMovements,
    addFinanceEntry,
    markFinanceEntryPaid,
    deleteFinanceEntry,
    addSystemNotification
  } = useApp();

  const [activePanel, setActivePanel] = useState<BasPanel>('main');
  const [viewMode, setViewMode] = useState<ViewMode>('journal');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');

  // Create Entry Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [entryForm, setEntryForm] = useState<{
    type: 'income' | 'expense' | 'transfer';
    category: string;
    walletId: string;
    sum: number;
    party: string;
    status: 'posted' | 'planned';
    dt: string;
    kt: string;
    description: string;
    document: string;
    dealId: string;
  }>({
    type: 'income',
    category: 'Оплата за замовлення',
    walletId: wallets[0]?.id || 'w-bank-1',
    sum: 15000,
    party: '',
    status: 'posted',
    dt: '311',
    kt: '361',
    description: '',
    document: '',
    dealId: ''
  });

  // Transfer Form in Bank/Cash
  const [transferForm, setTransferForm] = useState({
    fromWalletId: wallets[1]?.id || 'w-cash-1',
    toWalletId: wallets[0]?.id || 'w-bank-1',
    sum: 5000,
    description: 'Інкасація готівки на розрахунковий рахунок'
  });

  // Quick Order Payment Modal
  const [payOrderTargetId, setPayOrderTargetId] = useState<string | null>(null);
  const [payOrderAmount, setPayOrderAmount] = useState<number>(0);
  const [payOrderWalletId, setPayOrderWalletId] = useState<string>(wallets[0]?.id || 'w-bank-1');

  // Export Slide-Over Drawer
  const [showExportDrawer, setShowExportDrawer] = useState(false);
  const [exportFields, setExportFields] = useState({
    id: true,
    date: true,
    document: true,
    type: true,
    category: true,
    party: true,
    wallet: true,
    accounts: true,
    sum: true,
    status: true,
    description: true
  });

  const getClientNameById = (clientId: string) =>
    clients.find(c => c.id === clientId)?.name || 'Клієнт';

  // Live financial aggregates
  const stats = useMemo(() => {
    const bankTotal = wallets.filter(w => w.accountType !== 'cash').reduce((s, w) => s + w.balance, 0);
    const cashTotal = wallets.filter(w => w.accountType === 'cash').reduce((s, w) => s + w.balance, 0);
    const receivables361 = orders.reduce((s, o) => s + Math.max(0, o.finalPrice - (o.prepayment || 0)), 0);
    const warehouse201 = materials.reduce((s, m) => s + m.quantity * getDefaultMaterialPrice(m), 0);

    const postedIncome = financeEntries
      .filter(e => e.type === 'income' && (e.status ?? 'posted') === 'posted')
      .reduce((s, e) => s + e.sum, 0);
    const postedExpense = financeEntries
      .filter(e => e.type === 'expense' && (e.status ?? 'posted') === 'posted')
      .reduce((s, e) => s + e.sum, 0);
    const payables631 = financeEntries
      .filter(e => e.status === 'planned' && (e.kt === '631' || e.dt === '631'))
      .reduce((s, e) => s + e.sum, 0);

    const materialWriteoffCost = warehouseMovements
      .filter(m => m.type === 'writeoff')
      .reduce((s, m) => s + m.totalSum, 0);

    return {
      bankTotal,
      cashTotal,
      receivables361,
      warehouse201,
      postedIncome,
      postedExpense,
      payables631,
      materialWriteoffCost,
      netProfit: postedIncome - postedExpense
    };
  }, [wallets, orders, materials, financeEntries, warehouseMovements]);

  const filteredEntries = useMemo(() => {
    return financeEntries.filter(entry => {
      const entryStatus = entry.status ?? 'posted';
      if (viewMode === 'planned' && entryStatus === 'posted') return false;
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.id.toLowerCase().includes(q) ||
        entry.document.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        entry.party.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.dt.includes(q) ||
        entry.kt.includes(q)
      );
    });
  }, [financeEntries, viewMode, typeFilter, searchQuery]);

  const handleOpenCreateModal = (presetType?: 'income' | 'expense' | 'transfer') => {
    const t = presetType || 'income';
    setEntryForm({
      type: t,
      category: t === 'income' ? 'Оплата за замовлення' : t === 'expense' ? 'Оплата постачальнику' : 'Внутрішній переказ',
      walletId: wallets[0]?.id || 'w-bank-1',
      sum: 10000,
      party: '',
      status: 'posted',
      dt: t === 'income' ? '311' : t === 'expense' ? '92' : '311',
      kt: t === 'income' ? '361' : t === 'expense' ? '311' : '301',
      description: '',
      document: `DOC-${Date.now().toString().slice(-4)}`,
      dealId: ''
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = wallets.find(x => x.id === entryForm.walletId);
    const linkedOrder = orders.find(o => o.id === entryForm.dealId);
    const clientName = linkedOrder ? getClientNameById(linkedOrder.clientId) : '';
    addFinanceEntry({
      date: new Date().toLocaleDateString('uk-UA'),
      type: entryForm.type,
      category: entryForm.category,
      walletId: entryForm.walletId,
      wallet: w?.name || 'Поточний рахунок',
      sum: Number(entryForm.sum) || 0,
      party: entryForm.party.trim() || clientName || 'Контрагент',
      status: entryForm.status,
      dt: entryForm.dt,
      kt: entryForm.kt,
      document: entryForm.document.trim() || `ОП-${Date.now().toString().slice(-4)}`,
      description: entryForm.description.trim() || entryForm.category,
      dealId: linkedOrder?.id
    });
    setShowCreateModal(false);
  };

  const handleBankTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferForm.sum <= 0 || transferForm.fromWalletId === transferForm.toWalletId) return;
    const fromW = wallets.find(w => w.id === transferForm.fromWalletId);
    const toW = wallets.find(w => w.id === transferForm.toWalletId);
    if (!fromW || !toW) return;

    addFinanceEntry({
      date: new Date().toLocaleDateString('uk-UA'),
      type: 'transfer',
      category: 'Внутрішній переказ між рахунками',
      walletId: fromW.id,
      wallet: fromW.name,
      targetWalletId: toW.id,
      sum: transferForm.sum,
      party: toW.name,
      status: 'posted',
      dt: toW.accountType === 'cash' ? '301' : '311',
      kt: fromW.accountType === 'cash' ? '301' : '311',
      document: `ПР-${Date.now().toString().slice(-4)}`,
      description: `${transferForm.description} (${fromW.name} -> ${toW.name})`
    });
    addSystemNotification(`Переказ ${formatMoney(transferForm.sum)}: ${fromW.name} -> ${toW.name}`);
  };

  const handlePayOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(o => o.id === payOrderTargetId);
    if (!order || payOrderAmount <= 0) return;
    const w = wallets.find(x => x.id === payOrderWalletId);
    const clientName = getClientNameById(order.clientId);

    addFinanceEntry({
      date: new Date().toLocaleDateString('uk-UA'),
      type: 'income',
      category: 'Оплата від покупця',
      walletId: w?.id || payOrderWalletId,
      wallet: w?.name || 'Рахунок ФОП',
      sum: payOrderAmount,
      party: clientName,
      status: 'posted',
      dt: w?.accountType === 'cash' ? '301' : '311',
      kt: '361',
      document: `ПКО/БВ-${order.id}`,
      description: `Оплата по замовленню ${order.id}: ${order.name}`,
      dealId: order.id
    });
    setPayOrderTargetId(null);
  };

  const handleRunCsvExport = () => {
    const cols: Array<{ key: keyof typeof exportFields; header: string; getValue: (e: FinanceEntry) => string }> = [
      { key: 'id', header: 'ID', getValue: e => e.id },
      { key: 'date', header: 'Дата', getValue: e => e.date },
      { key: 'document', header: 'Документ', getValue: e => e.document },
      { key: 'type', header: 'Тип', getValue: e => (e.type === 'income' ? 'Надходження' : e.type === 'expense' ? 'Витрата' : 'Переказ') },
      { key: 'category', header: 'Стаття', getValue: e => e.category },
      { key: 'party', header: 'Контрагент', getValue: e => e.party },
      { key: 'wallet', header: 'Рахунок / Каса', getValue: e => e.wallet },
      { key: 'accounts', header: 'Проводка Дт/Кт', getValue: e => `${e.dt} / ${e.kt}` },
      { key: 'sum', header: 'Сума (₴)', getValue: e => e.sum.toFixed(2) },
      { key: 'status', header: 'Статус', getValue: e => ((e.status ?? 'posted') === 'posted' ? 'Проведено' : 'Заплановано') },
      { key: 'description', header: 'Коментар', getValue: e => e.description }
    ];

    const activeCols = cols.filter(c => exportFields[c.key]);
    const headerRow = activeCols.map(c => c.header);
    const dataRows = filteredEntries.map(entry => activeCols.map(c => c.getValue(entry)));
    const csv = '\uFEFF' + [headerRow, ...dataRows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buhgalteriya-reestr-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportDrawer(false);
    addSystemNotification(`Експортовано ${filteredEntries.length} проводок у CSV`);
  };

  // Trial Balance (ОСВ) calculation
  const trialBalance = useMemo(() => {
    return CHART_OF_ACCOUNTS.map(acc => {
      const dtTurnover = financeEntries
        .filter(e => (e.status ?? 'posted') === 'posted' && e.dt === acc.code)
        .reduce((s, e) => s + e.sum, 0);
      const ktTurnover = financeEntries
        .filter(e => (e.status ?? 'posted') === 'posted' && e.kt === acc.code)
        .reduce((s, e) => s + e.sum, 0);

      let endBalance = dtTurnover - ktTurnover;
      if (acc.code === '311') endBalance = stats.bankTotal;
      if (acc.code === '301') endBalance = stats.cashTotal;
      if (acc.code === '361') endBalance = stats.receivables361;
      if (acc.code === '201') endBalance = stats.warehouse201;
      if (acc.code === '631') endBalance = -stats.payables631;

      return {
        ...acc,
        dtTurnover,
        ktTurnover,
        endBalance
      };
    });
  }, [financeEntries, stats]);

  const getPanelIcon = (id: BasPanel) => {
    switch (id) {
      case 'executive': return <TrendingUp size={15} />;
      case 'bank_cash': return <Banknote size={15} />;
      case 'sales': return <ShoppingCart size={15} />;
      case 'purchases': return <PackageCheck size={15} />;
      case 'reports': return <FileSpreadsheet size={15} />;
      case 'fixed_assets': return <Building2 size={15} />;
      case 'payroll': return <Users size={15} />;
      case 'dictionaries': return <BookOpen size={15} />;
      case 'admin': return <Settings size={15} />;
      default: return <Wallet size={15} />;
    }
  };

  const renderLedgerTable = (entries: FinanceEntry[]) => (
    <div className="ios-table-container">
      <table className="ios-table">
        <thead>
          <tr>
            <th>Док / Дата</th>
            <th>Стаття та коментар</th>
            <th>Контрагент</th>
            <th>Рахунок</th>
            <th>Дт / Кт</th>
            <th style={{ textAlign: 'right' }}>Сума</th>
            <th>Статус</th>
            <th style={{ textAlign: 'right' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '26px', color: 'var(--text-medium)' }}>
                Записів за обраними параметрами немає
              </td>
            </tr>
          ) : (
            entries.map(entry => {
              const isIncome = entry.type === 'income';
              const isTransfer = entry.type === 'transfer';
              const statusVal = entry.status ?? 'posted';
              return (
                <tr key={entry.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '12px' }}>{entry.document || entry.id}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>{entry.date}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{entry.category}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-medium)', maxWidth: '240px' }}>{entry.description}</div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{entry.party}</td>
                  <td style={{ fontSize: '12px' }}>{entry.wallet}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
                    {entry.dt} {'->'} {entry.kt}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: isTransfer ? '#2563eb' : isIncome ? '#059669' : '#dc2626'
                    }}
                  >
                    {isIncome ? '+' : isTransfer ? '' : '-'}{formatMoney(entry.sum)}
                  </td>
                  <td>
                    <span
                      className="ios-badge"
                      style={{
                        backgroundColor:
                          statusVal === 'posted' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.15)',
                        color: statusVal === 'posted' ? '#059669' : '#d97706'
                      }}
                    >
                      {statusVal === 'posted' ? 'Проведено' : 'Заплановано'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      {statusVal !== 'posted' && (
                        <button
                          className="ios-btn ios-btn-primary ios-btn-small"
                          title="Провести операцію та оновити залишок рахунку"
                          onClick={() => markFinanceEntryPaid(entry.id)}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      <button
                        className="ios-btn ios-btn-secondary ios-btn-small"
                        title="Видалити запис"
                        onClick={() => deleteFinanceEntry(entry.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="main-content" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div className="header-title-container" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Бухгалтерія та Фінанси (BAS)</h1>
          <p className="subtitle">
            Реальний рух коштів, дебіторка клієнтів (361), розрахунки з постачальниками (631), каса/банк та ОСВ
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="ios-btn ios-btn-secondary"
            onClick={() => setShowExportDrawer(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} /> Експорт CSV
          </button>
          <button
            className="ios-btn ios-btn-primary"
            onClick={() => handleOpenCreateModal('income')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Створити операцію
          </button>
        </div>
      </div>

      {/* Live KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '18px'
        }}
      >
        <div className="ios-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Безготівка (Рах. 311 / Термінал)</div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', color: '#059669' }}>
            {formatMoney(stats.bankTotal)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '4px' }}>
            {wallets.filter(w => w.accountType !== 'cash').length} активних рахунків
          </div>
        </div>

        <div className="ios-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Готівкова каса (Рах. 301)</div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {formatMoney(stats.cashTotal)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '4px' }}>
            Операційна каса підприємства
          </div>
        </div>

        <div className="ios-card" style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setActivePanel('sales')}>
          <div style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Дебіторка клієнтів (Рах. 361)</div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', color: stats.receivables361 > 0 ? '#d97706' : '#059669' }}>
            {formatMoney(stats.receivables361)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '4px' }}>
            Борг по активних замовленнях
          </div>
        </div>

        <div className="ios-card" style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setActivePanel('purchases')}>
          <div style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Вартість складу (Рах. 201) / Борг (631)</div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--primary)' }}>
            {formatMoney(stats.warehouse201)}
          </div>
          <div style={{ fontSize: '11px', color: stats.payables631 > 0 ? '#dc2626' : 'var(--text-medium)', marginTop: '4px' }}>
            Кредиторка постачальникам: {formatMoney(stats.payables631)}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: '16px', alignItems: 'start' }}>
        <div className="ios-card" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {PANEL_ITEMS.map(item => {
            const active = activePanel === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                style={{
                  border: 'none',
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-dark)',
                  padding: '9px 11px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left'
                }}
              >
                {getPanelIcon(item.id)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ minWidth: 0 }}>
          {/* PANEL: MAIN / OPERATIONS */}
          {(activePanel === 'main' || activePanel === 'operations') && (
            <div className="ios-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'journal', label: 'Усі операції' },
                    { id: 'planned', label: 'Платіжний календар' },
                    { id: 'analytics', label: 'Аналітика статей' }
                  ].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setViewMode(v.id as ViewMode)}
                      className={viewMode === v.id ? 'ios-btn ios-btn-primary ios-btn-small' : 'ios-btn ios-btn-secondary ios-btn-small'}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
                    <input
                      type="text"
                      className="ios-input"
                      placeholder="Пошук по журналу..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: '30px', minWidth: '210px' }}
                    />
                  </div>
                  <select className="ios-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}>
                    <option value="all">Усі типи</option>
                    <option value="income">Тільки доходи (+)</option>
                    <option value="expense">Тільки витрати (-)</option>
                    <option value="transfer">Перекази</option>
                  </select>
                </div>
              </div>

              {viewMode === 'analytics' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#059669' }}>Проведені надходження: {formatMoney(stats.postedIncome)}</h4>
                    {Array.from(new Set(financeEntries.filter(e => e.type === 'income' && (e.status ?? 'posted') === 'posted').map(e => e.category))).map(cat => {
                      const sum = financeEntries
                        .filter(e => e.type === 'income' && (e.status ?? 'posted') === 'posted' && e.category === cat)
                        .reduce((s, e) => s + e.sum, 0);
                      return (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px' }}>
                          <span>{cat}</span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatMoney(sum)}</strong>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Проведені витрати: {formatMoney(stats.postedExpense)}</h4>
                    {Array.from(new Set(financeEntries.filter(e => e.type === 'expense' && (e.status ?? 'posted') === 'posted').map(e => e.category))).map(cat => {
                      const sum = financeEntries
                        .filter(e => e.type === 'expense' && (e.status ?? 'posted') === 'posted' && e.category === cat)
                        .reduce((s, e) => s + e.sum, 0);
                      return (
                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px' }}>
                          <span>{cat}</span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatMoney(sum)}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                renderLedgerTable(filteredEntries)
              )}
            </div>
          )}

          {/* PANEL: EXECUTIVE P&L */}
          {activePanel === 'executive' && (
            <div className="ios-card" style={{ padding: '18px' }}>
              <h3 style={{ margin: '0 0 14px 0' }}>Управлінський звіт про прибутки та збитки (P&L)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Загальний оборот замовлень</div>
                  <div style={{ fontSize: '19px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {formatMoney(orders.reduce((s, o) => s + o.finalPrice, 0))}
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Списано матеріалів (Собівартість)</div>
                  <div style={{ fontSize: '19px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#d97706' }}>
                    {formatMoney(stats.materialWriteoffCost)}
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Грошовий чистий результат (Cashflow)</div>
                  <div style={{ fontSize: '19px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: stats.netProfit >= 0 ? '#059669' : '#dc2626' }}>
                    {formatMoney(stats.netProfit)}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-medium)' }}>
                Касовий метод рахує реальні сплачені кошти ({formatMoney(stats.postedIncome)} дохід мінус {formatMoney(stats.postedExpense)} витрати), а складський модуль автоматично підтягує собівартість списаного паперу та матеріалів ({formatMoney(stats.materialWriteoffCost)}).
              </div>
            </div>
          )}

          {/* PANEL: BANK & CASH */}
          {activePanel === 'bank_cash' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {wallets.map(w => (
                  <div key={w.id} className="ios-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-medium)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {w.accountType === 'cash' ? `Каса (Субрахунок ${w.code})` : w.accountType === 'pos' ? `Еквайринг (${w.code})` : `Банк (${w.code})`}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>{w.name}</div>
                    <div style={{ fontSize: '21px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '10px', color: 'var(--primary)' }}>
                      {formatMoney(w.balance)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="ios-card" style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowRightLeft size={18} color="var(--primary)" /> Переказ між рахунками / Інкасація каси
                </h3>
                <form onSubmit={handleBankTransfer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'end' }}>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Звідки списати</label>
                    <select className="ios-input" value={transferForm.fromWalletId} onChange={e => setTransferForm(p => ({ ...p, fromWalletId: e.target.value }))}>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Куди зарахувати</label>
                    <select className="ios-input" value={transferForm.toWalletId} onChange={e => setTransferForm(p => ({ ...p, toWalletId: e.target.value }))}>
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Сума (₴)</label>
                    <input type="number" min={1} className="ios-input" value={transferForm.sum} onChange={e => setTransferForm(p => ({ ...p, sum: Number(e.target.value) }))} />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Призначення платежу</label>
                    <input type="text" className="ios-input" value={transferForm.description} onChange={e => setTransferForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <button type="submit" className="ios-btn ios-btn-primary">Провести переказ</button>
                </form>
              </div>
            </div>
          )}

          {/* PANEL: SALES (361) */}
          {activePanel === 'sales' && (
            <div className="ios-card" style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Розрахунки з покупцями (Рах. 361 — Дебіторська заборгованість)</h3>
              <div className="ios-table-container">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th>Замовлення</th>
                      <th>Клієнт</th>
                      <th style={{ textAlign: 'right' }}>Сума угоди</th>
                      <th style={{ textAlign: 'right' }}>Оплачено</th>
                      <th style={{ textAlign: 'right' }}>Борг (361)</th>
                      <th>Кредитний ліміт</th>
                      <th style={{ textAlign: 'right' }}>Прийом оплати</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const paid = order.prepayment || 0;
                      const debt = Math.max(0, order.finalPrice - paid);
                      const client = clients.find(c => c.id === order.clientId);
                      const creditLimit = client?.creditLimit;
                      const overLimit = typeof creditLimit === 'number' && debt > creditLimit;
                      return (
                        <tr key={order.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{order.id}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>{order.name}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{client?.name || 'Клієнт'}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatMoney(order.finalPrice)}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#059669' }}>{formatMoney(paid)}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: debt > 0 ? '#dc2626' : '#059669' }}>
                            {formatMoney(debt)}
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {creditLimit ? (
                              <span style={{ color: overLimit ? '#dc2626' : 'var(--text-medium)', fontWeight: overLimit ? 700 : 400, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                {overLimit && <AlertCircle size={13} />}
                                {formatMoney(creditLimit)} ({client?.paymentTermsDays || 14} дн.)
                              </span>
                            ) : (
                              'Передоплата'
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {debt > 0 ? (
                              <button
                                className="ios-btn ios-btn-primary ios-btn-small"
                                onClick={() => {
                                  setPayOrderTargetId(order.id);
                                  setPayOrderAmount(debt);
                                }}
                              >
                                Прийняти оплату
                              </button>
                            ) : (
                              <span className="ios-badge" style={{ backgroundColor: 'rgba(16,185,129,0.14)', color: '#059669' }}>
                                Оплачено 100%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PANEL: PURCHASES (631) */}
          {activePanel === 'purchases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="ios-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Розрахунки з постачальниками (Рах. 631)</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                      Рахунки від постачальників паперу, фарби та накладні зі Складу
                    </div>
                  </div>
                  <button className="ios-btn ios-btn-secondary ios-btn-small" onClick={() => handleOpenCreateModal('expense')}>
                    + Зареєструвати рахунок постачальника
                  </button>
                </div>
                {renderLedgerTable(financeEntries.filter(e => e.kt === '631' || e.dt === '631' || e.dt === '201'))}
              </div>
            </div>
          )}

          {/* PANEL: TRIAL BALANCE (OSV) */}
          {activePanel === 'reports' && (
            <div className="ios-card" style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Оборотно-сальдова відомість (ОСВ) за рахунками ПСБО</h3>
              <div className="ios-table-container">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th>Рахунок</th>
                      <th>Найменування рахунку</th>
                      <th>Тип</th>
                      <th style={{ textAlign: 'right' }}>Обороти Дт</th>
                      <th style={{ textAlign: 'right' }}>Обороти Кт</th>
                      <th style={{ textAlign: 'right' }}>Поточне сальдо</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialBalance.map(row => (
                      <tr key={row.code}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row.code}</td>
                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-medium)' }}>{row.type}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatMoney(row.dtTurnover)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatMoney(row.ktTurnover)}</td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: row.endBalance >= 0 ? '#059669' : '#dc2626'
                          }}
                        >
                          {formatMoney(row.endBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PANEL: FIXED ASSETS */}
          {activePanel === 'fixed_assets' && (
            <div className="ios-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Основні засоби та амортизація обладнання (Рах. 104 / 131)</h3>
                </div>
                <button
                  className="ios-btn ios-btn-primary ios-btn-small"
                  onClick={() => {
                    const totalAmort = FIXED_ASSETS_LIST.reduce((s, f) => s + f.monthlyAmort, 0);
                    addFinanceEntry({
                      date: new Date().toLocaleDateString('uk-UA'),
                      type: 'expense',
                      category: 'Амортизація обладнання',
                      walletId: wallets[0]?.id || 'w-bank-1',
                      wallet: 'Внутрішній розрахунок',
                      sum: totalAmort,
                      party: 'Поліграфічний цех',
                      status: 'posted',
                      dt: '92',
                      kt: '131',
                      document: `АМ-${Date.now().toString().slice(-4)}`,
                      description: `Щомісячна амортизація парку друкарських машин (${FIXED_ASSETS_LIST.length} од.)`
                    });
                  }}
                >
                  Нарахувати місячну амортизацію
                </button>
              </div>
              <div className="ios-table-container">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th>Інв. №</th>
                      <th>Обладнання</th>
                      <th>Дільниця</th>
                      <th style={{ textAlign: 'right' }}>Первісна вартість</th>
                      <th style={{ textAlign: 'right' }}>Накопичений знос</th>
                      <th style={{ textAlign: 'right' }}>Залишкова вартість</th>
                      <th style={{ textAlign: 'right' }}>Амортизація / міс.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIXED_ASSETS_LIST.map(fa => (
                      <tr key={fa.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fa.inv}</td>
                        <td style={{ fontWeight: 600 }}>{fa.name}</td>
                        <td style={{ fontSize: '12px' }}>{fa.section}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatMoney(fa.cost)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#d97706' }}>{formatMoney(fa.wear)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>{formatMoney(fa.cost - fa.wear)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatMoney(fa.monthlyAmort)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PANEL: PAYROLL */}
          {activePanel === 'payroll' && (
            <div className="ios-card" style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Відомість оплати праці працівників (Рах. 661)</h3>
              <div className="ios-table-container">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th>Працівник</th>
                      <th>Посада / Роль</th>
                      <th style={{ textAlign: 'right' }}>Оклад (ставка)</th>
                      <th style={{ textAlign: 'right' }}>Виплати (міс.)</th>
                      <th style={{ textAlign: 'right' }}>Дія</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role !== 'client').map(u => {
                      const base = ROLE_BASE_SALARY[u.role] || 24000;
                      return (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td>{ROLE_LABEL[u.role]}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatMoney(base)}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatMoney(base)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              onClick={() => {
                                const cashWallet = wallets.find(w => w.accountType === 'cash') || wallets[0];
                                addFinanceEntry({
                                  date: new Date().toLocaleDateString('uk-UA'),
                                  type: 'expense',
                                  category: 'Виплата заробітної плати',
                                  walletId: cashWallet?.id || 'w-cash-1',
                                  wallet: cashWallet?.name || 'Каса',
                                  sum: base,
                                  party: u.name,
                                  status: 'posted',
                                  dt: '661',
                                  kt: cashWallet?.accountType === 'cash' ? '301' : '311',
                                  document: `ЗП-${Date.now().toString().slice(-4)}`,
                                  description: `Нарахування та виплата ЗП: ${u.name} (${ROLE_LABEL[u.role]})`
                                });
                              }}
                            >
                              Виплатити ЗП
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PANEL: DICTIONARIES */}
          {activePanel === 'dictionaries' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="ios-card" style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>План рахунків бухгалтерського обліку</h3>
                <div className="ios-table-container">
                  <table className="ios-table">
                    <thead>
                      <tr>
                        <th>Код</th>
                        <th>Назва рахунку</th>
                        <th>Характеристика</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CHART_OF_ACCOUNTS.map(a => (
                        <tr key={a.code}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{a.code}</td>
                          <td>{a.name}</td>
                          <td>{a.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="ios-card" style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Контрагенти та кредитні ліміти</h3>
                <div className="ios-table-container">
                  <table className="ios-table">
                    <thead>
                      <tr>
                        <th>Контрагент</th>
                        <th>Контакт / Телефон</th>
                        <th style={{ textAlign: 'right' }}>Кредитний ліміт</th>
                        <th style={{ textAlign: 'right' }}>Відстрочка (дн.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td style={{ fontSize: '12px', color: 'var(--text-medium)' }}>{c.contact} · {c.phone}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {c.creditLimit ? formatMoney(c.creditLimit) : 'За передоплатою'}
                          </td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{c.paymentTermsDays || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PANEL: ADMIN */}
          {activePanel === 'admin' && (
            <div className="ios-card" style={{ padding: '18px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Адміністрування та вивантаження бухгалтерії</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-medium)', marginBottom: '14px' }}>
                Усі фінансові та складські документи автоматично зберігаються у локальному сховищі браузера та синхронізуються між модулями CRM (Угоди, Склад, Бухгалтерія).
              </p>
              <button className="ios-btn ios-btn-primary" onClick={() => setShowExportDrawer(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Download size={16} /> Налаштувати та вивантажити реєстр CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE OPERATION MODAL */}
      {showCreateModal && (
        <div className="ios-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="ios-modal" style={{ maxWidth: '540px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3 style={{ margin: 0 }}>Нова фінансова операція</h3>
              <button className="ios-btn ios-btn-secondary ios-btn-small" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="ios-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Тип операції</label>
                  <select
                    className="ios-input"
                    value={entryForm.type}
                    onChange={e => {
                      const t = e.target.value as 'income' | 'expense' | 'transfer';
                      setEntryForm(prev => ({
                        ...prev,
                        type: t,
                        dt: t === 'income' ? '311' : t === 'expense' ? '92' : '311',
                        kt: t === 'income' ? '361' : t === 'expense' ? '311' : '301'
                      }));
                    }}
                  >
                    <option value="income">Надходження коштів (+)</option>
                    <option value="expense">Витрата / Оплата постачальнику (-)</option>
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Статус документа</label>
                  <select className="ios-input" value={entryForm.status} onChange={e => setEntryForm(p => ({ ...p, status: e.target.value as 'posted' | 'planned' }))}>
                    <option value="posted">Проведено (оновити баланс)</option>
                    <option value="planned">Заплановано (календар)</option>
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Рахунок / Каса</label>
                  <select className="ios-input" value={entryForm.walletId} onChange={e => setEntryForm(p => ({ ...p, walletId: e.target.value }))}>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({formatMoney(w.balance)})</option>)}
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Сума (₴)</label>
                  <input required type="number" min={0.01} step="0.01" className="ios-input" value={entryForm.sum} onChange={e => setEntryForm(p => ({ ...p, sum: Number(e.target.value) }))} />
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Стаття руху коштів</label>
                  <input required type="text" className="ios-input" value={entryForm.category} onChange={e => setEntryForm(p => ({ ...p, category: e.target.value }))} />
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Контрагент</label>
                  <input type="text" className="ios-input" placeholder="ТОВ або ПІБ" value={entryForm.party} onChange={e => setEntryForm(p => ({ ...p, party: e.target.value }))} />
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Дебет (Дт)</label>
                  <select className="ios-input" value={entryForm.dt} onChange={e => setEntryForm(p => ({ ...p, dt: e.target.value }))}>
                    {CHART_OF_ACCOUNTS.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label">Кредит (Кт)</label>
                  <select className="ios-input" value={entryForm.kt} onChange={e => setEntryForm(p => ({ ...p, kt: e.target.value }))}>
                    {CHART_OF_ACCOUNTS.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                  </select>
                </div>

                <div className="ios-input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="ios-label">Прив’язати до замовлення (опціонально)</label>
                  <select className="ios-input" value={entryForm.dealId} onChange={e => setEntryForm(p => ({ ...p, dealId: e.target.value }))}>
                    <option value="">Без прив’язки до угоди</option>
                    {orders.map(o => <option key={o.id} value={o.id}>{o.id} — {getClientNameById(o.clientId)} ({o.name})</option>)}
                  </select>
                </div>

                <div className="ios-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                  <label className="ios-label">Призначення / Коментар</label>
                  <input type="text" className="ios-input" value={entryForm.description} onChange={e => setEntryForm(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <div className="ios-modal-footer">
                <button type="button" className="ios-btn ios-btn-secondary" onClick={() => setShowCreateModal(false)}>Скасувати</button>
                <button type="submit" className="ios-btn ios-btn-primary">Зберегти операцію</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ORDER PAYMENT MODAL */}
      {payOrderTargetId && (
        <div className="ios-modal-overlay" onClick={() => setPayOrderTargetId(null)}>
          <div className="ios-modal" style={{ maxWidth: '420px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3 style={{ margin: 0 }}>Прийом оплати за замовленням {payOrderTargetId}</h3>
              <button className="ios-btn ios-btn-secondary ios-btn-small" onClick={() => setPayOrderTargetId(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handlePayOrderSubmit}>
              <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Рахунок зарахування</label>
                  <select className="ios-input" value={payOrderWalletId} onChange={e => setPayOrderWalletId(e.target.value)}>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Сума оплати (₴)</label>
                  <input type="number" min={1} step="0.01" className="ios-input" value={payOrderAmount} onChange={e => setPayOrderAmount(Number(e.target.value))} />
                </div>
              </div>
              <div className="ios-modal-footer">
                <button type="button" className="ios-btn ios-btn-secondary" onClick={() => setPayOrderTargetId(null)}>Скасувати</button>
                <button type="submit" className="ios-btn ios-btn-primary">Зарахувати оплату</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT DRAWER MODAL */}
      {showExportDrawer && (
        <div className="ios-modal-overlay" onClick={() => setShowExportDrawer(false)}>
          <div className="ios-modal" style={{ maxWidth: '440px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3 style={{ margin: 0 }}>Експорт журналу операцій у CSV</h3>
              <button className="ios-btn ios-btn-secondary ios-btn-small" onClick={() => setShowExportDrawer(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-medium)', marginBottom: '4px' }}>
                Оберіть колонки для включення у звіт (роздільник «;», кодування UTF-8 для Excel):
              </div>
              {[
                { key: 'id', label: 'ID запису' },
                { key: 'date', label: 'Дата операції' },
                { key: 'document', label: 'Номер документа' },
                { key: 'type', label: 'Тип (Надходження / Витрата / Переказ)' },
                { key: 'category', label: 'Стаття' },
                { key: 'party', label: 'Контрагент' },
                { key: 'wallet', label: 'Рахунок / Каса' },
                { key: 'accounts', label: 'Кореспонденція Дт / Кт' },
                { key: 'sum', label: 'Сума (₴)' },
                { key: 'status', label: 'Статус' },
                { key: 'description', label: 'Коментар' }
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={exportFields[item.key as keyof typeof exportFields]}
                    onChange={e => setExportFields(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <div className="ios-modal-footer">
              <button className="ios-btn ios-btn-secondary" onClick={() => setShowExportDrawer(false)}>Скасувати</button>
              <button className="ios-btn ios-btn-primary" onClick={handleRunCsvExport}>Завантажити CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
