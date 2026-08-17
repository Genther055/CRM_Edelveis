import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Truck, 
  Search, 
  MapPin, 
  Calendar,
  Package,
  Plus,
  Sliders,
  User,
  Clock,
  Globe
} from 'lucide-react';
import type { DeliveryItem } from '../types';

export const Delivery: React.FC = () => {
  const { 
    deliveries, 
    updateDeliveryStatus, 
    updateDelivery, 
    addDelivery,
    novaPoshtaAccounts,
    orders,
    clients,
    npVolumeCalcEnabled
  } = useApp();

  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'created' | 'in_transit' | 'arrived' | 'received' | 'refused'>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'nova_poshta' | 'ukr_poshta' | 'system'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<DeliveryItem | null>(null);

  // Form State safely initialized
  const [newDealId, setNewDealId] = useState(orders[0]?.id || '');
  const [newClientName, setNewClientName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTtn, setNewTtn] = useState('');
  const [newDelType, setNewDelType] = useState<'nova_poshta' | 'ukr_poshta' | 'system'>('nova_poshta');
  const [newNpAccount, setNewNpAccount] = useState((novaPoshtaAccounts && novaPoshtaAccounts[0]) || '');
  const [newCourier, setNewCourier] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  // Dimensions calculator states
  const [boxLength, setBoxLength] = useState('');
  const [boxWidth, setBoxWidth] = useState('');
  const [boxHeight, setBoxHeight] = useState('');
  
  // UkrPoshta specific states
  const [isInternational, setIsInternational] = useState(false);
  const [upAccount, setUpAccount] = useState('УкрПошта Головне відділення (Вінниця)');

  const statusLabels: Record<string, string> = {
    created: 'Створено ЕН',
    in_transit: 'У дорозі',
    arrived: 'Прибуло у відділення',
    received: 'Отримано',
    refused: 'Відмова'
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'created': return 'ios-badge-blue';
      case 'in_transit': return 'ios-badge-orange';
      case 'arrived': return 'ios-badge-purple';
      case 'received': return 'ios-badge-green';
      case 'refused': return 'ios-badge-red';
      default: return '';
    }
  };

  React.useEffect(() => {
    if (!newDealId) return;
    const selectedOrder = orders.find(o => o.id === newDealId);
    if (selectedOrder) {
      const clientObj = clients.find(c => c.id === selectedOrder.clientId);
      if (clientObj) {
        setNewClientName(clientObj.name);
      }

      // Auto-extract address from order name or info if it's from Rozetka or Prom
      const textToParse = `${selectedOrder.name} ${selectedOrder.category || ''}`;
      const nameLower = textToParse.toLowerCase();
      const isFromRozetkaOrProm = nameLower.includes('rozetka') || nameLower.includes('prom') || nameLower.includes('пром') || nameLower.includes('розетка');
      
      if (isFromRozetkaOrProm) {
        const cityRegex = /(?:м\.|місто|м\s)\s*([А-ЯІЇЄҐа-яіїєґa-zA-Z-]+)/i;
        const cityMatch = textToParse.match(cityRegex);
        const city = cityMatch ? cityMatch[1] : '';

        const whRegex = /(?:відділення|відд\.|відд)\s*(?:№\s*|#\s*)?(\d+)/i;
        const whMatch = textToParse.match(whRegex);
        const warehouse = whMatch ? `Відділення №${whMatch[1]}` : '';

        if (city || warehouse) {
          setNewAddress(`м. ${city || 'Вінниця'}, ${warehouse || 'Відділення №1'}`);
        }
      }
    }
  }, [newDealId, orders, clients]);

  const handleCreateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    let volNotes = '';
    if (newDelType === 'nova_poshta' && npVolumeCalcEnabled) {
      const len = parseFloat(boxLength) || 0;
      const wid = parseFloat(boxWidth) || 0;
      const hei = parseFloat(boxHeight) || 0;
      if (len > 0 && wid > 0 && hei > 0) {
        const vol = (len * wid * hei) / 1000000;
        const volW = (len * wid * hei) / 4000;
        volNotes = ` [Коробка: ${len}x${wid}x${hei} см, Об'єм: ${vol.toFixed(4)} м³, Об'ємна вага: ${volW.toFixed(2)} кг]`;
      }
    }

    addDelivery({
      dealId: newDealId,
      clientName: newClientName,
      address: newAddress,
      ttnNumber: newTtn || `59000${Math.floor(100000000 + Math.random() * 900000000)}`, // auto generate if empty
      status: 'created',
      date: new Date().toISOString().split('T')[0],
      deliveryType: newDelType === 'ukr_poshta' ? 'nova_poshta' : newDelType,
      npAccountId: newDelType === 'nova_poshta' ? newNpAccount : newDelType === 'ukr_poshta' ? upAccount : undefined,
      courierName: newDelType === 'system' ? newCourier : undefined,
      deliveryTime: newDelType === 'system' ? newTime : undefined,
      notes: `${newNotes}${volNotes}${newDelType === 'ukr_poshta' ? ` [УкрПошта${isInternational ? ' - Міжнародна' : ''}]` : ''}`
    });

    // Reset Form
    setNewClientName('');
    setNewAddress('');
    setNewTtn('');
    setNewCourier('');
    setNewTime('');
    setNewNotes('');
    setBoxLength('');
    setBoxWidth('');
    setBoxHeight('');
    setIsInternational(false);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDelivery) return;

    updateDelivery(editingDelivery);
    setShowEditModal(false);
    setEditingDelivery(null);
  };

  // Safe property mapping to avoid TypeError / blank screen crash on undefined inputs
  const filteredDeliveries = (deliveries || []).filter(d => {
    if (!d) return false;
    const status = d.status || 'created';
    const deliveryType = d.deliveryType || 'nova_poshta';
    const clientName = d.clientName || '';
    const ttnNumber = d.ttnNumber || '';
    const dealId = d.dealId || '';
    const courierName = d.courierName || '';
    const notes = d.notes || '';

    const matchesStatus = activeStatusFilter === 'all' || status === activeStatusFilter;
    
    // Custom check for UkrPoshta
    const isUkrPoshta = notes.includes('[УкрПошта');
    const matchesType = 
      activeTypeFilter === 'all' ? true :
      activeTypeFilter === 'system' ? deliveryType === 'system' :
      activeTypeFilter === 'ukr_poshta' ? isUkrPoshta :
      activeTypeFilter === 'nova_poshta' ? (deliveryType === 'nova_poshta' && !isUkrPoshta) : true;

    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ttnNumber.includes(searchTerm) || 
                          dealId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          courierName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Доставка замовлень</h1>
          <p className="subtitle">Керування доставками: Нова Пошта, УкрПошта та Системні кур'єри</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ios-btn ios-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={16} />
          Створити доставку
        </button>
      </div>

      {/* Redesigned Cupertino Light Theme Filters Panel */}
      <div className="ios-card bg-white space-y-4 mb-6">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} size={16} />
            <input 
              placeholder="Шукати за клієнтом, ТТН, кур'єром або угодою..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', height: '36px', fontSize: '13px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <Sliders size={13} style={{ color: '#8e8e93' }} />
            <span style={{ fontWeight: '750' }}>Тип доставки:</span>
            <select 
              value={activeTypeFilter}
              onChange={(e) => setActiveTypeFilter(e.target.value as any)}
              style={{ height: '32px', fontSize: '12px', width: '145px' }}
            >
              <option value="all">Всі типи</option>
              <option value="nova_poshta">Нова Пошта</option>
              <option value="ukr_poshta">УкрПошта</option>
              <option value="system">Системна</option>
            </select>
          </div>
        </div>

        {/* Statuses Selector row */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '0.5px solid var(--border-light)', paddingTop: '10px' }}>
          {(['all', 'created', 'in_transit', 'arrived', 'received', 'refused'] as const).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatusFilter(status)}
              className="ios-btn"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                borderRadius: '6px',
                backgroundColor: activeStatusFilter === status ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
                color: activeStatusFilter === status ? '#ffffff' : 'var(--text-dark)',
                fontWeight: activeStatusFilter === status ? '700' : '500',
                whiteSpace: 'nowrap'
              }}
            >
              {status === 'all' ? 'Всі статуси' : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeliveries.length === 0 ? (
          <div className="ios-card bg-white col-span-full text-center py-10" style={{ color: '#8e8e93' }}>
            <Package size={48} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <p>Записи про доставку за обраними фільтрами відсутні</p>
          </div>
        ) : (
          filteredDeliveries.map(del => {
            const notes = del.notes || '';
            const isUP = notes.includes('[УкрПошта');
            return (
              <div key={del.id} className="ios-card bg-white flex flex-col justify-between" style={{ minHeight: '210px' }}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span style={{ fontSize: '11px', fontWeight: '750', color: 'var(--primary)' }}>{del.dealId}</span>
                    <span className={`ios-badge ${getStatusBadgeClass(del.status || 'created')}`}>
                      {statusLabels[del.status || 'created']}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-800" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    {del.clientName}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#636366' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} />
                      <span className="truncate">{del.address}</span>
                    </div>
                    
                    {isUP ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0ea5e9' }}>
                          <Globe size={12} />
                          <span style={{ fontWeight: '750' }}>УкрПошта: {del.npAccountId || 'Головне'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Truck size={12} />
                          <span style={{ fontFamily: 'var(--font-mono)' }}>ТТН: {del.ttnNumber || 'Очікує генерації'}</span>
                        </div>
                      </>
                    ) : (del.deliveryType || 'nova_poshta') === 'nova_poshta' ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Truck size={12} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                            ТТН: {del.ttnNumber || 'Не присвоєно'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '600' }}>
                          <Sliders size={12} />
                          <span>Акаунт: {del.npAccountId || 'Головний'}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: '700' }}>
                          <User size={12} />
                          <span>Кур'єр: {del.courierName || 'Самовивіз'}</span>
                        </div>
                        {del.deliveryTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} />
                            <span>Час доставки: {del.deliveryTime}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} />
                      <span>Дата відправки: {del.date}</span>
                    </div>

                    {del.notes && (
                      <div style={{ fontStyle: 'italic', fontSize: '11px', marginTop: '4px', borderLeft: '2px solid var(--border-light)', paddingLeft: '6px' }}>
                        {del.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update Options */}
                <div style={{ borderTop: '0.5px solid var(--border-light)', paddingTop: '10px', marginTop: '10px', display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDelivery(del);
                      setShowEditModal(true);
                    }}
                    className="ios-btn ios-btn-secondary ios-btn-small"
                    style={{ flexGrow: 1, justifyContent: 'center' }}
                  >
                    Редагувати
                  </button>
                  <select
                    value={del.status || 'created'}
                    onChange={(e) => updateDeliveryStatus(del.id, e.target.value as any)}
                    style={{
                      height: '28px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'rgba(120, 120, 128, 0.08)',
                      padding: '0 4px',
                      width: '130px'
                    }}
                  >
                    <option value="created">Створено ЕН</option>
                    <option value="in_transit">У дорозі</option>
                    <option value="arrived">Прибуло</option>
                    <option value="received">Отримано</option>
                    <option value="refused">Відмова</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Delivery Modal */}
      {showAddModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleCreateDelivery} className="ios-modal" style={{ maxWidth: '480px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Нова доставка</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div className="ios-input-group">
                <label className="ios-label">Тип доставки</label>
                <select value={newDelType} onChange={(e) => setNewDelType(e.target.value as any)}>
                  <option value="nova_poshta">Доставка Новою Поштою</option>
                  <option value="ukr_poshta">Доставка УкрПошта</option>
                  <option value="system">Системна доставка (Власна кур'єрська)</option>
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Пов'язана Угода</label>
                <select value={newDealId} onChange={(e) => setNewDealId(e.target.value)}>
                  {(orders || []).map(o => <option key={o.id} value={o.id}>{o.id} ({o.name})</option>)}
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Отримувач (Клієнт) *</label>
                <input required placeholder="напр. ТОВ Едельвейс" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Адреса доставки *</label>
                <input required placeholder="напр. м. Вінниця, Відділення №2" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              </div>

              {newDelType === 'nova_poshta' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                    <div className="ios-input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="ios-label">Номер ТТН</label>
                        <button
                          type="button"
                          onClick={() => setNewTtn(`59000${Math.floor(100000000 + Math.random() * 900000000)}`)}
                          style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontSize: '10px', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                        >
                          🎲 Згенерувати ТТН
                        </button>
                      </div>
                      <input placeholder="Автогенерація якщо пусто" value={newTtn} onChange={(e) => setNewTtn(e.target.value)} />
                    </div>
                    <div className="ios-input-group">
                      <label className="ios-label">Акаунт Нової Пошти</label>
                      <select value={newNpAccount} onChange={(e) => setNewNpAccount(e.target.value)}>
                        {(novaPoshtaAccounts || []).map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>

                  {npVolumeCalcEnabled && (
                    <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <span style={{ fontSize: '11px', fontWeight: '850', color: 'var(--text-dark)', display: 'block', marginBottom: '8px' }}>
                        🧮 Калькулятор об'єму та об'ємної ваги коробки
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <div className="ios-input-group" style={{ marginBottom: 0 }}>
                          <label className="ios-label" style={{ fontSize: '10px' }}>Довжина (см)</label>
                          <input type="number" placeholder="см" value={boxLength} onChange={(e) => setBoxLength(e.target.value)} style={{ height: '28px', fontSize: '11px' }} />
                        </div>
                        <div className="ios-input-group" style={{ marginBottom: 0 }}>
                          <label className="ios-label" style={{ fontSize: '10px' }}>Ширина (см)</label>
                          <input type="number" placeholder="см" value={boxWidth} onChange={(e) => setBoxWidth(e.target.value)} style={{ height: '28px', fontSize: '11px' }} />
                        </div>
                        <div className="ios-input-group" style={{ marginBottom: 0 }}>
                          <label className="ios-label" style={{ fontSize: '10px' }}>Висота (см)</label>
                          <input type="number" placeholder="см" value={boxHeight} onChange={(e) => setBoxHeight(e.target.value)} style={{ height: '28px', fontSize: '11px' }} />
                        </div>
                      </div>
                      
                      {(parseFloat(boxLength) > 0 && parseFloat(boxWidth) > 0 && parseFloat(boxHeight) > 0) && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '750', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Об'єм: {((parseFloat(boxLength) * parseFloat(boxWidth) * parseFloat(boxHeight)) / 1000000).toFixed(4)} м³</span>
                          <span>Об'ємна вага: {((parseFloat(boxLength) * parseFloat(boxWidth) * parseFloat(boxHeight)) / 4000).toFixed(2)} кг</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {newDelType === 'ukr_poshta' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label">Акаунт УкрПошти</label>
                    <select value={upAccount} onChange={(e) => setUpAccount(e.target.value)}>
                      <option>УкрПошта Головне відділення (Вінниця)</option>
                      <option>УкрПошта ФОП Шевченко (Міжнародна)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={isInternational} onChange={(e) => setIsInternational(e.target.checked)} />
                      Міжнародне відправлення (Експорт)
                    </label>
                  </div>
                </div>
              )}

              {newDelType === 'system' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label">Ім'я кур'єра</label>
                    <input placeholder="напр. Олександр" value={newCourier} onChange={(e) => setNewCourier(e.target.value)} />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Бажаний час</label>
                    <input placeholder="напр. 15:00 - 18:00" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="ios-input-group">
                <label className="ios-label">Примітки / Коментарі</label>
                <input placeholder="напр. обережно крихке" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
              </div>
            </div>
            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowAddModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти доставку</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Delivery Modal */}
      {showEditModal && editingDelivery && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleSaveEdit} className="ios-modal" style={{ maxWidth: '480px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Редагувати доставку: {editingDelivery.dealId}</h3>
              <button type="button" onClick={() => { setShowEditModal(false); setEditingDelivery(null); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div className="ios-input-group">
                <label className="ios-label">Адреса доставки *</label>
                <input 
                  required 
                  value={editingDelivery.address} 
                  onChange={(e) => setEditingDelivery({ ...editingDelivery, address: e.target.value })} 
                />
              </div>

              {(editingDelivery.deliveryType || 'nova_poshta') === 'nova_poshta' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label">Номер ТТН</label>
                    <input 
                      value={editingDelivery.ttnNumber || ''} 
                      onChange={(e) => setEditingDelivery({ ...editingDelivery, ttnNumber: e.target.value })} 
                    />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Акаунт</label>
                    <select 
                      value={editingDelivery.npAccountId || ''} 
                      onChange={(e) => setEditingDelivery({ ...editingDelivery, npAccountId: e.target.value })}
                    >
                      {(novaPoshtaAccounts || []).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label">Ім'я кур'єра</label>
                    <input 
                      value={editingDelivery.courierName || ''} 
                      onChange={(e) => setEditingDelivery({ ...editingDelivery, courierName: e.target.value })} 
                    />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Бажаний час</label>
                    <input 
                      value={editingDelivery.deliveryTime || ''} 
                      onChange={(e) => setEditingDelivery({ ...editingDelivery, deliveryTime: e.target.value })} 
                    />
                  </div>
                </div>
              )}

              <div className="ios-input-group">
                <label className="ios-label">Примітки</label>
                <input 
                  value={editingDelivery.notes || ''} 
                  onChange={(e) => setEditingDelivery({ ...editingDelivery, notes: e.target.value })} 
                />
              </div>
            </div>
            <div className="ios-modal-footer">
              <button type="button" onClick={() => { setShowEditModal(false); setEditingDelivery(null); }} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти зміни</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
