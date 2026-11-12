import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Info,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
  RotateCcw,
  Package,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { useApp, getDefaultMaterialPrice } from '../context/AppContext';
import type { Material, WarehouseMovementType } from '../types';

type TopTab =
  | 'zalyshki'
  | 'vyroby'
  | 'oprybutkuvannya'
  | 'spysannya'
  | 'peremishchennya'
  | 'inventaryzatsii'
  | 'povernennya'
  | 'tovary';

interface AssemblySpec {
  id: string;
  name: string;
  article: string;
  format: string;
  componentsSummary: string;
  baseCost: number;
  unit: string;
}

const ASSEMBLY_SPECS: AssemblySpec[] = [
  {
    id: 'BOM-01',
    name: 'Журнал А4, крейда 115 г/м² (блок + обкл. 250 г/м²)',
    article: 'SPEC-JRN-A4',
    format: '210×297 мм (А4)',
    componentsSummary: 'Крейда глянцева 115 + Крейда 250 + Термоклей EVA + Матова ламінація',
    baseCost: 24.5,
    unit: 'прим.'
  },
  {
    id: 'BOM-02',
    name: 'Книга тверда обкладинка, офсет 80 г/м²',
    article: 'SPEC-BK-HC',
    format: '148×210 мм (А5)',
    componentsSummary: 'Офсетний папір 80 + Палітурний картон 2 мм + Каптал + Ниткошвейне зшивання',
    baseCost: 78.0,
    unit: 'прим.'
  },
  {
    id: 'BOM-03',
    name: 'Каталог скоба А4, 64 стор.',
    article: 'SPEC-CAT-64',
    format: '210×297 мм (А4)',
    componentsSummary: 'Крейда матова 130 + Обкл. Крейда 300 + 2 металеві скоби',
    baseCost: 34.2,
    unit: 'прим.'
  },
  {
    id: 'BOM-04',
    name: 'Пакувальний короб 450×320×250 мм (гофрокартон Т-23)',
    article: 'SPEC-BOX-M',
    format: '450×320×250 мм',
    componentsSummary: 'Пятишаровий гофрокартон + стрічка пакувальна армована',
    baseCost: 28.0,
    unit: 'шт.'
  }
];

const WAREHOUSE_ZONES = [
  'Основний склад',
  'Секція А1-А3 (Листи)',
  'Секція B1-B2 (Блоковий папір)',
  'Секція C1-C3 (Обкладинки та картон)',
  'Секція D1-D2 (Палітурні та витратні)',
  'Цех друку (Оперативний)',
  'Дільниця упаковки'
];

const MATERIAL_TYPE_LABEL: Record<Material['type'], string> = {
  coated: 'Крейдований',
  offset: 'Офсетний / Картон',
  gazetka: 'Газетний / Спец.'
};

