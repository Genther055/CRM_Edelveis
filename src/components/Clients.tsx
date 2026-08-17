import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  User, 
  Landmark, 
  X,
  FolderPlus,
  Sliders,
  Filter,
  ArrowLeft,
  Phone,
  Edit3,
  Paperclip
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
    deleteClientSection,
    addSystemNotification
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Group / Section filtering state
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

  // Tag states
  const [newTagVal, setNewTagVal] = useState('');

  // Client Profile detail active tab (Нотатки / Чати / Email)
  const [profileTab, setProfileTab] = useState<'notes' | 'chats' | 'email'>('email');

  // Email form in Client Detail Page
  const [detailEmailSubject, setDetailEmailSubject] = useState('');
  const [detailEmailBody, setDetailEmailBody] = useState('');

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
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    if (activeSegmentFilter === 'leads' && c.type !== 'lead') return false;
    if (activeSegmentFilter === 'clients' && c.type !== 'client') return false;
    if (activeSegmentFilter.startsWith('section_')) {
      const secId = activeSegmentFilter.replace('section_', '');
      if (c.sectionId !== secId) return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchContact = (c.contact || '').toLowerCase().includes(q);
      const matchCity = (c.city || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').toLowerCase().includes(q);
      const matchTags = (c.tags || []).some(t => t.toLowerCase().includes(q));
      return matchName || matchContact || matchCity || matchPhone || matchTags;
    }
    return true;
  });

  const getClientStats = (clientId: string) => {
    const clientOrders = orders.filter(o => o.clientId === clientId);
    const totalSpent = clientOrders.reduce((sum, o) => sum + o.finalPrice, 0);
    return {
      orderCount: clientOrders.length,
      totalSpent
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

  const handleSendDetailEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    addSystemNotification(`📧 Gmail: Надіслано лист клієнту "${selectedClient.name}" з темою: "${detailEmailSubject || 'Без теми'}"`);
    alert(`Лист успішно надіслано на ${selectedClient.email || 'пошту замовника'}!`);
    setDetailEmailSubject('');
    setDetailEmailBody('');
  };

  return (
    <div className="main-content bg-[#f8fafc]" style={{ paddingBottom: '80px', minHeight: '100%' }}>
      
      {/* KEEPINCRM DETAILED CLIENT PROFILE VIEW */}
      {selectedClient ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Breadcrumb Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setSelectedClient(null)} 
                className="ios-btn ios-btn-secondary"
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} />
                Назад до списку
              </button>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Клієнти / <strong style={{ color: '#0f172a' }}>{selectedClient.name}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setSelectedClient(null)} className="ios-btn ios-btn-secondary" style={{ fontSize: '11px' }}>✕ Закрити</button>
            </div>
          </div>

          {/* 2-COLUMN MAIN KEEPINCRM LAYOUT */}
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Detailed Client Profile Card */}
            <div className="ios-card bg-white" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Big Avatar Image / Placeholder */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '36px',
                  fontWeight: '800',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)'
                }}>
                  <User size={48} />
                </div>
              </div>

              {/* Exact KeepinCRM Attribute Fields List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Тип ціни</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>Базова ціна</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Id</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>1575516{selectedClient.id}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Назва компанії</span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{selectedClient.name}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Контактна особа</span>
                  <span style={{ fontWeight: '700', color: '#007aff' }}>{selectedClient.contact || 'Віктор'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Номери телефонів</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} className="text-blue-500" />
                    <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#007aff' }}>
                      {selectedClient.phone || '+380956357775'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Email</span>
                  <span style={{ color: '#007aff', fontWeight: '600', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedClient.email || 'client1@edelveis.com'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Статус</span>
                  <div>
                    <span className="ios-badge ios-badge-blue">Новий</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Джерело</span>
                  <div>
                    <span className="ios-badge ios-badge-red">Дзвінок</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Головний відповідальний</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#007aff', color: '#fff', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      В
                    </div>
                    <span style={{ fontWeight: '700' }}>Віктор</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Підрядник</span>
                  <span style={{ opacity: 0.5 }}>—</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'flex-start' }}>
                  <span style={{ color: '#64748b' }}>Коментар</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Постійний замовник поліграфічної продукції</span>
                    <Edit3 size={11} className="text-slate-400 cursor-pointer" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Теги</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {(selectedClient.tags && selectedClient.tags.length > 0 ? selectedClient.tags : ['VIP', 'Поліграфія']).map(t => (
                      <span key={t} className="ios-badge ios-badge-purple" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {t}
                        <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleDeleteTag(t)} />
                      </span>
                    ))}
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                      <input 
                        placeholder="+ тег" 
                        value={newTagVal} 
                        onChange={(e) => setNewTagVal(e.target.value)} 
                        style={{ width: '50px', height: '18px', fontSize: '9px', padding: '1px 4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                      />
                      <button type="button" onClick={handleAddTag} style={{ fontSize: '9px', padding: '1px 4px', border: 'none', background: '#007aff', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Створив</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', fontSize: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      В
                    </div>
                    <span style={{ fontWeight: '600' }}>Працівник А</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Дата створення</span>
                  <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>01.04.2026 12:26</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Остання активність</span>
                  <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>17.08.2026 13:30</span>
                </div>
              </div>

              {/* Additional Contacts Block */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>Додаткові контакти</span>
                  <button type="button" className="ios-btn ios-btn-secondary ios-btn-small" style={{ fontSize: '10px' }}>+ Додати</button>
                </div>
                <table style={{ width: '100%', fontSize: '10px', color: '#64748b' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '4px' }}>ПІБ</th>
                      <th style={{ padding: '4px' }}>Телефон</th>
                      <th style={{ padding: '4px' }}>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '16px 0', opacity: 0.5 }}>
                        Немає додаткових контактів
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* RIGHT COLUMN: Financial Stats, Donut Chart, Communication Tabs & Activity Log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Top Financial Stat Summary Grid */}
              <div className="ios-card bg-white" style={{ padding: '16px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'left' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Сплачено</span>
                    <p style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a', margin: '2px 0 0 0' }}>
                      14 000,00 ₴
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Очікується</span>
                    <p style={{ fontSize: '18px', fontWeight: '900', color: '#ff9500', margin: '2px 0 0 0' }}>
                      20 000,00 ₴
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Прибуток</span>
                    <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '2px 0 0 0' }}>
                      14 000,00 ₴
                    </p>
                  </div>
                </div>
              </div>

              {/* Tasks & Deals Overview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                
                {/* Tasks Donut Chart Widget */}
                <div className="ios-card bg-white" style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>Завдання</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    
                    {/* Visual Donut Ring SVG */}
                    <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                      <svg width="70" height="70" viewBox="0 0 36 36">
                        <path stroke="#f1f5f9" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path stroke="#ff9500" strokeWidth="4" strokeDasharray="50, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path stroke="#ff3b30" strokeWidth="4" strokeDasharray="25, 100" strokeDashoffset="-50" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                    </div>

                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff9500' }}></span>
                        <span style={{ color: '#64748b' }}>В процесі виконання - <strong>1</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff3b30' }}></span>
                        <span style={{ color: '#64748b' }}>Протерміновано - <strong>1</strong></span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Deals Overview Widget */}
                <div className="ios-card bg-white" style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>Угоди</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Необроблені</span>
                      <strong style={{ fontWeight: '800' }}>1</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Всього</span>
                      <strong style={{ fontWeight: '800' }}>1</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Communication Tabs Card (Нотатки / Чати / Email) */}
              <div className="ios-card bg-white" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setProfileTab('notes')}
                    style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: profileTab === 'notes' ? '800' : '600', color: profileTab === 'notes' ? '#007aff' : '#64748b', cursor: 'pointer', borderBottom: profileTab === 'notes' ? '2px solid #007aff' : 'none', paddingBottom: '6px' }}
                  >
                    Нотатки
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setProfileTab('chats')}
                    style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: profileTab === 'chats' ? '800' : '600', color: profileTab === 'chats' ? '#007aff' : '#64748b', cursor: 'pointer', borderBottom: profileTab === 'chats' ? '2px solid #007aff' : 'none', paddingBottom: '6px' }}
                  >
                    Чати
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setProfileTab('email')}
                    style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: profileTab === 'email' ? '800' : '600', color: profileTab === 'email' ? '#007aff' : '#64748b', cursor: 'pointer', borderBottom: profileTab === 'email' ? '2px solid #007aff' : 'none', paddingBottom: '6px' }}
                  >
                    Email
                  </button>
                </div>

                {/* Email Tab Content */}
                {profileTab === 'email' && (
                  <form onSubmit={handleSendDetailEmail} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Кому</span>
                      <input 
                        value={`"${selectedClient.contact || selectedClient.name}" <${selectedClient.email || 'client1@edelveis.com'}>`} 
                        disabled 
                        style={{ backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>CC</span>
                      <input placeholder="Пошук копії..." style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Від</span>
                      <input 
                        value={`"Едельвейс і К" <office.edelveis@gmail.com> (E-mail)`} 
                        disabled 
                        style={{ backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>Тема</span>
                      <input 
                        placeholder="Тема листа..." 
                        value={detailEmailSubject} 
                        onChange={(e) => setDetailEmailSubject(e.target.value)} 
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                      <span className="ios-badge ios-badge-green" style={{ fontSize: '9px', cursor: 'pointer' }}>Змінні по клієнту</span>
                    </div>

                    <textarea 
                      rows={4} 
                      placeholder="Додати текст повідомлення..." 
                      value={detailEmailBody} 
                      onChange={(e) => setDetailEmailBody(e.target.value)} 
                      style={{ padding: '8px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      required
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="submit" className="ios-btn ios-btn-primary ios-btn-small" style={{ fontSize: '11px' }}>Відправити</button>
                        <button type="button" className="ios-btn ios-btn-secondary ios-btn-small" style={{ padding: '4px 8px' }}><Paperclip size={13} /></button>
                      </div>
                      <span className="ios-badge ios-badge-blue" style={{ fontSize: '9px', cursor: 'pointer' }}>Шаблон (KeepinCRM)</span>
                    </div>
                  </form>
                )}

                {/* Notes Tab Content */}
                {profileTab === 'notes' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea rows={3} placeholder="Введіть нотатку по клієнту..." style={{ padding: '8px', fontSize: '11px' }} />
                    <button type="button" className="ios-btn ios-btn-primary ios-btn-small" style={{ alignSelf: 'flex-start' }}>+ Зберегти нотатку</button>
                  </div>
                )}

                {/* Chats Tab Content */}
                {profileTab === 'chats' && (
                  <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '20px' }}>
                    💬 Журнал повідомлень месенджерів (Viber / Telegram) порожній
                  </div>
                )}

              </div>

              {/* Bottom Activity Log Card (Журнал активності) */}
              <div className="ios-card bg-white" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>Журнал активності</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#007aff', color: '#fff', fontSize: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>В</div>
                      <span><strong>Віктор</strong> створив(-ла) email-лист з темою <strong>Re: Закупівля тиражу бланків А4</strong></span>
                    </div>
                    <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>17.08.2026 13:30</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', fontSize: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>А</div>
                      <span>Створено замовлення <strong>№31101 (Бланки А4, 1000 шт)</strong> на суму <strong>433.76 грн</strong></span>
                    </div>
                    <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>17.08.2026 12:00</span>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <>
          {/* Title Header */}
          <div className="header-title-container">
            <div>
              <h2 className="page-title">База контрагентів</h2>
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
              <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase' }}>
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
                  backgroundColor: activeSegmentFilter === 'all' ? 'var(--primary)' : 'var(--bg-card)',
                  color: activeSegmentFilter === 'all' ? '#ffffff' : 'var(--text-dark)',
                  border: activeSegmentFilter === 'all' ? 'none' : '1px solid var(--border-light)'
                }}
              >
                <Filter size={13} />
                Всі замовники
              </button>

              <button
                type="button"
                onClick={() => setActiveSegmentFilter('leads')}
                className="ios-btn"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  backgroundColor: activeSegmentFilter === 'leads' ? 'var(--primary)' : 'var(--bg-card)',
                  color: activeSegmentFilter === 'leads' ? '#ffffff' : 'var(--text-dark)',
                  border: activeSegmentFilter === 'leads' ? 'none' : '1px solid var(--border-light)'
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
                  backgroundColor: activeSegmentFilter === 'clients' ? 'var(--primary)' : 'var(--bg-card)',
                  color: activeSegmentFilter === 'clients' ? '#ffffff' : 'var(--text-dark)',
                  border: activeSegmentFilter === 'clients' ? 'none' : '1px solid var(--border-light)'
                }}
              >
                <User size={13} />
                Замовники (Постійні)
              </button>

              {/* User Custom sections listing */}
              {clientSections.length > 0 && (
                <>
                  <div style={{ padding: '12px 8px 4px 8px', fontSize: '11px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase' }}>
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
                        backgroundColor: activeSegmentFilter === `section_${sec.id}` ? 'var(--primary)' : 'var(--bg-card)',
                        color: activeSegmentFilter === `section_${sec.id}` ? '#ffffff' : 'var(--text-dark)',
                        border: activeSegmentFilter === `section_${sec.id}` ? 'none' : '1px solid var(--border-light)'
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

            {/* Right list block */}
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

              {/* Table panel */}
              <div className="ios-card bg-white" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="ios-table-container">
                  <table className="ios-table">
                    <thead>
                      <tr>
                        <th>Назва замовника</th>
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
                              style={{ cursor: 'pointer' }}
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
            </div>

          </div>
        </>
      )}

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
