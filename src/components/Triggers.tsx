import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Tag,
  Share2,
  ArrowRightLeft,
  Clock,
  Zap,
  ShieldCheck,
  CreditCard,
  Search
} from 'lucide-react';

type AutomationTab = 
  | 'tags'              // Теги
  | 'sources'           // Джерела
  | 'stage_transitions' // Переходи по етапах
  | 'stage_deadlines'   // Терміни по замовленням в етапах
  | 'triggers'          // Тригери (Default active)
  | 'validation'        // Валідація
  | 'cash_desks';       // Каси

interface TriggerItem {
  id: string;
  active: boolean;
  entity: string; // e.g. "Угоди"
  actionName: string; // e.g. "Створення завдання"
  actionCategory: string; // e.g. "Створити завдання"
  condition: string; // e.g. "stage.name == 'Підготовка документів'"
  delayMinutes: number | null;
  comment: string;
}

export const Triggers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AutomationTab>('triggers');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('Всі');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showAddTriggerModal, setShowAddTriggerModal] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerItem | null>(null);

  // Form state for creating/editing trigger
  const [newEntity, setNewEntity] = useState('Угоди');
  const [newActionCategory, setNewActionCategory] = useState('Створити завдання');
  const [newActionName, setNewActionName] = useState('Створення завдання');
  const [newCondition, setNewCondition] = useState("stage.name == 'Підготовка документів'");
  const [newDelay, setNewDelay] = useState<string>('');
  const [newComment, setNewComment] = useState('');

  // Initial Triggers Data matching KeepinCRM system exact structure
  const [triggerList, setTriggerList] = useState<TriggerItem[]>([
    {
      id: '4703',
      active: true,
      entity: 'Угоди',
      actionName: 'Створення завдання',
      actionCategory: 'Створити завдання',
      condition: "stage.name == 'Підготовка документів'",
      delayMinutes: null,
      comment: 'Автоматичне створення завдання на етапі: підготовка документів'
    },
    {
      id: '4748',
      active: true,
      entity: 'Угоди',
      actionName: 'Заповнення відповідального',
      actionCategory: 'Заповнити головного відповідального',
      condition: "source_id == 1 AND stage.name == 'Склад'",
      delayMinutes: null,
      comment: 'Зміна відповідального, якщо джерело Facebook та етап Склад.'
    },
    {
      id: '4750',
      active: true,
      entity: 'Угоди',
      actionName: 'Створення платежу',
      actionCategory: 'Створити платіж',
      condition: "custom_fields.mietod_oplati_504 == 'Приватбанк'",
      delayMinutes: null,
      comment: 'Проведення собівартості товару як витрати у фінансах на основі методу оплати'
    },
    {
      id: '4811',
      active: true,
      entity: 'Угоди',
      actionName: 'Зміна етапу',
      actionCategory: 'Перемістити етап',
      condition: "stage.name == 'Узгодження' AND paid > 200.0",
      delayMinutes: 0,
      comment: 'Зміна етапу, якщо була авансова оплата'
    },
    {
      id: '5320',
      active: true,
      entity: 'Угоди',
      actionName: 'Авторозподілення замовлень',
      actionCategory: 'Авторозподілення',
      condition: 'created_at and source_id == 1',
      delayMinutes: null,
      comment: 'Розподілення між менеджерами заявок з сайту'
    },
    {
      id: '5369',
      active: true,
      entity: 'Угоди',
      actionName: 'Завершення угоди',
      actionCategory: 'Завершити угоду',
      condition: "stage.name == 'Отримано'",
      delayMinutes: null,
      comment: 'Архівування угоди, якщо все отримано та кошти проведені'
    },
    {
      id: '5410',
      active: true,
      entity: 'Угоди',
      actionName: 'Відправка SMS сповіщення',
      actionCategory: 'Відправити SMS',
      condition: "stage.name == 'Готово до видачі'",
      delayMinutes: 5,
      comment: 'Автоматична відправка SMS замовнику про готовність поліграфії'
    },
    {
      id: '5522',
      active: true,
      entity: 'Замовники',
      actionName: 'Тегування контрагента',
      actionCategory: 'Тегування контрагента',
      condition: 'total_spent > 50000.0',
      delayMinutes: null,
      comment: 'Автоматичне присвоєння тегу "VIP Клієнт" при досягненні 50 тис грн'
    }
  ]);

  // Action Pills List
  const actionPills = [
    'Всі',
    'Заповнити головного відповідального',
    'Перемістити етап',
    'Перемістити між воронками',
    'Завершити угоду',
    'Архів контрагента',
    'Копіювати поля',
    'Заповнити поля',
    'Створити платіж',
    'Згенерувати документи',
    'Створити завдання',
    'Створити угоду',
    'Створити ліда',
    'Запис в нотатку',
    'Відправити SMS',
    'Відправити Email',
    'Тегування контрагента',
    'Авторозподілення',
    'Сповіщення',
    'Webhook'
  ];

  // Toggle active status
  const toggleTriggerActive = (id: string) => {
    setTriggerList(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  // Delete trigger
  const deleteTrigger = (id: string) => {
    if (confirm('Ви впевнені, що бажаєте видалити цей тригер автоматизації?')) {
      setTriggerList(prev => prev.filter(t => t.id !== id));
    }
  };

  // Duplicate trigger
  const copyTrigger = (trigger: TriggerItem) => {
    const newId = (Math.floor(Math.random() * 9000) + 1000).toString();
    const copied: TriggerItem = {
      ...trigger,
      id: newId,
      comment: `${trigger.comment} (Копія)`
    };
    setTriggerList([copied, ...triggerList]);
  };

  // Add trigger submit
  const handleSaveTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrigger) {
      setTriggerList(prev => prev.map(t => t.id === editingTrigger.id ? {
        ...t,
        entity: newEntity,
        actionCategory: newActionCategory,
        actionName: newActionName,
        condition: newCondition,
        delayMinutes: newDelay ? Number(newDelay) : null,
        comment: newComment
      } : t));
      setEditingTrigger(null);
    } else {
      const newTriggerItem: TriggerItem = {
        id: (Math.floor(Math.random() * 9000) + 1000).toString(),
        active: true,
        entity: newEntity,
        actionCategory: newActionCategory,
        actionName: newActionName,
        condition: newCondition,
        delayMinutes: newDelay ? Number(newDelay) : null,
        comment: newComment || `${newActionName} при ${newCondition}`
      };
      setTriggerList([newTriggerItem, ...triggerList]);
    }
    setShowAddTriggerModal(false);
    resetForm();
  };

  const openEditModal = (trigger: TriggerItem) => {
    setEditingTrigger(trigger);
    setNewEntity(trigger.entity);
    setNewActionCategory(trigger.actionCategory);
    setNewActionName(trigger.actionName);
    setNewCondition(trigger.condition);
    setNewDelay(trigger.delayMinutes !== null ? trigger.delayMinutes.toString() : '');
    setNewComment(trigger.comment);
    setShowAddTriggerModal(true);
  };

  const resetForm = () => {
    setEditingTrigger(null);
    setNewEntity('Угоди');
    setNewActionCategory('Створити завдання');
    setNewActionName('Створення завдання');
    setNewCondition("stage.name == 'Підготовка документів'");
    setNewDelay('');
    setNewComment('');
  };

  // Filter triggers
  const filteredTriggers = triggerList.filter(t => {
    const matchesPill = selectedActionFilter === 'Всі' || t.actionCategory === selectedActionFilter;
    const matchesSearch = searchQuery === '' || 
      t.comment.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.includes(searchQuery);
    return matchesPill && matchesSearch;
  });

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header Banner */}
      <div className="header-title-container" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={22} style={{ color: '#10b981' }} />
            Автоматизація & Налаштування тригерів
          </h1>
          <p className="subtitle">Конструктор автоматичних дій, правил воронки та бізнес-процесів KeepinCRM</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddTriggerModal(true); }}
          className="ios-btn ios-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', borderColor: '#10b981' }}
        >
          <Plus size={16} />
          Створити тригер
        </button>
      </div>

      {/* Top 7 Navigation Tabs Bar */}
      <div className="ios-card" style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-light)', 
        padding: '8px 14px', 
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button
            onClick={() => setActiveTab('tags')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeTab === 'tags' ? '800' : '600',
              color: activeTab === 'tags' ? '#10b981' : 'var(--text-medium)',
              borderBottom: activeTab === 'tags' ? '2px solid #10b981' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Tag size={14} /> Теги
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeTab === 'sources' ? '800' : '600',
              color: activeTab === 'sources' ? '#10b981' : 'var(--text-medium)',
              borderBottom: activeTab === 'sources' ? '2px solid #10b981' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Share2 size={14} /> Джерела
          </button>

          <button
            onClick={() => setActiveTab('stage_transitions')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeTab === 'stage_transitions' ? '800' : '600',
              color: activeTab === 'stage_transitions' ? '#10b981' : 'var(--text-medium)',
              borderBottom: activeTab === 'stage_transitions' ? '2px solid #10b981' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <ArrowRightLeft size={14} /> Переходи по етапах
          </button>

          <button
            onClick={() => setActiveTab('stage_deadlines')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeTab === 'stage_deadlines' ? '800' : '600',
              color: activeTab === 'stage_deadlines' ? '#10b981' : 'var(--text-medium)',
              borderBottom: activeTab === 'stage_deadlines' ? '2px solid #10b981' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Clock size={14} /> Терміни по замовленням в етапах
          </button>

          <button
            onClick={() => setActiveTab('triggers')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeTab === 'triggers' ? '800' : '600',
              color: activeTab === 'triggers' ? '#10b981' : 'var(--text-medium)',
              borderBottom: activeTab === 'triggers' ? '2px solid #10b981' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Zap size={14} /> Тригери
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeTab === 'validation' ? '800' : '600',
              color: activeTab === 'validation' ? '#10b981' : 'var(--text-medium)',
              borderBottom: activeTab === 'validation' ? '2px solid #10b981' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <ShieldCheck size={14} /> Валідація
          </button>

          <button
            onClick={() => setActiveTab('cash_desks')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeTab === 'cash_desks' ? '800' : '600',
              color: activeTab === 'cash_desks' ? '#10b981' : 'var(--text-medium)',
              borderBottom: activeTab === 'cash_desks' ? '2px solid #10b981' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <CreditCard size={14} /> Каси
          </button>
        </div>
      </div>

      {/* --- TAB CONTENT --- */}

      {activeTab === 'triggers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Information / Description Banner */}
          <div style={{ 
            padding: '16px 20px', 
            borderRadius: '10px', 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-light)', 
            fontSize: '13px', 
            color: 'var(--text-medium)',
            lineHeight: '1.5'
          }}>
            Автоматичні дії (тригери) які виконуються на основі виконання певних умов в системі. Наприклад зміна відповідального при зміні етапу воронки продажів, автоматичне створення завдання, відправка SMS і тому подібне. <a href="#doc" onClick={(e) => { e.preventDefault(); alert('Відкриття документації тригерів KeepinCRM'); }} style={{ color: 'var(--text-dark)', textDecoration: 'underline' }}>Документація</a>
          </div>

          {/* Action Filter Pills Bar */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap', 
            backgroundColor: 'var(--bg-card)', 
            padding: '16px', 
            borderRadius: '10px', 
            border: '1px solid var(--border-light)' 
          }}>
            {actionPills.map(pill => {
              const isSelected = selectedActionFilter === pill;
              return (
                <button
                  key={pill}
                  onClick={() => setSelectedActionFilter(pill)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isSelected ? '750' : '500',
                    backgroundColor: isSelected ? '#10b981' : 'var(--bg-card-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-dark)',
                    border: isSelected ? '1px solid #10b981' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
              <input
                type="text"
                placeholder="Пошук тригера по ID, коментарю або умовам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  paddingLeft: '32px',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-dark)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px'
                }}
              />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
              Всього активних правил: <strong>{filteredTriggers.length}</strong>
            </span>
          </div>

          {/* Triggers Main Data Table */}
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: 0, overflow: 'hidden' }}>
            <div className="ios-table-container">
              <table className="ios-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ width: '80px', color: 'var(--text-medium)', padding: '12px 16px' }}>ID</th>
                    <th style={{ width: '220px', color: 'var(--text-medium)' }}>Дія</th>
                    <th style={{ color: 'var(--text-medium)' }}>Умова</th>
                    <th style={{ width: '110px', textAlign: 'center', color: 'var(--text-medium)' }}>Затримка, хв</th>
                    <th style={{ color: 'var(--text-medium)' }}>Коментар</th>
                    <th style={{ width: '90px', textAlign: 'right', color: 'var(--text-medium)', paddingRight: '16px' }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTriggers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-medium)' }}>
                        Тригерів за обраним фільтром не знайдено
                      </td>
                    </tr>
                  ) : (
                    filteredTriggers.map(trig => (
                      <tr key={trig.id} style={{ borderBottom: '1px solid var(--border-light)', height: '60px' }}>
                        
                        {/* ID + Toggle */}
                        <td style={{ paddingLeft: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-medium)', fontSize: '11px' }}>{trig.id}</span>
                            <div 
                              onClick={() => toggleTriggerActive(trig.id)}
                              style={{ 
                                width: '32px', 
                                height: '18px', 
                                borderRadius: '10px', 
                                backgroundColor: trig.active ? '#10b981' : '#cbd5e1', 
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <div style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                position: 'absolute',
                                top: '2px',
                                left: trig.active ? '16px' : '2px',
                                transition: 'left 0.2s'
                              }} />
                            </div>
                          </div>
                        </td>

                        {/* Entity & Action Name */}
                        <td>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-medium)', display: 'block' }}>{trig.entity}</span>
                            <span style={{ fontWeight: '750', color: '#007AFF', cursor: 'pointer' }}>{trig.actionName}</span>
                          </div>
                        </td>

                        {/* Condition Code Box */}
                        <td>
                          <div style={{ 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            backgroundColor: 'var(--bg-card-subtle)', 
                            border: '1px solid var(--border-light)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--text-dark)',
                            display: 'inline-block',
                            maxWidth: '100%',
                            overflowX: 'auto'
                          }}>
                            {trig.condition}
                          </div>
                        </td>

                        {/* Delay */}
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>
                          {trig.delayMinutes !== null ? trig.delayMinutes : '—'}
                        </td>

                        {/* Comment */}
                        <td style={{ color: 'var(--text-dark)', fontSize: '11px', maxWidth: '280px', lineHeight: '1.4' }}>
                          {trig.comment}
                        </td>

                        {/* Action Buttons */}
                        <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button 
                              onClick={() => openEditModal(trig)} 
                              title="Редагувати" 
                              style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer', padding: '2px' }}
                            >
                              <Edit size={15} />
                            </button>
                            <button 
                              onClick={() => copyTrigger(trig)} 
                              title="Дублювати" 
                              style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer', padding: '2px' }}
                            >
                              <Copy size={15} />
                            </button>
                            <button 
                              onClick={() => deleteTrigger(trig.id)} 
                              title="Видалити" 
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OTHER AUXILIARY SUB-TABS */}
      {activeTab === 'tags' && (
        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '12px' }}>Керування тегами замовників та угоди</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="ios-badge ios-badge-blue">VIP Клієнт</span>
            <span className="ios-badge ios-badge-green">Постійний замовник</span>
            <span className="ios-badge ios-badge-yellow">Терміновий друк</span>
            <span className="ios-badge ios-badge-red">Боржник</span>
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '12px' }}>Джерела замовлень та лідів</h2>
          <ul style={{ fontSize: '12px', color: 'var(--text-dark)', paddingLeft: '20px' }}>
            <li>Веб-сайт друкарні edelveis.com.ua</li>
            <li>Telegram Боти</li>
            <li>Instagram / Facebook Direct</li>
            <li>Телефонний дзвінок менеджеру</li>
          </ul>
        </div>
      )}

      {activeTab === 'validation' && (
        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '12px' }}>Правила валідації полів при зміні етапів воронки</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
            Наприклад: Заборона переведення угоди в етап "Друк" без завантаженого PDF макета.
          </div>
        </div>
      )}

      {/* --- ADD / EDIT TRIGGER MODAL --- */}
      {showAddTriggerModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleSaveTrigger} className="ios-modal" style={{ maxWidth: '520px' }}>
            <div className="ios-modal-header">
              <h2 className="ios-modal-title">
                {editingTrigger ? `Редагування тригера №${editingTrigger.id}` : 'Створення нового тригера автоматизації'}
              </h2>
              <button 
                type="button" 
                onClick={() => setShowAddTriggerModal(false)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Об'єкт автоматизації</label>
                <select 
                  value={newEntity}
                  onChange={(e) => setNewEntity(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                >
                  <option value="Угоди">Угоди</option>
                  <option value="Замовники">Замовники</option>
                  <option value="Завдання">Завдання</option>
                  <option value="Фінанси">Фінанси</option>
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Категорія автоматичної дії</label>
                <select 
                  value={newActionCategory}
                  onChange={(e) => {
                    setNewActionCategory(e.target.value);
                    setNewActionName(e.target.value);
                  }}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                >
                  {actionPills.filter(p => p !== 'Всі').map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Умова спрацювання тригера (Syntax Expression)</label>
                <input 
                  type="text" 
                  value={newCondition} 
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. stage.name == 'Підготовка документів'"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)', fontFamily: 'var(--font-mono)' }}
                  required
                />
              </div>

              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Затримка перед виконанням (хв)</label>
                <input 
                  type="number" 
                  value={newDelay} 
                  onChange={(e) => setNewDelay(e.target.value)}
                  placeholder="Залиште порожнім для миттєвого виконання"
                  style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                />
              </div>

              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Коментар та понятний опис правила</label>
                <textarea 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Короткий коментар для менеджера..."
                  rows={2}
                  style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                />
              </div>
            </div>

            <div className="ios-modal-footer">
              <button 
                type="button" 
                onClick={() => setShowAddTriggerModal(false)}
                className="ios-btn ios-btn-secondary"
              >
                Скасувати
              </button>
              <button 
                type="submit" 
                className="ios-btn ios-btn-primary"
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                {editingTrigger ? 'Зберегти зміни' : 'Створити тригер'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
