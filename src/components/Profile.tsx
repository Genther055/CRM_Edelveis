import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Phone, 
  Mail
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser } = useApp();
  const [employmentStatus, setEmploymentStatus] = useState<'Active' | 'Discharged' | 'Freelancer' | 'Hold'>('Active');
  
  // Custom categories list adapted for print shop operations
  const categories = [
    'Адміністрування', 
    'Розрахунок замовлень', 
    'Дизайн & Додрукарська підготовка', 
    'Цифровий друк', 
    'Офсетний друк', 
    'Післядрукарські роботи', 
    'Ламінування & Порізка'
  ];
  const [activeCategories, setActiveCategories] = useState<string[]>(['Адміністрування', 'Розрахунок замовлень']);

  // Basic info state matching Victoria's profile details
  const [fullName, setFullName] = useState(currentUser?.name || 'Працівник А');
  const [nickname, setNickname] = useState('Employee A');
  const [workingEmail, setWorkingEmail] = useState('employee.a@example.com');
  const [position, setPosition] = useState('Технолог, оператор рулонної етикетки');
  const [employmentDay, setEmploymentDay] = useState('06.03.2026');
  const [birthday, setBirthday] = useState('27 Apr 2004');
  const [personalPhone, setPersonalPhone] = useState('+38 (096) 698-6820');
  const [personalEmail, setPersonalEmail] = useState('personal.a@example.com');
  const [resourceManager, setResourceManager] = useState('Працівник Б');

  const toggleCategory = (cat: string) => {
    if (activeCategories.includes(cat)) {
      setActiveCategories(activeCategories.filter(c => c !== cat));
    } else {
      setActiveCategories([...activeCategories, cat]);
    }
  };

  // Mock list of tasks for the bottom table matching the user's profile view
  const profileTasks = [
    { id: 'T-201', project: 'Поліграфія CRM', status: 'В роботі', scene: 'Налаштування Kanban-дошки', startDate: '2026-07-24', duration: '2 дні', estimation: '6 год', objectCategory: 'Верстка', level: 'Середній', file: 'Production.tsx' },
    { id: 'T-202', project: 'Поліграфія CRM', status: 'Завершено', scene: 'Уніфікація шрифтів системи', startDate: '2026-07-24', duration: '1 день', estimation: '3 год', objectCategory: 'Дизайн', level: 'Легкий', file: 'index.css' },
    { id: 'T-203', project: 'Поліграфія CRM', status: 'Завершено', scene: 'Зв\'язування Лідів та Клієнтів', startDate: '2026-07-24', duration: '1 день', estimation: '4 год', objectCategory: 'Логіка', level: 'Складний', file: 'Leads.tsx' },
    { id: 'T-204', project: 'Поліграфія CRM', status: 'Черга', scene: 'Інтеграція бази співробітників', startDate: '2026-07-25', duration: '1 день', estimation: '5 год', objectCategory: 'База даних', level: 'Середній', file: 'Employees.tsx' },
    { id: 'T-205', project: 'Поліграфія CRM', status: 'Черга', scene: 'Скролінг таблиці завдань', startDate: '2026-07-25', duration: '0.5 дня', estimation: '1 год', objectCategory: 'Верстка', level: 'Легкий', file: 'Profile.tsx' }
  ];

  // Safe avatar initials generator
  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'ВШ';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  return (
    <div className="main-content bg-[#f8fafc]" style={{ overflowY: 'auto', height: '100%', paddingBottom: '40px' }}>
      
      {/* Top Banner Profile Summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-flat)'
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: '700',
          boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)'
        }}>
          {getInitials(fullName)}
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{fullName}</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{position} • Поліграфія Вінниця</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Basic Information Card */}
        <div className="ios-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a' }}>
            Основна інформація
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px 20px', fontSize: '13px' }}>
            <span style={{ color: '#64748b', fontWeight: '600' }}>Повне ім'я:</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '4px 8px' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>Нікнейм:</span>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} style={{ padding: '4px 8px' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>Робочий Email:</span>
            <input value={workingEmail} onChange={(e) => setWorkingEmail(e.target.value)} style={{ padding: '4px 8px' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>Посада:</span>
            <input value={position} onChange={(e) => setPosition(e.target.value)} style={{ padding: '4px 8px' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>Дата найму:</span>
            <input value={employmentDay} onChange={(e) => setEmploymentDay(e.target.value)} style={{ padding: '4px 8px' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>День народження:</span>
            <input value={birthday} onChange={(e) => setBirthday(e.target.value)} style={{ padding: '4px 8px' }} />
          </div>
        </div>

        {/* Contact details Card */}
        <div className="ios-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a' }}>
            Контактні дані & Статус
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div className="ios-input-group">
              <label className="ios-label">Мобільний телефон</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} className="text-slate-400" />
                <input value={personalPhone} onChange={(e) => setPersonalPhone(e.target.value)} />
              </div>
            </div>

            <div className="ios-input-group">
              <label className="ios-label">Особистий Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} className="text-slate-400" />
                <input value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} />
              </div>
            </div>

            <div className="ios-input-group">
              <label className="ios-label">Відповідальний менеджер</label>
              <input value={resourceManager} onChange={(e) => setResourceManager(e.target.value)} />
            </div>

            {/* Employment Status List */}
            <div className="ios-input-group">
              <label className="ios-label">Статус працевлаштування</label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                {(['Active', 'Discharged', 'Freelancer', 'Hold'] as const).map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setEmploymentStatus(status)}
                    style={{
                      flexGrow: 1,
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: employmentStatus === status ? '#10b981' : '#f1f5f9',
                      color: employmentStatus === status ? '#ffffff' : '#475569'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories tag clouds */}
            <div className="ios-input-group">
              <label className="ios-label">Спеціалізація друкарні</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {categories.map(cat => {
                  const isChecked = activeCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '10px',
                        fontWeight: '700',
                        borderRadius: '999px',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer',
                        backgroundColor: isChecked ? 'rgba(59, 130, 246, 0.1)' : '#ffffff',
                        color: isChecked ? '#3b82f6' : '#64748b'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Task List Table (With Scroll container) */}
      <div className="ios-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: '#0f172a' }}>
            Список завдань користувача (Tasks List)
          </h3>
        </div>

        {/* Scroll wrapper */}
        <div style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'auto' }}>
          <div className="ios-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="ios-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Проект</th>
                  <th>Сцена / Опис завдання</th>
                  <th style={{ width: '100px' }}>Статус</th>
                  <th style={{ width: '100px' }}>Початок</th>
                  <th style={{ width: '80px' }}>Тривалість</th>
                  <th style={{ width: '80px' }}>Оцінка</th>
                  <th style={{ width: '100px' }}>Категорія</th>
                  <th style={{ width: '100px' }}>Рівень</th>
                </tr>
              </thead>
              <tbody>
                {profileTasks.map(task => (
                  <tr key={task.id}>
                    <td style={{ fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{task.id}</td>
                    <td style={{ fontWeight: '700' }}>{task.project}</td>
                    <td>
                      <div>{task.scene}</div>
                      <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{task.file}</span>
                    </td>
                    <td>
                      <span className={`ios-badge ${task.status === 'Завершено' ? 'ios-badge-green' : task.status === 'Черга' ? 'ios-badge-blue' : 'ios-badge-orange'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{task.startDate}</td>
                    <td>{task.duration}</td>
                    <td style={{ fontWeight: '600', color: '#3b82f6' }}>{task.estimation}</td>
                    <td>{task.objectCategory}</td>
                    <td>
                      <span className={`ios-badge ${task.level === 'Складний' ? 'ios-badge-red' : task.level === 'Середній' ? 'ios-badge-orange' : 'ios-badge-green'}`}>
                        {task.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
