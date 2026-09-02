import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  ArrowRight,
  User,
  XCircle,
  Sliders,
  Archive,
  RotateCcw,
  Clock,
  AlertTriangle,
  Star,
  Copy,
  Info
} from 'lucide-react';
import type { Order } from '../types';
import { PIPELINE_STAGES } from '../data/pipelineStages';

export const Deals: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    updateOrder, 
    clients, 
    customFields, 
    addSystemNotification,
    materials,
    updateMaterialStock,
    transitionMatrix,
    stageDurations
  } = useApp();

  const [activePipeline, setActivePipeline] = useState<'b2b' | 'pos'>('b2b');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFunnelGuideModal, setShowFunnelGuideModal] = useState(false);

  // Filters state
  const [importantFilter, setImportantFilter] = useState<'all' | 'important'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');

  // TTN Auto Description setting toggle
  const [autoDescTtn, setAutoDescTtn] = useState(true);

  // Dynamic Column Settings
  const [showProductCol, setShowProductCol] = useState(true);
  const [showTtnNumberCol, setShowTtnNumberCol] = useState(true);
  const [showTtnStatusCol, setShowTtnStatusCol] = useState(true);

  // POS Cash Register simulation state
  const [posItems, setPosItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    { id: 'P1', name: 'Папір А4 80г (пачка)', price: 180, qty: 5 },
    { id: 'P2', name: 'Конверти крафт С6 (100 шт)', price: 120, qty: 2 }
  ]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
      const matchesImportant = importantFilter === 'all' || o.isImportant;
      const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
      return matchesSearch && matchesImportant && matchesPayment;
    });
  }, [orders, search, importantFilter, paymentFilter]);

  const getStageHeaderColor = (stage: Order['status']) => {
    switch (stage) {
      case 'design': return '#475569';
      case 'print_queue': return '#eab308';
      case 'printing': return '#f97316';
      case 'post_press': return '#6366f1';
      case 'ready': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const getStageLabel = (stage: Order['status']) => {
    switch (stage) {
      case 'design': return 'Черга макетування';
      case 'print_queue': return 'Черга друку';
      case 'printing': return 'У друці';
      case 'post_press': return 'Післядрукарська обробка';
      case 'ready': return 'Готово до видачі';
      default: return 'Закрито';
    }
  };

  const getTtnStatusLabel = (status?: string) => {
    if (!status) return 'Немає';
    switch (status) {
      case 'created': return 'Створено ЕН';
      case 'in_transit': return 'У дорозі';
      case 'arrived': return 'Прибуло';
      case 'received': return 'Отримано';
      case 'refused': return 'Відмова';
      default: return status;
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Покупець';
  };

  // Formula Evaluator Helper
  const evaluateFormula = (formula: string, values: Record<string, string | number>) => {
    try {
      let expr = formula;
      const regex = /\{([^}]+)\}/g;
      let match;
      while ((match = regex.exec(formula)) !== null) {
        const fieldName = match[1];
        const val = values[fieldName] !== undefined ? Number(values[fieldName]) : 0;
        expr = expr.replace(match[0], String(val));
      }
      if (/^[0-9+\-*/().\s]+$/.test(expr)) {
        const res = (0, eval)(expr);
        return typeof res === 'number' && !isNaN(res) ? res.toFixed(2) : '0.00';
      }
      return 'Некоректний вираз';
    } catch (e) {
      return 'Помилка';
    }
  };

  // SLA Overdue helper check
  const checkIsOverdue = (order: Order) => {
    if (!order.stageChangedAt || !order.stageChangedAt[order.status]) return false;
    const entryTime = new Date(order.stageChangedAt[order.status]).getTime();
    const now = new Date().getTime();
    const hoursSpent = (now - entryTime) / (1000 * 60 * 60);
    const limit = stageDurations[order.status] || 24;
    return hoursSpent > limit;
  };

  const getHoursOnStage = (order: Order) => {
    if (!order.stageChangedAt || !order.stageChangedAt[order.status]) return 0;
    const entryTime = new Date(order.stageChangedAt[order.status]).getTime();
    const now = new Date().getTime();
    return Math.floor((now - entryTime) / (1000 * 60 * 60));
  };

  // Manual Stock Write-off Action
  const handleManualWriteoff = (order: Order) => {
    const material = materials.find(m => m.type === order.paperType);
    if (!material) {
      alert('Не знайдено матеріалу на складі!');
      return;
    }

    if (material.quantity < order.physicalSheets) {
      alert('Недостатньо залишку на складі для списання!');
      return;
    }

    updateMaterialStock(material.id, material.quantity - order.physicalSheets);
    addSystemNotification(`📦 Ручне списання: Списано ${order.physicalSheets} арк. ${material.name} для угоди ${order.id}`);
    alert(`Матеріал ${material.name} (${order.physicalSheets} арк.) успішно списано зі складу!`);
  };

  // Manual Stock Return Action
  const handleManualReturn = (order: Order) => {
    const material = materials.find(m => m.type === order.paperType);
    if (!material) {
      alert('Не знайдено матеріалу на складі!');
      return;
    }

    updateMaterialStock(material.id, material.quantity + order.physicalSheets);
    addSystemNotification(`🔄 Ручне повернення: Повернуто ${order.physicalSheets} арк. ${material.name} з угоди ${order.id}`);
    alert(`Матеріал ${material.name} (${order.physicalSheets} арк.) повернуто на склад!`);
  };

  const handleToggleImportant = (order: Order) => {
    const updated = { ...order, isImportant: !order.isImportant };
    updateOrder(updated);
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(updated);
    }
  };

  // Duplicate material/product within order
  const handleDuplicateProductInOrder = (order: Order) => {
    const doubledSheets = order.physicalSheets * 2;
    const doubledSubtotal = order.subtotal * 2;
    const doubledPrice = order.finalPrice * 2;
    const updated = {
      ...order,
      physicalSheets: doubledSheets,
      subtotal: doubledSubtotal,
      finalPrice: doubledPrice,
      quantity: order.quantity * 2
    };
    updateOrder(updated);
    setSelectedOrder(updated);
    addSystemNotification(`📋 Дублювання: Подвоєно кількість товару в замовленні ${order.id}`);
    alert('Товар успішно продубльовано! Кількість та вартість оновлено.');
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Угоди та Продажі</h1>
          <p className="subtitle">Керування воронками дистрибуції, B2B друком та роздрібними POS-чеками</p>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', padding: '2px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setActivePipeline('b2b')}
            className="ios-btn"
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              borderRadius: '6px',
              backgroundColor: activePipeline === 'b2b' ? 'var(--primary)' : 'transparent',
              color: activePipeline === 'b2b' ? '#ffffff' : 'var(--text-dark)',
              fontWeight: activePipeline === 'b2b' ? '700' : '500'
            }}
          >
            B2B Воронка Друк
          </button>
          <button
            type="button"
            onClick={() => setActivePipeline('pos')}
            className="ios-btn"
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              borderRadius: '6px',
              backgroundColor: activePipeline === 'pos' ? 'var(--primary)' : 'transparent',
              color: activePipeline === 'pos' ? '#ffffff' : 'var(--text-dark)',
              fontWeight: activePipeline === 'pos' ? '700' : '500'
            }}
          >
            Каса Роздрібу (POS)
          </button>
        </div>
      </div>

      {activePipeline === 'b2b' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
          
          {/* Filters Panel */}
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-medium)' }} size={14} />
                <input 
                  placeholder="Пошук угоди..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '32px', height: '32px', fontSize: '12px', width: '100%', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ fontWeight: '750', color: 'var(--text-medium)' }}>Важливість:</span>
                <select 
                  value={importantFilter} 
                  onChange={(e) => setImportantFilter(e.target.value as any)}
                  style={{ height: '32px', fontSize: '11px', width: '120px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                >
                  <option value="all">Всі угоди</option>
                  <option value="important">⭐ Важливі (VIP)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ fontWeight: '750', color: 'var(--text-medium)' }}>Статус оплати:</span>
                <select 
                  value={paymentFilter} 
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  style={{ height: '32px', fontSize: '11px', width: '130px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                >
                  <option value="all">Всі оплати</option>
                  <option value="unpaid">Неоплачені</option>
                  <option value="partial">Частково</option>
                  <option value="paid">Оплачені</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '11px', borderTop: '1px solid var(--border-light)', paddingTop: '10px', color: 'var(--text-medium)' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-medium)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sliders size={12} />
                Поля картки:
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-dark)' }}>
                <input type="checkbox" checked={showProductCol} onChange={(e) => setShowProductCol(e.target.checked)} />
                Папір
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-dark)' }}>
                <input type="checkbox" checked={showTtnNumberCol} onChange={(e) => setShowTtnNumberCol(e.target.checked)} />
                ТТН
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-dark)' }}>
                <input type="checkbox" checked={showTtnStatusCol} onChange={(e) => setShowTtnStatusCol(e.target.checked)} />
                Статус ТТН
              </label>
            </div>
          </div>

          {/* Grid Layout of Pipeline Stages */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 370px' : '1fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', alignItems: 'flex-start' }}>
              {(['design', 'print_queue', 'printing', 'post_press', 'ready'] as Order['status'][]).map(stage => {
                const stageDeals = filteredOrders.filter(d => d.status === stage);
                const colSum = stageDeals.reduce((sum, d) => sum + d.finalPrice, 0);

                return (
                  <div 
                    key={stage}
                    style={{
                      minWidth: '240px',
                      width: '240px',
                      backgroundColor: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: 'calc(100vh - 220px)',
                      padding: '6px'
                    }}
                  >
                    {/* Stage Header */}
                    <div 
                      style={{
                        backgroundColor: getStageHeaderColor(stage),
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        marginBottom: '8px'
                      }}
                    >
                      <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>
                        {getStageLabel(stage)}
                      </h4>
                      <span style={{ fontSize: '9px', fontWeight: '600', opacity: 0.9 }}>
                        {stageDeals.length} шт. | {colSum.toLocaleString()} ₴
                      </span>
                    </div>

                    {/* Deal Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', minHeight: '120px' }}>
                      {stageDeals.length === 0 ? (
                        <div style={{ fontSize: '10px', color: 'var(--text-medium)', textAlign: 'center', padding: '20px 0' }}>
                          Немає угод
                        </div>
                      ) : (
                        stageDeals.map(deal => {
                          const isOverdue = checkIsOverdue(deal);
                          const hoursVal = getHoursOnStage(deal);
                          return (
                            <div 
                              key={deal.id}
                              onClick={() => setSelectedOrder(deal)}
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                border: selectedOrder?.id === deal.id ? '2px solid var(--primary)' : isOverdue ? '1.5px solid var(--danger)' : '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                cursor: 'pointer',
                                position: 'relative'
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {deal.id}
                                  {deal.isImportant && <Star size={10} style={{ fill: '#ffcc00', color: '#ffcc00' }} />}
                                </span>
                                {isOverdue ? (
                                  <span className="ios-badge ios-badge-red flex items-center gap-1" style={{ fontSize: '8px' }}>
                                    <Clock size={8} />
                                    SLA Увага ({hoursVal}г)
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '9px', color: 'var(--text-medium)' }}>
                                    {deal.createdAt.split('T')[0]}
                                  </span>
                                )}
                              </div>
                              
                              <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', lineHeight: '1.3' }}>
                                {deal.name}
                              </h4>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-medium)' }}>
                                <User size={10} />
                                <span>{getClientName(deal.clientId)}</span>
                              </div>

                              {showProductCol && (
                                <div style={{ fontSize: '10px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', padding: '4px 6px', borderRadius: '4px', marginTop: '2px', border: '1px solid var(--border-light)' }}>
                                  📦 Товар: {deal.paperType === 'offset' ? 'Офсет 70г' : deal.paperType === 'gazetka' ? 'Газетка' : 'Крейдований 130г'}
                                  {deal.totalMarkupPercent ? ` (+${deal.totalMarkupPercent}% нац)` : ''}
                                </div>
                              )}

                              {showTtnNumberCol && deal.ttnNumber && (
                                <div style={{ fontSize: '10px', color: 'var(--text-medium)' }}>
                                  🚚 ТТН: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>{deal.ttnNumber}</span>
                                </div>
                              )}

                              {showTtnStatusCol && deal.ttnStatus && (
                                <div>
                                  <span className="ios-badge ios-badge-purple" style={{ fontSize: '8px' }}>
                                    Статус ТТН: {getTtnStatusLabel(deal.ttnStatus)}
                                  </span>
                                </div>
                              )}

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)' }}>
                                  {deal.finalPrice.toLocaleString()} ₴
                                </span>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const stages: Order['status'][] = ['design', 'print_queue', 'printing', 'post_press', 'ready'];
                                    const idx = stages.indexOf(deal.status);
                                    if (idx < stages.length - 1) {
                                      const nextSt = stages[idx + 1];
                                      const allowed = transitionMatrix[deal.status] || [];
                                      if (allowed.length > 0 && !allowed.includes(nextSt)) {
                                        alert(`Перехід на етап "${getStageLabel(nextSt)}" заблоковано матрицею переходів!`);
                                        return;
                                      }
                                      updateOrderStatus(deal.id, nextSt);
                                    }
                                  }}
                                  className="ios-btn ios-btn-secondary ios-btn-small"
                                  style={{ padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '2px' }}
                                >
                                  <ArrowRight size={10} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Deal Side Details Panel */}
            {selectedOrder && (
              <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '20px' }}>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase' }}>Угода: {selectedOrder.id}</h3>
                  <button 
                    type="button" 
                    onClick={() => setSelectedOrder(null)} 
                    style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {checkIsOverdue(selectedOrder) && (
                  <div style={{
                    backgroundColor: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid rgba(255, 69, 58, 0.3)',
                    color: 'var(--danger)',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertTriangle size={14} />
                    Прострочено ліміт SLA етапу! ({getHoursOnStage(selectedOrder)} год на етапі)
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  
                  {/* VIP Important flag toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', padding: '8px', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '750', cursor: 'pointer', color: 'var(--text-dark)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedOrder.isImportant || false} 
                        onChange={() => handleToggleImportant(selectedOrder)} 
                      />
                      ⭐ Важлива угода (VIP)
                    </label>
                  </div>

                  {/* Calculated Margin display */}
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={14} style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dark)' }}>
                        Системна маржа угоди: <strong style={{ color: 'var(--success)', fontSize: '12px' }}>{selectedOrder.margin || 100}%</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFunnelGuideModal(true)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline bg-transparent border-0 cursor-pointer p-0"
                    >
                      Довідник воронки
                    </button>
                  </div>

                  {/* 🚀 DETAILED PIPELINE STAGE DESCRIPTION BOX */}
                  {(() => {
                    const stageInfo = PIPELINE_STAGES[selectedOrder.status] || PIPELINE_STAGES['design'];
                    return (
                      <div style={{
                        backgroundColor: stageInfo.bgColor,
                        borderColor: stageInfo.borderColor,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: stageInfo.color,
                            color: '#ffffff'
                          }}>
                            {stageInfo.badgeLabel}
                          </span>
                          <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={12} /> SLA: {stageInfo.slaHours} год
                          </span>
                        </div>

                        <h4 style={{ fontSize: '12.5px', fontWeight: '900', color: '#0f172a', margin: '2px 0 0 0' }}>
                          {stageInfo.label}
                        </h4>

                        <p style={{ fontSize: '11px', color: '#334155', lineHeight: '1.45', margin: 0 }}>
                          {stageInfo.fullDesc}
                        </p>

                        <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '8px', border: '1px solid rgba(203, 213, 225, 0.7)' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                            🎯 Необхідна дія для переходу:
                          </span>
                          <p style={{ fontSize: '10.5px', color: '#334155', margin: 0, lineHeight: '1.35' }}>
                            {stageInfo.actionRequired}
                          </p>
                        </div>

                        {/* Checklist */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase' }}>
                            Чекліст етапу:
                          </span>
                          {stageInfo.checklist.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '10.5px', color: '#334155' }}>
                              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(203, 213, 225, 0.7)', paddingTop: '6px', marginTop: '2px', fontSize: '10px', color: '#64748b' }}>
                          <span>Відповідальний: <strong style={{ color: '#0f172a' }}>{stageInfo.responsible}</strong></span>
                        </div>

                        {/* Quick Step Switcher */}
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                            Перевести на інший етап:
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                            {(['design', 'print_queue', 'printing', 'post_press', 'ready'] as Order['status'][]).map((stKey, idx) => {
                              const isCur = selectedOrder.status === stKey;
                              const stObj = PIPELINE_STAGES[stKey];
                              return (
                                <button
                                  key={stKey}
                                  type="button"
                                  onClick={() => {
                                    updateOrderStatus(selectedOrder.id, stKey);
                                    const updated = { ...selectedOrder, status: stKey };
                                    setSelectedOrder(updated);
                                    addSystemNotification(`🔄 Угода ${selectedOrder.id}: переведено на етап "${stObj.label}"`);
                                  }}
                                  style={{
                                    padding: '5px 2px',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    border: isCur ? 'none' : '1px solid #cbd5e1',
                                    backgroundColor: isCur ? '#0f172a' : '#ffffff',
                                    color: isCur ? '#ffffff' : '#334155',
                                    textAlign: 'center'
                                  }}
                                  title={stObj.label}
                                >
                                  {idx + 1}. {stKey === 'design' ? 'Макет' : stKey === 'print_queue' ? 'Черга' : stKey === 'printing' ? 'Друк' : stKey === 'post_press' ? 'Пост' : 'Готово'}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  <div>
                    <span style={{ color: 'var(--text-medium)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Назва замовлення</span>
                    <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-dark)', margin: 0 }}>{selectedOrder.name}</p>
                  </div>

                  {/* Change Client dropdown inside the deal specification */}
                  <div>
                    <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Змінити замовника угоди</label>
                    <select
                      value={selectedOrder.clientId}
                      onChange={(e) => {
                        const updated = { ...selectedOrder, clientId: e.target.value };
                        updateOrder(updated);
                        setSelectedOrder(updated);
                        addSystemNotification(`👤 Угода ${selectedOrder.id}: Змінено замовника на "${getClientName(e.target.value)}"`);
                      }}
                      style={{ height: '34px', minHeight: '34px', fontSize: '12.5px', padding: '4px 10px', backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                    >
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Manual Stock Returns, Writeoffs, and Total Order Markup percentage */}
                  <div style={{ border: '1px solid var(--border-light)', padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card-subtle)' }}>
                    <span style={{ color: 'var(--text-medium)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Контроль складу та націнки (Товари)
                    </span>
                    <p style={{ fontSize: '11px', marginBottom: '8px', color: 'var(--text-dark)' }}>
                      Папір: <strong style={{ color: 'var(--text-dark)' }}>{selectedOrder.paperType === 'offset' ? 'Офсетний' : selectedOrder.paperType === 'gazetka' ? 'Газетний' : 'Крейдований'}</strong> ({selectedOrder.physicalSheets} арк.)
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleManualWriteoff(selectedOrder)}
                        className="ios-btn ios-btn-secondary ios-btn-small"
                        style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', border: 'none', justifyContent: 'center' }}
                      >
                        <Archive size={12} />
                        Списати
                      </button>
                      <button
                        type="button"
                        onClick={() => handleManualReturn(selectedOrder)}
                        className="ios-btn ios-btn-secondary ios-btn-small"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: 'none', justifyContent: 'center' }}
                      >
                        <RotateCcw size={12} />
                        Повернути
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDuplicateProductInOrder(selectedOrder)}
                      className="ios-btn ios-btn-secondary ios-btn-small w-full mb-3"
                      style={{ display: 'flex', gap: '4px', justifyContent: 'center', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                    >
                      <Copy size={12} />
                      Дублювати товар у замовленні
                    </button>

                    <div className="ios-input-group" style={{ marginBottom: 0 }}>
                      <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Загальна націнка на товари (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedOrder.totalMarkupPercent || 0}
                        onChange={(e) => {
                          const markupVal = Number(e.target.value);
                          const subWithMarkup = selectedOrder.subtotal * (1 + markupVal / 100);
                          const updated = {
                            ...selectedOrder,
                            totalMarkupPercent: markupVal,
                            finalPrice: Number((subWithMarkup + selectedOrder.designCost).toFixed(2))
                          };
                          updateOrder(updated);
                          setSelectedOrder(updated);
                        }}
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                  </div>

                  {/* Custom fields */}
                  {customFields.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span style={{ color: 'var(--text-medium)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Користувацькі поля
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {customFields.map(cf => {
                          let displayVal = selectedOrder.customFieldValues?.[cf.name] || '—';
                          if (cf.type === 'formula' && cf.formulaExpression) {
                            displayVal = evaluateFormula(cf.formulaExpression, selectedOrder.customFieldValues || {});
                          }
                          return (
                            <div key={cf.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                              <span style={{ color: 'var(--text-medium)' }}>{cf.name}:</span>
                              <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{displayVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TTN Logistics panel */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-medium)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Логістика (Нова Пошта)
                    </span>
                    <div className="ios-input-group">
                      <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Номер ЕН (ТТН)</label>
                      <input 
                        value={selectedOrder.ttnNumber || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = { 
                            ...selectedOrder, 
                            ttnNumber: val
                          };
                          if (autoDescTtn) {
                            addSystemNotification(`🚚 ТТН Опис: ${selectedOrder.name} (${selectedOrder.quantity} шт) автоматично додано до супровідних документів.`);
                          }
                          updateOrder(updated);
                          setSelectedOrder(updated);
                        }}
                        placeholder="Введіть номер ТТН..."
                        style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginTop: '6px', cursor: 'pointer', color: 'var(--text-dark)' }}>
                      <input 
                        type="checkbox" 
                        checked={autoDescTtn} 
                        onChange={(e) => setAutoDescTtn(e.target.checked)} 
                      />
                      Автоматичний опис товарів у накладну
                    </label>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-medium)' }}>Сума бюджету:</span>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>{selectedOrder.finalPrice.toLocaleString()} ₴</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* POS Cart list */}
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', margin: 0 }}>
              Чек POS Терміналу
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {posItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-light)', padding: '10px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)' }}>
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-dark)', margin: 0 }}>{item.name}</h4>
                    <span style={{ fontSize: '10px', color: 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>
                      {item.price} ₴ × {item.qty} од.
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>
                      {(item.price * item.qty).toLocaleString()} ₴
                    </span>
                    <button 
                      type="button"
                      onClick={() => setPosItems(posItems.filter(i => i.id !== item.id))}
                      style={{ border: 'none', background: 'transparent', color: 'var(--danger)', display: 'flex', cursor: 'pointer' }}
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={() => {
                const name = prompt('Введіть назву товару:');
                const price = Number(prompt('Введіть ціну:'));
                if (!name || !price) return;
                setPosItems([...posItems, { id: `POS-${Date.now().toString().slice(-3)}`, name, price, qty: 1 }]);
              }}
              className="ios-btn ios-btn-secondary"
              style={{ width: '100%' }}
            >
              <Plus size={12} />
              Додати товар у чек
            </button>
          </div>

          {/* POS Summary panel */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', color: 'var(--text-medium)', margin: 0 }}>
              Касовий звіт
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-medium)' }}>
                <span>Усього товарів</span>
                <span style={{ color: 'var(--text-dark)' }}>{posItems.reduce((sum, i) => sum + i.qty, 0)} од.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-medium)' }}>Разом до сплати</span>
                <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                  {posItems.reduce((sum, i) => sum + (i.price * i.qty), 0).toLocaleString()} ₴
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('Продаж проведено по касі Checkbox, фіскальний чек надруковано.');
                setPosItems([]);
              }}
              disabled={posItems.length === 0}
              className="ios-btn ios-btn-primary"
              style={{
                width: '100%',
                opacity: posItems.length === 0 ? 0.4 : 1
              }}
            >
              Провести оплату
            </button>
          </div>
        </div>
      )}
    
      {/* 📖 FULL SALES & PRODUCTION PIPELINE GUIDE MODAL */}
      {showFunnelGuideModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  📊 Довідник усіх етапів воронки продажів та виробництва
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Стандартні операційні процедури (SOP) друкарні «Едельвейс і К»
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFunnelGuideModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(['design', 'print_queue', 'printing', 'post_press', 'ready'] as Order['status'][]).map(stKey => {
                const st = PIPELINE_STAGES[stKey];
                return (
                  <div
                    key={stKey}
                    style={{
                      backgroundColor: st.bgColor,
                      border: `1px solid ${st.borderColor}`,
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: st.color,
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: '900',
                          padding: '3px 10px',
                          borderRadius: '6px'
                        }}>
                          Етап {st.stepNumber}: {st.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> Нормативний SLA: {st.slaHours} год
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.5', margin: 0 }}>
                      {st.fullDesc}
                    </p>

                    <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid rgba(203, 213, 225, 0.6)' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                        🎯 Необхідна дія для переходу:
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#334155' }}>
                        {st.actionRequired}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px', marginTop: '4px' }}>
                      {st.checklist.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155' }}>
                          <span style={{ color: '#16a34a', fontWeight: '900' }}>✓</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(203, 213, 225, 0.6)', paddingTop: '6px', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                      Відповідальна посада: <strong style={{ color: '#0f172a' }}>{st.responsible}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => setShowFunnelGuideModal(false)}
                className="ios-btn ios-btn-primary"
                style={{ padding: '0 20px', height: '36px', fontSize: '12px', fontWeight: '800' }}
              >
                Зрозуміло
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
