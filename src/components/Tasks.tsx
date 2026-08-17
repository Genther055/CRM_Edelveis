import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Zap, 
  Search, 
  Briefcase, 
  AlertTriangle, 
  ListTodo
} from 'lucide-react';

interface TaskChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  type: 'Дзвінок' | 'Зустріч' | 'Перевірка макета' | 'Друк' | 'Порізка' | 'Доставка' | 'Оплата';
  deadline: string;
  deadlineTime?: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  checklist: TaskChecklistItem[];
  status: 'todo' | 'done';
  clientName?: string;
  dealName?: string;
  createdBy?: string;
  autoTriggered?: boolean;
  stageTrigger?: string;
}

type TaskSubTab = 'all' | 'my' | 'assigned_by_me' | 'overdue' | 'auto_triggers' | 'task_types';

export const Tasks: React.FC = () => {
  const { clients, orders, currentUser } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<TaskSubTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Всі');

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'T-301',
      title: 'Зробити кольоропробу CMYK для тиражу бланків A4',
      type: 'Перевірка макета',
      deadline: '2026-08-18',
      deadlineTime: '14:00',
      priority: 'high',
      assignee: 'Анна (Дизайнер)',
      checklist: [
        { id: 'c1', text: 'Завантажити файл макета у високій якості (300 dpi)', checked: true },
        { id: 'c2', text: 'Узгодити виліт 2мм з друкарем цифрової машини', checked: true },
        { id: 'c3', text: 'Отримати фінальне підтвердження від замовника по Email', checked: false }
      ],
      status: 'todo',
      clientName: 'ТОВ «ФармаТрейд»',
      dealName: 'Замовлення №31101 — Бланки А4',
      createdBy: 'Віктор (Менеджер)',
      autoTriggered: true,
      stageTrigger: 'Підготовка документів'
    },
    {
      id: 'T-302',
      title: 'Підготувати порізку тиражу 1500 шт на гіпер-порізчику',
      type: 'Порізка',
      deadline: '2026-08-19',
      deadlineTime: '16:30',
      priority: 'medium',
      assignee: 'Іван (Палітурник)',
      checklist: [
        { id: 'c4', text: 'Перевірити наявність крейдованого паперу 130г на стелажі А', checked: true },
        { id: 'c5', text: 'Виставити стопові мітки порізу 210х297мм', checked: false }
      ],
      status: 'todo',
      clientName: 'ПРАТ «ЕкоСок»',
      dealName: 'Замовлення №1502 — Буклети',
      createdBy: 'Працівник А (Адміністратор)',
      autoTriggered: true,
      stageTrigger: 'Склад'
    },
    {
      id: 'T-303',
      title: 'Ламінування матовою плівкою 30мкм тиражу меню',
      type: 'Друк',
      deadline: '2026-08-20',
      deadlineTime: '11:00',
      priority: 'low',
      assignee: 'Сергій (Оператор)',
      checklist: [
        { id: 'c6', text: 'Прогріти рулонний ламінатор до 115°C', checked: false },
        { id: 'c7', text: 'Упакувати готовий тираж у крафт-папір для доставки', checked: false }
      ],
      status: 'todo',
      clientName: 'Кафе «Капучино»',
      dealName: 'Замовлення №884 — Меню',
      createdBy: 'Віктор (Менеджер)'
    },
    {
      id: 'T-304',
      title: 'Дзвінок замовнику щодо узгодження передплати 50%',
      type: 'Дзвінок',
      deadline: '2026-08-17',
      deadlineTime: '18:00',
      priority: 'high',
      assignee: 'Працівник А (Адміністратор)',
      checklist: [
        { id: 'c8', text: 'Виставити рахунок-специфікацію', checked: true },
        { id: 'c9', text: 'Підтвердити надходження коштів на р/р ПриватБанку', checked: false }
      ],
      status: 'todo',
      clientName: 'ТОВ «МЕД-СЕРВІС»',
      dealName: 'Замовлення №9941 — Буклети',
      createdBy: 'Працівник А (Адміністратор)'
    }
  ]);

  // Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TaskItem['type']>('Перевірка макета');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDeadlineTime, setNewDeadlineTime] = useState('12:00');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('medium');
  const [newAssignee, setNewAssignee] = useState('Анна (Дизайнер)');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedDeal, setSelectedDeal] = useState('');
  const [checklistInputs, setChecklistInputs] = useState<string[]>(['']);
  const [enableAutoTrigger, setEnableAutoTrigger] = useState(false);
  const [selectedTriggerStage, setSelectedTriggerStage] = useState('Підготовка документів');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `T-${Date.now().toString().slice(-3)}`,
      title: newTitle,
      type: newType,
      deadline: newDeadline || new Date().toISOString().split('T')[0],
      deadlineTime: newDeadlineTime,
      priority: newPriority,
      assignee: newAssignee,
      checklist: checklistInputs
        .filter(text => text.trim())
        .map((text, idx) => ({ id: `c-${idx}-${Date.now()}`, text, checked: false })),
      status: 'todo',
      clientName: selectedClient || undefined,
      dealName: selectedDeal || undefined,
      createdBy: currentUser?.name || 'Працівник А (Адміністратор)',
      autoTriggered: enableAutoTrigger,
      stageTrigger: enableAutoTrigger ? selectedTriggerStage : undefined
    };

    setTasks([newTask, ...tasks]);
    setShowAddModal(false);
    
    // Reset Form
    setNewTitle('');
    setNewType('Перевірка макета');
    setNewDeadline('');
    setNewDeadlineTime('12:00');
    setNewPriority('medium');
    setSelectedClient('');
    setSelectedDeal('');
    setChecklistInputs(['']);
    setEnableAutoTrigger(false);
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          checklist: task.checklist.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
        };
      }
      return task;
    }));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'todo' ? 'done' : 'todo' } : t));
  };

  const deleteTask = (id: string) => {
    if (confirm('Видалити завдання зі списку?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const currentUserName = currentUser?.name || 'Працівник А (Адміністратор)';

  // Filter Tasks by Sub-tab & Search
  const filteredTasks = tasks.filter(task => {
    if (activeSubTab === 'my') {
      if (!task.assignee.includes(currentUserName.split(' ')[0])) return false;
    } else if (activeSubTab === 'assigned_by_me') {
      if (!task.createdBy?.includes(currentUserName.split(' ')[0])) return false;
    } else if (activeSubTab === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      if (task.deadline >= today || task.status === 'done') return false;
    } else if (activeSubTab === 'auto_triggers') {
      if (!task.autoTriggered) return false;
    }

    if (typeFilter !== 'Всі' && task.type !== typeFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(q) || 
             (task.clientName && task.clientName.toLowerCase().includes(q)) || 
             (task.dealName && task.dealName.toLowerCase().includes(q));
    }

    return true;
  });

  const getPriorityBadgeClass = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'high': return 'ios-badge ios-badge-red';
      case 'medium': return 'ios-badge ios-badge-orange';
      case 'low': return 'ios-badge ios-badge-blue';
    }
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header Title Container */}
      <div className="header-title-container" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={24} style={{ color: 'var(--primary)' }} />
            Завдання та бізнес-доручення (KeepinCRM)
          </h1>
          <p className="subtitle">Планування завдань, покрокові чек-листи та авто-створення за тригерами у воронці</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="ios-btn ios-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          Створити завдання
        </button>
      </div>

      {/* KeepinCRM Sub-tabs Navigation Bar */}
      <div className="ios-card" style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-light)', 
        padding: '8px 14px', 
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button
            onClick={() => setActiveSubTab('all')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeSubTab === 'all' ? '800' : '600',
              color: activeSubTab === 'all' ? 'var(--primary)' : 'var(--text-medium)',
              borderBottom: activeSubTab === 'all' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <ListTodo size={14} /> Всі завдання ({tasks.length})
          </button>

          <button
            onClick={() => setActiveSubTab('my')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeSubTab === 'my' ? '800' : '600',
              color: activeSubTab === 'my' ? 'var(--primary)' : 'var(--text-medium)',
              borderBottom: activeSubTab === 'my' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <User size={14} /> Мої завдання
          </button>

          <button
            onClick={() => setActiveSubTab('assigned_by_me')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeSubTab === 'assigned_by_me' ? '800' : '600',
              color: activeSubTab === 'assigned_by_me' ? 'var(--primary)' : 'var(--text-medium)',
              borderBottom: activeSubTab === 'assigned_by_me' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Briefcase size={14} /> Доручив я
          </button>

          <button
            onClick={() => setActiveSubTab('overdue')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeSubTab === 'overdue' ? '800' : '600',
              color: activeSubTab === 'overdue' ? 'var(--danger)' : 'var(--text-medium)',
              borderBottom: activeSubTab === 'overdue' ? '2px solid var(--danger)' : '2px solid transparent',
              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <AlertTriangle size={14} /> Протерміновані
          </button>

          <button
            onClick={() => setActiveSubTab('auto_triggers')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeSubTab === 'auto_triggers' ? '800' : '600',
              color: activeSubTab === 'auto_triggers' ? '#10b981' : 'var(--text-medium)',
              borderBottom: activeSubTab === 'auto_triggers' ? '2px solid #10b981' : '2px solid transparent',
              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Zap size={14} /> Авто-тригери воронок
          </button>
        </div>
      </div>

      {/* Search & Type Filter Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
          <input
            type="text"
            placeholder="Пошук завдань за назвою, угодою чи клієнтом..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '34px',
              paddingLeft: '32px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-dark)',
              border: '1px solid var(--border-light)',
              borderRadius: '6px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: '600' }}>Тип:</span>
          {['Всі', 'Дзвінок', 'Перевірка макета', 'Друк', 'Порізка', 'Доставка'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: typeFilter === type ? '750' : '500',
                backgroundColor: typeFilter === type ? 'var(--primary)' : 'var(--bg-card-subtle)',
                color: typeFilter === type ? '#ffffff' : 'var(--text-dark)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tasks List Rendering */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredTasks.length === 0 ? (
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '40px', textAlign: 'center', color: 'var(--text-medium)' }}>
            Завдань за обраним фільтром не знайдено
          </div>
        ) : (
          filteredTasks.map(task => {
            const completedCount = task.checklist.filter(c => c.checked).length;
            const progressPercent = task.checklist.length > 0 ? Math.round((completedCount / task.checklist.length) * 100) : 0;
            const isDone = task.status === 'done';

            return (
              <div 
                key={task.id} 
                className="ios-card" 
                style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-light)', 
                  padding: '18px',
                  opacity: isDone ? 0.75 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* Task Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" 
                      checked={isDone} 
                      onChange={() => toggleTaskStatus(task.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--success)' }}
                    />
                    <div>
                      <h3 style={{ 
                        fontSize: '15px', 
                        fontWeight: '800', 
                        color: isDone ? 'var(--text-medium)' : 'var(--text-dark)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        margin: 0
                      }}>
                        {task.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '11px' }}>
                        <span className="ios-badge ios-badge-blue">{task.type}</span>
                        <span className={getPriorityBadgeClass(task.priority)}>
                          {task.priority === 'high' ? '🔥 Високий пріоритет' : task.priority === 'medium' ? 'Середній' : 'Низький'}
                        </span>
                        {task.autoTriggered && (
                          <span className="ios-badge ios-badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Zap size={10} /> Авто-тригер ({task.stageTrigger})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteTask(task.id)}
                    style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    title="Видалити завдання"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Checklist Section with Progress Bar */}
                {task.checklist.length > 0 && (
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '11px' }}>
                      <strong style={{ color: 'var(--text-dark)' }}>Покроковий чек-лист виконання ({completedCount}/{task.checklist.length})</strong>
                      <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{progressPercent}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressPercent === 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s ease' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {task.checklist.map(item => (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: item.checked ? 'var(--text-medium)' : 'var(--text-dark)', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleChecklistItem(task.id, item.id)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>{item.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Metadata */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-medium)', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} style={{ color: 'var(--primary)' }} /> Виконавець: <strong style={{ color: 'var(--text-dark)' }}>{task.assignee}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} style={{ color: 'var(--warning)' }} /> Термін: <strong style={{ color: 'var(--text-dark)' }}>{task.deadline} {task.deadlineTime ? `о ${task.deadlineTime}` : ''}</strong>
                    </span>
                  </div>

                  {(task.dealName || task.clientName) && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {task.dealName && <span className="ios-badge ios-badge-blue">💼 {task.dealName}</span>}
                      {task.clientName && <span className="ios-badge ios-badge-purple">🏢 {task.clientName}</span>}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* KeepinCRM Create Task Modal Form */}
      {showAddModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleAddTask} className="ios-modal" style={{ maxWidth: '540px' }}>
            <div className="ios-modal-header">
              <h2 className="ios-modal-title">Створення нового завдання в KeepinCRM</h2>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Назва завдання / Що потрібно зробити</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Перевірити виліт макета 2мм та запустити порізку..."
                  style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Тип завдання</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  >
                    <option value="Перевірка макета">Перевірка макета</option>
                    <option value="Друк">Друк</option>
                    <option value="Порізка">Порізка</option>
                    <option value="Дзвінок">Дзвінок клієнту</option>
                    <option value="Зустріч">Зустріч</option>
                    <option value="Доставка">Доставка</option>
                    <option value="Оплата">Оплата</option>
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Відповідальний виконавець</label>
                  <select 
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  >
                    <option value="Анна (Дизайнер)">Анна (Дизайнер)</option>
                    <option value="Іван (Палітурник)">Іван (Палітурник)</option>
                    <option value="Сергій (Оператор)">Сергій (Оператор)</option>
                    <option value="Віктор (Менеджер)">Віктор (Менеджер)</option>
                    <option value="Працівник А (Адміністратор)">Працівник А (Адміністратор)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Дата терміну</label>
                  <input 
                    type="date" 
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  />
                </div>

                <div className="ios-input-group">
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Час виконання</label>
                  <input 
                    type="time" 
                    value={newDeadlineTime}
                    onChange={(e) => setNewDeadlineTime(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  />
                </div>

                <div className="ios-input-group">
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Пріоритет</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  >
                    <option value="high">Високий 🔥</option>
                    <option value="medium">Середній</option>
                    <option value="low">Низький</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Прив'язка до Угоди</label>
                  <select 
                    value={selectedDeal}
                    onChange={(e) => setSelectedDeal(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  >
                    <option value="">Без прив'язки</option>
                    {orders.map(o => (
                      <option key={o.id} value={`${o.id} — ${o.name || o.category}`}>{o.id} — {o.name || o.category}</option>
                    ))}
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Прив'язка до Замовника</label>
                  <select 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  >
                    <option value="">Без прив'язки</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checklist Dynamic Inputs */}
              <div className="ios-input-group">
                <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Покроковий Чек-лист дій</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {checklistInputs.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        value={val} 
                        onChange={(e) => {
                          const updated = [...checklistInputs];
                          updated[idx] = e.target.value;
                          setChecklistInputs(updated);
                        }}
                        placeholder={`Крок ${idx + 1}...`}
                        style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => setChecklistInputs([...checklistInputs, ''])}
                    className="ios-btn ios-btn-secondary ios-btn-small"
                    style={{ marginTop: '4px', alignSelf: 'flex-start' }}
                  >
                    + Додати крок у чек-лист
                  </button>
                </div>
              </div>

              {/* Auto-trigger Option */}
              <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-dark)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox"
                    checked={enableAutoTrigger}
                    onChange={(e) => setEnableAutoTrigger(e.target.checked)}
                  />
                  <span>Авто-створення завдання при зміні етапу воронки (Тригер)</span>
                </label>
                {enableAutoTrigger && (
                  <select 
                    value={selectedTriggerStage}
                    onChange={(e) => setSelectedTriggerStage(e.target.value)}
                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                  >
                    <option value="Підготовка документів">Підготовка документів</option>
                    <option value="Друк">Друк</option>
                    <option value="Склад">Склад</option>
                    <option value="Готово до видачі">Готово до видачі</option>
                  </select>
                )}
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
                Створити завдання
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
