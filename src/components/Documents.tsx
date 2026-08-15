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
    
    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <h4 style="font-size: 20px; font-weight: 900; font-style: italic; margin: 0;">НАРЯД-ЗАМОВЛЕННЯ №${order.id}</h4>
          <p style="font-size: 12px; color: #8E8E93; margin: 4px 0 0 0;">База розрахунків CRM</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 13px; font-weight: 700; margin: 0;">${order.name}</p>
          <p style="font-size: 11px; color: #8E8E93; margin: 4px 0 0 0;">Створено: ${new Date(order.createdAt).toLocaleDateString('uk-UA')}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; margin-bottom: 32px; font-size: 12px;">
        <div>
          <p style="font-size: 9px; font-weight: 750; color: #8e8e93; text-transform: uppercase; margin-bottom: 4px;">Специфікація замовлення</p>
          <p style="margin: 3px 0;"><strong>Замовник:</strong> ${activeClient?.name || '—'}</p>
          <p style="margin: 3px 0;"><strong>Тираж:</strong> ${order.quantity.toLocaleString()} шт.</p>
          <p style="margin: 3px 0;"><strong>Друкарська машина:</strong> ${order.machine}</p>
          <p style="margin: 3px 0;"><strong>Формат:</strong> ${order.format}</p>
          <p style="margin: 3px 0;"><strong>Папір:</strong> ${order.paperType === 'offset' ? 'Офсет 70г' : order.paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}</p>
          <p style="margin: 3px 0;"><strong>Параметри післядруку:</strong> ${order.notes || '—'}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 9px; font-weight: 750; color: #8e8e93; text-transform: uppercase; margin: 0;">Ціна за одиницю</p>
          <p style="font-size: 22px; font-weight: 800; color: #007aff; margin: 4px 0;">${order.unitPrice.toFixed(2)} грн</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 2px solid #1c1c1e; text-align: left;">
            <th style="padding: 6px 0; font-weight: 700;">Назва робіт/послуг</th>
            <th style="padding: 6px 0; text-align: right; font-weight: 700;">Сума (грн)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #E5E5EA;">
            <td style="padding: 8px 0;">Переддрукарська підготовка та розробка дизайну</td>
            <td style="padding: 8px 0; text-align: right;">${order.designCost.toFixed(2)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E5EA;">
            <td style="padding: 8px 0;">Матеріали, поліграфічний друк та поопераційна збірка тиражу</td>
            <td style="padding: 8px 0; text-align: right;">${(order.finalPrice - order.designCost).toFixed(2)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="font-size: 16px; font-weight: 800;">
            <td style="padding: 16px 0 0 0;">РАЗОМ:</td>
            <td style="padding: 16px 0 0 0; text-align: right; color: #007aff;">${order.finalPrice.toFixed(2)} грн</td>
          </tr>
        </tfoot>
      </table>
    `;

    const opt = {
      margin:       10,
      filename:     `invoice-order-${order.id}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="main-content bg-[#f2f2f7]" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title text-slate-900">Документи та Реєстр нарядів</h1>
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
                      <th>Контрагент</th>
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
          <div className="ios-modal" style={{ maxWidth: '550px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Деталі наряду №{selectedDocOrder.id}</h3>
              <button onClick={() => setSelectedDocOrder(null)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '11px' }}>Назва замовлення:</span>
                  <p style={{ fontWeight: '750', margin: '2px 0 0 0' }}>{selectedDocOrder.name}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '11px' }}>Дата прорахунку:</span>
                  <p style={{ fontWeight: '700', margin: '2px 0 0 0' }}>{new Date(selectedDocOrder.createdAt).toLocaleString('uk-UA')}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '11px' }}>Тираж:</span>
                  <p style={{ fontWeight: '700', margin: '2px 0 0 0' }}>{selectedDocOrder.quantity.toLocaleString()} шт</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '11px' }}>Формат:</span>
                  <p style={{ fontWeight: '700', margin: '2px 0 0 0' }}>{selectedDocOrder.format}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '11px' }}>Кольоровість:</span>
                  <p style={{ fontWeight: '700', margin: '2px 0 0 0' }}>{selectedDocOrder.colors}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '11px' }}>Друкарська машина:</span>
                  <p style={{ fontWeight: '700', margin: '2px 0 0 0' }}>{selectedDocOrder.machine}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '11px' }}>Папір:</span>
                  <p style={{ fontWeight: '700', margin: '2px 0 0 0' }}>{selectedDocOrder.paperType === 'offset' ? 'Офсет 70г' : selectedDocOrder.paperType === 'gazetka' ? 'Газетний 45г' : 'Крейдований 130г'}</p>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-medium)', fontSize: '11px' }}>Специфікація післядрукарської обробки:</span>
                <p style={{ margin: '4px 0 0 0', padding: '8px', backgroundColor: '#f2f2f7', borderRadius: '6px', fontStyle: 'italic' }}>
                  {selectedDocOrder.notes || 'Не вказано'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid var(--border-light)', paddingTop: '10px', marginTop: '10px' }}>
                <span>Собівартість:</span>
                <strong>{selectedDocOrder.subtotal.toFixed(2)} ₴</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Націнка ({selectedDocOrder.margin}%):</span>
                <strong>+{selectedDocOrder.marginAmount.toFixed(2)} ₴</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800' }}>
                <span>Сума до сплати:</span>
                <span style={{ color: 'var(--primary)' }}>{selectedDocOrder.finalPrice.toFixed(2)} ₴</span>
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
