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

                {/* Product Specification & Quantity Banner */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#636366', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Продукція / Специфікація</span>
                    <p style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#1c1c1e' }}>{selectedOrderForPDF.name}</p>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'right' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#636366', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Тираж замовлення</span>
                    <p style={{ fontSize: '14px', fontWeight: '900', margin: 0, color: '#007aff' }}>{selectedOrderForPDF.quantity.toLocaleString()} шт.</p>
                  </div>
                </div>

                {/* 1. Матеріали та сировина */}
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px', color: '#007aff', textTransform: 'uppercase', margin: 0 }}>
                    1. МАТЕРІАЛИ ТА СИРОВИНА
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Матеріал паперу:</span>
                      <strong style={{ fontSize: '11px', color: '#1c1c1e' }}>
                        {selectedOrderForPDF.paperType === 'offset' ? 'Офсетний 70г' : selectedOrderForPDF.paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Розмір друкарського листа:</span>
                      <strong style={{ fontSize: '11px', color: '#1c1c1e' }}>
                        {selectedOrderForPDF.format === 'A1' ? 'A1 (594×841 мм)' : selectedOrderForPDF.format === 'A2' ? 'A2 (420×594 мм)' : 'A3 (297×420 мм)'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Обсяг матеріалу:</span>
                      <strong style={{ fontSize: '11px', color: '#1c1c1e' }}>
                        {selectedOrderForPDF.physicalSheets} арк. (+{Math.ceil(selectedOrderForPDF.physicalSheets * 0.05)} тех. відх.)
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. Процес друку */}
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px', color: '#007aff', textTransform: 'uppercase', margin: 0 }}>
                    2. ПРОЦЕС ДРУКУ (ДРУКАРСЬКА МАШИНА & ПАРАМЕТРИ)
                  </h5>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 12px', color: '#636366', width: '35%' }}>Друкарська машина:</td>
                          <td style={{ padding: '6px 12px', fontWeight: '800', color: '#1c1c1e', width: '25%' }}>{selectedOrderForPDF.machine}</td>
                          <td style={{ padding: '6px 12px', color: '#636366', width: '25%' }}>Красочність (кольоровість):</td>
                          <td style={{ padding: '6px 12px', fontWeight: '800', color: '#1c1c1e', width: '15%' }}>{selectedOrderForPDF.colors}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 12px', color: '#636366' }}>Однотипних листів (на арк):</td>
                          <td style={{ padding: '6px 12px', fontWeight: '800', color: '#1c1c1e' }}>{selectedOrderForPDF.itemsPerSheet} шт./арк</td>
                          <td style={{ padding: '6px 12px', color: '#636366' }}>Спуск макету / оборот:</td>
                          <td style={{ padding: '6px 12px', fontWeight: '800', color: '#1c1c1e' }}>
                            {selectedOrderForPDF.isSamNaSebe ? 'Сам на себе (с/с)' : 'Без обороту'}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 12px', color: '#636366' }}>Кількість друкованих листів:</td>
                          <td style={{ padding: '6px 12px', fontWeight: '800', color: '#1c1c1e' }}>{selectedOrderForPDF.physicalSheets} арк</td>
                          <td style={{ padding: '6px 12px', color: '#636366' }}>Фактичні прогони (відбитки):</td>
                          <td style={{ padding: '6px 12px', fontWeight: '800', color: '#1c1c1e' }}>{selectedOrderForPDF.physicalSheets} прогонів</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 12px', color: '#636366' }}>Приладка / Форми:</td>
                          <td style={{ padding: '6px 12px', fontWeight: '800', color: '#1c1c1e' }}>1 компл. форм</td>
                          <td style={{ padding: '6px 12px', color: '#636366' }}>Технічні відходи (приладка):</td>
                          <td style={{ padding: '6px 12px', fontWeight: '800', color: '#1c1c1e' }}>+{Math.ceil(selectedOrderForPDF.physicalSheets * 0.05)} арк. (5%)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Післядрукарська обробка */}
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px', color: '#007aff', textTransform: 'uppercase', margin: 0 }}>
                    3. ПІСЛЯДРУКАРСЬКА ОБРОБКА (ПІСЛЯДРУК)
                  </h5>
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Порізка тиражу:</span>
                      <strong style={{ fontSize: '11px', color: '#1c1c1e' }}>Формат {selectedOrderForPDF.format}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Пакування виробів:</span>
                      <strong style={{ fontSize: '11px', color: '#1c1c1e' }}>по {selectedOrderForPDF.packingCount} шт/пачка</strong>
                    </div>
                    {selectedOrderForPDF.notes && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: '#636366', display: 'block', fontSize: '10px' }}>Технічні примітки / Оздоблення:</span>
                        <strong style={{ fontSize: '11px', color: '#007aff' }}>{selectedOrderForPDF.notes}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Фінанси та Підписи */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #e2e8f0', paddingTop: '14px', marginTop: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#636366', display: 'block' }}>Автор наряду: <strong style={{ color: '#1c1c1e' }}>{selectedOrderForPDF.createdBy}</strong></span>
                    <span style={{ fontSize: '11px', color: '#636366', marginTop: '4px', display: 'block' }}>Підпис майстра цеху: ___________________</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#636366', display: 'block' }}>Ціна за 1 шт: <strong style={{ color: '#1c1c1e' }}>{(selectedOrderForPDF.unitPrice || 0).toFixed(2)} грн</strong></span>
                    <span style={{ fontSize: '12px', color: '#1c1c1e', fontWeight: '700' }}>Сума прорахунку: </span>
                    <strong style={{ fontSize: '18px', color: '#007aff' }}>{selectedOrderForPDF.finalPrice.toLocaleString()} грн</strong>
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
