import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  FileText,
  X
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  budget: number;
  source: 'Site' | 'Phone' | 'Instagram' | 'Facebook' | 'Recommendation';
  status: 'new' | 'contact' | 'negotiation' | 'review' | 'converted';
  date: string;
  notes: string;
  tags?: string[];
  files?: string[];
  customFieldValues?: Record<string, string | number>;
}

export const Leads: React.FC = () => {
  const { addClient, customFields } = useApp();

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 'L-101',
      name: 'Друк меню для кафе "Капучино"',
      contactPerson: 'Олег Петренко',
      phone: '+380671234567',
      email: 'oleg.p@gmail.com',
      budget: 3500,
      source: 'Site',
      status: 'new',
      date: '2026-07-24',
      notes: 'Потрібно надрукувати 50 меню А4 на щільному крейдованому папері 300г з матовою ламінацією.',
      tags: ['Важливо', 'Терміново'],
      files: ['Макет_меню.pdf'],
      customFieldValues: { 'Ширина': 210, 'Висота': 297 }
    },
    {
      id: 'L-102',
      name: 'Візитки для автосервісу "Гараж 777"',
      contactPerson: 'Ігор Шевченко',
      phone: '+380509876543',
      email: 'igor.auto@ukr.net',
      budget: 850,
      source: 'Instagram',
      status: 'contact',
      date: '2026-07-23',
      notes: 'Дизайн візитки є в наявності. Двостороння матова ламінація 1000 шт.',
      tags: ['Новий'],
      files: ['Visytka_Garage.eps'],
      customFieldValues: { 'Ширина': 90, 'Висота': 50 }
    },
    {
      id: 'L-103',
      name: 'Друк каталогу продукції А4 (64 стор.)',
      contactPerson: 'Олена Ковальчук (ТОВ ФармаТрейд)',
      phone: '+380673214567',
      email: 'o.koval@pharmatrade.com',
      budget: 24500,
      source: 'Phone',
      status: 'negotiation',
      date: '2026-07-22',
      notes: 'Обкладинка 250г + УФ лак, блок 115г крейда. Тираж 500 примірників. Збірка на скобу.',
      tags: ['B2B', 'Каталоги'],
      files: ['Catalog_Pharma_v2.pdf'],
      customFieldValues: { 'Ширина': 210, 'Висота': 297 }
    },
    {
      id: 'L-104',
      name: 'Самоклеючі етикетки на банки соків 10 000 шт.',
      contactPerson: 'Василь Гнатюк (ПРАТ ЕкоСок)',
      phone: '+380934567890',
      email: 'v.hnatyuk@ecosok.ua',
      budget: 18200,
      source: 'Site',
      status: 'review',
      date: '2026-07-21',
      notes: 'Рулонний флексодрук, напівглянцевий самоклей, висічка під овальний штамп.',
      tags: ['Етикетка', 'Флексодрук'],
      files: ['Label_Juice_Apple.ai'],
      customFieldValues: { 'Ширина': 75, 'Висота': 120 }
    },
    {
      id: 'L-105',
      name: 'Картонні брендовані пакети 1 000 шт.',
      contactPerson: 'Марія Бойко (Бутік ModaLux)',
      phone: '+380961112233',
      email: 'm.boyko@modalux.ua',
      budget: 32000,
      source: 'Instagram',
      status: 'new',
      date: '2026-07-20',
      notes: 'Крейдований папір 200г, шовкотрафаретний друк золотом, люверси та шовковий шнур.',
      tags: ['Упаковка', 'Преміум'],
      files: ['Bag_ModaLux_print.pdf'],
      customFieldValues: { 'Ширина': 250, 'Висота': 350 }
    },
    {
      id: 'L-106',
      name: 'Фірмові настінні календарі ТРІО 500 шт.',
      contactPerson: 'Віктор Савченко (СК Україна)',
      phone: '+380503334455',
      email: 'v.savchenko@sk-ukraine.ua',
      budget: 45000,
      source: 'Phone',
      status: 'contact',
      date: '2026-07-19',
      notes: 'Верхній постер 300г з глянцевою ламінацією, 3 курсори, білі металеві пружини.',
      tags: ['Календарі', 'Новий Рік'],
      files: ['Calendar_Trio_2027.pdf'],
      customFieldValues: { 'Ширина': 297, 'Висота': 840 }
    },
    {
      id: 'L-107',
      name: 'Друк плакатів А1 для рекламної кампанії 200 шт.',
      contactPerson: 'Оксана Дмитренко (Креатив Агентство)',
      phone: '+380678889900',
      email: 'o.dmytrenko@creative.com',
      budget: 9600,
      source: 'Facebook',
      status: 'negotiation',
      date: '2026-07-18',
      notes: 'Широкоформатний інтер\'єрний друк на сіті-папері 150г з високою роздільною здатністю.',
      tags: ['Плакати', 'Широкий формат'],
      files: ['Poster_A1_Promo.tif'],
      customFieldValues: { 'Ширина': 594, 'Висота': 841 }
    },
    {
      id: 'L-108',
      name: 'Блокноти А5 на пружині з логотипом 300 шт.',
      contactPerson: 'Андрій Кравченко (SoftTech)',
      phone: '+380937776655',
      email: 'a.kravchenko@softtech.io',
      budget: 14400,
      source: 'Site',
      status: 'converted',
      date: '2026-07-17',
      notes: 'Обкладинка софт-тач, блок 50 аркушів клітинка офсет 80г, навивка на чорну пружину.',
      tags: ['Сувеніри', 'Блокноти'],
      files: ['Notebook_Cover_SoftTech.pdf'],
      customFieldValues: { 'Ширина': 148, 'Висота': 210 }
    },
    {
      id: 'L-109',
      name: 'Ліфлети А4 2 згини (євробуклети) 5 000 шт.',
      contactPerson: 'Тетяна Бондар (Мережа "Здоров\'я")',
      phone: '+380504445566',
      email: 't.bondar@zdorovya.ua',
      budget: 7800,
      source: 'Phone',
      status: 'new',
      date: '2026-07-16',
      notes: 'Крейдований папір 130г, фальцювання у 2 згини (усередину).',
      tags: ['Буклети', 'Офсет'],
      files: ['Eurobuklet_Pharm.pdf'],
      customFieldValues: { 'Ширина': 210, 'Висота': 297 }
    },
    {
      id: 'L-110',
      name: 'Тиснення золотом на паперових папках 200 шт.',
      contactPerson: 'Сергій Мороз (Адвокатське бюро)',
      phone: '+380679998877',
      email: 's.moroz@lawyer.ua',
      budget: 11500,
      source: 'Site',
      status: 'contact',
      date: '2026-07-15',
      notes: 'Дизайнерський картон 350г чорний, тиснення фольгою (гаряче тиснення).',
      tags: ['Папки', 'Тиснення'],
      files: ['Folder_Lawyer_Gold.pdf'],
      customFieldValues: { 'Ширина': 220, 'Висота': 310 }
    },
    {
      id: 'L-111',
      name: 'Хенгери на двері готелю 2 000 шт.',
      contactPerson: 'Ольга Яковенко (Готель "Гранд")',
      phone: '+380962223344',
      email: 'reception@grandhotel.ua',
      budget: 5200,
      source: 'Instagram',
      status: 'review',
      date: '2026-07-14',
      notes: 'Щільний картон 300г, вирубка штампом гачка на ручку дверей.',
      tags: ['Хенгери', 'Висічка'],
      files: ['Hanger_DoNotDisturb.ai'],
      customFieldValues: { 'Ширина': 100, 'Висота': 230 }
    },
    {
      id: 'L-112',
      name: 'Газетний друк рекламних випусків А3 20 000 прим.',
      contactPerson: 'Микола Семенов (ГО "Наш Город")',
      phone: '+380501112233',
      email: 'n.semenov@nashgorod.org',
      budget: 38000,
      source: 'Phone',
      status: 'negotiation',
      date: '2026-07-13',
      notes: 'Газетний папір 45г, ротаційний друк, 8 сторінок, фальцювання в зошит.',
      tags: ['Газети', 'Ротація'],
      files: ['Newspaper_Issue_08.pdf'],
      customFieldValues: { 'Ширина': 297, 'Висота': 420 }
    }
  ]);

  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBudget, setNewBudget] = useState(0);
  const [newSource, setNewSource] = useState<Lead['source']>('Site');
  const [newNotes, setNewNotes] = useState('');
  const [newTagsVal, setNewTagsVal] = useState('');
  const [newFileVal, setNewFileVal] = useState('');

  // Custom fields inputs state
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});

  // Formula Evaluator Helper
  const evaluateFormula = (formula: string, values: Record<string, string | number>) => {
    try {
      let expr = formula;
      const regex = /\{([^}]+)\}/g;
      let match;
      while ((match = regex.exec(formula)) !== null) {
        const fieldName = match[1];
        const rawVal = values[fieldName] !== undefined ? values[fieldName] : 0;
        const val = typeof rawVal === 'string' ? Number(rawVal.replace(',', '.')) : Number(rawVal);
        expr = expr.replace(match[0], String(isNaN(val) ? 0 : val));
      }
      if (/^[0-9+\-*/().\s]+$/.test(expr)) {
        // eslint-disable-next-line no-eval
        const res = (0, eval)(expr);
        return typeof res === 'number' && !isNaN(res) ? res.toFixed(2) : '0.00';
      }
      return 'Некоректний вираз';
    } catch (e) {
      return 'Помилка';
    }
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newLead: Lead = {
      id: `L-${Date.now().toString().slice(-3)}`,
      name: newName,
      contactPerson: newContact,
      phone: newPhone,
      email: newEmail,
      budget: Number(newBudget),
      source: newSource,
      status: 'new',
      date: new Date().toISOString().split('T')[0],
      notes: newNotes,
      tags: [],
      files: [],
      customFieldValues: Object.keys(fieldValues).reduce((acc, key) => {
        const val = fieldValues[key];
        acc[key] = typeof val === 'string' ? val.replace(',', '.') : val;
        return acc;
      }, {} as Record<string, string | number>)
    };

    setLeads([...leads, newLead]);
    setShowAddModal(false);
    // Reset Form
    setNewName('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
    setNewBudget(0);
    setNewNotes('');
    setFieldValues({});
  };

  const updateLeadStatus = (id: string, newStatus: Lead['status']) => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const deleteLead = (id: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей запит?')) {
      setLeads(leads.filter(lead => lead.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    }
  };

  const convertToClient = (lead: Lead) => {
    addClient({
      name: lead.name,
      contact: lead.contactPerson,
      phone: lead.phone,
      email: lead.email,
      discount: 0,
      city: 'Вінниця',
      tags: lead.tags || [],
      files: lead.files || []
    });
    alert(`Лід "${lead.contactPerson}" успішно конвертовано в Клієнта!\nСтворено картку контрагента у місті Вінниця.`);
    updateLeadStatus(lead.id, 'converted');
  };

  const handleAddTag = () => {
    if (!selectedLead || !newTagsVal.trim()) return;
    const currentTags = selectedLead.tags || [];
    if (currentTags.includes(newTagsVal.trim())) return;

    const updated = {
      ...selectedLead,
      tags: [...currentTags, newTagsVal.trim()]
    };
    setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
    setSelectedLead(updated);
    setNewTagsVal('');
  };

  const handleDeleteTag = (t: string) => {
    if (!selectedLead) return;
    const updated = {
      ...selectedLead,
      tags: (selectedLead.tags || []).filter(tag => tag !== t)
    };
    setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
    setSelectedLead(updated);
  };

  const handleAddFile = () => {
    if (!selectedLead || !newFileVal.trim()) return;
    const currentFiles = selectedLead.files || [];

    const updated = {
      ...selectedLead,
      files: [...currentFiles, newFileVal.trim()]
    };
    setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
    setSelectedLead(updated);
    setNewFileVal('');
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                          lead.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
                          lead.phone.includes(search);
    const matchesFilter = filterSource === 'all' || lead.source === filterSource;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'new': return <span className="ios-badge ios-badge-blue">Необроблений</span>;
      case 'contact': return <span className="ios-badge ios-badge-orange">Контакт</span>;
      case 'negotiation': return <span className="ios-badge ios-badge-purple">Узгодження ТЗ</span>;
      case 'review': return <span className="ios-badge ios-badge-yellow">Думає</span>;
      case 'converted': return <span className="ios-badge ios-badge-green">Готово</span>;
    }
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      {/* Top Header */}
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Запити та звернення</h1>
          <p className="subtitle">Журнал вхідних запитів замовників з підключеними формулами</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ios-btn ios-btn-primary"
        >
          <Plus size={14} />
          Створити запит
        </button>
      </div>

      {/* Strict Command Panel / Filter Bar */}
      <div className="ios-card bg-white" style={{ display: 'flex', gap: '10px', padding: '10px 14px', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search style={{ position: 'absolute', left: '8px', top: '10px', color: '#94a3b8' }} size={14} />
          <input 
            placeholder="Шукати за назвою, телефоном..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '28px', height: '32px', fontSize: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
          <span>Джерело:</span>
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            style={{ height: '32px', fontSize: '12px', width: '120px' }}
          >
            <option value="all">Всі джерела</option>
            <option value="Site">Сайт</option>
            <option value="Phone">Телефон</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 370px' : '1fr', gap: '16px', alignItems: 'start', marginTop: '16px' }}>
        {/* Strictly Structured Table */}
        <div className="ios-table-container">
          <table className="ios-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th style={{ width: '90px' }}>Дата</th>
                <th>Назва запиту / Опис</th>
                <th style={{ width: '130px' }}>Контактна особа</th>
                <th style={{ width: '100px' }}>Теги</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Бюджет</th>
                <th style={{ width: '120px' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    Немає записів у журналі за обраними фільтрами
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr 
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedLead?.id === lead.id ? 'rgba(0, 122, 255, 0.05)' : 'transparent' 
                    }}
                  >
                    <td style={{ fontWeight: '600', color: 'var(--text-medium)' }}>{lead.id}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>{lead.date}</td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{lead.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-medium)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                        {lead.notes}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-dark)' }}>{lead.contactPerson}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>{lead.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                        {(lead.tags || []).map(t => (
                          <span key={t} className="ios-badge ios-badge-purple" style={{ fontSize: '8px' }}>{t}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--primary)' }}>
                      {lead.budget.toLocaleString()} ₴
                    </td>
                    <td>{getStatusBadge(lead.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Lead Side Panel (Detail View) */}
        {selectedLead && (
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase' }}>Картка запиту</h3>
              <button 
                type="button" 
                onClick={() => setSelectedLead(null)} 
                style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Тема / Суть</span>
                <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-dark)' }}>{selectedLead.name}</p>
              </div>

              <div>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Контакт</span>
                <p style={{ color: 'var(--text-dark)' }}><strong>{selectedLead.contactPerson}</strong></p>
                <p style={{ fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-dark)' }}>{selectedLead.phone}</p>
                <p style={{ color: 'var(--text-medium)', fontSize: '11px', marginTop: '1px' }}>{selectedLead.email}</p>
              </div>

              {/* Tags Section */}
              <div>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Теги ліду</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px', marginBottom: '8px' }}>
                  {(selectedLead.tags || []).map(t => (
                    <span key={t} className="ios-badge ios-badge-purple flex items-center gap-1">
                      {t}
                      <X size={8} style={{ cursor: 'pointer' }} onClick={() => handleDeleteTag(t)} />
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    placeholder="Додати тег..."
                    value={newTagsVal}
                    onChange={(e) => setNewTagsVal(e.target.value)}
                    style={{ height: '24px', fontSize: '11px', padding: '0 4px' }}
                  />
                  <button type="button" onClick={handleAddTag} className="ios-btn ios-btn-primary ios-btn-small" style={{ padding: '2px 8px' }}>+</button>
                </div>
              </div>

              {/* Files Block */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Файли ліду</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
                  {(selectedLead.files || []).map(f => (
                    <div key={f} className="flex justify-between items-center p-1.5 rounded" style={{ fontSize: '11px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                      <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--primary)' }}>
                        <FileText size={11} />
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    placeholder="Назва файлу..."
                    value={newFileVal}
                    onChange={(e) => setNewFileVal(e.target.value)}
                    style={{ height: '24px', fontSize: '11px', padding: '0 4px' }}
                  />
                  <button type="button" onClick={handleAddFile} className="ios-btn ios-btn-secondary ios-btn-small" style={{ padding: '2px 8px' }}>+</button>
                </div>
              </div>

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Користувацькі поля</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {customFields.map(cf => {
                      let displayVal = selectedLead.customFieldValues?.[cf.name] || '—';
                      if (cf.type === 'formula' && cf.formulaExpression) {
                        displayVal = evaluateFormula(cf.formulaExpression, selectedLead.customFieldValues || {});
                      }
                      return (
                        <div key={cf.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: 'var(--text-medium)' }}>{cf.name}:</span>
                          <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>
                            {displayVal} {cf.type === 'formula' && ' (Формула)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Примітки</span>
                <p style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', color: 'var(--text-dark)', padding: '8px', borderRadius: '4px', fontSize: '11px', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                  {selectedLead.notes}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Бюджет</span>
                  <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--primary)' }}>{selectedLead.budget.toLocaleString()} ₴</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Статус</span>
                  <div style={{ marginTop: '2px' }}>{getStatusBadge(selectedLead.status)}</div>
                </div>
              </div>
            </div>

            {/* Change Status Command bar */}
            {selectedLead.status !== 'converted' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '0.5px solid var(--border-light)', paddingTop: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Перевести статус:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4px' }}>
                  <select 
                    value={selectedLead.status}
                    onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as any)}
                    style={{ fontSize: '11px', height: '28px', padding: '0 4px', border: 'none', backgroundColor: 'rgba(120,120,128,0.08)' }}
                  >
                    <option value="new">Необроблений</option>
                    <option value="contact">Перший контакт</option>
                    <option value="negotiation">Узгодження ТЗ</option>
                    <option value="review">Думає / Прорахунок</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => convertToClient(selectedLead)}
                    className="ios-btn ios-btn-primary"
                    style={{ fontSize: '11px' }}
                  >
                    В Клієнти
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => deleteLead(selectedLead.id)}
              className="ios-btn"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 59, 48, 0.08)',
                color: 'var(--danger)',
                border: 'none',
                fontSize: '11px',
                fontWeight: '700',
                marginTop: '10px'
              }}
            >
              Вилучити запит
            </button>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleAddLead} className="ios-modal" style={{ maxWidth: '500px' }}>
            <div className="ios-modal-header" style={{ backgroundColor: '#f1f5f9' }}>
              <h2 className="ios-modal-title" style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Новий запит покупця</h2>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="ios-modal-body">
              <div className="ios-input-group">
                <label className="ios-label">Тема запиту / Виріб *</label>
                <input 
                  required
                  placeholder="напр. Друк книг в твердій обкладинці"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                />
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Контактна особа *</label>
                <input 
                  required
                  placeholder="ПІБ клієнта"
                  value={newContact} 
                  onChange={(e) => setNewContact(e.target.value)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Контактний телефон</label>
                  <input 
                    placeholder="+380"
                    value={newPhone} 
                    onChange={(e) => setNewPhone(e.target.value)} 
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Email</label>
                  <input 
                    type="email"
                    placeholder="client@mail.com"
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Попередній бюджет (грн)</label>
                  <input 
                    type="number"
                    value={newBudget || ''} 
                    onChange={(e) => setNewBudget(Number(e.target.value))} 
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Джерело запиту</label>
                  <select 
                    value={newSource} 
                    onChange={(e) => setNewSource(e.target.value as any)} 
                  >
                    <option value="Site">Сайт</option>
                    <option value="Phone">Телефон</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Recommendation">Рекомендація</option>
                  </select>
                </div>
              </div>

              {customFields.filter(cf => cf.type === 'number').map(cf => (
                <div className="ios-input-group" key={cf.id}>
                  <label className="ios-label">{cf.name} (Користувацьке числове поле)</label>
                  <input
                    type="text"
                    placeholder={`Введіть ${cf.name} (допускаються . та ,)`}
                    value={fieldValues[cf.name] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.,-]/g, '');
                      setFieldValues({
                        ...fieldValues,
                        [cf.name]: val
                      });
                    }}
                  />
                </div>
              ))}

              <div className="ios-input-group">
                <label className="ios-label">Технічні вимоги / Примітки</label>
                <textarea 
                  rows={3}
                  value={newNotes} 
                  onChange={(e) => setNewNotes(e.target.value)} 
                  style={{ resize: 'none' }}
                />
              </div>
            </div>

            <div className="ios-modal-footer">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="ios-btn ios-btn-secondary"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className="ios-btn ios-btn-primary"
              >
                Записати
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
