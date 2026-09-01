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

      {/* Work Order PDF Modal & Printable Preview - Pure Monochrome B&W Design */}
      {selectedOrderForPDF && (
        <div className="ios-modal-overlay">
          <div className="bg-white rounded-none border-2 border-black max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-3 border-b border-black flex items-center justify-between bg-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-black" />
                <h3 className="text-xs font-black uppercase text-black m-0 tracking-wider">Технологічний наряд-специфікація № {selectedOrderForPDF.id}</h3>
              </div>
              <button type="button" onClick={() => setSelectedOrderForPDF(null)} className="text-black hover:bg-black hover:text-white px-2 py-0.5 border border-black font-bold text-xs transition-colors">✕ Закрити</button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto flex-1 max-h-[78vh] bg-white text-black font-sans text-xs" id={`work-order-print-${selectedOrderForPDF.id}`}>
              {/* Header */}
              <div className="border-b-2 border-black pb-3 mb-4">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-black m-0 uppercase">Поліграфічне підприємство «Едельвейс і К»</h2>
                    <p className="text-[11px] text-slate-700 m-0 mt-0.5">Виробничий цех • Технологічний паспорт замовлення</p>
                  </div>
                  <div className="text-right border border-black p-2 min-w-[210px] bg-slate-50">
                    <h3 className="text-xs font-black text-black m-0 uppercase">НАРЯД-СПЕЦИФІКАЦІЯ № {selectedOrderForPDF.id}</h3>
                    <p className="text-[11px] font-bold text-black m-0 mt-1">Дата: {selectedOrderForPDF.createdAt}</p>
                  </div>
                </div>

                {/* Customer / Manager */}
                <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-slate-300 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Замовник:</span>
                    <strong className="text-black font-bold">{clients.find(c => c.id === selectedOrderForPDF.clientId)?.name || 'Клієнт'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Менеджер замовлення:</span>
                    <strong className="text-black font-bold">{selectedOrderForPDF.createdBy || 'Менеджер'}</strong>
                  </div>
                </div>
              </div>

              {/* 1. Блок «МАТЕРІАЛИ ТА ПАПІР» */}
              <div className="mb-4">
                <h5 className="text-[11px] font-black uppercase text-black m-0 mb-1.5">
                  1. МАТЕРІАЛИ ТА ПАПІР ЗІ СКЛАДУ
                </h5>
                <table className="w-full border-collapse border border-black text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black text-black font-bold text-left">
                      <th className="p-1.5 border-r border-black">Матеріал / Папір</th>
                      <th className="p-1.5 border-r border-black">Формат сировини</th>
                      <th className="p-1.5 border-r border-black text-center">Чистий наклад</th>
                      <th className="p-1.5 border-r border-black text-center">Приладка</th>
                      <th className="p-1.5 border-r border-black text-center">Тех. відходи</th>
                      <th className="p-1.5 text-right">Фактично зі складу</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 border-r border-black font-bold text-black">{selectedOrderForPDF.paperName || (selectedOrderForPDF.paperType === 'offset' ? 'Офсетний 70г' : 'Крейдований 130г')}</td>
                      <td className="p-1.5 border-r border-black text-slate-800">{selectedOrderForPDF.sheetSize || selectedOrderForPDF.format || 'SRA3 (320×450 мм)'}</td>
                      <td className="p-1.5 border-r border-black text-center font-mono font-bold">{selectedOrderForPDF.physicalSheets} арк.</td>
                      <td className="p-1.5 border-r border-black text-center font-mono text-slate-700">{selectedOrderForPDF.priladkaSheets || (selectedOrderForPDF.isSamNaSebe ? 30 : 20)} арк.</td>
                      <td className="p-1.5 border-r border-black text-center font-mono text-slate-700">{selectedOrderForPDF.techWasteSheets || Math.ceil(selectedOrderForPDF.physicalSheets * 0.04)} арк.</td>
                      <td className="p-1.5 text-right font-mono font-bold text-black">
                        {selectedOrderForPDF.totalGrossSheets || (selectedOrderForPDF.physicalSheets + (selectedOrderForPDF.priladkaSheets || 20) + (selectedOrderForPDF.techWasteSheets || 4))} арк.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. Блок «ДРУК» */}
              <div className="mb-4">
                <h5 className="text-[11px] font-black uppercase text-black m-0 mb-1.5">
                  2. ДРУК (ОБЛАДНАННЯ ТА ПАРАМЕТРИ СПУСКУ)
                </h5>
                <table className="w-full border-collapse border border-black text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black text-black font-bold text-left">
                      <th className="p-1.5 border-r border-black">Обладнання</th>
                      <th className="p-1.5 border-r border-black">Папір</th>
                      <th className="p-1.5 border-r border-black">Розмір, мм</th>
                      <th className="p-1.5 border-r border-black">Красочність</th>
                      <th className="p-1.5 border-r border-black text-center">Шт/арк</th>
                      <th className="p-1.5 border-r border-black text-center">Друк. лист.</th>
                      <th className="p-1.5 border-r border-black text-center">Приладка</th>
                      <th className="p-1.5 border-r border-black text-center">Відходи</th>
                      <th className="p-1.5 border-r border-black text-center">В друк</th>
                      <th className="p-1.5 text-center">Оборот</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 border-r border-black font-bold text-black">{selectedOrderForPDF.machine}</td>
                      <td className="p-1.5 border-r border-black text-slate-800">{selectedOrderForPDF.paperName || '130 г/м²'}</td>
                      <td className="p-1.5 border-r border-black text-slate-800">{selectedOrderForPDF.sheetSize || selectedOrderForPDF.format}</td>
                      <td className="p-1.5 border-r border-black font-bold text-black">{selectedOrderForPDF.colors}</td>
                      <td className="p-1.5 border-r border-black text-center font-bold">{selectedOrderForPDF.itemsPerSheet}</td>
                      <td className="p-1.5 border-r border-black text-center font-mono">{selectedOrderForPDF.physicalSheets}</td>
                      <td className="p-1.5 border-r border-black text-center font-mono text-slate-700">{selectedOrderForPDF.priladkaSheets || (selectedOrderForPDF.isSamNaSebe ? 30 : 20)}</td>
                      <td className="p-1.5 border-r border-black text-center font-mono text-slate-700">{selectedOrderForPDF.techWasteSheets || Math.ceil(selectedOrderForPDF.physicalSheets * 0.04)}</td>
                      <td className="p-1.5 border-r border-black text-center font-mono font-bold text-black">
                        {selectedOrderForPDF.totalGrossSheets || (selectedOrderForPDF.physicalSheets + (selectedOrderForPDF.priladkaSheets || 20) + (selectedOrderForPDF.techWasteSheets || 4))}
                      </td>
                      <td className="p-1.5 text-center font-bold text-black">
                        {selectedOrderForPDF.turnTypeLabel || (selectedOrderForPDF.isSamNaSebe ? 'с/с' : 'б/о')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. Блок «ДОДРУКАРСЬКИЙ ПРОЦЕС» */}
              <div className="mb-4">
                <h5 className="text-[11px] font-black uppercase text-black m-0 mb-1.5">
                  3. ДОДРУКАРСЬКИЙ ПРОЦЕС (CTP ФОРМИ ТА СПУСК СМУГ)
                </h5>
                <table className="w-full border-collapse border border-black text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black text-black font-bold text-left">
                      <th className="p-1.5 border-r border-black w-8 text-center">№</th>
                      <th className="p-1.5 border-r border-black">Технологічна операція</th>
                      <th className="p-1.5 border-r border-black text-center w-28">Кількість</th>
                      <th className="p-1.5 text-center w-24">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 text-center border-r border-black font-mono">1</td>
                      <td className="p-1.5 border-r border-black font-semibold text-black">Перевірка макету, калібрування та спуск смуг ({selectedOrderForPDF.format})</td>
                      <td className="p-1.5 text-center border-r border-black font-mono">1 спуск</td>
                      <td className="p-1.5 text-center font-bold text-black">OK</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 text-center border-r border-black font-mono">2</td>
                      <td className="p-1.5 border-r border-black font-semibold text-black">Виведення офсетних CTP форм / термопластин</td>
                      <td className="p-1.5 text-center border-r border-black font-mono font-bold">
                        {selectedOrderForPDF.platesCount || (selectedOrderForPDF.colors === '4+4' ? (selectedOrderForPDF.isSamNaSebe ? 4 : 8) : selectedOrderForPDF.colors === '4+0' ? 4 : 2)} пластин
                      </td>
                      <td className="p-1.5 text-center font-bold text-black">Готово</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. Блок «ПІСЛЯДРУКАРСЬКИЙ ПРОЦЕС ТА УПАКОВКА» */}
              <div className="mb-4">
                <h5 className="text-[11px] font-black uppercase text-black m-0 mb-1.5">
                  4. ПІСЛЯДРУКАРСЬКИЙ ПРОЦЕС ТА УПАКОВКА
                </h5>
                <table className="w-full border-collapse border border-black text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black text-black font-bold text-left">
                      <th className="p-1.5 border-r border-black w-8 text-center">№</th>
                      <th className="p-1.5 border-r border-black">Операція післядруку / фасування</th>
                      <th className="p-1.5 border-r border-black text-center w-28">Обсяг робіт</th>
                      <th className="p-1.5 border-r border-black text-center w-28">Прізвище майстра</th>
                      <th className="p-1.5 text-center w-24">Час виконання</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderForPDF.postpressOps && selectedOrderForPDF.postpressOps.length > 0 ? (
                      selectedOrderForPDF.postpressOps.map((op, opIdx) => (
                        <tr key={opIdx} className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">{opIdx + 1}</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">{op.name}</td>
                          <td className="p-1.5 border-r border-black text-center font-mono font-bold">{op.qty}</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">____________</td>
                          <td className="p-1.5 text-center text-slate-400">__:__</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">1</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">Порізка тиражу в готовий розмір ({selectedOrderForPDF.format})</td>
                          <td className="p-1.5 border-r border-black text-center font-mono font-bold">{selectedOrderForPDF.quantity.toLocaleString()} шт</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">____________</td>
                          <td className="p-1.5 text-center text-slate-400">__:__</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 text-center border-r border-black font-mono">2</td>
                          <td className="p-1.5 border-r border-black font-semibold text-black">Фасування та пакування продукції</td>
                          <td className="p-1.5 border-r border-black text-center font-mono font-bold">{selectedOrderForPDF.packingInfo || `по ${selectedOrderForPDF.packingCount || 100} шт`}</td>
                          <td className="p-1.5 border-r border-black text-center text-slate-400">____________</td>
                          <td className="p-1.5 text-center text-slate-400">__:__</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 5. Фінансовий блок та Відмітки цеху */}
              <div className="grid grid-cols-2 gap-8 pt-3 mt-4 border-t-2 border-black text-[11px]">
                <div className="flex flex-col gap-3">
                  <div>Менеджер замовлення: <strong className="text-black">{selectedOrderForPDF.createdBy || 'Менеджер'}</strong> (підпис: ______________)</div>
                  <div>Друкар (оператор): __________________ (підпис: ______________)</div>
                  <div>Майстер післядруку: ________________ (підпис: ______________)</div>
                  <div>Контролер якості (ВТК): ______________ (підпис: ______________)</div>
                </div>
                <div className="text-right border border-black p-3 bg-slate-50 flex flex-col justify-center">
                  <span className="text-[10.5px] text-slate-600">Собівартість виробництва: <strong className="text-black font-mono">{(selectedOrderForPDF.subtotal || 0).toFixed(2)} ₴</strong></span>
                  <span className="text-[10.5px] text-slate-600">Ціна за 1 шт для клієнта: <strong className="text-black font-mono">{(selectedOrderForPDF.unitPrice || 0).toFixed(2)} ₴ / шт</strong></span>
                  <div className="mt-1 pt-1 border-t border-slate-300">
                    <span className="text-xs font-bold text-black uppercase">Сума до сплати: </span>
                    <strong className="text-base text-black font-mono font-black">{selectedOrderForPDF.finalPrice.toLocaleString()} ₴</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-100 border-t border-black flex items-center justify-between gap-3">
              <button type="button" onClick={() => setSelectedOrderForPDF(null)} className="px-4 py-2 border border-black bg-white hover:bg-slate-200 text-black text-xs font-bold transition-colors">Закрити</button>
              <button type="button" onClick={() => generateWorkOrderPDF(selectedOrderForPDF)} className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5">
                <Download size={14} />
                <span>Завантажити PDF Специфікацію</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
