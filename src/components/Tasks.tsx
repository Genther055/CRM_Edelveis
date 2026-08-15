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
      title: 'Зробити кольоропробу для замовлення №201',
      deadline: '2026-07-24',
      priority: 'high',
      assignee: 'Анна',
      checklist: [
        { id: 'c1', text: 'Завантажити файл макета у високій якості', checked: true },
        { id: 'c2', text: 'Узгодити кольори CMYK з друкарем', checked: false }
      ],
      status: 'todo',
      clientName: 'Контрагент А',
      dealName: 'Замовлення №1',
      createdBy: 'Працівник Б'
    },
    {
      id: 'T-302',
      title: 'Підготувати закупівлю крейдованого паперу',
      deadline: '2026-07-26',
      priority: 'medium',
      assignee: 'Анна',
      checklist: [],
      status: 'todo',
      clientName: 'Контрагент Б',
      createdBy: 'Працівник А'
    }
  ]);

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

  return (
    <div className="main-content bg-[#f2f2f7]" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title text-slate-900">Завдання та Чек-листи</h1>
          <p className="subtitle">Планування та контроль виробничих доручень</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Active Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="ios-card bg-white space-y-4">
            <h3 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              Активні завдання
            </h3>

            {tasks.filter(t => t.status === 'todo').length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-medium)', fontSize: '13px', padding: '20px' }}>
                Всі завдання виконано! 🎉
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.filter(t => t.status === 'todo').map(task => (
                  <div key={task.id} className="task-card" style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '0.5px solid var(--border-light)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
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
                            color: '#c7c7cc',
                            padding: 0,
                            marginTop: '2px'
                          }}
                        >
                          <CheckSquare size={20} />
                        </button>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-dark)' }}>{task.title}</h4>
                          
                          {/* Display Client and Deal if present */}
                          {(task.clientName || task.dealName) && (
                            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '6px', flexWrap: 'wrap' }}>
                              {task.clientName && (
                                <span style={{ backgroundColor: 'rgba(88,86,214,0.08)', color: '#5856d6', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                  👤 Клієнт: {task.clientName}
                                </span>
                              )}
                              {task.dealName && (
                                <span style={{ backgroundColor: 'rgba(0,122,255,0.08)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                  💼 Угода: {task.dealName}
                                </span>
                              )}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-medium)', marginTop: '8px', opacity: 0.8, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> До: {task.deadline}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} /> Виконавець: {task.assignee}
                            </span>
                            {task.createdBy && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontStyle: 'italic' }}>
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
                            padding: '4px',
                            borderRadius: '50%'
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
                        borderTop: '0.5px solid var(--border-light)',
                        paddingTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '10px', fontWeight: '750', color: '#c7c7cc', textTransform: 'uppercase' }}>Чек-лист:</span>
                        {task.checklist.map(item => (
                          <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                            <input 
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleChecklistItem(task.id, item.id)}
                              style={{ width: '15px', height: '15px', borderRadius: '4px' }}
                            />
                            <span style={{
                              textDecoration: item.checked ? 'line-through' : 'none',
                              color: item.checked ? '#c7c7cc' : 'var(--text-dark)'
                            }}>{item.text}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks Sidebar */}
        <div className="ios-card bg-white space-y-4">
          <h3 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            Завершені
          </h3>
          
          {tasks.filter(t => t.status === 'done').length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-medium)', fontSize: '11px', fontStyle: 'italic', padding: '10px' }}>
              Немає завершених завдань
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.filter(t => t.status === 'done').map(task => (
                <div key={task.id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '0.5px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  opacity: 0.7
                }}>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <div>
                        <h4 style={{ fontSize: '12px', fontWeight: '700', textDecoration: 'line-through', color: 'var(--text-dark)' }}>{task.title}</h4>
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
                    <div style={{ display: 'flex', gap: '4px', fontSize: '9px', opacity: 0.8 }}>
                      {task.clientName && <span>👤 {task.clientName}</span>}
                      {task.dealName && <span>💼 {task.dealName}</span>}
                    </div>
                  )}
                  {task.createdBy && (
                    <span style={{ fontSize: '9px', color: '#8e8e93', fontStyle: 'italic' }}>Створив: {task.createdBy}</span>
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