const MOVEMENT_LABELS: Record<WarehouseMovementType, { label: string; color: string; bg: string }> = {
  receipt: { label: 'Оприбуткування', color: '#059669', bg: 'rgba(16, 185, 129, 0.12)' },
  writeoff: { label: 'Списання у виробництво', color: '#dc2626', bg: 'rgba(239, 68, 68, 0.12)' },
  relocate: { label: 'Переміщення', color: '#2563eb', bg: 'rgba(59, 130, 246, 0.12)' },
  reconciliation: { label: 'Інвентаризація', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
  return: { label: 'Повернення', color: '#d97706', bg: 'rgba(245, 158, 11, 0.14)' },
  reserve: { label: 'Резерв під замовлення', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' },
  release: { label: 'Зняття резерву', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)' }
};

const formatMoney = (n: number) =>
  `${n.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴`;

export const Warehouse: React.FC = () => {
  const {
    materials,
    orders,
    clients,
    wallets,
    warehouseMovements,
    addMaterial,
    recordWarehouseMovement,
    reconcileWarehouseStock,
    addSystemNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<TopTab>('zalyshki');
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Material['type']>('all');
  const [presetFilter, setPresetFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'reserved'>('all');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detail modal
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);

  // Add material modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMatForm, setNewMatForm] = useState<{
    name: string;
    type: Material['type'];
    quantity: number;
    minStock: number;
    price: number;
    location: string;
    supplier: string;
    unit: string;
  }>({
    name: '',
    type: 'coated',
    quantity: 5000,
    minStock: 1000,
    price: 0.65,
    location: 'Основний склад',
    supplier: 'ПапірТрейд',
    unit: 'листів'
  });

  // Multi-receipt modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptForm, setReceiptForm] = useState({
    warehouse: 'Основний склад',
    supplier: 'ПапірТрейд',
    docNote: '',
    createFinanceRecord: true,
    financePaidImmediately: false,
    walletId: wallets[0]?.id || 'w-bank-1',
    items: [{ materialId: materials[0]?.id || '1', quantity: 5000, unitPrice: getDefaultMaterialPrice(materials[0]) }]
  });

  // Relocate modal
  const [relocateTarget, setRelocateTarget] = useState<Material | null>(null);
  const [relocateQty, setRelocateQty] = useState(500);
  const [relocateTo, setRelocateTo] = useState('Цех друку (Оперативний)');
  const [relocateReason, setRelocateReason] = useState('Передача матеріалу у виробничий цех');

  // Inline write-off form (in Spysannya tab)
  const [writeoffForm, setWriteoffForm] = useState({
    materialId: materials[0]?.id || '1',
    quantity: 500,
    dealId: '',
    reason: 'Витрата паперу на приладку та тираж'
  });

  // Inline relocation form (in Peremishchennya tab)
  const [inlineRelocateForm, setInlineRelocateForm] = useState({
    materialId: materials[0]?.id || '1',
    quantity: 500,
    warehouseTo: 'Цех друку (Оперативний)',
    reason: 'Внутрішнє переміщення по складу'
  });

  // Return form (in Povernennya tab)
  const [returnForm, setReturnForm] = useState({
    mode: 'from_production' as 'from_production' | 'to_supplier',
    materialId: materials[0]?.id || '1',
    quantity: 250,
    party: 'Цех друку №1',
    reason: 'Повернення невикористаних листів після замовлення'
  });

  // Stock reconciliation editable counts (map materialId -> string value)
  const [countsMap, setCountsMap] = useState<Record<string, string>>({});
  const [reconcileReason, setReconcileReason] = useState('Планова інвентаризація складу');

  const getMinStock = (m: Material) => m.minStock ?? 500;
  const getLocation = (m: Material) => m.location || 'Основний склад';
  const getSupplier = (m: Material) => m.supplier || 'ПапірТрейд';

  // KPIs
  const kpis = useMemo(() => {
    const totalValuation = materials.reduce((sum, m) => sum + m.quantity * getDefaultMaterialPrice(m), 0);
    const totalReservedValue = materials.reduce((sum, m) => sum + m.reserved * getDefaultMaterialPrice(m), 0);
    const lowStockCount = materials.filter(m => m.quantity - m.reserved <= getMinStock(m)).length;
    const movementsCount = warehouseMovements.length;
    return { totalValuation, totalReservedValue, lowStockCount, movementsCount };
  }, [materials, warehouseMovements]);

  const warehousesList = useMemo(() => {
    const set = new Set<string>(WAREHOUSE_ZONES);
    materials.forEach(m => { if (m.location) set.add(m.location); });
    return Array.from(set);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const q = searchQuery.toLowerCase();
      const loc = getLocation(m);
      const sup = getSupplier(m);
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        sup.toLowerCase().includes(q) ||
        loc.toLowerCase().includes(q) ||
        MATERIAL_TYPE_LABEL[m.type].toLowerCase().includes(q);
      const matchWh = warehouseFilter === 'all' || loc === warehouseFilter;
      const matchType = typeFilter === 'all' || m.type === typeFilter;
      const free = m.quantity - m.reserved;
      let matchPreset = true;
      if (presetFilter === 'in_stock') matchPreset = free > 0;
      else if (presetFilter === 'low_stock') matchPreset = free <= getMinStock(m);
      else if (presetFilter === 'reserved') matchPreset = m.reserved > 0;
      return matchSearch && matchWh && matchType && matchPreset;
    });
  }, [materials, searchQuery, warehouseFilter, typeFilter, presetFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMaterials = filteredMaterials.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const visibleIds = paginatedMaterials.map(m => m.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleExportCsv = () => {
    const header = ['Код', 'Назва матеріалу', 'Група', 'Склад / Секція', 'Факт', 'Резерв', 'Доступно', 'Мін. поріг', 'Од.', 'Ціна ₴', 'Вартість ₴', 'Постачальник'];
    const rows = filteredMaterials.map(m => {
      const price = getDefaultMaterialPrice(m);
      const free = m.quantity - m.reserved;
      return [
        `MAT-${m.id.padStart(3, '0')}`,
        m.name,
        MATERIAL_TYPE_LABEL[m.type],
        getLocation(m),
        String(m.quantity),
        String(m.reserved),
        String(free),
        String(getMinStock(m)),
        m.unit,
        price.toFixed(2),
        (m.quantity * price).toFixed(2),
        getSupplier(m)
      ];
    });
    const csv = '\uFEFF' + [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sklad-zalyshky-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addSystemNotification('Експорт складу виконано у CSV');
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatForm.name.trim()) return;
    addMaterial({
      name: newMatForm.name.trim(),
      type: newMatForm.type,
      quantity: newMatForm.quantity,
      reserved: 0,
      unit: newMatForm.unit,
      price: newMatForm.price,
      supplier: newMatForm.supplier,
      minStock: newMatForm.minStock,
      location: newMatForm.location
    });
    setShowAddModal(false);
    setNewMatForm({
      name: '',
      type: 'coated',
      quantity: 5000,
      minStock: 1000,
      price: 0.65,
      location: 'Основний склад',
      supplier: 'ПапірТрейд',
      unit: 'листів'
    });
  };

  const handleMultiReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = receiptForm.items.filter(it => it.materialId && it.quantity > 0);
    if (validItems.length === 0) return;

    validItems.forEach(item => {
      recordWarehouseMovement({
        type: 'receipt',
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        warehouseTo: receiptForm.warehouse,
        party: receiptForm.supplier,
        reason: receiptForm.docNote.trim() || `Надходження від ${receiptForm.supplier}`,
        createFinanceRecord: receiptForm.createFinanceRecord,
        financePaidImmediately: receiptForm.financePaidImmediately,
        walletId: receiptForm.walletId
      });
    });

    setShowReceiptModal(false);
    setReceiptForm({
      warehouse: 'Основний склад',
      supplier: 'ПапірТрейд',
      docNote: '',
      createFinanceRecord: true,
      financePaidImmediately: false,
      walletId: wallets[0]?.id || 'w-bank-1',
      items: [{ materialId: materials[0]?.id || '1', quantity: 5000, unitPrice: getDefaultMaterialPrice(materials[0]) }]
    });
  };

  const handleRelocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relocateTarget || relocateQty <= 0) return;
    recordWarehouseMovement({
      type: 'relocate',
      materialId: relocateTarget.id,
      quantity: relocateQty,
      warehouseFrom: getLocation(relocateTarget),
      warehouseTo: relocateTo,
      reason: relocateReason
    });
    setRelocateTarget(null);
  };

  const handleInlineWriteoff = (e: React.FormEvent) => {
    e.preventDefault();
    const linkedOrder = orders.find(o => o.id === writeoffForm.dealId);
    recordWarehouseMovement({
      type: 'writeoff',
      materialId: writeoffForm.materialId,
      quantity: writeoffForm.quantity,
      dealId: linkedOrder?.id,
      dealName: linkedOrder ? `${linkedOrder.id} — ${linkedOrder.name}` : undefined,
      reason: writeoffForm.reason
    });
    setWriteoffForm(prev => ({ ...prev, quantity: 500 }));
  };

  const handleInlineRelocate = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = materials.find(m => m.id === inlineRelocateForm.materialId);
    if (!mat) return;
    recordWarehouseMovement({
      type: 'relocate',
      materialId: inlineRelocateForm.materialId,
      quantity: inlineRelocateForm.quantity,
      warehouseFrom: getLocation(mat),
      warehouseTo: inlineRelocateForm.warehouseTo,
      reason: inlineRelocateForm.reason
    });
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = materials.find(m => m.id === returnForm.materialId);
    if (!mat || returnForm.quantity <= 0) return;
    if (returnForm.mode === 'from_production') {
      recordWarehouseMovement({
        type: 'return',
        materialId: returnForm.materialId,
        quantity: returnForm.quantity,
        warehouseTo: getLocation(mat),
        party: returnForm.party || 'Виробництво',
        reason: `Повернення на склад з виробництва: ${returnForm.reason}`
      });
    } else {
      recordWarehouseMovement({
        type: 'writeoff',
        materialId: returnForm.materialId,
        quantity: returnForm.quantity,
        party: returnForm.party || getSupplier(mat),
        reason: `Повернення браку постачальнику (${returnForm.party || getSupplier(mat)}): ${returnForm.reason}`
      });
    }
  };

  const handleSaveReconciliation = () => {
    const items = Object.entries(countsMap)
      .filter(([, val]) => val !== '' && !Number.isNaN(Number(val)))
      .map(([materialId, val]) => ({
        materialId,
        actualQty: Math.max(0, Number(val)),
        reason: reconcileReason
      }));
    if (items.length === 0) return;
    reconcileWarehouseStock(items);
    setCountsMap({});
  };

  const topTabs: Array<{ id: TopTab; label: string; count?: number }> = [
    { id: 'zalyshki', label: 'Залишки', count: materials.length },
    { id: 'oprybutkuvannya', label: 'Оприбуткування', count: warehouseMovements.filter(m => m.type === 'receipt').length },
    { id: 'spysannya', label: 'Списання', count: warehouseMovements.filter(m => m.type === 'writeoff').length },
    { id: 'peremishchennya', label: 'Переміщення', count: warehouseMovements.filter(m => m.type === 'relocate').length },
    { id: 'inventaryzatsii', label: 'Інвентаризації', count: warehouseMovements.filter(m => m.type === 'reconciliation').length },
    { id: 'povernennya', label: 'Потреби та повернення', count: kpis.lowStockCount },
    { id: 'vyroby', label: 'Специфікації (BOM)', count: ASSEMBLY_SPECS.length },
    { id: 'tovary', label: 'Зони зберігання' }
  ];

  const receiptTotalPreview = receiptForm.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);

  const renderMovementTable = (filterType?: WarehouseMovementType) => {
    const list = filterType
      ? warehouseMovements.filter(m => m.type === filterType)
      : warehouseMovements;
    const searched = list.filter(m => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.materialName.toLowerCase().includes(q) ||
        (m.party && m.party.toLowerCase().includes(q)) ||
        (m.dealName && m.dealName.toLowerCase().includes(q)) ||
        (m.reason && m.reason.toLowerCase().includes(q))
      );
    });

    return (
      <div className="ios-table-container">
        <table className="ios-table">
          <thead>
            <tr>
              <th>Дата / Док</th>
              <th>Тип операції</th>
              <th>Матеріал</th>
              <th style={{ textAlign: 'right' }}>Зміна / К-ть</th>
              <th style={{ textAlign: 'right' }}>Сума</th>
              <th>Контрагент / Угода / Секція</th>
              <th>Коментар</th>
              <th>Відповідальний</th>
            </tr>
          </thead>
          <tbody>
            {searched.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-medium)' }}>
                  Немає записів за обраним фільтром
                </td>
              </tr>
            ) : (
              searched.map(mov => {
                const badge = MOVEMENT_LABELS[mov.type] || MOVEMENT_LABELS.receipt;
                const displayDelta = mov.quantityChange !== 0 ? mov.quantityChange : mov.quantity;
                const isNegative = mov.quantityChange < 0 || mov.type === 'writeoff';
                return (
                  <tr key={mov.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{mov.id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>{mov.date}</div>
                    </td>
                    <td>
                      <span
                        className="ios-badge"
                        style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 600 }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{mov.materialName}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: isNegative ? '#dc2626' : '#059669'
                      }}
                    >
                      {displayDelta > 0 ? `+${displayDelta.toLocaleString('uk-UA')}` : displayDelta.toLocaleString('uk-UA')} {mov.unit}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {formatMoney(mov.totalSum)}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {mov.dealName && <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{mov.dealName}</div>}
                      {mov.party && <div>{mov.party}</div>}
                      {(mov.warehouseFrom || mov.warehouseTo) && (
                        <div style={{ color: 'var(--text-medium)' }}>
                          {mov.warehouseFrom ? `${mov.warehouseFrom} -> ` : ''}
                          {mov.warehouseTo || ''}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-medium)', maxWidth: '240px' }}>{mov.reason}</td>
                    <td style={{ fontSize: '12px' }}>{mov.employee}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="main-content" style={{ paddingBottom: '40px' }}>
      <div className="header-title-container" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Складський облік та ТМЦ
          </h1>
          <p className="subtitle">
            Оцінка залишків, облік резервів під замовлення, рух матеріалів, списання та інвентаризація
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="ios-btn ios-btn-secondary"
            onClick={() => setShowReceiptModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowDownToLine size={16} /> Оприбуткувати партію
          </button>
          <button
            className="ios-btn ios-btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Нова номенклатура
          </button>
          <button
            className="ios-btn ios-btn-secondary"
            onClick={handleExportCsv}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} /> Експорт CSV
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '18px'
        }}
      >
        <div className="ios-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Вартість складу (Рах. 201)</span>
            <Wallet size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {formatMoney(kpis.totalValuation)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '4px' }}>
            {materials.length} позицій у номенклатурі
          </div>
        </div>

        <div className="ios-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Вартість у резерві</span>
            <Package size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
            {formatMoney(kpis.totalReservedValue)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '4px' }}>
            Заблоковано під активні тиражі
          </div>
        </div>

        <div
          className="ios-card"
          style={{ padding: '14px 16px', cursor: 'pointer' }}
          onClick={() => setActiveTab('povernennya')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Позицій у дефіциті</span>
            <AlertTriangle size={16} color={kpis.lowStockCount > 0 ? '#dc2626' : '#059669'} />
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: kpis.lowStockCount > 0 ? '#dc2626' : '#059669'
            }}
          >
            {kpis.lowStockCount} поз.
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '4px' }}>
            Натисніть для перегляду заявок постачальникам
          </div>
        </div>

        <div className="ios-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Журнал руху ТМЦ</span>
            <ClipboardCheck size={16} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {kpis.movementsCount} док.
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '4px' }}>
            Повна історія приходу, витрат і звірок
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div
        className="ios-card"
        style={{
          padding: '6px',
          marginBottom: '16px',
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          flexWrap: 'wrap'
        }}
      >
        {topTabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-dark)',
                padding: '8px 13px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: active ? 'rgba(255,255,255,0.22)' : 'var(--bg-card-subtle)',
                    color: active ? '#fff' : 'var(--text-medium)'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ZALYSHKI */}
      {activeTab === 'zalyshki' && (
        <div className="ios-card" style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }}
                />
                <input
                  type="text"
                  className="ios-input"
                  placeholder="Пошук за назвою, групою або постачальником..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ paddingLeft: '32px', width: '100%' }}
                />
              </div>

              <select
                className="ios-input"
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value as 'all' | Material['type']); setCurrentPage(1); }}
                style={{ minWidth: '160px' }}
              >
                <option value="all">Всі групи матеріалів</option>
                <option value="coated">Крейдований</option>
                <option value="offset">Офсетний / Картон</option>
                <option value="gazetka">Газетний / Спец.</option>
              </select>

              <select
                className="ios-input"
                value={warehouseFilter}
                onChange={e => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
                style={{ minWidth: '170px' }}
              >
                <option value="all">Всі склади / зони</option>
                {warehousesList.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Усі' },
                { id: 'in_stock', label: 'В наявності' },
                { id: 'reserved', label: 'З резервом' },
                { id: 'low_stock', label: 'Дефіцит' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPresetFilter(p.id as typeof presetFilter); setCurrentPage(1); }}
                  className={presetFilter === p.id ? 'ios-btn ios-btn-primary ios-btn-small' : 'ios-btn ios-btn-secondary ios-btn-small'}
                >
                  {p.label}
                </button>
              ))}
              <button
                className="ios-btn ios-btn-secondary ios-btn-small"
                title="Скинути фільтри"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setWarehouseFilter('all');
                  setPresetFilter('all');
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="ios-table-container">
            <table className="ios-table">
              <thead>
                <tr>
                  <th style={{ width: '36px' }}>
                    <input
                      type="checkbox"
                      checked={paginatedMaterials.length > 0 && paginatedMaterials.every(m => selectedIds.includes(m.id))}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Код / Матеріал</th>
                  <th>Секція</th>
                  <th style={{ textAlign: 'right' }}>Факт</th>
                  <th style={{ textAlign: 'right' }}>Резерв</th>
                  <th style={{ textAlign: 'right' }}>Доступно</th>
                  <th style={{ textAlign: 'right' }}>Ціна за од.</th>
                  <th style={{ textAlign: 'right' }}>Сума (₴)</th>
                  <th style={{ textAlign: 'right' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-medium)' }}>
                      Матеріалів за заданим фільтром не знайдено
                    </td>
                  </tr>
                ) : (
                  paginatedMaterials.map(m => {
                    const free = m.quantity - m.reserved;
                    const minStock = getMinStock(m);
                    const isLow = free <= minStock;
                    const price = getDefaultMaterialPrice(m);
                    const totalVal = m.quantity * price;
                    return (
                      <tr key={m.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(m.id)}
                            onChange={() => toggleSelect(m.id)}
                          />
                        </td>
                        <td>
                          <div
                            onClick={() => setDetailMaterial(m)}
                            style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }}
                          >
                            {m.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>
                            MAT-{m.id.padStart(3, '0')} · {MATERIAL_TYPE_LABEL[m.type]} · {getSupplier(m)}
                          </div>
                        </td>
                        <td style={{ fontSize: '12px' }}>{getLocation(m)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {m.quantity.toLocaleString('uk-UA')} {m.unit}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: m.reserved > 0 ? '#0284c7' : 'var(--text-medium)' }}>
                          {m.reserved.toLocaleString('uk-UA')}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isLow ? '#dc2626' : '#059669' }}>
                          {free.toLocaleString('uk-UA')}
                          {isLow && (
                            <div style={{ fontSize: '10px', fontWeight: 600, color: '#dc2626' }}>
                              Мін: {minStock.toLocaleString('uk-UA')}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {price.toFixed(2)} ₴
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {formatMoney(totalVal)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              title="Картка та історія руху"
                              onClick={() => setDetailMaterial(m)}
                            >
                              <Info size={14} />
                            </button>
                            <button
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              title="Перемістити"
                              onClick={() => {
                                setRelocateTarget(m);
                                setRelocateQty(Math.min(500, Math.max(1, m.quantity)));
                                setRelocateTo(getLocation(m) === 'Основний склад' ? 'Цех друку (Оперативний)' : 'Основний склад');
                              }}
                            >
                              <ArrowLeftRight size={14} />
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
              Показано {paginatedMaterials.length} з {filteredMaterials.length} позицій
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                className="ios-input"
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                <option value={10}>10 / стор.</option>
                <option value={20}>20 / стор.</option>
                <option value={50}>50 / стор.</option>
              </select>
              <button className="ios-btn ios-btn-secondary ios-btn-small" disabled={safePage <= 1} onClick={() => setCurrentPage(1)}>
                <ChevronsLeft size={14} />
              </button>
              <button className="ios-btn ios-btn-secondary ios-btn-small" disabled={safePage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '12px', padding: '0 6px' }}>
                {safePage} / {totalPages}
              </span>
              <button className="ios-btn ios-btn-secondary ios-btn-small" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight size={14} />
              </button>
              <button className="ios-btn ios-btn-secondary ios-btn-small" disabled={safePage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPRYBUTKUVANNYA */}
      {activeTab === 'oprybutkuvannya' && (
        <div className="ios-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Журнал оприбуткувань від постачальників</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                Кожне надходження оновлює склад і за потреби формує проводку Дт 201 — Кт 631 у Бухгалтерії
              </div>
            </div>
            <button className="ios-btn ios-btn-primary" onClick={() => setShowReceiptModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Оприбуткувати прихід
            </button>
          </div>
          {renderMovementTable('receipt')}
        </div>
      )}

      {/* TAB 3: SPYSANNYA */}
      {activeTab === 'spysannya' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ios-card" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpFromLine size={18} color="#dc2626" /> Оформити списання матеріалу (під замовлення або технологічний брак)
            </h3>
            <form onSubmit={handleInlineWriteoff} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Матеріал</label>
                <select
                  className="ios-input"
                  value={writeoffForm.materialId}
                  onChange={e => setWriteoffForm(prev => ({ ...prev, materialId: e.target.value }))}
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Залишок: {m.quantity} {m.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Кількість</label>
                <input
                  type="number"
                  min={1}
                  className="ios-input"
                  value={writeoffForm.quantity}
                  onChange={e => setWriteoffForm(prev => ({ ...prev, quantity: Math.max(1, Number(e.target.value)) }))}
                />
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Прив’язка до угоди (необов’язково)</label>
                <select
                  className="ios-input"
                  value={writeoffForm.dealId}
                  onChange={e => setWriteoffForm(prev => ({ ...prev, dealId: e.target.value }))}
                >
                  <option value="">Загальновиробничі витрати / Приладка</option>
                  {orders.map(o => {
                    const cName = clients.find(c => c.id === o.clientId)?.name || 'Клієнт';
                    return (
                      <option key={o.id} value={o.id}>
                        {o.id} — {o.name} ({cName})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Причина списання</label>
                <input
                  type="text"
                  className="ios-input"
                  value={writeoffForm.reason}
                  onChange={e => setWriteoffForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              <button type="submit" className="ios-btn ios-btn-primary" style={{ backgroundColor: '#dc2626' }}>
                Провести списання
              </button>
            </form>
          </div>

          <div className="ios-card" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Журнал списань у виробництво</h3>
            {renderMovementTable('writeoff')}
          </div>
        </div>
      )}

      {/* TAB 4: PEREMISHCHENNYA */}
      {activeTab === 'peremishchennya' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ios-card" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeftRight size={18} color="#2563eb" /> Внутрішнє переміщення між зонами зберігання
            </h3>
            <form onSubmit={handleInlineRelocate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Матеріал</label>
                <select
                  className="ios-input"
                  value={inlineRelocateForm.materialId}
                  onChange={e => setInlineRelocateForm(prev => ({ ...prev, materialId: e.target.value }))}
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({getLocation(m)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Кількість</label>
                <input
                  type="number"
                  min={1}
                  className="ios-input"
                  value={inlineRelocateForm.quantity}
                  onChange={e => setInlineRelocateForm(prev => ({ ...prev, quantity: Math.max(1, Number(e.target.value)) }))}
                />
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Куди перемістити</label>
                <select
                  className="ios-input"
                  value={inlineRelocateForm.warehouseTo}
                  onChange={e => setInlineRelocateForm(prev => ({ ...prev, warehouseTo: e.target.value }))}
                >
                  {WAREHOUSE_ZONES.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Примітка</label>
                <input
                  type="text"
                  className="ios-input"
                  value={inlineRelocateForm.reason}
                  onChange={e => setInlineRelocateForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              <button type="submit" className="ios-btn ios-btn-primary">
                Перемістити
              </button>
            </form>
          </div>

          <div className="ios-card" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Журнал переміщень</h3>
            {renderMovementTable('relocate')}
          </div>
        </div>
      )}

      {/* TAB 5: INVENTARYZATSII */}
      {activeTab === 'inventaryzatsii' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ios-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Відомість інвентаризації (Звірка фактичних залишків)</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                  Вкажіть фактичний перерахований залишок — система автоматично розрахує надлишок або нестачу в штуках та гривнях і проведе коригування
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="ios-input"
                  placeholder="Акт / Причина інвентаризації"
                  value={reconcileReason}
                  onChange={e => setReconcileReason(e.target.value)}
                  style={{ minWidth: '240px' }}
                />
                <button
                  className="ios-btn ios-btn-primary"
                  disabled={Object.keys(countsMap).length === 0}
                  onClick={handleSaveReconciliation}
                >
                  Провести інвентаризацію
                </button>
              </div>
            </div>

            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th>Матеріал</th>
                    <th>Склад</th>
                    <th style={{ textAlign: 'right' }}>Обліковий залишок</th>
                    <th style={{ textAlign: 'right', width: '160px' }}>Факт (перерахунок)</th>
                    <th style={{ textAlign: 'right' }}>Відхилення (к-ть)</th>
                    <th style={{ textAlign: 'right' }}>Відхилення (₴)</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => {
                    const rawVal = countsMap[m.id];
                    const hasVal = rawVal !== undefined && rawVal !== '';
                    const parsedVal = hasVal ? Number(rawVal) : m.quantity;
                    const diffQty = hasVal ? parsedVal - m.quantity : 0;
                    const price = getDefaultMaterialPrice(m);
                    const diffSum = diffQty * price;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>{MATERIAL_TYPE_LABEL[m.type]} · {price.toFixed(2)} ₴/{m.unit}</div>
                        </td>
                        <td style={{ fontSize: '12px' }}>{getLocation(m)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          {m.quantity.toLocaleString('uk-UA')} {m.unit}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <input
                            type="number"
                            min={0}
                            className="ios-input"
                            placeholder={String(m.quantity)}
                            value={rawVal ?? ''}
                            onChange={e => setCountsMap(prev => ({ ...prev, [m.id]: e.target.value }))}
                            style={{ width: '125px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                          />
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: diffQty === 0 ? 'var(--text-medium)' : diffQty > 0 ? '#059669' : '#dc2626'
                          }}
                        >
                          {diffQty === 0 ? '0' : diffQty > 0 ? `+${diffQty.toLocaleString('uk-UA')}` : diffQty.toLocaleString('uk-UA')} {m.unit}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: diffSum === 0 ? 'var(--text-medium)' : diffSum > 0 ? '#059669' : '#dc2626'
                          }}
                        >
                          {diffSum === 0 ? '0.00 ₴' : `${diffSum > 0 ? '+' : ''}${formatMoney(diffSum)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ios-card" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Архів актів інвентаризації</h3>
            {renderMovementTable('reconciliation')}
          </div>
        </div>
      )}

      {/* TAB 6: POVERNENNYA & MATERIAL REQUESTS */}
      {activeTab === 'povernennya' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ios-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Потреба в закупівлі (позиції нижче критичного мінімуму)</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                  Автоматичний список дозамовлення постачальникам на основі вільного залишку (Факт - Резерв)
                </div>
              </div>
            </div>

            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th>Матеріал</th>
                    <th>Постачальник</th>
                    <th style={{ textAlign: 'right' }}>Доступно (Факт - Резерв)</th>
                    <th style={{ textAlign: 'right' }}>Мін. поріг</th>
                    <th style={{ textAlign: 'right' }}>Рекомендоване замовлення</th>
                    <th style={{ textAlign: 'right' }}>Орієнтовний бюджет</th>
                    <th style={{ textAlign: 'right' }}>Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.filter(m => m.quantity - m.reserved <= getMinStock(m)).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#059669', fontWeight: 600 }}>
                        Усі позиції складу забезпечені вище мінімального порогу.
                      </td>
                    </tr>
                  ) : (
                    materials
                      .filter(m => m.quantity - m.reserved <= getMinStock(m))
                      .map(m => {
                        const free = m.quantity - m.reserved;
                        const minStock = getMinStock(m);
                        const recOrder = Math.max(minStock * 2 - free, minStock);
                        const price = getDefaultMaterialPrice(m);
                        return (
                          <tr key={m.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{m.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>{MATERIAL_TYPE_LABEL[m.type]}</div>
                            </td>
                            <td>{getSupplier(m)}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#dc2626', fontWeight: 700 }}>
                              {free.toLocaleString('uk-UA')} {m.unit}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                              {minStock.toLocaleString('uk-UA')} {m.unit}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                              +{recOrder.toLocaleString('uk-UA')} {m.unit}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                              {formatMoney(recOrder * price)}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="ios-btn ios-btn-primary ios-btn-small"
                                onClick={() => {
                                  setReceiptForm({
                                    warehouse: getLocation(m),
                                    supplier: getSupplier(m),
                                    docNote: `Планове поповнення дефіциту (${m.name})`,
                                    createFinanceRecord: true,
                                    financePaidImmediately: false,
                                    walletId: wallets[0]?.id || 'w-bank-1',
                                    items: [{ materialId: m.id, quantity: recOrder, unitPrice: price }]
                                  });
                                  setShowReceiptModal(true);
                                }}
                              >
                                Оформити прихід
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ios-card" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} color="#d97706" /> Оформити повернення матеріалів
            </h3>
            <form onSubmit={handleReturnSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Тип повернення</label>
                <select
                  className="ios-input"
                  value={returnForm.mode}
                  onChange={e => setReturnForm(prev => ({ ...prev, mode: e.target.value as 'from_production' | 'to_supplier' }))}
                >
                  <option value="from_production">Повернення з цеху на склад (+)</option>
                  <option value="to_supplier">Повернення браку постачальнику (-)</option>
                </select>
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Матеріал</label>
                <select
                  className="ios-input"
                  value={returnForm.materialId}
                  onChange={e => setReturnForm(prev => ({ ...prev, materialId: e.target.value }))}
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.quantity} {m.unit})</option>
                  ))}
                </select>
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Кількість</label>
                <input
                  type="number"
                  min={1}
                  className="ios-input"
                  value={returnForm.quantity}
                  onChange={e => setReturnForm(prev => ({ ...prev, quantity: Math.max(1, Number(e.target.value)) }))}
                />
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Цех / Постачальник</label>
                <input
                  type="text"
                  className="ios-input"
                  value={returnForm.party}
                  onChange={e => setReturnForm(prev => ({ ...prev, party: e.target.value }))}
                />
              </div>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Причина</label>
                <input
                  type="text"
                  className="ios-input"
                  value={returnForm.reason}
                  onChange={e => setReturnForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              <button type="submit" className="ios-btn ios-btn-primary">
                Зафіксувати
              </button>
            </form>
          </div>

          <div className="ios-card" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Історія повернень</h3>
            {renderMovementTable('return')}
          </div>
        </div>
      )}

      {/* TAB 7: VYROBY (BOM Specs) */}
      {activeTab === 'vyroby' && (
        <div className="ios-card" style={{ padding: '16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Виробничі специфікації (BOM) поліграфічних виробів</h3>
          <div className="ios-table-container">
            <table className="ios-table">
              <thead>
                <tr>
                  <th>Артикул</th>
                  <th>Назва виробу</th>
                  <th>Формат</th>
                  <th>Склад матеріалів і процесів</th>
                  <th style={{ textAlign: 'right' }}>Нормативна собівартість</th>
                </tr>
              </thead>
              <tbody>
                {ASSEMBLY_SPECS.map(spec => (
                  <tr key={spec.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{spec.article}</td>
                    <td style={{ fontWeight: 600 }}>{spec.name}</td>
                    <td>{spec.format}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-medium)' }}>{spec.componentsSummary}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {spec.baseCost.toFixed(2)} ₴ / {spec.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: TOVARY (Zones Summary) */}
      {activeTab === 'tovary' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px'
          }}
        >
          {warehousesList.map(zone => {
            const zoneMats = materials.filter(m => getLocation(m) === zone);
            const zoneValue = zoneMats.reduce((s, m) => s + m.quantity * getDefaultMaterialPrice(m), 0);
            const zoneUnits = zoneMats.reduce((s, m) => s + m.quantity, 0);
            return (
              <div key={zone} className="ios-card" style={{ padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{zone}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-medium)', marginBottom: '4px' }}>
                  <span>Позицій:</span>
                  <strong style={{ color: 'var(--text-dark)' }}>{zoneMats.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-medium)', marginBottom: '4px' }}>
                  <span>Загальний обсяг:</span>
                  <strong style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>{zoneUnits.toLocaleString('uk-UA')} од.</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-medium)', marginBottom: '12px' }}>
                  <span>Вартість у зоні:</span>
                  <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{formatMoney(zoneValue)}</strong>
                </div>
                <button
                  className="ios-btn ios-btn-secondary ios-btn-small"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setWarehouseFilter(zone);
                    setActiveTab('zalyshki');
                  }}
                >
                  Показати залишки зони
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MATERIAL DETAIL MODAL */}
      {detailMaterial && (
        <div className="ios-modal-overlay" onClick={() => setDetailMaterial(null)}>
          <div className="ios-modal" style={{ maxWidth: '720px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="ios-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{detailMaterial.name}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                  MAT-{detailMaterial.id.padStart(3, '0')} · {getLocation(detailMaterial)} · {getSupplier(detailMaterial)}
                </div>
              </div>
              <button className="ios-btn ios-btn-secondary ios-btn-small" onClick={() => setDetailMaterial(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>На складі (Факт)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {detailMaterial.quantity.toLocaleString('uk-UA')} {detailMaterial.unit}
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>Резерв</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                    {detailMaterial.reserved.toLocaleString('uk-UA')} {detailMaterial.unit}
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>Вільно</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#059669' }}>
                    {(detailMaterial.quantity - detailMaterial.reserved).toLocaleString('uk-UA')} {detailMaterial.unit}
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-card-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-medium)' }}>Оцінка запасу</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {formatMoney(detailMaterial.quantity * getDefaultMaterialPrice(detailMaterial))}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Історія руху за матеріалом</h4>
                <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '8px' }}>
                  {warehouseMovements.filter(mov => mov.materialId === detailMaterial.id).length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-medium)', padding: '12px' }}>
                      Ще немає зафіксованих документів руху по цій позиції.
                    </div>
                  ) : (
                    warehouseMovements
                      .filter(mov => mov.materialId === detailMaterial.id)
                      .map(mov => {
                        const delta = mov.quantityChange !== 0 ? mov.quantityChange : mov.quantity;
                        return (
                          <div
                            key={mov.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px',
                              borderBottom: '1px solid var(--border-light)',
                              fontSize: '12px'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600 }}>{(MOVEMENT_LABELS[mov.type] || MOVEMENT_LABELS.receipt).label} · {mov.date}</div>
                              <div style={{ color: 'var(--text-medium)' }}>{mov.reason}</div>
                            </div>
                            <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {delta > 0 ? `+${delta}` : delta} {mov.unit}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
            <div className="ios-modal-footer">
              <button
                className="ios-btn ios-btn-secondary"
                onClick={() => {
                  const mat = detailMaterial;
                  setDetailMaterial(null);
                  setReceiptForm({
                    warehouse: getLocation(mat),
                    supplier: getSupplier(mat),
                    docNote: `Поповнення ${mat.name}`,
                    createFinanceRecord: true,
                    financePaidImmediately: false,
                    walletId: wallets[0]?.id || 'w-bank-1',
                    items: [{ materialId: mat.id, quantity: 2000, unitPrice: getDefaultMaterialPrice(mat) }]
                  });
                  setShowReceiptModal(true);
                }}
              >
                Оприбуткувати ще
              </button>
              <button className="ios-btn ios-btn-primary" onClick={() => setDetailMaterial(null)}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW MATERIAL MODAL */}
      {showAddModal && (
        <div className="ios-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ios-modal" style={{ maxWidth: '540px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3 style={{ margin: 0 }}>Додати номенклатурну позицію</h3>
              <button className="ios-btn ios-btn-secondary ios-btn-small" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddMaterialSubmit}>
              <div className="ios-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="ios-label">Назва матеріалу</label>
                  <input
                    required
                    type="text"
                    className="ios-input"
                    placeholder="Наприклад: Крейда матова 150 г/м² SRA3"
                    value={newMatForm.name}
                    onChange={e => setNewMatForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Група</label>
                  <select className="ios-input" value={newMatForm.type} onChange={e => setNewMatForm(prev => ({ ...prev, type: e.target.value as Material['type'] }))}>
                    <option value="coated">Крейдований папір</option>
                    <option value="offset">Офсетний / Картон / Фарба</option>
                    <option value="gazetka">Газетний / Спец. носій</option>
                  </select>
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Одиниця виміру</label>
                  <input type="text" className="ios-input" value={newMatForm.unit} onChange={e => setNewMatForm(prev => ({ ...prev, unit: e.target.value }))} />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Початковий залишок</label>
                  <input type="number" min={0} className="ios-input" value={newMatForm.quantity} onChange={e => setNewMatForm(prev => ({ ...prev, quantity: Number(e.target.value) }))} />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Ціна за од. (₴)</label>
                  <input type="number" min={0} step="0.01" className="ios-input" value={newMatForm.price} onChange={e => setNewMatForm(prev => ({ ...prev, price: Number(e.target.value) }))} />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Критичний мінімум</label>
                  <input type="number" min={0} className="ios-input" value={newMatForm.minStock} onChange={e => setNewMatForm(prev => ({ ...prev, minStock: Number(e.target.value) }))} />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Склад / Секція</label>
                  <select className="ios-input" value={newMatForm.location} onChange={e => setNewMatForm(prev => ({ ...prev, location: e.target.value }))}>
                    {WAREHOUSE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className="ios-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                  <label className="ios-label">Основний постачальник</label>
                  <input type="text" className="ios-input" value={newMatForm.supplier} onChange={e => setNewMatForm(prev => ({ ...prev, supplier: e.target.value }))} />
                </div>
              </div>
              <div className="ios-modal-footer">
                <button type="button" className="ios-btn ios-btn-secondary" onClick={() => setShowAddModal(false)}>Скасувати</button>
                <button type="submit" className="ios-btn ios-btn-primary">Створити позицію</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MULTI-RECEIPT MODAL */}
      {showReceiptModal && (
        <div className="ios-modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="ios-modal" style={{ maxWidth: '680px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3 style={{ margin: 0 }}>Прибуткова накладна (Оприбуткування на склад)</h3>
              <button className="ios-btn ios-btn-secondary ios-btn-small" onClick={() => setShowReceiptModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleMultiReceiptSubmit}>
              <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Постачальник</label>
                    <input
                      required
                      type="text"
                      className="ios-input"
                      value={receiptForm.supplier}
                      onChange={e => setReceiptForm(prev => ({ ...prev, supplier: e.target.value }))}
                    />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Склад отримання</label>
                    <select
                      className="ios-input"
                      value={receiptForm.warehouse}
                      onChange={e => setReceiptForm(prev => ({ ...prev, warehouse: e.target.value }))}
                    >
                      {WAREHOUSE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                </div>

                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Номер накладної / Коментар</label>
                  <input
                    type="text"
                    className="ios-input"
                    placeholder="Наприклад: Видаткова накладна №РН-0412"
                    value={receiptForm.docNote}
                    onChange={e => setReceiptForm(prev => ({ ...prev, docNote: e.target.value }))}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="ios-label" style={{ margin: 0 }}>Позиції накладної</label>
                    <button
                      type="button"
                      className="ios-btn ios-btn-secondary ios-btn-small"
                      onClick={() => {
                        const first = materials[0];
                        setReceiptForm(prev => ({
                          ...prev,
                          items: [...prev.items, { materialId: first?.id || '1', quantity: 1000, unitPrice: getDefaultMaterialPrice(first) }]
                        }));
                      }}
                    >
                      + Додати рядок
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {receiptForm.items.map((row, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                        <select
                          className="ios-input"
                          value={row.materialId}
                          onChange={e => {
                            const mat = materials.find(m => m.id === e.target.value);
                            setReceiptForm(prev => ({
                              ...prev,
                              items: prev.items.map((it, i) =>
                                i === idx ? { ...it, materialId: e.target.value, unitPrice: getDefaultMaterialPrice(mat) } : it
                              )
                            }));
                          }}
                        >
                          {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                        </select>
                        <input
                          type="number"
                          min={1}
                          className="ios-input"
                          placeholder="К-ть"
                          value={row.quantity}
                          onChange={e =>
                            setReceiptForm(prev => ({
                              ...prev,
                              items: prev.items.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it)
                            }))
                          }
                        />
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="ios-input"
                          placeholder="Ціна ₴"
                          value={row.unitPrice}
                          onChange={e =>
                            setReceiptForm(prev => ({
                              ...prev,
                              items: prev.items.map((it, i) => i === idx ? { ...it, unitPrice: Number(e.target.value) } : it)
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="ios-btn ios-btn-secondary ios-btn-small"
                          disabled={receiptForm.items.length <= 1}
                          onClick={() =>
                            setReceiptForm(prev => ({
                              ...prev,
                              items: prev.items.filter((_, i) => i !== idx)
                            }))
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-card-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={receiptForm.createFinanceRecord}
                      onChange={e => setReceiptForm(prev => ({ ...prev, createFinanceRecord: e.target.checked }))}
                    />
                    Створити запис у Бухгалтерії (Рах. 631 — розрахунки з постачальником)
                  </label>
                  {receiptForm.createFinanceRecord && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', paddingLeft: '22px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={receiptForm.financePaidImmediately}
                          onChange={e => setReceiptForm(prev => ({ ...prev, financePaidImmediately: e.target.checked }))}
                        />
                        Оплатити одразу з рахунку (списати залишок)
                      </label>
                      {receiptForm.financePaidImmediately && (
                        <select
                          className="ios-input"
                          value={receiptForm.walletId}
                          onChange={e => setReceiptForm(prev => ({ ...prev, walletId: e.target.value }))}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          {wallets.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({formatMoney(w.balance)})</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '15px' }}>
                  <span>Разом по накладній:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{formatMoney(receiptTotalPreview)}</span>
                </div>
              </div>
              <div className="ios-modal-footer">
                <button type="button" className="ios-btn ios-btn-secondary" onClick={() => setShowReceiptModal(false)}>Скасувати</button>
                <button type="submit" className="ios-btn ios-btn-primary">Оприбуткувати</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELOCATE MODAL */}
      {relocateTarget && (
        <div className="ios-modal-overlay" onClick={() => setRelocateTarget(null)}>
          <div className="ios-modal" style={{ maxWidth: '460px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3 style={{ margin: 0 }}>Перемістити матеріал</h3>
              <button className="ios-btn ios-btn-secondary ios-btn-small" onClick={() => setRelocateTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRelocateSubmit}>
              <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{relocateTarget.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Поточна секція: {getLocation(relocateTarget)}</div>
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Цільовий склад / цех</label>
                  <select className="ios-input" value={relocateTo} onChange={e => setRelocateTo(e.target.value)}>
                    {WAREHOUSE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Кількість ({relocateTarget.unit})</label>
                  <input type="number" min={1} className="ios-input" value={relocateQty} onChange={e => setRelocateQty(Number(e.target.value))} />
                </div>
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Підстава / Коментар</label>
                  <input type="text" className="ios-input" value={relocateReason} onChange={e => setRelocateReason(e.target.value)} />
                </div>
              </div>
              <div className="ios-modal-footer">
                <button type="button" className="ios-btn ios-btn-secondary" onClick={() => setRelocateTarget(null)}>Скасувати</button>
                <button type="submit" className="ios-btn ios-btn-primary">Перемістити</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
