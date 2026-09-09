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
  ListTodo,
  CalendarRange,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import type { TaskItem } from '../types';
import { NotesSection } from './NotesSection';

type TaskSubTab = 'all' | 'today' | 'my' | 'assigned_by_me' | 'overdue' | 'auto_triggers' | 'task_types';

export const Tasks: React.FC = () => {
  const { 
    clients, 
    orders, 
    currentUser, 
    tasks, 
    addTask, 
    deleteTask, 
    toggleTaskStatus, 
    toggleTaskChecklistItem,
    theme 
  } = useApp();

  const isDark = theme === 'dark';

  const [activeSubTab, setActiveSubTab] = useState<TaskSubTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Всі');
  
  // Date Creation Filter
  const [createdDateFilter, setCreatedDateFilter] = useState<'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom'>('all');
  const [customCreatedDate, setCustomCreatedDate] = useState('');

  // Expanded notes state per task
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

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

    addTask({
      title: newTitle.trim(),
      type: newType,
      deadline: newDeadline || new Date().toISOString().split('T')[0],
      deadlineTime: newDeadlineTime,
      priority: newPriority,
      assignee: newAssignee,
      checklist: checklistInputs
        .filter(text => text.trim())
        .map((text, idx) => ({ id: `c-${idx}-${Date.now()}`, text, checked: false })),
      status: 'todo',
      createdAt: new Date().toISOString().split('T')[0],
      clientName: selectedClient || undefined,
      dealName: selectedDeal || undefined,
      createdBy: currentUser?.name || 'Працівник А (Адміністратор)',
      autoTriggered: enableAutoTrigger,
      stageTrigger: enableAutoTrigger ? selectedTriggerStage : undefined
    });

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

  const toggleNotesForTask = (taskId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const currentUserName = currentUser?.name || 'Працівник А (Адміністратор)';
  const todayStr = new Date().toISOString().split('T')[0];

  const getPastDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // Filter Tasks by Sub-tab, Date Creation & Search
  const filteredTasks = tasks.filter(task => {
    if (activeSubTab === 'today') {
      if (!task.deadline || task.deadline !== todayStr || task.status === 'done') return false;
    } else if (activeSubTab === 'my') {
      if (!task.assignee.includes(currentUserName.split(' ')[0])) return false;
    } else if (activeSubTab === 'assigned_by_me') {
      if (!task.createdBy?.includes(currentUserName.split(' ')[0])) return false;
    } else if (activeSubTab === 'overdue') {
      if (!task.deadline || task.deadline >= todayStr || task.status === 'done') return false;
    } else if (activeSubTab === 'auto_triggers') {
      if (!task.autoTriggered) return false;
    }

    if (typeFilter !== 'Всі' && task.type !== typeFilter) return false;

    // Creation Date Filter
    if (createdDateFilter !== 'all') {
      const created = task.createdAt ? task.createdAt.split('T')[0] : '';
      if (createdDateFilter === 'today') {
        if (created !== todayStr) return false;
      } else if (createdDateFilter === 'yesterday') {
        const yesterday = getPastDateStr(1);
        if (created !== yesterday) return false;
      } else if (createdDateFilter === 'last7') {
        const last7 = getPastDateStr(7);
        if (created < last7) return false;
      } else if (createdDateFilter === 'last30') {
        const last30 = getPastDateStr(30);
        if (created < last30) return false;
      } else if (createdDateFilter === 'custom' && customCreatedDate) {
        if (created !== customCreatedDate) return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(q) || 
             (task.clientName && task.clientName.toLowerCase().includes(q)) || 
             (task.dealName && task.dealName.toLowerCase().includes(q)) ||
             (task.assignee && task.assignee.toLowerCase().includes(q));
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

  const overdueCount = tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < todayStr).length;
  const todayCount = tasks.filter(t => t.status !== 'done' && t.deadline && t.deadline === todayStr).length;

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header Title Container */}
      <div className="header-title-container" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={24} style={{ color: 'var(--primary)' }} />
            Завдання та бізнес-доручення (KeepinCRM)
          </h1>
          <p className="subtitle">Планування завдань, фільтри за датою створення, замітки та авто-тригери воронки</p>
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
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', gap: '18px', overflowX: 'auto', whiteSpace: 'nowrap', alignItems: 'center' }}>
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
            onClick={() => setActiveSubTab('today')}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: activeSubTab === 'today' ? '800' : '600',
              color: activeSubTab === 'today' ? '#f59e0b' : 'var(--text-medium)',
              borderBottom: activeSubTab === 'today' ? '2px solid #f59e0b' : '2px solid transparent',
              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Calendar size={14} style={{ color: '#f59e0b' }} /> На сьогодні ({todayCount})
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
            <AlertTriangle size={14} /> Протерміновані ({overdueCount})
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

      {/* Filter Control Bar (Search + Type + CREATION DATE FILTER) */}
      <div className="ios-card" style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-light)', 
        padding: '12px 16px', 
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Top Row: Search and Type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-medium)' }} />
            <input
              type="text"
              placeholder="Пошук за назвою, клієнтом, виконавцем..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '32px',
                paddingLeft: '32px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-card-subtle)',
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

        {/* Bottom Row: Creation Date Filter Controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: '12px', 
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '750', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CalendarRange size={13} style={{ color: 'var(--primary)' }} />
              Дата створення задач:
            </span>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Всі дати' },
                { id: 'today', label: 'Сьогодні' },
                { id: 'yesterday', label: 'Вчора' },
                { id: 'last7', label: 'Останні 7 днів' },
                { id: 'last30', label: 'Останні 30 днів' },
                { id: 'custom', label: 'Календарний вибір...' }
              ].map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setCreatedDateFilter(d.id as any)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10.5px',
                    borderRadius: '5px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: createdDateFilter === d.id ? 'var(--primary)' : 'var(--bg-card-subtle)',
                    color: createdDateFilter === d.id ? '#ffffff' : 'var(--text-dark)',
                    fontWeight: createdDateFilter === d.id ? '750' : '500',
                    cursor: 'pointer'
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {createdDateFilter === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="date"
                  value={customCreatedDate}
                  onChange={(e) => setCustomCreatedDate(e.target.value)}
                  style={{
                    height: '26px',
                    padding: '0 6px',
                    fontSize: '11px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    color: 'var(--text-dark)',
                    border: '1px solid var(--primary)',
                    borderRadius: '5px'
                  }}
                />
                {customCreatedDate && (
                  <button
                    type="button"
                    onClick={() => setCustomCreatedDate('')}
                    style={{ border: 'none', background: 'transparent', color: 'var(--text-medium)', cursor: 'pointer' }}
                    title="Скинути дату"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {createdDateFilter !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setCreatedDateFilter('all');
                setCustomCreatedDate('');
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--primary)',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              ✕ Скинути фільтр дати
            </button>
          )}
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
            const isNotesOpen = Boolean(expandedNotes[task.id]);

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
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '11px', flexWrap: 'wrap' }}>
                        <span className="ios-badge ios-badge-blue">{task.type}</span>
                        <span className={getPriorityBadgeClass(task.priority)}>
                          {task.priority === 'high' ? '🔥 Високий пріоритет' : task.priority === 'medium' ? 'Середній' : 'Низький'}
                        </span>
                        {task.autoTriggered && (
                          <span className="ios-badge ios-badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Zap size={10} /> Авто-тригер ({task.stageTrigger})
                          </span>
                        )}
                        <span style={{ fontSize: '10.5px', color: 'var(--text-medium)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CalendarRange size={11} /> Створено: <strong style={{ color: 'var(--text-dark)' }}>{task.createdAt ? task.createdAt.split('T')[0] : '—'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (window.confirm(`Видалити завдання "${task.title}"?`)) {
                        deleteTask(task.id);
                      }
                    }}
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {task.checklist.map(item => (
                        <label 
                          key={item.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            fontSize: '13px', 
                            color: item.checked ? 'var(--text-medium)' : 'var(--text-dark)', 
                            cursor: 'pointer',
                            padding: '2px 0'
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleTaskChecklistItem(task.id, item.id)}
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              minWidth: '16px', 
                              margin: 0, 
                              cursor: 'pointer',
                              accentColor: 'var(--primary)'
                            }}
                          />
                          <span style={{ textDecoration: item.checked ? 'line-through' : 'none', flexGrow: 1, lineHeight: '1.4' }}>
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Metadata & Notes Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-medium)', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} style={{ color: 'var(--primary)' }} /> Виконавець: <strong style={{ color: 'var(--text-dark)' }}>{task.assignee}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} style={{ color: task.deadline < todayStr && !isDone ? 'var(--danger)' : 'var(--warning)' }} /> 
                      Термін: <strong style={{ color: task.deadline < todayStr && !isDone ? 'var(--danger)' : 'var(--text-dark)' }}>{task.deadline} {task.deadlineTime ? `о ${task.deadlineTime}` : ''}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {task.dealName && <span className="ios-badge ios-badge-blue">💼 {task.dealName}</span>}
                    {task.clientName && <span className="ios-badge ios-badge-purple">🏢 {task.clientName}</span>}

                    {/* Notes expansion button */}
                    <button
                      type="button"
                      onClick={() => toggleNotesForTask(task.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        border: '1px solid var(--border-light)',
                        backgroundColor: isNotesOpen ? 'var(--primary)' : 'var(--bg-card-subtle)',
                        color: isNotesOpen ? '#ffffff' : 'var(--text-dark)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <MessageSquare size={12} />
                      Замітки
                      {isNotesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Embedded Notes Section */}
                {isNotesOpen && (
                  <div style={{ 
                    borderTop: '1px dashed var(--border-light)', 
                    paddingTop: '12px', 
                    marginTop: '2px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <NotesSection
                      targetType="task"
                      targetId={task.id}
                      title="Замітки та коментарі до цього завдання"
                      placeholder="Напишіть замітку або відповідь до завдання..."
                      compact={true}
                    />
                  </div>
                )}

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
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Прив\'язка до Угоди</label>
                  <select 
                    value={selectedDeal}
                    onChange={(e) => setSelectedDeal(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  >
                    <option value="">Без прив\'язки</option>
                    {orders.map(o => (
                      <option key={o.id} value={`${o.id} — ${o.name || o.category}`}>{o.id} — {o.name || o.category}</option>
                    ))}
                  </select>
                </div>

                <div className="ios-input-group">
                  <label className="ios-label" style={{ color: 'var(--text-medium)' }}>Прив\'язка до Замовника</label>
                  <select 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-card-subtle)', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  >
                    <option value="">Без прив\'язки</option>
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
