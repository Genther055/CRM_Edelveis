import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Info,
  FileText,
  Download,
  Eye,
  Kanban
} from 'lucide-react';
import type { Order } from '../types';
import html2pdf from 'html2pdf.js';

export const Production: React.FC = () => {
  const { orders, clients, updateOrderStatus, updateOrderPayment, currentUser } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'kanban' | 'naryady'>('kanban');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderForPDF, setSelectedOrderForPDF] = useState<Order | null>(null);
  
  // Payment edit state
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('unpaid');
  const [prepayment, setPrepayment] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const role = currentUser?.role || 'operator';
  const isOperator = role === 'operator';
  const canManagePayment = ['admin', 'manager'].includes(role);

  // Kanban Columns
  const columns: { id: Order['status']; title: string; color: string }[] = [
    { id: 'design', title: 'Дизайн & Макети', color: 'var(--indigo)' },
    { id: 'print_queue', title: 'Черга друку', color: 'var(--primary)' },
    { id: 'printing', title: 'Друк', color: 'var(--teal)' },
    { id: 'post_press', title: 'Післядрук (Порізка)', color: 'var(--warning)' },
    { id: 'ready', title: 'Готово до видачі', color: 'var(--success)' }
  ];

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('orderId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Order['status']) => {
    const id = e.dataTransfer.getData('orderId');
    if (id) {
      updateOrderStatus(id, targetStatus);
    }
  };

  const moveOrder = (id: string, currentStatus: Order['status'], direction: 'left' | 'right') => {
    const statusOrder: Order['status'][] = ['design', 'print_queue', 'printing', 'post_press', 'ready'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    let newIndex = currentIndex;
    
    if (direction === 'left' && currentIndex > 0) newIndex--;
    if (direction === 'right' && currentIndex < statusOrder.length - 1) newIndex++;
    
    if (newIndex !== currentIndex) {
      updateOrderStatus(id, statusOrder[newIndex]);
    }
  };

  const handleOpenPaymentModal = (order: Order) => {
    if (!canManagePayment) return;
    setSelectedOrder(order);
    setPaymentStatus(order.paymentStatus);
    setPrepayment(order.prepayment);
    setShowPaymentModal(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder) {
      updateOrderPayment(selectedOrder.id, paymentStatus, Number(prepayment) || 0);
      setShowPaymentModal(false);
      setSelectedOrder(null);
    }
  };

  const generateWorkOrderPDF = (order: Order) => {
    const element = document.getElementById(`work-order-print-${order.id}`);
    if (!element) return;

    const activeClient = clients.find(c => c.id === order.clientId);

    const matchNum = (order.name || '').match(/№\s*(\d+)/);
    const num = matchNum ? matchNum[1] : (order.id || '33811');

    let rawProd = order.category || 'Бланки';
    if (!order.category || (order.category as string) === 'Основна' || (order.category as string).includes('Угода')) {
      if ((order.name || '').toLowerCase().includes('бланк')) {
        rawProd = 'Бланки';
      } else if ((order.name || '').toLowerCase().includes('листівк')) {
        rawProd = 'Листівки';
      } else {
        rawProd = 'Бланки';
      }
    }
    const safeProdName = rawProd.replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_');

    const rawClient = activeClient?.name || 'Замовник №1';
    const safeClientName = rawClient.replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_');

    const paperShort = order.paperType === 'offset' ? 'Офс._70г' : order.paperType === 'gazetka' ? 'Газ._45г' : 'Крейда_130г';
    const turnShort = order.isSamNaSebe ? 'сс' : 'без_обор';

    const fileName = `№${num}_${safeProdName}_—_${safeClientName}_(${order.format || 'A4'},_${paperShort},_${order.colors || '1+0'},_${turnShort},_${order.quantity || 1000}_шт.).pdf`;

    const opt = {
      margin:       10,
      filename:     fileName,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Title Header */}
      <div className="header-title-container">
        <div>
          <h2 className="page-title">Управління виробництвом</h2>
          <p className="subtitle">Супроводження поліграфічних тиражів та техкарт робіт</p>
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <div style={{
        display: 'flex',
        backgroundColor: 'rgba(120, 120, 128, 0.12)',
        padding: '3px',
        borderRadius: '8px',
        marginBottom: '16px',
        alignSelf: 'flex-start'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('kanban')}
          className="ios-btn"
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeSubTab === 'kanban' ? '#ffffff' : 'transparent',
            color: 'var(--text-dark)',
            boxShadow: activeSubTab === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            fontWeight: activeSubTab === 'kanban' ? '700' : '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Kanban size={14} />
          <span>Канбан-дошка робіт</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('naryady')}
          className="ios-btn"
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeSubTab === 'naryady' ? '#ffffff' : 'transparent',
            color: 'var(--text-dark)',
            boxShadow: activeSubTab === 'naryady' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            fontWeight: activeSubTab === 'naryady' ? '700' : '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={14} />
          <span>База нарядів на виробництво ({orders.length})</span>
        </button>
      </div>

      {activeSubTab === 'kanban' && (
        <>
          {/* Drag & Drop instruction bar */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '10px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            border: '0.5px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-medium)'
          }}>
            <Info size={16} style={{ color: 'var(--primary)' }} />
            <span>
              {isOperator 
                ? 'Ви можете пересувати замовлення по етапах верстатів за допомогою стрілок на картках.'
                : 'Перетягуйте замовлення (Drag & Drop) між колонками або використовуйте стрілки на картках для швидкої зміни статусів.'
              }
            </span>
          </div>

          {/* Kanban Board Container */}
          <div className="kanban-board" style={{ flexGrow: 1 }}>
            {columns.map(col => {
              const colOrders = orders.filter(o => o.status === col.id);
              return (
                <div 
                  key={col.id} 
                  className="kanban-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="kanban-column-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: col.color 
                      }} />
                      <span className="kanban-column-title">{col.title}</span>
                    </div>
                    <span className="kanban-column-count">{colOrders.length}</span>
                  </div>

                  {colOrders.map(order => {
                    const client = clients.find(c => c.id === order.clientId);
                    return (
                      <div 
                        key={order.id} 
                        className="kanban-card"
                        draggable={!isOperator}
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        style={{ position: 'relative' }}
                      >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-medium)', fontWeight: '700', fontFamily: 'monospace' }}>
                            {order.id}
                          </span>
                          <span className="ios-badge ios-badge-blue" style={{ fontSize: '9px' }}>
                            {order.machine}
                          </span>
                        </div>

                        {/* Order Name & Details */}
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-dark)', marginBottom: '4px' }}>
                            {order.name}
                          </h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.8 }}>
                            {order.quantity.toLocaleString()} шт • {order.format} • {order.colors}
                          </p>
                          {order.notes && (
                            <p style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', marginTop: '4px' }}>
                              📝 {order.notes}
                            </p>
                          )}
                        </div>

                        {/* Client Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-medium)' }}>
                          <User size={12} />
                          <span>{client ? client.name : 'Контрагент відсутній'}</span>
                        </div>

                        {/* Financial summary & Payment Badge */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          borderTop: '0.5px solid var(--border-light)',
                          paddingTop: '8px',
                          marginTop: '4px'
                        }}>
                          <div>
                            <span style={{ fontSize: '10px', color: '#8e8e93', display: 'block' }}>Сума замовлення:</span>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)' }}>
                              {order.finalPrice.toLocaleString()} ₴
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(order)}
                            className={`ios-badge ${
                              order.paymentStatus === 'paid' ? 'ios-badge-green' :
                              order.paymentStatus === 'partial' ? 'ios-badge-orange' : 'ios-badge-red'
                            }`}
                            style={{ cursor: canManagePayment ? 'pointer' : 'default', border: 'none' }}
                          >
                            {order.paymentStatus === 'paid' ? 'Оплачено' :
                             order.paymentStatus === 'partial' ? `Аванс ${order.prepayment} ₴` : 'Неоплачено'}
                          </button>
                        </div>

                        {/* Stage Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => moveOrder(order.id, order.status, 'left')}
                            disabled={order.status === 'design'}
                            className="ios-btn ios-btn-secondary ios-btn-small"
                            style={{ padding: '2px 6px', opacity: order.status === 'design' ? 0.3 : 1 }}
                          >
                            <ChevronLeft size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderForPDF(order)}
                            className="ios-btn ios-btn-secondary ios-btn-small"
                            style={{ fontSize: '10px', padding: '2px 8px' }}
                          >
                            <FileText size={12} />
                            Наряд
                          </button>

                          <button
                            type="button"
                            onClick={() => moveOrder(order.id, order.status, 'right')}
                            disabled={order.status === 'ready'}
                            className="ios-btn ios-btn-secondary ios-btn-small"
                            style={{ padding: '2px 6px', opacity: order.status === 'ready' ? 0.3 : 1 }}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Production Work Orders Database Sub-tab */}
      {activeSubTab === 'naryady' && (
        <div className="ios-card bg-white" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)' }}>
                Реєстр виробничих нарядів (Технологічні карти)
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-medium)', opacity: 0.7 }}>
                Всі наряди, сформовані калькулятором та додані у виробництво
              </p>
            </div>
            <span className="ios-badge ios-badge-blue">
              Всього: {orders.length} нарядів
            </span>
          </div>

          <div className="ios-table-container">
            <table className="ios-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>№ Наряду</th>
                  <th>Назва замовлення / Продукція</th>
                  <th>Замовник</th>
                  <th>Тираж / Формат</th>
                  <th>Специфікація та папір</th>
                  <th style={{ textAlign: 'right' }}>Вартість</th>
                  <th style={{ width: '120px' }}>Статус</th>
                  <th style={{ width: '180px', textAlign: 'center' }}>Дії з нарядом</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#8e8e93' }}>
                      Наразі немає сформованих виробничих нарядів
                    </td>
                  </tr>
                
                ) : (
                  orders.map(order => {
                    const client = clients.find(c => c.id === order.clientId);
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>#{order.id}</td>
                        <td>
                          <strong style={{ color: 'var(--text-dark)', display: 'block' }}>{order.name}</strong>
                          <span className="ios-badge ios-badge-purple mt-1">{order.category}</span>
                        </td>
                        <td>{client ? client.name : '—'}</td>
                        <td>
                          <strong>{order.quantity.toLocaleString()} шт</strong>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>{order.format} ({order.colors})</span>
                        </td>
                        <td style={{ fontSize: '11px', color: '#475569' }}>
                          <div>Папір: {order.paperType}</div>
                          {order.notes && <div style={{ color: 'var(--primary)', fontWeight: '600' }}>{order.notes}</div>}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--primary)' }}>
                          {order.finalPrice.toLocaleString()} ₴
                        </td>
                        <td>
                          <span className="ios-badge ios-badge-blue">
                            {order.status === 'design' ? 'Дизайн' :
                             order.status === 'print_queue' ? 'Черга' :
                             order.status === 'printing' ? 'Друк' :
                             order.status === 'post_press' ? 'Післядрук' : 'Готово'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForPDF(order)}
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <Eye size={12} />
                              <span>Перегляд</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForPDF(order)}
                              className="ios-btn ios-btn-primary ios-btn-small"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <Download size={12} />
                              <span>PDF</span>
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
        </div>
      )}

      {/* Payment Edit Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleSavePayment} className="ios-modal" style={{ maxWidth: '400px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Оплата замовлення #{selectedOrder.id}</h3>
              <button type="button" onClick={() => setShowPaymentModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Статус оплати</label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)}>
                  <option value="unpaid">Неоплачено</option>
                  <option value="partial">Часткова передплата</option>
                  <option value="paid">Оплачено повністю</option>
                </select>
              </div>

              {paymentStatus === 'partial' && (
                <div className="ios-input-group">
                  <label className="ios-label">Сума авансу / передплати (грн)</label>
                  <input type="number" min="0" value={prepayment} onChange={(e) => setPrepayment(Number(e.target.value))} />
                </div>
              )}
            </div>
            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowPaymentModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти</button>
            </div>
          </form>
        </div>
      )}

      {/* Work Order PDF Modal & Printable Preview - Full ERP Specification Design */}
      {selectedOrderForPDF && (
        <div className="ios-modal-overlay">
          <div className="ios-modal" style={{ maxWidth: '760px', width: '95%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div className="ios-modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="ios-modal-title" style={{ color: 'var(--text-dark)' }}>📄 Рахунок-Специфікація замовлення № {selectedOrderForPDF.id}</h3>
              <button type="button" onClick={() => setSelectedOrderForPDF(null)} style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" style={{ padding: '20px' }}>
              {/* Printable PDF Template Box - High Contrast Pure Light Canvas */}
              <div id={`work-order-print-${selectedOrderForPDF.id}`} style={{
                backgroundColor: '#ffffff',
                padding: '28px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                color: '#1c1c1e',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '11px',
                lineHeight: '1.4'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1c1c1e', paddingBottom: '12px', marginBottom: '16px', gap: '16px' }}>
                  <div style={{ flexShrink: 0 }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, color: '#1c1c1e' }}>РАХУНОК-СПЕЦИФІКАЦІЯ № {selectedOrderForPDF.id}</h4>
                    <p style={{ fontSize: '11px', color: '#636366', margin: '2px 0 0 0' }}>Поліграфічна компанія «Едельвейс і К»</p>
                  </div>
                  <div style={{ textAlign: 'right', flexGrow: 1, minWidth: '220px', backgroundColor: '#f8fafc', padding: '8px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', margin: 0, color: '#1c1c1e' }}>Дата: {selectedOrderForPDF.createdAt}</p>
                    <p style={{ fontSize: '12px', color: '#636366', margin: '4px 0 0 0', fontWeight: '600' }}>
                      Покупець (Замовник): <span style={{ fontWeight: '800', color: '#007aff', fontSize: '13px' }}>{clients.find(c => c.id === selectedOrderForPDF.clientId)?.name || 'Клієнт'}</span>
                    </p>
                  </div>
                </div>

                {/* Шапка наряду-замовлення (Паспорт виробництва) */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Замовник: </span>
                      <strong style={{ color: '#0f172a' }}>{clients.find(c => c.id === selectedOrderForPDF.clientId)?.name || 'Клієнт'}</strong>
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Продукція: </span>
                      <strong style={{ color: '#0f172a' }}>{selectedOrderForPDF.name}</strong>
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Відповідальний менеджер: </span>
                      <strong style={{ color: '#0f172a' }}>{selectedOrderForPDF.createdBy || 'Менеджер'}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                    <div style={{ fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Тираж: </span>
                      <strong style={{ color: '#2563eb', fontSize: '13px' }}>{selectedOrderForPDF.quantity.toLocaleString()} шт.</strong>
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Дата прийому: </span>
                      <strong style={{ color: '#0f172a' }}>{selectedOrderForPDF.createdAt}</strong>
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Здача (Дедлайн): </span>
                      <strong style={{ color: '#d97706' }}>{selectedOrderForPDF.deadline || '1-2 роб. дні'}</strong>
                    </div>
                  </div>
                </div>

                {/* 1. Блок «МАТЕРІАЛИ» */}
                <div style={{ marginBottom: '14px' }}>
                  <h5 style={{ fontSize: '10px', fontWeight: '800', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px', color: '#1e293b', textTransform: 'uppercase', margin: 0 }}>
                    1. МАТЕРІАЛИ ТА ПАПІР ЗІ СКЛАДУ
                  </h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '5px 8px' }}>Матеріал / Папір</th>
                        <th style={{ padding: '5px 8px' }}>Формат сировини</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>Чистий наклад</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>Приладка</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center' }}>Тех. відходи</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right' }}>Фактично зі складу</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{ padding: '6px 8px', fontWeight: '700', color: '#0f172a' }}>{selectedOrderForPDF.paperName || (selectedOrderForPDF.paperType === 'offset' ? 'Офсетний 70г' : 'Крейдований 130г')}</td>
                        <td style={{ padding: '6px 8px', color: '#334155' }}>{selectedOrderForPDF.sheetSize || selectedOrderForPDF.format || 'SRA3 (320×450 мм)'}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700' }}>{selectedOrderForPDF.physicalSheets} арк.</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b' }}>{selectedOrderForPDF.priladkaSheets || (selectedOrderForPDF.isSamNaSebe ? 30 : 20)} арк.</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b' }}>{selectedOrderForPDF.techWasteSheets || Math.ceil(selectedOrderForPDF.physicalSheets * 0.04)} арк.</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '900', color: '#2563eb' }}>
                          {selectedOrderForPDF.totalGrossSheets || (selectedOrderForPDF.physicalSheets + (selectedOrderForPDF.priladkaSheets || 20) + (selectedOrderForPDF.techWasteSheets || 4))} арк.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Блок «ДРУК» (ПЕЧАТЬ) */}
                <div style={{ marginBottom: '14px' }}>
                  <h5 style={{ fontSize: '10px', fontWeight: '800', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px', color: '#1e293b', textTransform: 'uppercase', margin: 0 }}>
                    2. ДРУК (ДРУКАРСЬКА МАШИНА ТА ПАРАМЕТРИ)
                  </h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '5px 6px' }}>Обладнання</th>
                        <th style={{ padding: '5px 6px' }}>Папір</th>
                        <th style={{ padding: '5px 6px' }}>Розмір, мм</th>
                        <th style={{ padding: '5px 6px' }}>Красочність</th>
                        <th style={{ padding: '5px 6px', textAlign: 'center' }}>Шт/арк</th>
                        <th style={{ padding: '5px 6px', textAlign: 'center' }}>Друк. лист.</th>
                        <th style={{ padding: '5px 6px', textAlign: 'center' }}>Приладка</th>
                        <th style={{ padding: '5px 6px', textAlign: 'center' }}>Тех. відходи</th>
                        <th style={{ padding: '5px 6px', textAlign: 'center' }}>В друк</th>
                        <th style={{ padding: '5px 6px', textAlign: 'center' }}>Оборот</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{ padding: '6px 6px', fontWeight: '700', color: '#0f172a' }}>{selectedOrderForPDF.machine}</td>
                        <td style={{ padding: '6px 6px', color: '#334155' }}>{selectedOrderForPDF.paperName || '130 г/м²'}</td>
                        <td style={{ padding: '6px 6px', color: '#334155' }}>{selectedOrderForPDF.sheetSize || selectedOrderForPDF.format}</td>
                        <td style={{ padding: '6px 6px', fontWeight: '800', color: '#c2410c' }}>{selectedOrderForPDF.colors}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: '700' }}>{selectedOrderForPDF.itemsPerSheet}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontFamily: 'monospace' }}>{selectedOrderForPDF.physicalSheets}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b' }}>{selectedOrderForPDF.priladkaSheets || (selectedOrderForPDF.isSamNaSebe ? 30 : 20)}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b' }}>{selectedOrderForPDF.techWasteSheets || Math.ceil(selectedOrderForPDF.physicalSheets * 0.04)}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '800', color: '#2563eb' }}>
                          {selectedOrderForPDF.totalGrossSheets || (selectedOrderForPDF.physicalSheets + (selectedOrderForPDF.priladkaSheets || 20) + (selectedOrderForPDF.techWasteSheets || 4))}
                        </td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                          {selectedOrderForPDF.turnTypeLabel || (selectedOrderForPDF.isSamNaSebe ? 'с/с' : 'б/о')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Блок «ДОДРУКАРСЬКИЙ ПРОЦЕС» */}
                <div style={{ marginBottom: '14px' }}>
                  <h5 style={{ fontSize: '10px', fontWeight: '800', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px', color: '#1e293b', textTransform: 'uppercase', margin: 0 }}>
                    3. ДОДРУКАРСЬКИЙ ПРОЦЕС (CTP ФОРМИ ТА СПУСК СМУГ)
                  </h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '5px 8px', width: '8%' }}>№ п/п</th>
                        <th style={{ padding: '5px 8px', width: '60%' }}>Технологічна операція</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: '20%' }}>Кількість</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: '12%' }}>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '5px 8px', color: '#64748b' }}>1</td>
                        <td style={{ padding: '5px 8px', fontWeight: '600' }}>Перевірка макету, калібрування та спуск смуг ({selectedOrderForPDF.format})</td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace' }}>1 спуск</td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>Готово</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', color: '#64748b' }}>2</td>
                        <td style={{ padding: '5px 8px', fontWeight: '600' }}>Виведення офсетних CTP форм / термопластин</td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700' }}>
                          {selectedOrderForPDF.platesCount || (selectedOrderForPDF.colors === '4+4' ? (selectedOrderForPDF.isSamNaSebe ? 4 : 8) : selectedOrderForPDF.colors === '4+0' ? 4 : 2)} пластин
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#2563eb', fontWeight: '700' }}>До друку</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. Блок «ПІСЛЯДРУКАРСЬКИЙ ПРОЦЕС ТА ФАСУВАННЯ» */}
                <div style={{ marginBottom: '14px' }}>
                  <h5 style={{ fontSize: '10px', fontWeight: '800', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px', color: '#1e293b', textTransform: 'uppercase', margin: 0 }}>
                    4. ПІСЛЯДРУКАРСЬКИЙ ПРОЦЕС ТА УПАКОВКА
                  </h5>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '5px 8px', width: '6%' }}>№</th>
                        <th style={{ padding: '5px 8px', width: '44%' }}>Операція післядруку / фасування</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: '22%' }}>Обсяг робіт</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: '16%' }}>Прізвище майстра</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center', width: '12%' }}>Час виконання</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderForPDF.postpressOps && selectedOrderForPDF.postpressOps.length > 0 ? (
                        selectedOrderForPDF.postpressOps.map((op, opIdx) => (
                          <tr key={opIdx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '5px 8px', color: '#64748b' }}>{opIdx + 1}</td>
                            <td style={{ padding: '5px 8px', fontWeight: '600', color: '#0f172a' }}>{op.name}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700' }}>{op.qty}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', color: '#94a3b8' }}>____________</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', color: '#94a3b8' }}>__:__</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '5px 8px', color: '#64748b' }}>1</td>
                            <td style={{ padding: '5px 8px', fontWeight: '600', color: '#0f172a' }}>Порізка тиражу в готовий розмір ({selectedOrderForPDF.format})</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700' }}>{selectedOrderForPDF.quantity.toLocaleString()} шт</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', color: '#94a3b8' }}>____________</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', color: '#94a3b8' }}>__:__</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '5px 8px', color: '#64748b' }}>2</td>
                            <td style={{ padding: '5px 8px', fontWeight: '600', color: '#0f172a' }}>Фасування та пакування продукції</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700' }}>{selectedOrderForPDF.packingInfo || `по ${selectedOrderForPDF.packingCount || 100} шт`}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', color: '#94a3b8' }}>____________</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', color: '#94a3b8' }}>__:__</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 5. Фінансовий блок та Відмітки цеху */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', borderTop: '2px dashed #cbd5e1', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#475569' }}>
                    <div>Менеджер: <strong style={{ color: '#0f172a' }}>{selectedOrderForPDF.createdBy || 'Менеджер'}</strong> (підпис: ______________)</div>
                    <div>Друкар (оператор): __________________ (підпис: ______________)</div>
                    <div>Майстер післядруку: ________________ (підпис: ______________)</div>
                    <div>Контролер якості (ВТК): ______________ (підпис: ______________)</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Собівартість виробництва: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{(selectedOrderForPDF.subtotal || 0).toFixed(2)} ₴</strong></span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Ціна за 1 шт для клієнта: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{(selectedOrderForPDF.unitPrice || 0).toFixed(2)} ₴ / шт</strong></span>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>Сума замовлення: </span>
                      <strong style={{ fontSize: '16px', color: '#2563eb', fontFamily: 'monospace' }}>{selectedOrderForPDF.finalPrice.toLocaleString()} ₴</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ios-modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button type="button" onClick={() => setSelectedOrderForPDF(null)} className="ios-btn ios-btn-secondary">Закрити</button>
              <button type="button" onClick={() => generateWorkOrderPDF(selectedOrderForPDF)} className="ios-btn ios-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} />
                Завантажити PDF Специфікацію
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
