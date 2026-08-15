import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  User, 
  Landmark, 
  X,
  FileText,
  FolderPlus,
  Sliders,
  Filter
} from 'lucide-react';
import type { Client } from '../types';

export const Clients: React.FC = () => {
  const { 
    clients, 
    addClient, 
    updateClient, 
    orders, 
    clientSections, 
    addClientSection,
    deleteClientSection 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Group / Section filtering state
  // 'all' | 'leads' | 'clients' | 'section_[id]'
  const [activeSegmentFilter, setActiveSegmentFilter] = useState<string>('all');

  // Form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [discount, setDiscount] = useState(0);
  const [city, setCity] = useState('Вінниця');
  const [clientType, setClientType] = useState<'lead' | 'client'>('client');
  const [targetSectionId, setTargetSectionId] = useState('');
  const [targetSectionStatus, setTargetSectionStatus] = useState('');
  
  // Custom field inputs values for sections
  const [sectionFieldVals, setSectionFieldVals] = useState<Record<string, string | number>>({});

  // New Custom Section Form State
  const [newSecName, setNewSecName] = useState('');
  const [newSecStatuses, setNewSecStatuses] = useState('Узгодження, Активний, Архів');
  const [newSecFieldName, setNewSecFieldName] = useState('');
  const [newSecFieldType, setNewSecFieldType] = useState<'number' | 'text'>('text');

  // Tag & File states
  const [newTagVal, setNewTagVal] = useState('');
  const [newFileVal, setNewFileVal] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addClient({
      name,
      contact,
      phone,
      email,
      discount: Number(discount) || 0,
      city: city || 'Вінниця',
      tags: [],
      files: [],
      type: clientType,
      sectionId: targetSectionId || undefined,
      sectionStatus: targetSectionStatus || undefined,
      sectionFieldValues: targetSectionId ? { ...sectionFieldVals } : undefined
    });

    // Reset form
    setName('');
    setContact('');
    setPhone('');
    setEmail('');
    setDiscount(0);
    setCity('Вінниця');
    setClientType('client');
    setTargetSectionId('');
    setTargetSectionStatus('');
    setSectionFieldVals({});
    setShowAddModal(false);
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecName.trim()) return;

    addClientSection({
      name: newSecName,
      customFields: newSecFieldName ? [{ name: newSecFieldName, type: newSecFieldType }] : [],
      statuses: newSecStatuses.split(',').map(s => s.trim())
    });

    setNewSecName('');
    setNewSecStatuses('Узгодження, Активний, Архів');
    setNewSecFieldName('');
    setShowSectionModal(false);
    alert('Користувацький розділ успішно створено!');
  };

  // Filter clients based on segment
  const filteredClientsBySegment = clients.filter(c => {
    if (activeSegmentFilter === 'leads') return c.type === 'lead';
    if (activeSegmentFilter === 'clients') return c.type === 'client';
    if (activeSegmentFilter.startsWith('section_')) {
      const secId = activeSegmentFilter.replace('section_', '');
      return c.sectionId === secId;
    }
    return true;
  });

  const filteredClients = filteredClientsBySegment.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getClientStats = (clientId: string) => {
    const clientOrders = orders.filter(o => o.clientId === clientId);
    const totalAmount = clientOrders.reduce((sum, o) => sum + o.finalPrice, 0);
    return {
      orderCount: clientOrders.length,
      totalAmount,
      orders: clientOrders
    };
  };

  const handleAddTag = () => {
    if (!selectedClient || !newTagVal.trim()) return;
    const currentTags = selectedClient.tags || [];
    if (currentTags.includes(newTagVal.trim())) return;
    
    const updatedClient = { ...selectedClient, tags: [...currentTags, newTagVal.trim()] };
    updateClient(updatedClient);
    setSelectedClient(updatedClient);
    setNewTagVal('');
  };

  const handleDeleteTag = (tagToDelete: string) => {
    if (!selectedClient) return;
    const updatedClient = { ...selectedClient, tags: (selectedClient.tags || []).filter(t => t !== tagToDelete) };
    updateClient(updatedClient);
    setSelectedClient(updatedClient);
  };

  const handleAddFile = () => {
    if (!selectedClient || !newFileVal.trim()) return;
    const currentFiles = selectedClient.files || [];
    const updatedClient = { ...selectedClient, files: [...currentFiles, newFileVal.trim()] };
    updateClient(updatedClient);
    setSelectedClient(updatedClient);
    setNewFileVal('');
  };

  return (
    <div className="main-content bg-[#f2f2f7]">
      {/* Title Header */}
      <div className="header-title-container">
        <div>
          <h2 className="page-title text-slate-900">База контрагентів</h2>
          <p className="subtitle">Сегментація лідів, клієнтів та користувацьких розділів</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowSectionModal(true)} 
            className="ios-btn ios-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FolderPlus size={14} />
            Новий розділ
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)} 
            className="ios-btn ios-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={16} />
            Новий запис
          </button>
        </div>
      </div>

      {/* Main layout: Sidebar filters + Grid table */}
      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Segment Sidebar filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '800', color: '#8e8e93', textTransform: 'uppercase' }}>
            Сегменти бази
          </div>
          
          <button
            type="button"
            onClick={() => setActiveSegmentFilter('all')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSegmentFilter === 'all' ? 'var(--primary)' : '#ffffff',
              color: activeSegmentFilter === 'all' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Filter size={13} />
            Всі контрагенти
          </button>

          <button
            type="button"
            onClick={() => setActiveSegmentFilter('leads')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSegmentFilter === 'leads' ? 'var(--primary)' : '#ffffff',
              color: activeSegmentFilter === 'leads' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Sliders size={13} />
            Ліди (Запити)
          </button>

          <button
            type="button"
            onClick={() => setActiveSegmentFilter('clients')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSegmentFilter === 'clients' ? 'var(--primary)' : '#ffffff',
              color: activeSegmentFilter === 'clients' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <User size={13} />
            Клієнти
          </button>

          {/* User Custom sections listing */}
          {clientSections.length > 0 && (
            <>
              <div style={{ padding: '12px 8px 4px 8px', fontSize: '11px', fontWeight: '800', color: '#8e8e93', textTransform: 'uppercase' }}>
                Користувацькі розділи
              </div>
              {clientSections.map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSegmentFilter(`section_${sec.id}`)}
                  className="ios-btn"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    justifyContent: 'space-between',
                    backgroundColor: activeSegmentFilter === `section_${sec.id}` ? 'var(--primary)' : '#ffffff',
                    color: activeSegmentFilter === `section_${sec.id}` ? '#ffffff' : 'var(--text-dark)'
                  }}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Landmark size={13} />
                    {sec.name}
                  </span>
                  <X 
                    size={12} 
                    style={{ opacity: 0.5, cursor: 'pointer' }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Видалити цей розділ?')) {
                        deleteClientSection(sec.id);
                        setActiveSegmentFilter('all');
                      }
                    }} 
                  />
                </button>
              ))}
            </>
          )}
        </div>

        {/* Right list and details block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search box */}
          <div className="ios-card bg-white" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={18} style={{ color: 'var(--text-medium)', opacity: 0.6 }} />
            <input
              type="text"
              className="ios-input"
              placeholder="Шукати за назвою, тегами, містом або телефоном..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '6px 10px', backgroundColor: 'transparent', width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedClient ? '1fr 370px' : '1fr', gap: '20px', alignItems: 'start' }}>
            {/* Table panel */}
            <div className="ios-card bg-white" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="ios-table-container">
                <table className="ios-table">
                  <thead>
                    <tr>
                      <th>Назва контрагента</th>
                      <th>Місто</th>
                      <th>Тип</th>
                      <th>Статус / Розділ</th>
                      <th>Теги</th>
                      <th>Замовлень</th>
                      <th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-medium)' }}>
                          Дані в обраному сегменті відсутні
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map(c => {
                        const stats = getClientStats(c.id);
                        const parentSec = clientSections.find(s => s.id === c.sectionId);
                        return (
                          <tr 
                            key={c.id} 
                            onClick={() => setSelectedClient(c)}
                            style={{ 
                              cursor: 'pointer',
                              backgroundColor: selectedClient?.id === c.id ? 'rgba(0, 122, 255, 0.05)' : 'transparent'
                            }}
                          >
                            <td style={{ fontWeight: '700' }}>{c.name}</td>
                            <td>{c.city || 'Вінниця'}</td>
                            <td>
                              <span className={`ios-badge ${c.type === 'lead' ? 'ios-badge-orange' : 'ios-badge-green'}`}>
                                {c.type === 'lead' ? 'Лід' : 'Клієнт'}
                              </span>
                            </td>
                            <td>
                              {parentSec ? (
                                <span className="ios-badge ios-badge-purple" style={{ fontSize: '9px' }}>
                                  {parentSec.name}: {c.sectionStatus || 'Новий'}
                                </span>
                              ) : (
                                <span style={{ opacity: 0.5 }}>—</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {(c.tags || []).map(t => (
                                  <span key={t} className="ios-badge ios-badge-blue" style={{ fontSize: '9px' }}>{t}</span>
                                ))}
                              </div>
                            </td>
                            <td style={{ fontWeight: '700', textAlign: 'center' }}>{stats.orderCount}</td>
                            <td>
                              <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedClient(c);
                                }}
                                className="ios-btn ios-btn-secondary ios-btn-small"
                              >
                                Картка
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Client Card Details */}
            {selectedClient && (
              <div className="ios-card bg-white" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--border-light)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)' }}>ДЕТАЛІ ЗАПИСУ</h3>
                  <button 
                    onClick={() => setSelectedClient(null)} 
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-medium)' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Classification changer */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#f2f2f7', padding: '6px 10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#636366' }}>Тип бази:</span>
                  <select
                    value={selectedClient.type || 'client'}
                    onChange={(e) => {
                      const updated = { ...selectedClient, type: e.target.value as any };
                      updateClient(updated);
                      setSelectedClient(updated);
                    }}
                    style={{ height: '24px', fontSize: '11px', border: 'none', backgroundColor: 'transparent', fontWeight: '700' }}
                  >
                    <option value="client">Клієнт</option>
                    <option value="lead">Лід</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#8e8e93', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Назва / Організація</span>
                    <p style={{ fontSize: '15px', fontWeight: '800' }}>{selectedClient.name}</p>
                  </div>

                  <div>
                    <span style={{ color: '#8e8e93', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Контакт та телефон</span>
                    <p><strong>{selectedClient.contact || '—'}</strong></p>
                    <p style={{ fontFamily: 'var(--font-mono)' }}>{selectedClient.phone || '—'}</p>
                  </div>
                </div>

                {/* Section Specific Status & Fields rendering */}
                {selectedClient.sectionId && (
                  <div style={{ border: '0.5px solid var(--border-light)', padding: '10px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <span style={{ color: '#8e8e93', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Поля користувацького розділу
                    </span>
                    
                    {/* Status updater */}
                    {(() => {
                      const currentSec = clientSections.find(s => s.id === selectedClient.sectionId);
                      if (!currentSec) return null;
                      return (
                        <div className="ios-input-group" style={{ marginBottom: '8px' }}>
                          <label className="ios-label">Статус контрагента</label>
                          <select
                            value={selectedClient.sectionStatus || currentSec.statuses[0] || ''}
                            onChange={(e) => {
                              const updated = { ...selectedClient, sectionStatus: e.target.value };
                              updateClient(updated);
                              setSelectedClient(updated);
                            }}
                          >
                            {currentSec.statuses.map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </div>
                      );
                    })()}

                    {/* Section custom fields rendering */}
                    {(() => {
                      const currentSec = clientSections.find(s => s.id === selectedClient.sectionId);
                      if (!currentSec) return null;
                      return currentSec.customFields.map(f => (
                        <div key={f.name} className="ios-input-group" style={{ marginBottom: '4px' }}>
                          <label className="ios-label">{f.name}</label>
                          <input 
                            value={selectedClient.sectionFieldValues?.[f.name] || ''}
                            onChange={(e) => {
                              const updatedValues = { ...(selectedClient.sectionFieldValues || {}), [f.name]: e.target.value };
                              const updated = { ...selectedClient, sectionFieldValues: updatedValues };
                              updateClient(updated);
                              setSelectedClient(updated);
                            }}
                            placeholder={`Введіть ${f.name}...`}
                          />
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* Tagging */}
                <div>
                  <span style={{ color: '#8e8e93', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Тегування</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px', marginBottom: '8px' }}>
                    {(selectedClient.tags || []).map(t => (
                      <span key={t} className="ios-badge ios-badge-purple flex items-center gap-1">
                        {t}
                        <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleDeleteTag(t)} />
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      placeholder="Додати тег..."
                      value={newTagVal}
                      onChange={(e) => setNewTagVal(e.target.value)}
                      style={{ height: '28px', fontSize: '12px' }}
                    />
                    <button type="button" onClick={handleAddTag} className="ios-btn ios-btn-primary ios-btn-small">Додати</button>
                  </div>
                </div>

                {/* Files Block */}
                <div>
                  <span style={{ color: '#8e8e93', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Блок "Файли"</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', marginBottom: '8px' }}>
                    {(selectedClient.files || []).map(f => (
                      <div key={f} className="flex justify-between items-center bg-[#f9f9f9] p-2 rounded" style={{ fontSize: '12px' }}>
                        <span className="flex items-center gap-1.5 font-medium text-blue-600">
                          <FileText size={12} />
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      placeholder="Назва файлу..."
                      value={newFileVal}
                      onChange={(e) => setNewFileVal(e.target.value)}
                      style={{ height: '28px', fontSize: '12px' }}
                    />
                    <button type="button" onClick={handleAddFile} className="ios-btn ios-btn-secondary ios-btn-small">Додати</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Section Modal */}
      {showSectionModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleCreateSection} className="ios-modal" style={{ maxWidth: '400px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Створити новий розділ</h3>
              <button type="button" onClick={() => setShowSectionModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Назва розділу *</label>
                <input required placeholder="напр. Дизайнери Аутсорс" value={newSecName} onChange={(e) => setNewSecName(e.target.value)} />
              </div>
              <div className="ios-input-group">
                <label className="ios-label">Перелік статусів (через кому)</label>
                <input placeholder="Вільний, Зайнятий, Архів" value={newSecStatuses} onChange={(e) => setNewSecStatuses(e.target.value)} />
              </div>
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Налаштувати користувацьке поле</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                  <input placeholder="Назва поля (напр. Рейтинг)" value={newSecFieldName} onChange={(e) => setNewSecFieldName(e.target.value)} style={{ height: '32px' }} />
                  <select value={newSecFieldType} onChange={(e) => setNewSecFieldType(e.target.value as any)} style={{ height: '32px' }}>
                    <option value="text">Текст</option>
                    <option value="number">Число</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowSectionModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Створити розділ</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Client / Partner Modal */}
      {showAddModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleAddClient} className="ios-modal" style={{ maxWidth: '500px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Створити запис у базі</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Назва / Організація *</label>
                <input required placeholder="напр. ТОВ Едельвейс і К" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Класифікація</label>
                  <select value={clientType} onChange={(e) => setClientType(e.target.value as any)}>
                    <option value="client">Клієнт</option>
                    <option value="lead">Лід (Запит)</option>
                  </select>
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Прив'язати до розділу</label>
                  <select 
                    value={targetSectionId} 
                    onChange={(e) => {
                      setTargetSectionId(e.target.value);
                      const sec = clientSections.find(s => s.id === e.target.value);
                      setTargetSectionStatus(sec?.statuses[0] || '');
                      setSectionFieldVals({});
                    }}
                  >
                    <option value="">Без користувацького розділу</option>
                    {clientSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Rendering section specific fields to configure value */}
              {targetSectionId && (
                <div style={{ border: '0.5px solid var(--border-light)', padding: '10px', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#8e8e93' }}>Специфічні поля для обраного розділу</span>
                  {(() => {
                    const sec = clientSections.find(s => s.id === targetSectionId);
                    if (!sec) return null;
                    return sec.customFields.map(f => (
                      <div className="ios-input-group" key={f.name} style={{ marginBottom: 0 }}>
                        <label className="ios-label">{f.name}</label>
                        <input 
                          placeholder={`Введіть значення ${f.name}`} 
                          value={sectionFieldVals[f.name] || ''} 
                          onChange={(e) => setSectionFieldVals({ ...sectionFieldVals, [f.name]: e.target.value })}
                        />
                      </div>
                    ));
                  })()}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Контактна особа</label>
                  <input placeholder="Прізвище ім'я" value={contact} onChange={(e) => setContact(e.target.value)} />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Телефон</label>
                  <input placeholder="+380" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Ел. пошта</label>
                  <input placeholder="client@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Знижка (%)</label>
                  <input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                </div>
              </div>
            </div>
            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowAddModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти запис</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
