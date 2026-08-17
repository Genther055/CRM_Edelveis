import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Download, 
  Plus, 
  Trash,
  Settings,
  FileSignature,
  FileText,
  Search,
  Eye,
  FileCode
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface DocTemplate {
  id: string;
  name: string;
  type: string;
  lastUsed: string;
}

interface GeneratedDoc {
  id: string;
  number: string;
  client: string;
  type: string;
  date: string;
}

export const Documents: React.FC = () => {
  const { orders, clients } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'registry' | 'templates'>('registry');
  const [searchQuery, setSearchQuery] = useState('');

  const [templates, setTemplates] = useState<DocTemplate[]>([
    { id: '1', name: 'Рахунок-фактура (Стандарт)', type: 'Invoice', lastUsed: '2026-07-24' },
    { id: '2', name: 'Акт виконаних робіт (Послуги)', type: 'Act', lastUsed: '2026-07-23' },
    { id: '3', name: 'Договір про надання послуг друку', type: 'Contract', lastUsed: '2026-07-20' }
  ]);

  const [docs] = useState<GeneratedDoc[]>([
    { id: '1', number: '142', client: 'Контрагент А', type: 'Рахунок-фактура', date: '2026-07-24' },
    { id: '2', number: '98', client: 'Контрагент Б', type: 'Акт виконаних робіт', date: '2026-07-23' },
    { id: '3', number: '12', client: 'Контрагент В', type: 'Договір послуг', date: '2026-07-20' }
  ]);

  const [prefix, setPrefix] = useState('INV-');
  const [nextNumber, setNextNumber] = useState(143);
  const [suffix, setSuffix] = useState('/2026');

  // Selected order for detailed modal view
  const [selectedDocOrder, setSelectedDocOrder] = useState<any>(null);

  const addTemplate = () => {
    const name = prompt('Введіть назву нового шаблону:');
    if (!name) return;

    setTemplates([...templates, {
      id: String(templates.length + 1),
      name,
      type: 'Invoice',
      lastUsed: new Date().toISOString().split('T')[0]
    }]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const filteredOrders = orders.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (clients.find(c => c.id === o.clientId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generatePDFForOrder = (order: any) => {
    const activeClient = clients.find(c => c.id === order.clientId);
    const element = document.createElement('div');
    element.style.padding = '36px';
    element.style.backgroundColor = '#FFFFFF';
    element.style.color = '#1C1C1E';
    element.style.fontFamily = 'sans-serif';
    
    // Extract 5-digit order number if present in title, otherwise fallback to order.id
    const matchNum = (order.name || '').match(/№\s*(\d+)/);
    const num = matchNum ? matchNum[1] : (order.id || '33811');

    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; gap: 16px;">
        <div>
          <h4 style="font-size: 18px; font-weight: 900; letter-spacing: -0.5px; margin: 0;">РАХУНОК-СПЕЦИФІКАЦІЯ № ${num}</h4>
          <p style="font-size: 11px; color: #636366; margin: 2px 0 0 0;">Поліграфічна компанія «Едельвейс і К»</p>
        </div>
        <div style="text-align: right; background-color: #F8FAFC; padding: 8px 14px; border-radius: 6px; border: 1px solid #E2E8F0;">
          <p style="font-size: 12px; font-weight: 700; margin: 0;">Дата: ${new Date(order.createdAt || Date.now()).toLocaleDateString('uk-UA')}</p>
          <p style="font-size: 12px; color: #1E293B; margin: 4px 0 0 0; font-weight: 600;">
            Покупець (Замовник): <span style="font-weight: 800; color: #007AFF; font-size: 13px;">${activeClient?.name || 'Замовник №1'}</span>
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2.5fr 1fr; gap: 10px; margin-bottom: 16px;">
        <div style="background-color: #F2F2F7; padding: 10px 14px; border-radius: 6px; border: 1px solid #E5E5EA;">
          <span style="font-size: 9px; font-weight: 800; color: #8E8E93; text-transform: uppercase; display: block; margin-bottom: 2px;">Продукція / Специфікація</span>
          <p style="font-size: 13px; font-weight: 800; margin: 0; color: #000;">${order.name}</p>
        </div>
        <div style="background-color: #F2F2F7; padding: 10px 14px; border-radius: 6px; border: 1px solid #E5E5EA; text-align: right;">
          <span style="font-size: 9px; font-weight: 800; color: #8E8E93; text-transform: uppercase; display: block; margin-bottom: 2px;">Тираж замовлення</span>
          <p style="font-size: 14px; font-weight: 900; margin: 0; color: #007AFF;">${order.quantity} шт.</p>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h5 style="font-size: 11px; font-weight: 800; border-bottom: 1px solid #E5E5EA; padding-bottom: 4px; margin-bottom: 8px; color: #007AFF; text-transform: uppercase; margin: 0;">
          1. Матеріали та сировина
        </h5>
        <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 10px; background-color: #FAFAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid #E5E5EA;">
          <div>
            <span style="color: #8E8E93; display: block; font-size: 10px;">Матеріал паперу:</span>
            <strong style="font-size: 11px;">${order.paperType === 'offset' ? 'Офсетний 70г' : order.paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}</strong>
          </div>
          <div>
            <span style="color: #8E8E93; display: block; font-size: 10px;">Розмір друкарського листа:</span>
            <strong style="font-size: 11px;">${order.format || 'A4'}</strong>
          </div>
          <div>
            <span style="color: #8E8E93; display: block; font-size: 10px;">Обсяг матеріалу:</span>
            <strong style="font-size: 11px;">${order.physicalSheets || 500} арк. (+${Math.ceil((order.physicalSheets || 500) * 0.05)} тех. відх.)</strong>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h5 style="font-size: 11px; font-weight: 800; border-bottom: 1px solid #E5E5EA; padding-bottom: 4px; margin-bottom: 8px; color: #007AFF; text-transform: uppercase; margin: 0;">
          2. Процес друку (Друкарська машина & Параметри)
        </h5>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #E5E5EA;">
          <tbody>
            <tr style="border-bottom: 1px solid #E5E5EA; background-color: #FAFAFC;">
              <td style="padding: 6px 10px; color: #636366; width: 30%;">Друкарська машина:</td>
              <td style="padding: 6px 10px; font-weight: 700; width: 20%;">${order.machine || 'Опція 1'}</td>
              <td style="padding: 6px 10px; color: #636366; width: 30%;">Красочність (кольоровість):</td>
              <td style="padding: 6px 10px; font-weight: 700; width: 20%;">${order.colors || '1+0'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E5EA;">
              <td style="padding: 6px 10px; color: #636366;">Однотипних листів (на арк):</td>
              <td style="padding: 6px 10px; font-weight: 700;">${order.itemsPerSheet || 2} шт./арк</td>
              <td style="padding: 6px 10px; color: #636366;">Спуск макету / оборот:</td>
              <td style="padding: 6px 10px; font-weight: 700;">${order.isSamNaSebe ? 'Сам на себе (с/с)' : 'Без обороту'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 16px;">
        <h5 style="font-size: 11px; font-weight: 800; border-bottom: 1px solid #E5E5EA; padding-bottom: 4px; margin-bottom: 8px; color: #007AFF; text-transform: uppercase; margin: 0;">
          3. Післядрукарська обробка (Післядрук)
        </h5>
        <div style="padding: 8px 12px; border: 1px solid #E5E5EA; border-radius: 6px; background-color: #FAFAFC; font-size: 11px;">
          ${order.notes || 'Порізка в готовий формат, пакування в пачки.'}
        </div>
      </div>

      <div>
        <h5 style="font-size: 11px; font-weight: 800; border-bottom: 1px solid #E5E5EA; padding-bottom: 4px; margin-bottom: 8px; color: #007AFF; text-transform: uppercase; margin: 0;">
          4. Фінансовий підсумок
        </h5>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 2px solid #1C1C1E; text-align: left;">
              <th style="padding: 6px 0; font-weight: 700;">Складова замовлення</th>
              <th style="padding: 6px 0; text-align: center; font-weight: 700;">Обсяг</th>
              <th style="padding: 6px 0; text-align: right; font-weight: 700;">Сума (грн)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E5E5EA;">
              <td style="padding: 6px 0;">Макет та переддрук</td>
              <td style="padding: 6px 0; text-align: center;">1 посл.</td>
              <td style="padding: 6px 0; text-align: right;">${(order.designCost || 34).toFixed(2)} ₴</td>
            </tr>
            <tr style="border-bottom: 1px solid #E5E5EA;">
              <td style="padding: 6px 0;">Матеріали + Поліграфічний друк + Післядрукарські операції</td>
              <td style="padding: 6px 0; text-align: center;">${order.quantity} шт.</td>
              <td style="padding: 6px 0; text-align: right;">${(order.finalPrice - (order.designCost || 34)).toFixed(2)} ₴</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="font-size: 14px; font-weight: 800;">
              <td style="padding: 12px 0 0 0;" colSpan="2">РАЗОМ ДО СПЛАТИ:</td>
              <td style="padding: 12px 0 0 0; text-align: right; color: #007AFF;">${order.finalPrice.toFixed(2)} ₴</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    // Product name: use order.category or clean product name
    let rawProd = order.category || 'Бланки';
    if (!order.category || order.category === 'Основна' || order.category.includes('Угода')) {
      if ((order.name || '').toLowerCase().includes('бланк')) {
        rawProd = 'Бланки';
      } else if ((order.name || '').toLowerCase().includes('листівк')) {
        rawProd = 'Листівки';
      } else {
        rawProd = 'Бланки';
      }
    }
    const safeProdName = rawProd.replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_');

    // Client name: use activeClient.name or fallback
    const rawClient = activeClient?.name || 'Замовник №1';
    const safeClientName = rawClient.replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_');

    const paperShort = order.paperType === 'offset' ? 'Офс._70г' : order.paperType === 'gazetka' ? 'Газ._45г' : 'Крейда_130г';
    const turnShort = order.isSamNaSebe ? 'сс' : 'без_обор';

    const fileName = `№${num}_${safeProdName}_—_${safeClientName}_(${order.format || 'A4'},_${paperShort},_${order.colors || '1+0'},_${turnShort},_${order.quantity || 1000}_шт.).pdf`;

    const opt = {
      margin:       10,
      filename:     fileName,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Документи та Реєстр нарядів</h1>
          <p className="subtitle">База розрахунків калькулятора, рахунки та шаблони договорів</p>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveSubTab('registry')}
          className={`ios-btn ${activeSubTab === 'registry' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px' }}
        >
          <FileText size={14} />
          База розрахунків (наряди)
        </button>
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`ios-btn ${activeSubTab === 'templates' ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px' }}
        >
          <FileSignature size={14} />
          Шаблони та Договори
        </button>
      </div>

      {activeSubTab === 'registry' ? (
        /* DATABASE OF CALCULATED ORDERS (НАРЯДИ) */
        <div className="ios-card bg-white space-y-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCode size={18} style={{ color: 'var(--primary)' }} />
              База розрахованих нарядів (накопичувальна БД)
            </h2>

            {/* Search */}
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)', opacity: 0.6 }} />
              <input
                placeholder="Шукати замовлення або клієнта..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '32px', fontSize: '12px', width: '100%' }}
              />
            </div>
          </div>

          <div className="ios-table-container">
            <table className="ios-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Назва замовлення</th>
                  <th>Клієнт</th>
                  <th>Специфікація</th>
                  <th>Сума</th>
                  <th>Машина</th>
                  <th style={{ textAlign: 'right' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-medium)', fontStyle: 'italic', padding: '24px' }}>
                      Немає збережених розрахунків. Зробіть розрахунок у вкладці "Калькулятор" та натисніть "Запустити у виробництво".
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const client = clients.find(c => c.id === order.clientId);
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{order.id}</td>
                        <td style={{ fontWeight: '700' }}>{order.name}</td>
                        <td>{client?.name || '—'}</td>
                        <td style={{ fontSize: '11px', color: 'var(--text-medium)' }}>
                          <div>Тираж: {order.quantity.toLocaleString()} шт, {order.colors} ({order.format})</div>
                          <div style={{ fontStyle: 'italic', opacity: 0.8 }}>{order.notes || 'Без додаткових операцій'}</div>
                        </td>
                        <td style={{ fontWeight: '750', color: 'var(--primary)' }}>{order.finalPrice.toFixed(2)} ₴</td>
                        <td>
                          <span style={{ fontSize: '10px', backgroundColor: '#f2f2f7', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {order.machine}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedDocOrder(order)}
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              style={{ padding: '6px' }}
                              title="Переглянути деталі"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => generatePDFForOrder(order)}
                              className="ios-btn ios-btn-secondary ios-btn-small"
                              style={{ padding: '6px' }}
                              title="Завантажити PDF рахунок"
                            >
                              <Download size={12} />
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
      ) : (
        /* ORIGINAL TEMPLATES & CONTRACTS INTERFACE WITH NEW iOS STYLING */
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="ios-card bg-white" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSignature size={18} style={{ color: 'var(--primary)' }} />
                  Доступні шаблони договорів
                </h2>
                <button 
                  type="button"
                  onClick={addTemplate}
                  className="ios-btn ios-btn-secondary ios-btn-small"
                >
                  <Plus size={14} />
                  Створити шаблон
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {templates.map(tmpl => (
                  <div key={tmpl.id} style={{ 
                    padding: '16px', 
                    borderRadius: 'var(--radius-lg)', 
                    border: '0.5px solid var(--border-light)', 
                    backgroundColor: '#f9f9f9',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '110px',
                    position: 'relative'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '750', margin: 0 }}>{tmpl.name}</h4>
                      <span className="ios-badge ios-badge-blue" style={{ marginTop: '8px', display: 'inline-block' }}>{tmpl.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-medium)', borderTop: '0.5px solid var(--border-light)', paddingTop: '6px', marginTop: '6px' }}>
                      <span>Використано: {tmpl.lastUsed}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => deleteTemplate(tmpl.id)}
                      style={{ 
                        position: 'absolute', 
                        right: '8px', 
                        top: '8px', 
                        color: 'var(--danger)', 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="ios-card bg-white" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px' }}>Реєстр створених документів</h2>
              
              <div className="ios-table-container">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th>Номер</th>
                      <th>Тип документа</th>
                      <th>Замовник</th>
                      <th>Дата</th>
                      <th style={{ textAlign: 'right' }}>Дія</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map(doc => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{doc.number}</td>
                        <td>{doc.type}</td>
                        <td>{doc.client}</td>
                        <td style={{ opacity: 0.7 }}>{doc.date}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            type="button"
                            onClick={() => alert(`Завантаження документа ${doc.number} у форматі PDF.`)}
                            className="ios-btn ios-btn-secondary ios-btn-small"
                            style={{ padding: '6px' }}
                          >
                            <Download size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Auto Numbering settings */}
          <div className="ios-card bg-white" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={16} style={{ color: 'var(--primary)' }} />
              Автонумерація
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Префікс номера</label>
                <input 
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="напр. INV-"
                />
              </div>

              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Наступний номер</label>
                <input 
                  type="number"
                  value={nextNumber}
                  onChange={(e) => setNextNumber(Number(e.target.value))}
                />
              </div>

              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Суфікс номера</label>
                <input 
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="напр. /2026"
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f2f2f7', borderRadius: 'var(--radius-md)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '9px', fontWeight: '750', color: 'var(--text-medium)', textTransform: 'uppercase' }}>Приклад генерації:</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)' }}>{prefix}{nextNumber}{suffix}</div>
              </div>

              <button 
                type="button"
                onClick={() => alert('Налаштування автонумератора збережено.')}
                className="ios-btn ios-btn-primary w-full"
              >
                Зберегти правила
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doc details view modal */}
      {selectedDocOrder && (
        <div className="ios-modal-overlay">
          <div className="ios-modal" style={{ maxWidth: '750px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Рахунок-Специфікація замовлення №{selectedDocOrder.id}</h3>
              <button onClick={() => setSelectedDocOrder(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" id="invoice-preview-container" style={{ padding: '24px', backgroundColor: '#FFFFFF', color: '#1C1C1E', fontSize: '11px', lineHeight: '1.4' }}>
              
              {/* Document Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px', gap: '16px' }}>
                <div style={{ flexShrink: 0 }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>
                    РАХУНОК-СПЕЦИФІКАЦІЯ № {selectedDocOrder.name.match(/№\s*(\d+)/)?.[1] || selectedDocOrder.id}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#636366', margin: '2px 0 0 0' }}>Поліграфічна компанія «Едельвейс і К»</p>
                </div>
                <div style={{ textAlign: 'right', flexGrow: 1, minWidth: '220px', backgroundColor: '#F8FAFC', padding: '8px 14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', margin: 0 }}>
                    Дата: {new Date(selectedDocOrder.createdAt || Date.now()).toLocaleDateString('uk-UA')}
                  </p>
                  <p style={{ fontSize: '12px', color: '#1E293B', margin: '4px 0 0 0', fontWeight: '600' }}>
                    Покупець (Замовник): <span style={{ fontWeight: '800', color: '#007AFF', fontSize: '13px' }}>
                      {clients.find(c => c.id === selectedDocOrder.clientId)?.name || 'Замовник №1'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Product Specification & Quantity Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#F2F2F7', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E5E5EA' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Продукція / Специфікація</span>
                  <p style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#000' }}>{selectedDocOrder.name}</p>
                </div>
                <div style={{ backgroundColor: '#F2F2F7', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E5E5EA', textAlign: 'right' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Тираж замовлення</span>
                  <p style={{ fontSize: '14px', fontWeight: '900', margin: 0, color: '#007AFF' }}>{selectedDocOrder.quantity.toLocaleString()} шт.</p>
                </div>
              </div>

              {/* 1. Матеріали та сировина */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E5E5EA', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  1. Матеріали та сировина
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', backgroundColor: '#FAFAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E5EA' }}>
                  <div>
                    <span style={{ color: '#8E8E93', display: 'block', fontSize: '10px' }}>Матеріал паперу:</span>
                    <strong style={{ fontSize: '11px' }}>{selectedDocOrder.paperType === 'offset' ? 'Офсетний 70г' : selectedDocOrder.paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#8E8E93', display: 'block', fontSize: '10px' }}>Розмір друкарського листа:</span>
                    <strong style={{ fontSize: '11px' }}>{selectedDocOrder.format || 'A4'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#8E8E93', display: 'block', fontSize: '10px' }}>Обсяг матеріалу:</span>
                    <strong style={{ fontSize: '11px' }}>{selectedDocOrder.physicalSheets || 500} арк. (+{Math.ceil((selectedDocOrder.physicalSheets || 500) * 0.05)} тех. відх.)</strong>
                  </div>
                </div>
              </div>

              {/* 2. Процес друку */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E5E5EA', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  2. Процес друку (Друкарська машина & Параметри)
                </h5>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #E5E5EA' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E5E5EA', backgroundColor: '#FAFAFC' }}>
                      <td style={{ padding: '6px 10px', color: '#636366', width: '30%' }}>Друкарська машина:</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', width: '20%' }}>{selectedDocOrder.machine || 'Опція 1'}</td>
                      <td style={{ padding: '6px 10px', color: '#636366', width: '30%' }}>Красочність (кольоровість):</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700', width: '20%' }}>{selectedDocOrder.colors || '1+0'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                      <td style={{ padding: '6px 10px', color: '#636366' }}>Однотипних листів (на арк):</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700' }}>{selectedDocOrder.itemsPerSheet || 2} шт./арк</td>
                      <td style={{ padding: '6px 10px', color: '#636366' }}>Спуск макету / оборот:</td>
                      <td style={{ padding: '6px 10px', fontWeight: '700' }}>{selectedDocOrder.isSamNaSebe ? 'Сам на себе (с/с)' : 'Без обороту'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. Післядрукарська обробка */}
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E5E5EA', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  3. Післядрукарська обробка (Післядрук)
                </h5>
                <div style={{ padding: '8px 12px', border: '1px solid #E5E5EA', borderRadius: '6px', backgroundColor: '#FAFAFC', fontSize: '11px' }}>
                  {selectedDocOrder.notes || 'Порізка в готовий формат, пакування в пачки.'}
                </div>
              </div>

              {/* 4. Фінансовий розрахунок */}
              <div>
                <h5 style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #E5E5EA', paddingBottom: '4px', marginBottom: '8px', color: '#007AFF', textTransform: 'uppercase', margin: 0 }}>
                  4. Фінансовий підсумок
                </h5>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #1C1C1E', textAlign: 'left' }}>
                      <th style={{ padding: '6px 0', fontWeight: '700' }}>Складова замовлення</th>
                      <th style={{ padding: '6px 0', textAlign: 'center', fontWeight: '700' }}>Обсяг</th>
                      <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700' }}>Сума (грн)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                      <td style={{ padding: '6px 0' }}>Макет та переддрук</td>
                      <td style={{ padding: '6px 0', textAlign: 'center' }}>1 посл.</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>{(selectedDocOrder.designCost || 34).toFixed(2)} ₴</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E5EA' }}>
                      <td style={{ padding: '6px 0' }}>Матеріали + Поліграфічний друк + Післядрукарські операції</td>
                      <td style={{ padding: '6px 0', textAlign: 'center' }}>{selectedDocOrder.quantity} шт.</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>{(selectedDocOrder.finalPrice - (selectedDocOrder.designCost || 34)).toFixed(2)} ₴</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ fontSize: '14px', fontWeight: '800' }}>
                      <td style={{ padding: '12px 0 0 0' }} colSpan={2}>РАЗОМ ДО СПЛАТИ:</td>
                      <td style={{ padding: '12px 0 0 0', textAlign: 'right', color: '#007AFF' }}>{selectedDocOrder.finalPrice.toFixed(2)} ₴</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>

            <div className="ios-modal-footer">
              <button onClick={() => setSelectedDocOrder(null)} className="ios-btn ios-btn-secondary">Закрити</button>
              <button onClick={() => { generatePDFForOrder(selectedDocOrder); setSelectedDocOrder(null); }} className="ios-btn ios-btn-primary">Завантажити рахунок</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
