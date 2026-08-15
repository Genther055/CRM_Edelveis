import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  History,
  ArrowLeftRight,
  Copy,
  FolderOpen,
  Search,
  CheckSquare,
  Plus,
  Trash,
  Info,
  Package,
  Sparkles,
  Building
} from 'lucide-react';
import type { Material } from '../types';

export const Warehouse: React.FC = () => {
  const { materials, updateMaterialStock, addMaterial, addSystemNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'zalyshki' | 'vyroby' | 'oprybutkuvannya' | 'spysannya' | 'peremishchennya' | 'inventaryzatsii' | 'povernennya' | 'tovary'>('zalyshki');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'instock' | 'lowstock'>('all');
  const [selectedMaterialForLog, setSelectedMaterialForLog] = useState<Material | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk operation states
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [bulkFolderTarget, setBulkFolderTarget] = useState('Папір');

  // Relocation Form State
  const [showRelocateModal, setShowRelocateModal] = useState(false);
  const [relocateMaterialId, setRelocateMaterialId] = useState(materials[0]?.id || '');
  const [relocateQty, setRelocateQty] = useState(100);
  const [relocateFrom, setRelocateFrom] = useState('Головний склад Вінниця');
  const [relocateTo, setRelocateTo] = useState('Друкарський цех');

  // Multi-receipt Form States
  const [showMultiReceiptModal, setShowMultiReceiptModal] = useState(false);
  const [multiReceiptSupplier, setMultiReceiptSupplier] = useState('ТОВ Папір-Світ');
  const [multiReceiptRows, setMultiReceiptRows] = useState<Array<{ materialId: string; quantity: number; price: number }>>([
    { materialId: materials[0]?.id || '', quantity: 100, price: 0 }
  ]);

  // Add New Material Form State
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatType, setNewMatType] = useState<'offset' | 'gazetka' | 'coated'>('coated');
  const [newMatUnit, setNewMatUnit] = useState('арк.');
  const [newMatQty, setNewMatQty] = useState<number>(1000);
  const [newMatPrice, setNewMatPrice] = useState<number>(0.60);
  const [newMatSupplier, setNewMatSupplier] = useState('ТОВ Папір-Світ');
  const [newMatMinStock, setNewMatMinStock] = useState<number>(500);
  const [newMatLocation, setNewMatLocation] = useState('Стелаж А-1 (Папір)');

  // Sub-Tab Mock Datasets
  const assemblies = [
    { sku: 'V-501', name: 'Меню А4 з двосторонньою ламінацією', components: 'Крейдований папір 130г (3 шт) + Плівка A3 (2 шт)', price: '95 ₴', speed: '10 хв/шт' },
    { sku: 'V-502', name: 'Книга А5 в м\'якій палітурці', components: 'Офсетний папір 70г (20 шт) + Клей (10г) + Картон 300г (1 шт)', price: '180 ₴', speed: '15 хв/шт' },
    { sku: 'V-503', name: 'Візитки 100 шт на 350г папері', components: 'Папір 350г (2 шт) + пластиковий бокс (1 шт)', price: '250 ₴', speed: '5 хв/уп' }
  ];

  const receipts = [
    { date: '2026-07-24', supplier: 'ТОВ Папір-Світ', item: 'Крейдований папір 130г (A1)', qty: '+1,500 шт', total: '1,275 ₴', status: 'Проведено' },
    { date: '2026-07-23', supplier: 'Хімікалії та Тонери Вінниця', item: 'Тонер Canon C-EXV 21', qty: '+5 шт', total: '3,250 ₴', status: 'Проведено' }
  ];

  const getFolderForMaterial = (type?: string) => {
    switch (type) {
      case 'offset':
      case 'gazetka':
      case 'coated':
        return 'Папір';
      default:
        return 'Інші товари';
    }
  };

  const categories = useMemo(() => [
    { name: 'Папір', itemsCount: (materials || []).filter(m => getFolderForMaterial(m?.type) === 'Папір').length, location: 'Головний склад (Стелаж А)', manager: 'Вікторія' },
    { name: 'Фарби та Тонери', itemsCount: (materials || []).filter(m => (m?.name || '').toLowerCase().includes('тонер')).length || 2, location: 'Склад фарб (Шафа Б)', manager: 'Сергій' },
    { name: 'Форми та Майстер-плівки', itemsCount: 1, location: 'Шафа обладнання цеху', manager: 'Іван' },
    { name: 'Палітурні матеріали', itemsCount: (materials || []).filter(m => (m?.name || '').toLowerCase().includes('пружина') || (m?.name || '').toLowerCase().includes('картон')).length || 2, location: 'Зона післядрукарської обробки', manager: 'Іван' }
  ], [materials]);

  // Presets for fast 1-click material creation
  const presets = [
    {
      title: '📄 Крейдований папір 150г',
      name: 'Крейдований папір 150г (A1)',
      type: 'coated' as const,
      unit: 'арк.',
      qty: 3000,
      price: 0.65,
      supplier: 'ТОВ Папір-Світ',
      minStock: 1000,
      location: 'Стелаж А-1 (Папір)'
    },
    {
      title: '📜 Офсетний папір 80г',
      name: 'Офсетний папір 80г (A1)',
      type: 'offset' as const,
      unit: 'арк.',
      qty: 5000,
      price: 0.35,
      supplier: 'ТОВ Друк-Папір',
      minStock: 2000,
      location: 'Стелаж А-3 (Папір)'
    },
    {
      title: '🏷️ Самоклейка Рафлатак',
      name: 'Самоклейка Рафлатак матова (A1)',
      type: 'coated' as const,
      unit: 'арк.',
      qty: 1500,
      price: 1.20,
      supplier: 'Рафлатак Україна',
      minStock: 500,
      location: 'Стелаж Б-1 (Стікери)'
    },
    {
      title: '🖨️ Тонер Canon C-EXV',
      name: 'Тонер Canon C-EXV чорний',
      type: 'coated' as const,
      unit: 'шт.',
      qty: 10,
      price: 850,
      supplier: 'Канон Україна',
      minStock: 3,
      location: 'Шафа В-2 (Тонери)'
    },
    {
      title: '✨ Плівка ламінації 30мкм',
      name: 'Плівка для ламінації матова 30мкм',
      type: 'coated' as const,
      unit: 'рулон',
      qty: 20,
      price: 420,
      supplier: 'Хім-Палітурка',
      minStock: 5,
      location: 'Зона ламінації'
    },
    {
      title: '🌀 Пружина металева 6.4мм',
      name: 'Пружина металева 6.4мм біла',
      type: 'offset' as const,
      unit: 'шт.',
      qty: 3000,
      price: 0.45,
      supplier: 'Палітур-Сервіс',
      minStock: 1000,
      location: 'Зона післядруку'
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setNewMatName(preset.name);
    setNewMatType(preset.type);
    setNewMatUnit(preset.unit);
    setNewMatQty(preset.qty);
    setNewMatPrice(preset.price);
    setNewMatSupplier(preset.supplier);
    setNewMatMinStock(preset.minStock);
    setNewMatLocation(preset.location);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) return;

    addMaterial({
      name: newMatName,
      type: newMatType,
      quantity: Number(newMatQty) || 0,
      reserved: 0,
      unit: newMatUnit,
      price: Number(newMatPrice) || 0,
      supplier: newMatSupplier,
      minStock: Number(newMatMinStock) || 500,
      location: newMatLocation,
      salesLog: []
    });

    setShowAddMaterialModal(false);
    // Reset form
    setNewMatName('');
    setNewMatQty(1000);
    setNewMatPrice(0.60);
  };

  const handleDuplicate = (id: string, folderName: string) => {
    const mat = materials.find(m => m.id === id);
    if (!mat) return;
    alert(`Товар "${mat.name}" успішно скопійовано до папки "${folderName}"`);
  };

  const handleBulkDuplicate = () => {
    if (selectedMaterials.length === 0) {
      alert('Будь ласка, оберіть товари для дублювання!');
      return;
    }
    selectedMaterials.forEach(id => {
      handleDuplicate(id, bulkFolderTarget);
    });
    setSelectedMaterials([]);
    alert(`Здубльовано ${selectedMaterials.length} товарів у папку "${bulkFolderTarget}"`);
  };

  const handleSelectMaterial = (id: string) => {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(selectedMaterials.filter(m => m !== id));
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  };

  const handleRelocateStock = (e: React.FormEvent) => {
    e.preventDefault();
    const material = materials.find(m => m.id === relocateMaterialId);
    if (!material) return;

    if (material.quantity < relocateQty) {
      alert('Недостатньо матеріалу на складі відправника!');
      return;
    }

    updateMaterialStock(relocateMaterialId, material.quantity - relocateQty);

    const notificationMessage = `Переміщення товару: "${material.name}", кількість: ${relocateQty} ${material.unit}, надійшов з філіалу "${relocateFrom}" до "${relocateTo}"`;
    addSystemNotification(notificationMessage);
    alert('Переміщення успішно проведено та додано до журналу!');
    setShowRelocateModal(false);
  };

  const handleRegisterMultiReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    let loggedCount = 0;
    multiReceiptRows.forEach(row => {
      if (!row.materialId || row.quantity <= 0) return;
      const mat = materials.find(m => m.id === row.materialId);
      if (mat) {
        updateMaterialStock(row.materialId, mat.quantity + row.quantity);
        loggedCount += row.quantity;
      }
    });

    if (loggedCount > 0) {
      addSystemNotification(`Мультиприхід товарів від постачальника "${multiReceiptSupplier}": оприбутковано товари.`);
      alert('Мультиприхід успішно проведено на склад!');
    }
    setShowMultiReceiptModal(false);
    setMultiReceiptRows([{ materialId: materials[0]?.id || '', quantity: 100, price: 0 }]);
  };

  const addMultiReceiptRow = () => {
    setMultiReceiptRows([...multiReceiptRows, { materialId: materials[0]?.id || '', quantity: 100, price: 0 }]);
  };

  const removeMultiReceiptRow = (idx: number) => {
    if (multiReceiptRows.length > 1) {
      setMultiReceiptRows(multiReceiptRows.filter((_, i) => i !== idx));
    }
  };

  const filteredMaterials = useMemo(() => {
    return (materials || []).filter(m => {
      const name = m?.name || '';
      const id = m?.id || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || m?.type === selectedCategory;
      
      const minStock = m?.minStock || 1000;
      const qty = m?.quantity || 0;
      const matchesStock = selectedStockFilter === 'all' || 
                           (selectedStockFilter === 'instock' && qty > minStock) ||
                           (selectedStockFilter === 'lowstock' && qty <= minStock);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [materials, searchQuery, selectedCategory, selectedStockFilter]);

  return (
    <div className="main-content bg-[#f2f2f7]">
      <div className="header-title-container">
        <div>
          <h1 className="page-title text-slate-900">Склад матеріалів та номенклатури</h1>
          <p className="subtitle">Повний контроль залишків, резервів, цін закупівлі та складських комірок</p>
        </div>

        <button 
          type="button" 
          onClick={() => setShowAddMaterialModal(true)}
          className="ios-btn ios-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          Додати товар на склад
        </button>
      </div>

      {/* Informational Guidance Banner explaining metrics for clear understanding */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '12px 16px',
        borderRadius: '12px',
        marginBottom: '16px',
        border: '0.5px solid var(--border-light)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        fontSize: '11px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-dark)' }}>📦 Залишок:</strong>
            <span style={{ color: 'var(--text-medium)', display: 'block' }}>Фізична кількість на складі</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} style={{ color: '#ff9500', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-dark)' }}>🔒 Зарезервовано:</strong>
            <span style={{ color: 'var(--text-medium)', display: 'block' }}>Відкладено під замовлення в роботі</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-dark)' }}>✅ Доступно:</strong>
            <span style={{ color: 'var(--text-medium)', display: 'block' }}>Вільний баланс для калькуляцій</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={16} style={{ color: '#5856d6', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-dark)' }}>📍 Локація:</strong>
            <span style={{ color: 'var(--text-medium)', display: 'block' }}>Стелаж/Шафа зберігання</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs inside Warehouse */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#e5e5ea',
        padding: '3px',
        borderRadius: '10px',
        marginBottom: '16px',
        overflowX: 'auto',
        position: 'relative',
        zIndex: 1,
        minHeight: '40px'
      }}>
        {(['zalyshki', 'vyroby', 'oprybutkuvannya', 'spysannya', 'peremishchennya', 'inventaryzatsii', 'povernennya', 'tovary'] as const).map(tab => (
          <button 
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="ios-btn"
            style={{
              flexGrow: 1,
              padding: '7px 14px',
              fontSize: '11px',
              borderRadius: '7px',
              backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
              color: activeTab === tab ? 'var(--primary)' : '#1c1c1e',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
              fontWeight: activeTab === tab ? '800' : '600',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab === 'zalyshki' ? `Залишки (${materials.length})` : 
             tab === 'vyroby' ? 'Вироби / Прайс' : 
             tab === 'oprybutkuvannya' ? 'Оприбуткування' : 
             tab === 'spysannya' ? 'Списання' : 
             tab === 'peremishchennya' ? 'Переміщення' : 
             tab === 'inventaryzatsii' ? 'Інвентаризації' : 
             tab === 'povernennya' ? 'Повернення' : 'Папки / Склади'}
          </button>
        ))}
      </div>

      {activeTab === 'zalyshki' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Quick Search & Filters Bar */}
          <div className="ios-card bg-white" style={{ display: 'flex', gap: '12px', padding: '12px 16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} size={14} />
              <input 
                placeholder="Швидкий пошук товару..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '32px', fontSize: '12px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>
              <span>Тип:</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ height: '32px', fontSize: '12px', width: '140px' }}
              >
                <option value="all">Всі матеріали</option>
                <option value="offset">Офсетний папір</option>
                <option value="gazetka">Газетний папір</option>
                <option value="coated">Крейдований папір</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>
              <span>Статус:</span>
              <select 
                value={selectedStockFilter}
                onChange={(e) => setSelectedStockFilter(e.target.value as any)}
                style={{ height: '32px', fontSize: '12px', width: '140px' }}
              >
                <option value="all">Всі записи</option>
                <option value="instock">В достатку</option>
                <option value="lowstock">Низький залишок</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={() => setShowMultiReceiptModal(true)}
                className="ios-btn ios-btn-primary ios-btn-small"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={13} />
                Мультиприхід
              </button>
              <button
                type="button"
                onClick={() => setShowRelocateModal(true)}
                className="ios-btn ios-btn-secondary ios-btn-small"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeftRight size={13} />
                Перемістити
              </button>
            </div>
          </div>

          {/* Mass Duplication panel */}
          {selectedMaterials.length > 0 && (
            <div className="ios-card bg-slate-50 flex items-center justify-between py-3 px-4 border border-blue-200">
              <span className="text-xs font-bold text-slate-700">Осталось обрано: {selectedMaterials.length} товарів</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select 
                  value={bulkFolderTarget}
                  onChange={(e) => setBulkFolderTarget(e.target.value)}
                  style={{ height: '28px', fontSize: '11px', width: '130px' }}
                >
                  <option value="Папір">Папка: Папір</option>
                  <option value="Фарби та Тонери">Папка: Фарби</option>
                  <option value="Палітурні матеріали">Папка: Палітурка</option>
                </select>
                <button type="button" onClick={handleBulkDuplicate} className="ios-btn ios-btn-primary ios-btn-small flex items-center gap-1">
                  <Copy size={11} />
                  Копіювати в папку
                </button>
              </div>
            </div>
          )}

          {/* Warehouse Table - Detailed Informative View */}
          <div className="ios-card bg-white" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="ios-table-container">
              <table className="ios-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}><CheckSquare size={13} /></th>
                    <th style={{ width: '80px' }}>Код</th>
                    <th>Найменування номенклатури</th>
                    <th>Складська локація</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Закупівельна ціна</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Залишок</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Резерв</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Доступно</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Статус</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((m) => {
                    const minStock = m.minStock || 1000;
                    const available = m.quantity - m.reserved;
                    const isCritical = available <= 0;
                    const isLow = available <= minStock;
                    const folder = getFolderForMaterial(m.type);
                    const unitPrice = m.price || 0.60;
                    const loc = m.location || `Стелаж ${m.type === 'offset' ? 'А' : m.type === 'coated' ? 'Б' : 'В'}`;

                    return (
                      <tr key={m.id}>
                        <td>
                          <input 
                            type="checkbox"
                            checked={selectedMaterials.includes(m.id)}
                            onChange={() => handleSelectMaterial(m.id)}
                          />
                        </td>
                        <td style={{ fontWeight: '600', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>#{m.id}</td>
                        <td>
                          {/* Clickable material name: triggers journal/detail modal view */}
                          <div 
                            onClick={() => setSelectedMaterialForLog(m)} 
                            style={{ fontWeight: '800', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                            title="Клацніть для перегляду деталей та журналу руху товару"
                          >
                            {m.name}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            <span className="ios-badge ios-badge-blue">{m.type}</span>
                            {m.supplier && <span style={{ fontSize: '10px', color: '#64748b' }}>🏢 {m.supplier}</span>}
                          </div>
                        </td>
                        <td>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                            <FolderOpen size={12} style={{ color: 'var(--primary)' }} />
                            {loc} ({folder})
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                          {unitPrice.toFixed(2)} ₴/{m.unit}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>
                          {m.quantity.toLocaleString()} {m.unit}
                        </td>
                        <td style={{ textAlign: 'right', color: '#ff9500', fontWeight: '700' }}>
                          {m.reserved.toLocaleString()} {m.unit}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: isCritical ? 'var(--danger)' : isLow ? '#ff9500' : 'var(--success)' }}>
                          {available.toLocaleString()} {m.unit}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`ios-badge ${isCritical ? 'ios-badge-red' : isLow ? 'ios-badge-orange' : 'ios-badge-green'}`}>
                            {isCritical ? 'Немає' : isLow ? 'Мало' : 'В нормі'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedMaterialForLog(m)}
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              style={{ padding: '4px 8px' }}
                            >
                              <History size={11} />
                              <span>Деталі</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(m.id, folder)}
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              style={{ padding: '4px 8px' }}
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add New Material Modal with Fast Preset Autofill */}
      {showAddMaterialModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleCreateMaterial} className="ios-modal" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">✨ Додати новий товар на склад</h3>
              <button type="button" onClick={() => setShowAddMaterialModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Presets Bar for 1-Click Fast Creation */}
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '11px', fontWeight: '850', color: 'var(--text-dark)', display: 'block', marginBottom: '6px' }}>
                  ⚡ Швидке шаблонне заповнення в 1 клік:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="ios-btn ios-btn-secondary"
                      style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Назва матеріалу / товару *</label>
                <input 
                  required 
                  placeholder="напр. Крейдований папір 150г (A1)" 
                  value={newMatName} 
                  onChange={(e) => setNewMatName(e.target.value)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Категорія матеріалу</label>
                  <select value={newMatType} onChange={(e) => setNewMatType(e.target.value as any)}>
                    <option value="coated">Крейдований папір</option>
                    <option value="offset">Офсетний папір</option>
                    <option value="gazetka">Газетний папір</option>
                  </select>
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Одиниця виміру</label>
                  <select value={newMatUnit} onChange={(e) => setNewMatUnit(e.target.value)}>
                    <option value="арк.">арк. (аркуші)</option>
                    <option value="шт.">шт. (штуки)</option>
                    <option value="кг">кг (кілограми)</option>
                    <option value="рулон">рулон (рулони)</option>
                  </select>
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Початковий залишок</label>
                  <input type="number" min="0" value={newMatQty} onChange={(e) => setNewMatQty(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Закупівельна ціна (грн/{newMatUnit})</label>
                  <input type="number" step="0.01" min="0" value={newMatPrice} onChange={(e) => setNewMatPrice(Number(e.target.value))} />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Мінімальний залишок (попередження)</label>
                  <input type="number" min="0" value={newMatMinStock} onChange={(e) => setNewMatMinStock(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Постачальник</label>
                  <input placeholder="напр. ТОВ Папір-Світ" value={newMatSupplier} onChange={(e) => setNewMatSupplier(e.target.value)} />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Локація / Стелаж зберігання</label>
                  <input placeholder="напр. Стелаж А-1" value={newMatLocation} onChange={(e) => setNewMatLocation(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowAddMaterialModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти новий товар</button>
            </div>
          </form>
        </div>
      )}

      {/* Relocate Stock Modal */}
      {showRelocateModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleRelocateStock} className="ios-modal" style={{ maxWidth: '400px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Переміщення між складами</h3>
              <button type="button" onClick={() => setShowRelocateModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Матеріал для перенесення</label>
                <select value={relocateMaterialId} onChange={(e) => setRelocateMaterialId(e.target.value)}>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Кількість переміщення</label>
                <input type="number" min="1" value={relocateQty} onChange={(e) => setRelocateQty(Number(e.target.value))} />
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Склад-відправник</label>
                <select value={relocateFrom} onChange={(e) => setRelocateFrom(e.target.value)}>
                  <option>Головний склад Вінниця</option>
                  <option>Друкарський цех</option>
                  <option>Точка видачі (Соборна)</option>
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Склад-отримувач</label>
                <select value={relocateTo} onChange={(e) => setRelocateTo(e.target.value)}>
                  <option>Друкарський цех</option>
                  <option>Головний склад Вінниця</option>
                  <option>Точка видачі (Соборна)</option>
                </select>
              </div>
            </div>
            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowRelocateModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Підтвердити перенесення</button>
            </div>
          </form>
        </div>
      )}

      {/* Multi-receipt Modal */}
      {showMultiReceiptModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleRegisterMultiReceipt} className="ios-modal" style={{ maxWidth: '650px', width: '90%' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">📦 Мультиприхід товарів на склад</h3>
              <button type="button" onClick={() => setShowMultiReceiptModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Постачальник *</label>
                <input required value={multiReceiptSupplier} onChange={(e) => setMultiReceiptSupplier(e.target.value)} />
              </div>

              <span className="ios-label">Список товарів для оприбуткування:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                {multiReceiptRows.map((row, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div className="ios-input-group" style={{ marginBottom: 0 }}>
                      <select 
                        value={row.materialId} 
                        onChange={(e) => {
                          const newRows = [...multiReceiptRows];
                          newRows[idx].materialId = e.target.value;
                          setMultiReceiptRows(newRows);
                        }}
                        style={{ height: '32px', fontSize: '12px' }}
                      >
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                      </select>
                    </div>

                    <div className="ios-input-group" style={{ marginBottom: 0 }}>
                      <input 
                        type="number" 
                        min="1" 
                        placeholder="Кількість" 
                        value={row.quantity} 
                        onChange={(e) => {
                          const newRows = [...multiReceiptRows];
                          newRows[idx].quantity = Number(e.target.value);
                          setMultiReceiptRows(newRows);
                        }} 
                        style={{ height: '32px', fontSize: '12px' }}
                      />
                    </div>

                    <div className="ios-input-group" style={{ marginBottom: 0 }}>
                      <input 
                        type="number" 
                        min="0" 
                        placeholder="Ціна закупівлі" 
                        value={row.price} 
                        onChange={(e) => {
                          const newRows = [...multiReceiptRows];
                          newRows[idx].price = Number(e.target.value);
                          setMultiReceiptRows(newRows);
                        }} 
                        style={{ height: '32px', fontSize: '12px' }}
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removeMultiReceiptRow(idx)} 
                      disabled={multiReceiptRows.length === 1}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger)', opacity: multiReceiptRows.length === 1 ? 0.3 : 1 }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={addMultiReceiptRow}
                style={{
                  alignSelf: 'flex-start',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--primary)',
                  fontSize: '11px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                + Додати ще одну позицію
              </button>
            </div>

            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowMultiReceiptModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Оформити мультиприхід</button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Material Detailed Information Modal */}
      {selectedMaterialForLog && (
        <div className="ios-modal-overlay">
          <div className="ios-modal" style={{ maxWidth: '600px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Деталі та історія товару: {selectedMaterialForLog.name}</h3>
              <button type="button" onClick={() => setSelectedMaterialForLog(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Material specifications breakdown */}
              <div style={{ backgroundColor: 'rgba(0,122,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <span className="text-xs font-bold text-slate-700 block mb-2">Основні параметри номенклатури:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '11px' }}>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <span className="text-slate-500">Код / SKU:</span>
                    <strong className="block text-slate-800 text-sm">#{selectedMaterialForLog.id}</strong>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <span className="text-slate-500">Категорія:</span>
                    <strong className="block text-slate-800 text-sm">{selectedMaterialForLog.type}</strong>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <span className="text-slate-500">Закупівельна ціна:</span>
                    <strong className="block text-slate-800 text-sm">{(selectedMaterialForLog.price || 0.60).toFixed(2)} ₴/{selectedMaterialForLog.unit}</strong>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <span className="text-slate-500">Постачальник:</span>
                    <strong className="block text-slate-800 text-sm">{selectedMaterialForLog.supplier || 'ТОВ Папір-Світ'}</strong>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <span className="text-slate-500">Локація зберігання:</span>
                    <strong className="block text-slate-800 text-sm">{selectedMaterialForLog.location || 'Стелаж А'}</strong>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <span className="text-slate-500">Мін. залишок:</span>
                    <strong className="block text-slate-800 text-sm">{selectedMaterialForLog.minStock || 1000} {selectedMaterialForLog.unit}</strong>
                  </div>
                </div>
              </div>

              {/* Sales log list */}
              <div className="ios-table-container">
                <table className="ios-table" style={{ fontSize: '11px' }}>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Працівник</th>
                      <th>Кількість</th>
                      <th>Списано під угоду</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!selectedMaterialForLog.salesLog || selectedMaterialForLog.salesLog.length === 0) ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: '#8e8e93' }}>
                          Ручні списання відсутні
                        </td>
                      </tr>
                    ) : (
                      selectedMaterialForLog.salesLog.map(entry => (
                        <tr key={entry.id}>
                          <td>{entry.date}</td>
                          <td>{entry.employee}</td>
                          <td style={{ fontWeight: '700', color: 'var(--danger)' }}>-{entry.quantity} {selectedMaterialForLog.unit}</td>
                          <td>{entry.dealName || entry.dealId || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ios-modal-footer">
              <button type="button" onClick={() => setSelectedMaterialForLog(null)} className="ios-btn ios-btn-secondary">Закрити</button>
            </div>
          </div>
        </div>
      )}

      {/* Render sub-tabs content */}
      {activeTab === 'vyroby' && (
        <div className="ios-table-container bg-white rounded-xl shadow-sm border border-slate-100">
          <table className="ios-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Артикул</th>
                <th>Назва готового виробу</th>
                <th>Складові матеріали</th>
                <th style={{ width: '120px' }}>Собівартість</th>
                <th style={{ width: '120px' }}>Час збірки</th>
              </tr>
            </thead>
            <tbody>
              {assemblies.map(item => (
                <tr key={item.sku}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{item.sku}</td>
                  <td style={{ fontWeight: '700' }}>
                    <div 
                      onClick={() => alert(`Залишок та детальна інформація прайс-листа для: ${item.name}`)}
                      style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {item.name}
                    </div>
                  </td>
                  <td style={{ color: '#475569' }}>{item.components}</td>
                  <td style={{ fontWeight: '800', color: '#10b981' }}>{item.price}</td>
                  <td style={{ fontWeight: '500' }}>{item.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'oprybutkuvannya' && (
        <div className="ios-table-container bg-white rounded-xl shadow-sm border border-slate-100">
          <table className="ios-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>Дата ордера</th>
                <th>Постачальник</th>
                <th>Найменування матеріалу</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Кількість</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Сума закупки</th>
                <th style={{ width: '120px' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.date}</td>
                  <td style={{ fontWeight: '700' }}>{item.supplier}</td>
                  <td>{item.item}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--success)' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{item.total}</td>
                  <td><span className="ios-badge ios-badge-green">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories / Folders sub tab */}
      {activeTab === 'tovary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="ios-card bg-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <FolderOpen size={16} style={{ color: 'var(--primary)' }} />
                  {cat.name}
                </span>
                <span className="ios-badge ios-badge-blue">{cat.itemsCount} найменувань</span>
              </div>
              <div style={{ fontSize: '12px', color: '#636366', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p>📍 Розташування складання: {cat.location}</p>
                <p>👤 Відповідальний за зону: {cat.manager}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
