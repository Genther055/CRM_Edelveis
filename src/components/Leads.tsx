import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, Client, AdditionalContact } from '../types';
import { formatPhoneNumber } from '../utils/phoneFormatter';
import { findMatchingCompany, isContactInCompany } from '../utils/companyMatcher';
import { 
  Plus, 
  Search, 
  FileText, 
  X, 
  Globe, 
  PhoneCall, 
  Tag, 
  PackageCheck,
  Building,
  MessageSquare,
  Send,
  Mail
} from 'lucide-react';

export const Leads: React.FC = () => {
  const { 
    leads, 
    addLead, 
    updateLead, 
    deleteLead, 
    updateLeadStatus, 
    addClient, 
    updateClient,
    clients, 
    addOrder, 
    customFields,
    addSystemNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'calculator' | 'direct'>('all');
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTelegram, setNewTelegram] = useState('');
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

    const newLead = addLead({
      name: newName,
      contactPerson: newContact,
      phone: newPhone,
      email: newEmail,
      telegram: newTelegram ? (newTelegram.startsWith('@') ? newTelegram : `@${newTelegram}`) : undefined,
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
    });

    setShowAddModal(false);
    // Reset Form
    setNewName('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
    setNewTelegram('');
    setNewBudget(0);
    setNewNotes('');
    setFieldValues({});
    setSelectedLead(newLead);
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей запит?')) {
      deleteLead(id);
      if (selectedLead?.id === id) setSelectedLead(null);
    }
  };

  const convertToClient = (lead: Lead) => {
    // 1. Intelligent company fuzzy match & typo prevention
    const match = findMatchingCompany(lead.name, clients);
    
    if (match && match.score >= 0.70) {
      const existing = match.client;
      const alreadyIn = isContactInCompany(existing, lead.phone, lead.contactPerson);
      
      if (!alreadyIn && (lead.contactPerson || lead.phone)) {
        const newContact: AdditionalContact = {
          id: `ac_${Date.now()}`,
          name: lead.contactPerson || 'Представник',
          role: lead.role || 'Замовник / Контакт',
          phone: lead.phone || '',
          email: lead.email || undefined,
          telegram: lead.telegram || undefined,
          viber: lead.viber || lead.phone || undefined,
          notes: `Додано з онлайн-запиту: ${lead.notes || lead.name}`,
          createdAt: new Date().toISOString()
        };
        const updatedClient: Client = {
          ...existing,
          additionalContacts: [...(existing.additionalContacts || []), newContact]
        };
        updateClient(updatedClient);
        addSystemNotification(`🏢 Додано новий контакт «${newContact.name}» (${newContact.role}) до існуючої компанії «${existing.name}»`);
        alert(`Знайдено існуючу компанію «${existing.name}» (${Math.round(match.score * 100)}% схожості)!\n\nКонтактну особу «${newContact.name}» (${newContact.phone}) додано як додатковий контакт без створення дубліката компанії.`);
      } else {
        alert(`Компанія «${existing.name}» вже зареєстрована в базі контрагентів!`);
      }
      updateLeadStatus(lead.id, 'converted');
      return existing;
    }

    // 2. Exact phone fallback
    const existingByPhone = clients.find(c => lead.phone && isContactInCompany(c, lead.phone));
    if (existingByPhone) {
      alert(`Клієнт з номером ${lead.phone} вже зареєстрований як «${existingByPhone.name}»!`);
      updateLeadStatus(lead.id, 'converted');
      return existingByPhone;
    }

    // 3. Create fresh client card
    const created = addClient({
      name: lead.name,
      contact: lead.contactPerson || 'Замовник',
      phone: lead.phone || '',
      email: lead.email || '',
      discount: 0,
      city: 'Вінниця',
      tags: [...(lead.tags || []), 'З лідів'],
      files: lead.files || [],
      type: 'client'
    });
    alert(`Лід «${lead.contactPerson || lead.name}» успішно додано до бази контрагентів!\nСтворено нову картку компанії «${created.name}».`);
    updateLeadStatus(lead.id, 'converted');
    return created;
  };

  const convertToOrder = (lead: Lead) => {
    // 1. Intelligent fuzzy match to attach to existing company
    const match = findMatchingCompany(lead.name, clients);
    let client = match ? match.client : clients.find(c => lead.phone && isContactInCompany(c, lead.phone));

    if (client) {
      // If contact not in company, attach as additional contact
      if (!isContactInCompany(client, lead.phone, lead.contactPerson) && (lead.contactPerson || lead.phone)) {
        const newContact: AdditionalContact = {
          id: `ac_${Date.now()}`,
          name: lead.contactPerson || 'Представник',
          role: lead.role || 'Замовник',
          phone: lead.phone || '',
          email: lead.email || undefined,
          telegram: lead.telegram || undefined,
          viber: lead.viber || lead.phone || undefined,
          notes: `Замовлення з онлайн-запиту: ${lead.notes || lead.name}`,
          createdAt: new Date().toISOString()
        };
        updateClient({
          ...client,
          additionalContacts: [...(client.additionalContacts || []), newContact]
        });
        addSystemNotification(`👤 Контакт «${newContact.name}» додано до компанії «${client.name}»`);
      }
    } else {
      client = addClient({
        name: lead.name,
        contact: lead.contactPerson || 'Замовник',
        phone: lead.phone || '',
        email: lead.email || '',
        discount: 0,
        city: 'Вінниця',
        tags: [...(lead.tags || []), 'Онлайн-замовлення'],
        files: lead.files || [],
        type: 'client'
      });
    }

    const qty = lead.calcSpecs?.quantity || 1000;
    const finalPrice = lead.budget || 1000;
    const category = lead.calcSpecs?.category || 'Поліграфія';
    const format = lead.calcSpecs?.format || 'A4';
    const paperName = lead.calcSpecs?.material || 'Крейдований папір';
    const colors = lead.calcSpecs?.colors || '4+4';

    addOrder({
      name: lead.name,
      clientId: client.id,
      category,
      quantity: qty,
      packingCount: 1,
      paperType: 'coated',
      paperName,
      colors,
      isSamNaSebe: false,
      designCost: 0,
      margin: 20,
      machine: 'Офсет / Цифра',
      format,
      physicalSheets: Math.ceil(qty / 2),
      itemsPerSheet: 2,
      subtotal: Math.round(finalPrice * 0.8),
      marginAmount: Math.round(finalPrice * 0.2),
      finalPrice: finalPrice,
      unitPrice: Number((finalPrice / qty).toFixed(2)),
      paymentStatus: 'unpaid',
      prepayment: 0,
      notes: `Замовлення з онлайн-запиту ${lead.id}. ${lead.notes}`
    });

    updateLeadStatus(lead.id, 'converted');
    alert(`🚀 Замовлення успішно створено та закріплено за «${client.name}»!\nЗапит ${lead.id} переведено у статус "Готово".`);
  };

  const handleAddTag = () => {
    if (!selectedLead || !newTagsVal.trim()) return;
    const currentTags = selectedLead.tags || [];
    if (currentTags.includes(newTagsVal.trim())) return;

    const updated: Lead = {
      ...selectedLead,
      tags: [...currentTags, newTagsVal.trim()]
    };
    updateLead(updated);
    setSelectedLead(updated);
    setNewTagsVal('');
  };

  const handleDeleteTag = (t: string) => {
    if (!selectedLead) return;
    const updated: Lead = {
      ...selectedLead,
      tags: (selectedLead.tags || []).filter(tag => tag !== t)
    };
    updateLead(updated);
    setSelectedLead(updated);
  };

  const handleAddFile = () => {
    if (!selectedLead || !newFileVal.trim()) return;
    const currentFiles = selectedLead.files || [];

    const updated: Lead = {
      ...selectedLead,
      files: [...currentFiles, newFileVal.trim()]
    };
    updateLead(updated);
    setSelectedLead(updated);
    setNewFileVal('');
  };

  // Counts for tabs
  const calcLeadsCount = leads.filter(l => l.source === 'Calculator' || (l.tags && l.tags.includes('Онлайн-калькулятор'))).length;
  const newCalcLeadsCount = leads.filter(l => (l.source === 'Calculator' || (l.tags && l.tags.includes('Онлайн-калькулятор'))) && l.status === 'new').length;
  const directLeadsCount = leads.filter(l => l.source !== 'Calculator' && !(l.tags && l.tags.includes('Онлайн-калькулятор'))).length;

  const filteredLeads = leads.filter(lead => {
    // Tab filter
    const isCalc = lead.source === 'Calculator' || (lead.tags && lead.tags.includes('Онлайн-калькулятор'));
    if (activeTab === 'calculator' && !isCalc) return false;
    if (activeTab === 'direct' && isCalc) return false;

    // Search filter
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                          lead.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
                          lead.phone.includes(search) ||
                          lead.notes.toLowerCase().includes(search.toLowerCase());

    // Dropdown filters
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;

    return matchesSearch && matchesSource && matchesStatus;
  });

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'new': return <span className="ios-badge ios-badge-blue">Необроблений</span>;
      case 'contact': return <span className="ios-badge ios-badge-orange">Контакт</span>;
      case 'negotiation': return <span className="ios-badge ios-badge-purple">Узгодження ТЗ</span>;
      case 'review': return <span className="ios-badge ios-badge-yellow">Думає / КП</span>;
      case 'converted': return <span className="ios-badge ios-badge-green">Готово / Замовлення</span>;
    }
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      {/* Top Header */}
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Запити та звернення</h1>
          <p className="subtitle">Журнал вхідних запитів клієнтів, онлайн-прорахунків з калькулятора та лідів</p>
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

      {/* Modern Subtabs Filter Bar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText size={14} />
          <span>Всі запити</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {leads.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
            activeTab === 'calculator'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Globe size={14} className={activeTab === 'calculator' ? 'text-white' : 'text-emerald-600'} />
          <span>🌐 Онлайн-запити з калькулятора</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'calculator' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {calcLeadsCount}
          </span>
          {newCalcLeadsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('direct')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
            activeTab === 'direct'
              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <PhoneCall size={14} />
          <span>📞 Дзвінки та інші джерела</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'direct' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {directLeadsCount}
          </span>
        </button>
      </div>

      {/* Strict Command Panel / Filter Bar */}
      <div className="ios-card bg-white" style={{ display: 'flex', gap: '10px', padding: '10px 14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <Search style={{ position: 'absolute', left: '8px', top: '10px', color: '#94a3b8' }} size={14} />
          <input 
            placeholder="Шукати за назвою, телефоном..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '28px', height: '32px', fontSize: '12px', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
          <span>Джерело:</span>
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            style={{ height: '34px', minHeight: '34px', fontSize: '12px', width: '140px', padding: '4px 8px' }}
          >
            <option value="all">Всі джерела</option>
            <option value="Calculator">🌐 Калькулятор</option>
            <option value="Site">Сайт</option>
            <option value="Phone">Телефон</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="Recommendation">Рекомендація</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
          <span>Статус:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '34px', minHeight: '34px', fontSize: '12px', width: '140px', padding: '4px 8px' }}
          >
            <option value="all">Всі статуси</option>
            <option value="new">Необроблені</option>
            <option value="contact">Перший контакт</option>
            <option value="negotiation">Узгодження ТЗ</option>
            <option value="review">Думає / КП</option>
            <option value="converted">Готово / Замовлення</option>
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 400px' : '1fr', gap: '16px', alignItems: 'start', marginTop: '16px' }}>
        {/* Table View */}
        <div className="ios-table-container">
          <table className="ios-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th style={{ width: '90px' }}>Дата</th>
                <th>Назва запиту / Калькуляція</th>
                <th style={{ width: '140px' }}>Контактна особа</th>
                <th style={{ width: '110px' }}>Джерело</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Бюджет</th>
                <th style={{ width: '120px' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Немає записів у журналі за обраними фільтрами
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const isCalc = lead.source === 'Calculator' || (lead.tags && lead.tags.includes('Онлайн-калькулятор'));
                  return (
                    <tr 
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedLead?.id === lead.id ? 'rgba(0, 122, 255, 0.06)' : 'transparent' 
                      }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td style={{ fontWeight: '600', color: 'var(--text-medium)' }}>
                        <span className="font-mono text-xs">{lead.id}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>{lead.date}</td>
                      <td>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isCalc && (
                            <span className="ios-badge ios-badge-green text-[9px] font-black px-1.5 py-0.5">
                              Калькулятор
                            </span>
                          )}
                          {(() => {
                            const match = findMatchingCompany(lead.name, clients);
                            if (match && match.score >= 0.70) {
                              return (
                                <span className="ios-badge ios-badge-purple text-[9px] font-bold" title={`Схожість: ${Math.round(match.score * 100)}%`}>
                                  🏢 {match.client.name}
                                </span>
                              );
                            }
                            return null;
                          })()}
                          <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{lead.name}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                          {lead.notes}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-dark)', fontWeight: '600' }}>{lead.contactPerson || '—'}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-medium)', fontFamily: 'var(--font-mono)' }}>{lead.phone || '—'}</div>
                      </td>
                      <td>
                        {lead.source === 'Calculator' ? (
                          <span className="ios-badge ios-badge-blue flex items-center gap-1 text-[10px]">
                            <Globe size={10} /> Калькулятор
                          </span>
                        ) : (
                          <span className="ios-badge ios-badge-purple text-[10px]">{lead.source}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--primary)' }}>
                        {lead.budget.toLocaleString()} ₴
                      </td>
                      <td>{getStatusBadge(lead.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Lead Side Panel (Detail View) */}
        {selectedLead && (
          <div className="ios-card bg-white" style={{ border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', margin: 0 }}>
                  Картка запиту {selectedLead.id}
                </h3>
                {selectedLead.source === 'Calculator' && (
                  <span className="ios-badge ios-badge-blue text-[9px] font-black">Онлайн</span>
                )}
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedLead(null)} 
                style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Тема / Організація</span>
                <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-dark)', marginTop: '2px', lineHeight: '1.3' }}>{selectedLead.name}</p>
              </div>

              {/* Match with existing company alert banner */}
              {(() => {
                const match = findMatchingCompany(selectedLead.name, clients);
                if (!match || match.score < 0.70) return null;
                return (
                  <div style={{ padding: '8px 10px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontWeight: '800' }}>
                      <Building size={13} className="text-blue-600" />
                      <span>Існуюча компанія: <u>{match.client.name}</u> ({Math.round(match.score * 100)}%)</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#3b82f6' }}>
                      {match.reason}. При оформленні цей контакт буде збережено до додаткових контактів компанії без дублювання.
                    </span>
                  </div>
                );
              })()}

              <div>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Контактна інформація</span>
                <p style={{ color: 'var(--text-dark)', marginTop: '2px', fontWeight: '700' }}>
                  {selectedLead.contactPerson || 'Замовник'}
                  {selectedLead.role && (
                    <span className="ios-badge ios-badge-purple" style={{ fontSize: '9px', marginLeft: '6px' }}>
                      {selectedLead.role}
                    </span>
                  )}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dark)', fontWeight: '700' }}>
                    📱 {selectedLead.phone || 'Телефон не вказано'}
                  </span>
                  {selectedLead.phone && (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <a 
                        href={`tel:${selectedLead.phone}`} 
                        className="ios-badge ios-badge-green" 
                        style={{ padding: '2px 6px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                        title="Подзвонити"
                      >
                        <PhoneCall size={9} /> Дзвінок
                      </a>
                      <a 
                        href={`viber://chat?number=${encodeURIComponent(selectedLead.viber || selectedLead.phone)}`} 
                        style={{ backgroundColor: '#7360f2', color: '#fff', padding: '2px 6px', borderRadius: '6px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                        title="Написати у Viber"
                      >
                        <MessageSquare size={9} /> Viber
                      </a>
                    </div>
                  )}
                </div>

                {selectedLead.telegram && (
                  <div style={{ marginTop: '4px' }}>
                    <a
                      href={`https://t.me/${selectedLead.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ios-badge ios-badge-blue"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontSize: '10px' }}
                    >
                      <Send size={9} /> Telegram: {selectedLead.telegram}
                    </a>
                  </div>
                )}

                {selectedLead.email && (
                  <div style={{ marginTop: '4px' }}>
                    <a 
                      href={`mailto:${selectedLead.email}`}
                      style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                    >
                      <Mail size={9} /> {selectedLead.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Calculator Spec Box */}
              {(selectedLead.source === 'Calculator' || selectedLead.calcSpecs) && (
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <Globe size={12} className="text-blue-600" />
                      Специфікація калькулятора
                    </span>
                    <span className="font-mono text-xs font-black text-blue-700">
                      {selectedLead.budget.toLocaleString()} ₴
                    </span>
                  </div>

                  {selectedLead.calcSpecs && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-blue-200/50">
                      {selectedLead.calcSpecs.category && (
                        <div><span className="text-slate-500">Категорія:</span> <strong>{selectedLead.calcSpecs.category}</strong></div>
                      )}
                      {selectedLead.calcSpecs.format && (
                        <div><span className="text-slate-500">Формат:</span> <strong>{selectedLead.calcSpecs.format}</strong></div>
                      )}
                      {selectedLead.calcSpecs.quantity && (
                        <div><span className="text-slate-500">Тираж:</span> <strong>{selectedLead.calcSpecs.quantity.toLocaleString()} шт</strong></div>
                      )}
                      {selectedLead.calcSpecs.material && (
                        <div><span className="text-slate-500">Матеріал:</span> <strong>{selectedLead.calcSpecs.material}</strong></div>
                      )}
                      {selectedLead.calcSpecs.colors && (
                        <div><span className="text-slate-500">Друк:</span> <strong>{selectedLead.calcSpecs.colors}</strong></div>
                      )}
                      {selectedLead.calcSpecs.unitPrice && (
                        <div><span className="text-slate-500">За одиницю:</span> <strong>{selectedLead.calcSpecs.unitPrice.toFixed(2)} ₴</strong></div>
                      )}
                    </div>
                  )}

                  {selectedLead.calcSpecs?.options && (
                    <div className="text-[10px] text-blue-900 bg-white/80 p-2 rounded border border-blue-100 mt-1">
                      {selectedLead.calcSpecs.options}
                    </div>
                  )}
                </div>
              )}

              {/* Tags Section */}
              <div>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={10} /> Теги
                </span>
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
                    style={{ height: '24px', fontSize: '11px', padding: '0 6px', flex: 1 }}
                  />
                  <button type="button" onClick={handleAddTag} className="ios-btn ios-btn-primary ios-btn-small" style={{ padding: '2px 8px' }}>+</button>
                </div>
              </div>

              {/* Files Block */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Файли та макети</span>
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
                    placeholder="Назва файлу макета..."
                    value={newFileVal}
                    onChange={(e) => setNewFileVal(e.target.value)}
                    style={{ height: '24px', fontSize: '11px', padding: '0 6px', flex: 1 }}
                  />
                  <button type="button" onClick={handleAddFile} className="ios-btn ios-btn-secondary ios-btn-small" style={{ padding: '2px 8px' }}>+</button>
                </div>
              </div>

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Користувацькі поля</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                <span style={{ color: 'var(--text-medium)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Примітки та коментарі</span>
                <p style={{ backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', color: 'var(--text-dark)', padding: '8px', borderRadius: '6px', fontSize: '11px', marginTop: '2px', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
                  {selectedLead.notes || 'Немає коментарів'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Бюджет</span>
                  <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--primary)', margin: 0 }}>{selectedLead.budget.toLocaleString()} ₴</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-medium)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Статус</span>
                  <div style={{ marginTop: '2px' }}>{getStatusBadge(selectedLead.status)}</div>
                </div>
              </div>
            </div>

            {/* Quick One-Click Action: Launch into Production */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => convertToOrder(selectedLead)}
                className="ios-btn ios-btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <PackageCheck size={16} />
                🚀 Створити замовлення у виробництво
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px' }}>
                <select 
                  value={selectedLead.status}
                  onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as any)}
                  style={{ fontSize: '11px', height: '30px', padding: '0 6px', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                >
                  <option value="new">Необроблений</option>
                  <option value="contact">Перший контакт</option>
                  <option value="negotiation">Узгодження ТЗ</option>
                  <option value="review">Думає / КП</option>
                  <option value="converted">Готово / Виконано</option>
                </select>
                <button
                  type="button"
                  onClick={() => convertToClient(selectedLead)}
                  className="ios-btn ios-btn-secondary"
                  style={{ fontSize: '11px', padding: '0 6px', height: '30px' }}
                >
                  В Клієнти
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteLead(selectedLead.id)}
              className="ios-btn"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 59, 48, 0.08)',
                color: 'var(--danger)',
                border: 'none',
                fontSize: '11px',
                fontWeight: '700',
                marginTop: '4px'
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
                  placeholder="напр. Друк книг у твердій обкладинці"
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
                  <label className="ios-label">Контактний телефон *</label>
                  <input 
                    required
                    placeholder="+(380)-__-___-__-__"
                    value={newPhone} 
                    onChange={(e) => setNewPhone(formatPhoneNumber(e.target.value))} 
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Нік у Telegram</label>
                  <input 
                    placeholder="@username"
                    value={newTelegram} 
                    onChange={(e) => setNewTelegram(e.target.value)} 
                  />
                </div>
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
                    <option value="Calculator">🌐 Онлайн-калькулятор</option>
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
