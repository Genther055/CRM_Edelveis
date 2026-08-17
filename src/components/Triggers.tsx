import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  ShieldCheck, 
  Coins, 
  Bot, 
  Mail, 
  Inbox, 
  Send, 
  Paperclip, 
  CheckCircle2, 
  UserPlus, 
  FilePlus, 
  StickyNote, 
  Search, 
  RotateCcw, 
  AlertTriangle, 
  BellRing, 
  Sparkles, 
  FileText,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';

interface TriggerRule {
  id: string;
  name: string;
  event: string;
  action: string;
  active: boolean;
}

interface ValidationRule {
  id: string;
  name: string;
  targetField: string;
  condition: string;
  errorMessage: string;
  active: boolean;
}

interface EmailItem {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  time: string;
  unread: boolean;
  replied: boolean;
  attachments: string[];
  body: string;
  senderName: string;
  isDraft?: boolean;
}

export const Triggers: React.FC = () => {
  const { 
    addAutoPaymentTrigger, 
    addSystemNotification,
    addSmsTemplate,
    addOrder,
    clients
  } = useApp();

  const [triggers, setTriggers] = useState<TriggerRule[]>([
    { id: 'TR-1', name: 'Авто-завдання: Перевірка макета', event: 'Нова угода створена', action: 'Створити завдання "Перевірити макет" для Дизайнера', active: true },
    { id: 'TR-2', name: 'SMS-сповіщення: Готовність тиражу', event: 'Етап змінено на "Готово"', action: 'Надіслати SMS "Замовлення {name} готове до видачі!"', active: true },
    { id: 'TR-3', name: 'Авто-списання складу', event: 'Угода переведена в статус "Готово"', action: 'Списати зарезервовану сировину', active: true }
  ]);

  const [validations, setValidations] = useState<ValidationRule[]>([
    { id: 'VL-1', name: 'Макет є обов\'язковим', targetField: 'Файли макета', condition: 'Не порожньо при переході у "Друк"', errorMessage: 'Неможливо розпочати друк: завантажте оригінал-макет!', active: true },
    { id: 'VL-2', name: 'Контроль передплати перед друком', targetField: 'Сума передплати', condition: '>= 50% від бюджету перед друком', errorMessage: 'Потрібно внести щонайменше 50% оплати для запуску тиражу!', active: false }
  ]);

  const [activeTab, setActiveTab] = useState<'triggers' | 'email' | 'validations' | 'autopay' | 'sms'>('email');

  // Email & Gmail state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [systemNotifyEnabled, setSystemNotifyEnabled] = useState(true);
  const [emailFilter, setEmailFilter] = useState<'all' | 'unreplied' | 'unread' | 'drafts' | 'sent'>('all');
  const [emailSearch, setEmailSearch] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  // Email composer form state
  const [toEmail, setToEmail] = useState('Замовник №1 <client1@edelveis.com>');
  const [ccEmail, setCcEmail] = useState('');
  const [bccEmail, setBccEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('Рахунок-Специфікація та підтвердження замовлення №31101');
  const [emailBody, setEmailBody] = useState('Доброго дня!\n\nНадсилаємо вам розрахований Рахунок-Специфікацію замовлення №31101 (Бланки А4, Офсетний 70г, 1000 шт.).\n\nПросимо перевірити деталі та підтвердити запуск у друк.\n\nЗ повагою,\nПоліграфічна компанія «Едельвейс і К»');
  const [attachInvoice, setAttachInvoice] = useState(true);
  const [attachAct, setAttachAct] = useState(false);
  const [attachProof, setAttachProof] = useState(true);
  const autoSaveStatus = '💾 Збережено у чернетки (автозбереження 13:32)';

  // List of emails
  const [emails, setEmails] = useState<EmailItem[]>([
    {
      id: 'EM-101',
      from: 'client1@edelveis.com',
      to: 'office.edelveis@gmail.com',
      senderName: 'Замовник №1',
      subject: 'Замовлення №31101 — Рахунок та узгодження макету А4',
      date: '17 Серп 2026',
      time: '13:20',
      unread: true,
      replied: false,
      attachments: ['№31101_Бланки_А4.pdf', 'Оригінал_макет_A4.pdf'],
      body: 'Доброго дня! Просимо надіслати підтвердження запуску тиражу Бланки А4 (1000 шт.) та сформований рахунок-специфікацію. Дякуємо!'
    },
    {
      id: 'EM-102',
      from: 'client2@edelveis.com',
      to: 'office.edelveis@gmail.com',
      senderName: 'Замовник №2',
      subject: 'Запит на розрахунок листівок А5 (Крейда 130г, 4+4)',
      date: '17 Серп 2026',
      time: '11:45',
      unread: true,
      replied: false,
      attachments: ['ТЗ_Листівки_А5.pdf'],
      body: 'Вітаємо! Прорахуйте, будь ласка, вартість тиражу 2000 шт. листівок А5 4+4 з матовою ламінацією.'
    },
    {
      id: 'EM-103',
      from: 'client3@edelveis.com',
      to: 'office.edelveis@gmail.com',
      senderName: 'Замовник №3',
      subject: 'Підтвердження оплати рахунку №15744',
      date: '16 Серп 2026',
      time: '16:30',
      unread: false,
      replied: true,
      attachments: ['Квитанція_ПриватБанк.pdf'],
      body: 'Доброго дня! Оплата за замовлення №15744 здійснена у повному обсязі у Приват24.'
    },
    {
      id: 'EM-104',
      from: 'client4@edelveis.com',
      to: 'office.edelveis@gmail.com',
      senderName: 'Замовник №4',
      subject: 'Уточнення щодо термінів відправки в Київ Новою Поштою',
      date: '16 Серп 2026',
      time: '14:15',
      unread: false,
      replied: false,
      attachments: [],
      body: 'Добрий день. Коли планово буде виготовлено та відправлено Новою Поштою наш тираж газет 45г?'
    },
    {
      id: 'EM-105',
      from: 'office.edelveis@gmail.com',
      to: 'client5@edelveis.com',
      senderName: 'Чернетка (Менеджер)',
      subject: 'Комерційна пропозиція на корпоративні блокноти А5',
      date: '15 Серп 2026',
      time: '10:00',
      unread: false,
      replied: false,
      attachments: ['КП_Блокноти_А5.pdf'],
      body: 'Шановний замовнику! Надсилаємо сформовану КП на блокноти зі пружиною та твердою обкладинкою...',
      isDraft: true
    }
  ]);

  // Auto Payment creation state
  const [newStage, setNewStage] = useState('ready');
  const [newCategory, setNewCategory] = useState('Оплата клієнта');
  const [newWallet, setNewWallet] = useState('ПриватБанк ФОП');
  const [newPercent, setNewPercent] = useState(100);

  // SMS template creation state
  const [newSmsName, setNewSmsName] = useState('');
  const [newSmsText, setNewSmsText] = useState('Вітаємо {name}! ТОВ Едельвейс і К виконує ваше замовлення №{id}.');

  const toggleTrigger = (id: string) => {
    setTriggers(triggers.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const toggleValidation = (id: string) => {
    setValidations(validations.map(v => v.id === id ? { ...v, active: !v.active } : v));
  };

  const handleCreateAutoPayRule = (e: React.FormEvent) => {
    e.preventDefault();
    addAutoPaymentTrigger({
      dealStage: newStage,
      category: newCategory,
      wallet: newWallet,
      percentage: newPercent,
      active: true
    });
    addSystemNotification(`🤖 Keepin Bot: Створено нове правило автооплати для етапу "${newStage}"`);
    alert('Правило автооплати успішно додано!');
  };

  const handleCreateSmsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmsName.trim() || !newSmsText.trim()) return;
    addSmsTemplate({ name: newSmsName, text: newSmsText });
    setNewSmsName('');
    alert('Шаблон SMS збережено успішно!');
  };

  // Quick action: Create Deal from Email
  const handleCreateDealFromEmail = (email: EmailItem) => {
    addOrder({
      name: `Угода з Email: ${email.subject}`,
      clientId: clients[0]?.id || '1',
      category: 'Бланки',
      quantity: 1000,
      packingCount: 500,
      paperType: 'offset',
      colors: '1+0',
      isSamNaSebe: true,
      designCost: 34,
      margin: 100,
      machine: 'Опція 1',
      format: 'A4',
      physicalSheets: 500,
      itemsPerSheet: 2,
      subtotal: 216.88,
      marginAmount: 216.88,
      finalPrice: 433.76,
      unitPrice: 0.43,
      paymentStatus: 'unpaid',
      prepayment: 0,
      notes: `Автоматично створено з Email від ${email.senderName} (${email.from}). Текст: ${email.body}`
    });
    addSystemNotification(`📧 Створено нову Угоду з Email від ${email.senderName}`);
    alert(`Угоду за листом від ${email.senderName} успішно створено у системі!`);
  };

  // Quick action: Create Task from Email
  const handleCreateTaskFromEmail = (email: EmailItem) => {
    addSystemNotification(`📌 Створено нове завдання за листом від ${email.senderName}: "${email.subject}"`);
    alert(`Завдання за листом від ${email.senderName} успішно додано у календар завдань!`);
  };

  // Quick action: Add Note from Email
  const handleAddNoteFromEmail = (email: EmailItem) => {
    addSystemNotification(`📝 Нотатку з листа "${email.subject}" прикріплено до картки замовника ${email.senderName}`);
    alert(`Нотатку з листа від ${email.senderName} збережено в історії клієнта!`);
  };

  // Send Email handler
  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSentEmail: EmailItem = {
      id: `EM-${Date.now()}`,
      from: 'office.edelveis@gmail.com',
      to: toEmail,
      senderName: 'Видавництво Едельвейс і К',
      subject: emailSubject,
      date: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' }),
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      unread: false,
      replied: true,
      attachments: [
        ...(attachInvoice ? ['№31101_Бланки_А4.pdf'] : []),
        ...(attachAct ? ['Акт_виконаних_робіт.pdf'] : []),
        ...(attachProof ? ['Кольоропроба_макет.pdf'] : [])
      ],
      body: emailBody
    };
    setEmails([newSentEmail, ...emails]);
    setShowComposeModal(false);
    addSystemNotification(`📧 Gmail: Лист з прикріпленими документами успішно надіслано на ${toEmail}`);
    alert(`Лист успішно надіслано на ${toEmail}!`);
  };

  // Template select in composer
  const handleApplyTemplate = (tpl: string) => {
    if (tpl === 'invoice') {
      setEmailSubject('Рахунок-Специфікація замовлення №31101');
      setEmailBody('Вітаємо!\n\nНадсилаємо сформований Рахунок-Специфікацію замовлення №31101.\nПросимо підтвердити запуск у виробництво.');
      setAttachInvoice(true);
    } else if (tpl === 'production') {
      setEmailSubject('Замовлення №31101 запущено у друк');
      setEmailBody('Доброго дня!\n\nВаш тираж успішно передано друкарському цеху. Очікувана дата готовності — завтра о 15:00.');
      setAttachProof(true);
    } else if (tpl === 'ready') {
      setEmailSubject('Замовлення №31101 готове до видачі!');
      setEmailBody('Вітаємо!\n\nВаш тираж виготовлено та укомплектовано. Ви можете забрати замовлення або очікувати на відправку Новою Поштою.');
    }
  };

  // Filtered emails
  const filteredEmails = emails.filter(email => {
    if (emailFilter === 'unreplied' && email.replied) return false;
    if (emailFilter === 'unread' && !email.unread) return false;
    if (emailFilter === 'drafts' && !email.isDraft) return false;
    if (emailFilter === 'sent' && email.from !== 'office.edelveis@gmail.com') return false;
    if (emailSearch.trim() !== '') {
      const q = emailSearch.toLowerCase();
      return (
        email.senderName.toLowerCase().includes(q) ||
        email.subject.toLowerCase().includes(q) ||
        email.from.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Автоматизація CRM</h1>
          <p className="subtitle">Конструктор автоматичних правил, Gmail пошти, сповіщень та авто-ТТН</p>
        </div>
      </div>

      {/* iOS Segmented Control */}
      <div style={{
        display: 'flex',
        backgroundColor: 'rgba(120, 120, 128, 0.12)',
        padding: '2px',
        borderRadius: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '2px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'email' ? '#ffffff' : 'transparent',
            color: activeTab === 'email' ? 'var(--primary)' : 'var(--text-dark)',
            boxShadow: activeTab === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: activeTab === 'email' ? '800' : '600'
          }}
        >
          <Mail size={14} />
          Email & Gmail інтеграція
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('triggers')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'triggers' ? '#ffffff' : 'transparent',
            color: activeTab === 'triggers' ? 'var(--primary)' : 'var(--text-dark)',
            boxShadow: activeTab === 'triggers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Zap size={14} />
          Автоматичні дії
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('validations')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'validations' ? '#ffffff' : 'transparent',
            color: activeTab === 'validations' ? 'var(--primary)' : 'var(--text-dark)',
            boxShadow: activeTab === 'validations' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <ShieldCheck size={14} />
          Валідація угод
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('autopay')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'autopay' ? '#ffffff' : 'transparent',
            color: activeTab === 'autopay' ? 'var(--primary)' : 'var(--text-dark)',
            boxShadow: activeTab === 'autopay' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Coins size={14} />
          Автооплата
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sms')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'sms' ? '#ffffff' : 'transparent',
            color: activeTab === 'sms' ? 'var(--primary)' : 'var(--text-dark)',
            boxShadow: activeTab === 'sms' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Bot size={14} />
          SMS шаблони
        </button>
      </div>

      {/* EMAIL & GMAIL SUITE TAB */}
      {activeTab === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Gmail Connection Status & Notification Settings Header */}
          <div className="ios-card bg-white" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Підключення Email на Gmail
                  </h3>
                  <span className="ios-badge ios-badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Gmail OAuth 2.0 Активний
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Пошта організації: <strong>office.edelveis@gmail.com</strong> (двостороння синхронізація угод, рахунків та листування)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  onClick={() => setShowComposeModal(true)} 
                  className="ios-btn ios-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  + Написати Email
                </button>
              </div>
            </div>

            {/* Sub-bar for Notifications & Push Toggles */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={pushEnabled} 
                  onChange={(e) => setPushEnabled(e.target.checked)} 
                />
                <BellRing size={14} className="text-blue-500" />
                <span>🔔 PUSH-сповіщення у браузері про нові листи</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={systemNotifyEnabled} 
                  onChange={(e) => setSystemNotifyEnabled(e.target.checked)} 
                />
                <Sparkles size={14} className="text-orange-500" />
                <span>📩 Системні сповіщення Keepin Bot</span>
              </label>
            </div>
          </div>

          {/* Email Inbox Filters & Search Bar */}
          <div className="ios-card bg-white" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              
              {/* Filters row */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'Всі листи' },
                  { key: 'unreplied', label: '🔴 Без відповіді', badgeCount: emails.filter(e => !e.replied).length },
                  { key: 'unread', label: '🔵 Непрочитані', badgeCount: emails.filter(e => e.unread).length },
                  { key: 'drafts', label: '📝 Чернетки' },
                  { key: 'sent', label: '📤 Відправлені' }
                ].map(f => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setEmailFilter(f.key as any)}
                    className="ios-btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      fontWeight: emailFilter === f.key ? '800' : '600',
                      backgroundColor: emailFilter === f.key ? '#007aff' : '#f1f5f9',
                      color: emailFilter === f.key ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {f.label}
                    {f.badgeCount !== undefined && f.badgeCount > 0 && (
                      <span style={{
                        backgroundColor: emailFilter === f.key ? '#ffffff' : '#ff3b30',
                        color: emailFilter === f.key ? '#007aff' : '#ffffff',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        fontSize: '9px',
                        fontWeight: '800'
                      }}>
                        {f.badgeCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '260px' }}>
                <Search size={14} className="text-slate-400" />
                <input
                  placeholder="Пошук за поштою, темами..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '11px', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Email Messages List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredEmails.length === 0 ? (
              <div className="ios-card bg-white" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                <Inbox size={32} className="mx-auto mb-2 opacity-50" />
                <p style={{ margin: 0, fontWeight: '700' }}>Листів за вказаним фільтром не знайдено</p>
              </div>
            ) : (
              filteredEmails.map(email => (
                <div 
                  key={email.id} 
                  className="ios-card bg-white" 
                  style={{ 
                    padding: '16px 20px', 
                    borderLeft: email.unread ? '4px solid #007aff' : !email.replied ? '4px solid #ff3b30' : '4px solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    
                    {/* Sender Info & Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '34px', 
                        height: '34px', 
                        borderRadius: '50%', 
                        backgroundColor: email.isDraft ? '#f59e0b' : '#007aff', 
                        color: '#fff', 
                        fontWeight: '800', 
                        fontSize: '13px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        {email.senderName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{email.senderName}</span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>&lt;{email.from}&gt;</span>
                          
                          {email.unread && (
                            <span className="ios-badge ios-badge-blue">Новий лист</span>
                          )}
                          {!email.replied && !email.isDraft && (
                            <span className="ios-badge ios-badge-red" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={10} /> Без відповіді
                            </span>
                          )}
                          {email.isDraft && (
                            <span className="ios-badge ios-badge-orange">Чернетка</span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: '2px 0 0 0' }}>{email.subject}</h4>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      {email.date} о {email.time}
                    </span>
                  </div>

                  {/* Body Preview */}
                  <p style={{ fontSize: '12px', color: '#475569', margin: '0', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                    {email.body}
                  </p>

                  {/* Attachments (Рахунки PDF, макети, акти) */}
                  {email.attachments.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {email.attachments.map((file, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: '#0284c7', border: '1px solid #e2e8f0' }}>
                          <Paperclip size={12} />
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 1-Click Quick Actions Toolbar */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => handleCreateDealFromEmail(email)}
                      className="ios-btn ios-btn-secondary"
                      style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <UserPlus size={13} className="text-blue-500" />
                      + Створити угоду
                    </button>

                    <button 
                      type="button" 
                      onClick={() => handleCreateTaskFromEmail(email)}
                      className="ios-btn ios-btn-secondary"
                      style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FilePlus size={13} className="text-green-500" />
                      + Створити завдання
                    </button>

                    <button 
                      type="button" 
                      onClick={() => handleAddNoteFromEmail(email)}
                      className="ios-btn ios-btn-secondary"
                      style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <StickyNote size={13} className="text-orange-500" />
                      + Додати нотатку
                    </button>

                    <button 
                      type="button" 
                      onClick={() => {
                        setToEmail(email.from);
                        setEmailSubject(`Re: ${email.subject}`);
                        setShowComposeModal(true);
                      }}
                      className="ios-btn ios-btn-secondary"
                      style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
                    >
                      <RotateCcw size={13} />
                      Відповісти
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TRIGGERS TAB */}
      {activeTab === 'triggers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card bg-white">
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>
              Автоматичні сценарії бізнес-процесів
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {triggers.map(rule => (
                <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{rule.name}</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Подія: <strong>{rule.event}</strong> ➔ Дія: <strong>{rule.action}</strong>
                    </p>
                  </div>
                  <button onClick={() => toggleTrigger(rule.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    {rule.active ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VALIDATIONS TAB */}
      {activeTab === 'validations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ios-card bg-white">
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>
              Правила обов'язкової перевірки перед друком
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {validations.map(val => (
                <div key={val.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{val.name}</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Поле: <strong>{val.targetField}</strong> ({val.condition}) — Помилка: "{val.errorMessage}"
                    </p>
                  </div>
                  <button onClick={() => toggleValidation(val.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    {val.active ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-slate-400" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AUTOPAY TAB */}
      {activeTab === 'autopay' && (
        <div className="ios-card bg-white">
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>
            Автоматичне внесення оплат у Фінанси
          </h3>
          <form onSubmit={handleCreateAutoPayRule} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 120px', gap: '10px' }}>
            <select value={newStage} onChange={(e) => setNewStage(e.target.value)}>
              <option value="ready">Етап: Готово</option>
              <option value="printing">Етап: Друк</option>
            </select>
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Категорія" />
            <input value={newWallet} onChange={(e) => setNewWallet(e.target.value)} placeholder="Гаманець" />
            <input type="number" value={newPercent} onChange={(e) => setNewPercent(Number(e.target.value))} placeholder="%" />
            <button type="submit" className="ios-btn ios-btn-primary">+ Додати</button>
          </form>
        </div>
      )}

      {/* SMS TAB */}
      {activeTab === 'sms' && (
        <div className="ios-card bg-white">
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>
            Шаблони SMS & Viber сповіщень
          </h3>
          <form onSubmit={handleCreateSmsTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Назва шаблону" value={newSmsName} onChange={(e) => setNewSmsName(e.target.value)} />
            <textarea rows={3} placeholder="Текст SMS" value={newSmsText} onChange={(e) => setNewSmsText(e.target.value)} />
            <button type="submit" className="ios-btn ios-btn-primary" style={{ alignSelf: 'flex-start' }}>+ Зберегти шаблон</button>
          </form>
        </div>
      )}

      {/* EMAIL COMPOSER MODAL (With CC, BCC, Attachments, Auto-save) */}
      {showComposeModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleSendEmailSubmit} className="ios-modal" style={{ maxWidth: '640px', width: '90%' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} className="text-blue-500" />
                Новий Email (Gmail Integration)
              </h3>
              <button type="button" onClick={() => setShowComposeModal(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Quick Template Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>Шаблони листів:</span>
                <button type="button" onClick={() => handleApplyTemplate('invoice')} className="ios-btn ios-btn-secondary" style={{ fontSize: '10px' }}>
                  📄 Рахунок-Специфікація №31101
                </button>
                <button type="button" onClick={() => handleApplyTemplate('production')} className="ios-btn ios-btn-secondary" style={{ fontSize: '10px' }}>
                  ⚙️ Запуск у друк
                </button>
                <button type="button" onClick={() => handleApplyTemplate('ready')} className="ios-btn ios-btn-secondary" style={{ fontSize: '10px' }}>
                  🎉 Готовність тиражу
                </button>
              </div>

              {/* To field */}
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="ios-label">Кому (To) *</label>
                  <button type="button" onClick={() => setShowCcBcc(!showCcBcc)} style={{ fontSize: '11px', color: '#007aff', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '700' }}>
                    {showCcBcc ? 'Сховати CC/BCC' : '+ Додати CC / BCC'}
                  </button>
                </div>
                <input 
                  value={toEmail} 
                  onChange={(e) => setToEmail(e.target.value)} 
                  placeholder="замовник@example.com"
                  required 
                />
              </div>

              {/* CC / BCC Fields */}
              {showCcBcc && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Копія (CC)</label>
                    <input value={ccEmail} onChange={(e) => setCcEmail(e.target.value)} placeholder="manager@example.com" />
                  </div>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Прихована копія (BCC)</label>
                    <input value={bccEmail} onChange={(e) => setBccEmail(e.target.value)} placeholder="audit@example.com" />
                  </div>
                </div>
              )}

              {/* Subject */}
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Тема листа *</label>
                <input 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)} 
                  required 
                />
              </div>

              {/* Message Body */}
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Текст повідомлення *</label>
                <textarea 
                  rows={6} 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)} 
                  required 
                  style={{ fontSize: '12px', lineHeight: '1.4' }}
                />
              </div>

              {/* Attachments Section */}
              <div style={{ backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  📎 Прикріпити сформовані документи та макети:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={attachInvoice} onChange={(e) => setAttachInvoice(e.target.checked)} />
                    <FileText size={13} className="text-blue-500" />
                    <span>Прикріпити Рахунок-Специфікацію №31101 (№31101_Бланки_А4.pdf)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={attachAct} onChange={(e) => setAttachAct(e.target.checked)} />
                    <FileText size={13} className="text-emerald-500" />
                    <span>Прикріпити Акт виконаних робіт</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={attachProof} onChange={(e) => setAttachProof(e.target.checked)} />
                    <Paperclip size={13} className="text-orange-500" />
                    <span>Прикріпити оригінал-макет / кольоропробу</span>
                  </label>
                </div>
              </div>

              {/* Auto-save status footer indicator */}
              <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)', fontStyle: 'italic' }}>
                {autoSaveStatus}
              </div>

            </div>

            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowComposeModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} />
                Надіслати лист з Gmail
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
