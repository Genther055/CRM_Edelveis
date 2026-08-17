import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, 
  Plus, 
  Trash, 
  Calendar, 
  User, 
  CheckCircle2
} from 'lucide-react';

interface TaskChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  checklist: TaskChecklistItem[];
  status: 'todo' | 'done';
  clientName?: string;
  dealName?: string;
  createdBy?: string;
}

export const Tasks: React.FC = () => {
  const { clients, orders, currentUser } = useApp();

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'T-301',
      title: 'Зробити кольоропробу CMYK для тиражу бланків A4',
      deadline: '2026-08-18',
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
      createdBy: 'Віктор (Менеджер)'
    },
    {
      id: 'T-302',
      title: 'Підготувати порізку тиражу 1500 шт на гіпер-порізчику',
      deadline: '2026-08-19',
      priority: 'medium',
      assignee: 'Іван (Палітурник)',
      checklist: [
        { id: 'c4', text: 'Перевірити наявність крейдованого паперу 130г на стелажі А', checked: true },
        { id: 'c5', text: 'Виставити стопові мітки порізу 210х297мм', checked: false }
      ],
      status: 'todo',
      clientName: 'ПРАТ «ЕкоСок»',
      dealName: 'Замовлення №1502 — Буклети',
      createdBy: 'Працівник А (Директор)'
    },
    {
      id: 'T-303',
      title: 'Ламінування матовою плівкою 30мкм тиражу меню',
      deadline: '2026-08-20',
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
    }
  ]);

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('medium');
  const [newAssignee, setNewAssignee] = useState('Анна');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedDeal, setSelectedDeal] = useState('');
  const [checklistInputs, setChecklistInputs] = useState<string[]>(['']);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `T-${Date.now().toString().slice(-3)}`,
      title: newTitle,
      deadline: newDeadline || new Date().toISOString().split('T')[0],
      priority: newPriority,
      assignee: newAssignee,
      checklist: checklistInputs
        .filter(text => text.trim())
        .map((text, idx) => ({ id: `c-${idx}-${Date.now()}`, text, checked: false })),
      status: 'todo',
      clientName: selectedClient || undefined,
      dealName: selectedDeal || undefined,
      createdBy: currentUser?.name || 'Працівник А'
    };

    setTasks([...tasks, newTask]);
    setShowAddModal(false);
    // Reset Form
    setNewTitle('');
    setNewDeadline('');
    setNewPriority('medium');
    setSelectedClient('');
    setSelectedDeal('');
    setChecklistInputs(['']);
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
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityBadgeClass = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'high': return 'ios-badge ios-badge-red';
      case 'medium': return 'ios-badge ios-badge-orange';
      case 'low': return 'ios-badge ios-badge-blue';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTabFilter === 'todo') return t.status === 'todo';
    if (activeTabFilter === 'done') return t.status === 'done';
    return true;
  });

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Завдання та Чек-листи</h1>
          <p className="subtitle">Планування та контроль виробничих доручень друкарні</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowAddModal(true)}
          className="ios-btn ios-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          Нове завдання
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveTabFilter('all')}
          className="ios-btn"
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTabFilter === 'all' ? 'var(--primary)' : 'var(--bg-card-subtle)',
            color: activeTabFilter === 'all' ? '#ffffff' : 'var(--text-dark)',
            border: '1px solid var(--border-light)',
            fontWeight: '700'
          }}
        >
          Усі завдання ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTabFilter('todo')}
          className="ios-btn"
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTabFilter === 'todo' ? 'var(--primary)' : 'var(--bg-card-subtle)',
            color: activeTabFilter === 'todo' ? '#ffffff' : 'var(--text-dark)',
            border: '1px solid var(--border-light)',
            fontWeight: '700'
          }}
        >
          В роботі ({tasks.filter(t => t.status === 'todo').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTabFilter('done')}
          className="ios-btn"
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTabFilter === 'done' ? 'var(--primary)' : 'var(--bg-card-subtle)',
            color: activeTabFilter === 'done' ? '#ffffff' : 'var(--text-dark)',
            border: '1px solid var(--border-light)',
            fontWeight: '700'
          }}
        >
          Завершені ({tasks.filter(t => t.status === 'done').length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', color: 'var(--text-dark)', margin: 0 }}>
              Список завдань
            </h3>

            {filteredTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-medium)', fontSize: '13px', padding: '20px' }}>
                Завдання за обраним фільтром відсутні 🎉
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredTasks.map(task => {
                  const doneCount = task.checklist.filter(c => c.checked).length;
                  const totalCount = task.checklist.length;
                  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                  return (
                    <div key={task.id} className="task-card" style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-card-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <button 
                            type="button"
                            onClick={() => toggleTaskStatus(task.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: task.status === 'done' ? 'var(--success)' : 'var(--text-medium)',
                              padding: 0,
                              marginTop: '2px'
                            }}
                          >
                            {task.status === 'done' ? <CheckCircle2 size={22} /> : <CheckSquare size={20} />}
                          </button>
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', textDecoration: task.status === 'done' ? 'line-through' : 'none', margin: 0 }}>
                              {task.title}
                            </h4>
                            
                            {/* Display Client and Deal if present */}
                            {(task.clientName || task.dealName) && (
                              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '6px', flexWrap: 'wrap' }}>
                                {task.clientName && (
                                  <span style={{ backgroundColor: 'rgba(88,86,214,0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', border: '1px solid var(--border-light)' }}>
                                    👤 Замовник: {task.clientName}
                                  </span>
                                )}
                                {task.dealName && (
                                  <span style={{ backgroundColor: 'rgba(0,122,255,0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', border: '1px solid var(--border-light)' }}>
                                    💼 {task.dealName}
                                  </span>
                                )}
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-medium)', marginTop: '8px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-medium)' }}>
                                <Calendar size={12} /> До: <strong style={{ color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>{task.deadline}</strong>
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-medium)' }}>
                                <User size={12} /> Виконавець: <strong style={{ color: 'var(--text-dark)' }}>{task.assignee}</strong>
                              </span>
                              {task.createdBy && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontStyle: 'italic', color: 'var(--text-medium)' }}>
                                  ✍️ Автор: {task.createdBy}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={getPriorityBadgeClass(task.priority)}>
                            {task.priority === 'high' ? 'Критичний' : task.priority === 'medium' ? 'Середній' : 'Низький'}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => deleteTask(task.id)} 
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: 'var(--danger)',
                              padding: '4px'
                            }}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Checklist */}
                      {task.checklist.length > 0 && (
                        <div style={{
                          paddingLeft: '32px',
                          borderTop: '1px solid var(--border-light)',
                          paddingTop: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-medium)', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>Чек-лист виконання ({doneCount}/{totalCount}):</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary)' }}>{progressPct}%</span>
                          </div>
                          {task.checklist.map(item => (
                            <label key={item.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '11px',
                              color: item.checked ? 'var(--text-medium)' : 'var(--text-dark)',
                              textDecoration: item.checked ? 'line-through' : 'none',
                              cursor: 'pointer'
                            }}>
                              <input 
                                type="checkbox" 
                                checked={item.checked} 
                                onChange={() => toggleChecklistItem(task.id, item.id)} 
                              />
                              {item.text}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks Sidebar */}
        <div className="ios-card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', color: 'var(--text-dark)', margin: 0 }}>
            Завершені завдання
          </h3>
          
          {tasks.filter(t => t.status === 'done').length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-medium)', fontSize: '12px', fontStyle: 'italic', padding: '10px' }}>
              Немає завершених завдань
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.filter(t => t.status === 'done').map(task => (
                <div key={task.id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  opacity: 0.8
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <div>
                        <h4 style={{ fontSize: '12px', fontWeight: '700', textDecoration: 'line-through', color: 'var(--text-dark)', margin: 0 }}>{task.title}</h4>
                        <span style={{ fontSize: '10px', color: 'var(--text-medium)' }}>Виконав: {task.assignee}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => deleteTask(task.id)} 
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }}
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                  {(task.clientName || task.dealName) && (
                    <div style={{ display: 'flex', gap: '4px', fontSize: '9px', color: 'var(--text-medium)' }}>
                      {task.clientName && <span>👤 {task.clientName}</span>}
                      {task.dealName && <span>💼 {task.dealName}</span>}
                    </div>
                  )}
                  {task.createdBy && (
                    <span style={{ fontSize: '9px', color: 'var(--text-medium)', fontStyle: 'italic' }}>Створив: {task.createdBy}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleAddTask} className="ios-modal" style={{ maxWidth: '450px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Створити нове завдання</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Суть завдання *</label>
                <input 
                  required
                  placeholder="напр. Надіслати макет на узгодження"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Крайній термін</label>
                  <input 
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Пріоритет</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                  >
                    <option value="low">Низький</option>
                    <option value="medium">Середній</option>
                    <option value="high">Критичний</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Пов'язаний Клієнт</label>
                  <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                    <option value="">-- Оберіть клієнта --</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Пов'язана Угода</label>
                  <select value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)}>
                    <option value="">-- Оберіть угоду --</option>
                    {orders.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Виконавець</label>
                <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
                  <option value="Анна">Анна (Менеджер)</option>
                  <option value="Вікторія">Вікторія (Технолог)</option>
                  <option value="Сергій">Сергій (Друкар)</option>
                </select>
              </div>

              {/* Checklist items */}
              <div className="space-y-2">
                <label className="ios-label">Пункти чек-листа</label>
                {checklistInputs.map((input, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      placeholder={`Пункт ${idx + 1}`}
                      value={input}
                      onChange={(e) => {
                        const newInputs = [...checklistInputs];
                        newInputs[idx] = e.target.value;
                        setChecklistInputs(newInputs);
                      }}
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                    {checklistInputs.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => setChecklistInputs(checklistInputs.filter((_, i) => i !== idx))}
                        className="ios-btn ios-btn-secondary"
                        style={{ padding: '0 8px', height: '32px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={() => setChecklistInputs([...checklistInputs, ''])}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: '4px'
                  }}
                >
                  + Додати пункт чек-листа
                </button>
              </div>
            </div>

            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowAddModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Створити</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
