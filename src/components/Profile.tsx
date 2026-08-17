import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Phone, 
  Mail,
  Camera,
  Clock,
  Award,
  CheckCircle,
  TrendingUp,
  Palmtree,
  CalendarDays,
  FileText
} from 'lucide-react';

interface VacationRecord {
  id: string;
  user: string;
  teamMember: string;
  type: 'Vacation' | 'Remote' | 'Holidays' | 'Unpaid';
  date: string;
  time: string;
  hours: number;
  project: string;
  avatar?: string;
}

export const Profile: React.FC = () => {
  const { currentUser } = useApp();
  
  // Employment Status in Ukrainian
  const [employmentStatus, setEmploymentStatus] = useState<'Active' | 'Hold' | 'Freelancer' | 'Discharged'>('Active');
  
  // Avatar photo state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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

  // Basic info state
  const [fullName, setFullName] = useState(currentUser?.name || 'Працівник А');
  const [nickname, setNickname] = useState('Employee A');
  const [workingEmail, setWorkingEmail] = useState('employee.a@example.com');
  const [position, setPosition] = useState('Технолог, оператор рулонної етикетки');
  const [employmentDay, setEmploymentDay] = useState('06.03.2026');
  const [birthday, setBirthday] = useState('27 Кві 2004');
  const [personalPhone, setPersonalPhone] = useState('+38 (096) 698-6820');
  const [personalEmail, setPersonalEmail] = useState('personal.a@example.com');
  const [resourceManager, setResourceManager] = useState('Працівник Б');

  // Vacation modal & list state (GudHub Vacation Admin style)
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacations, setVacations] = useState<VacationRecord[]>([
    { id: 'V-1', user: 'Михайло Лаута', teamMember: 'Mike Lauta', type: 'Vacation', date: '25 Лист 2025', time: '18:12', hours: 3, project: 'Поліграфія CRM' },
    { id: 'V-2', user: 'Марина Шаран', teamMember: 'Maryna Sharan', type: 'Remote', date: '25 Лист 2025', time: '15:00', hours: 1, project: 'Дизайн макетів' },
    { id: 'V-3', user: 'Марина Шаран', teamMember: 'Maryna Sharan', type: 'Vacation', date: '25 Лист 2025', time: '13:00', hours: 2, project: 'Офсетний цех' },
    { id: 'V-4', user: 'Дмитро Свінціцький', teamMember: 'Dmytro Svintsitskyi', type: 'Remote', date: '25 Лист 2025', time: '11:00', hours: 6, project: 'Поліграфія CRM' },
    { id: 'V-5', user: 'Любов Шкавро', teamMember: 'Liubov Shkavro', type: 'Holidays', date: '25 Лист 2025', time: '09:32', hours: 16, project: 'Святкові дні' },
    { id: 'V-6', user: 'Наталія Черевко', teamMember: 'Nataliia Cherevko', type: 'Unpaid', date: '25 Лист 2025', time: '09:00', hours: 1, project: 'Особисті справи' },
    { id: 'V-7', user: 'Дмитро Свінціцький', teamMember: 'Dmytro Svintsitskyi', type: 'Vacation', date: '25 Лист 2025', time: '09:00', hours: 2, project: 'Поліграфія CRM' },
    { id: 'V-8', user: 'Ірина Валькова', teamMember: 'Iryna Valkova', type: 'Remote', date: '25 Лист 2025', time: '09:00', hours: 8, project: 'Дистанційно' },
    { id: 'V-9', user: 'Наталія Черевко', teamMember: 'Nataliia Cherevko', type: 'Remote', date: '25 Лист 2025', time: '09:00', hours: 7, project: 'Контроль тиражу' },
    { id: 'V-10', user: 'Ярослав Суровцев', teamMember: 'Yaroslav Surovtsev', type: 'Vacation', date: '25 Лист 2025', time: '09:00', hours: 1, project: 'Відпустка' }
  ]);

  // New vacation form state
  const [vacType, setVacType] = useState<'Vacation' | 'Remote' | 'Holidays' | 'Unpaid'>('Vacation');
  const [vacHours, setVacHours] = useState<number>(8);
  const [vacProject, setVacProject] = useState<string>('Поліграфія CRM');
  const [vacDate, setVacDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 10 Recent tasks list
  const profileTasks = [
    { id: 'T-201', project: 'Поліграфія CRM', status: 'В роботі', scene: 'Налаштування Калькулятора & 1С', startDate: '2026-08-17', duration: '2 дні', estimation: '6 год', objectCategory: 'Верстка', level: 'Середній', file: 'Calculator.tsx' },
    { id: 'T-202', project: 'Поліграфія CRM', status: 'Завершено', scene: 'Уніфікація назв замовників (Замовник №1..5)', startDate: '2026-08-17', duration: '1 день', estimation: '3 год', objectCategory: 'База даних', level: 'Легкий', file: 'AppContext.tsx' },
    { id: 'T-203', project: 'Поліграфія CRM', status: 'Завершено', scene: 'Формування розлогого рахунку PDF', startDate: '2026-08-17', duration: '1 день', estimation: '4 год', objectCategory: 'Логіка PDF', level: 'Складний', file: 'Calculator.tsx' },
    { id: 'T-204', project: 'Друкарня Вінниця', status: 'Завершено', scene: 'Перевірка макету №15744', startDate: '2026-08-16', duration: '0.5 дня', estimation: '2 год', objectCategory: 'Додрук', level: 'Легкий', file: 'Production.tsx' },
    { id: 'T-205', project: 'Друкарня Вінниця', status: 'В роботі', scene: 'Запуск тиражу Бланки А4 (Офсет 70г)', startDate: '2026-08-16', duration: '1 день', estimation: '5 год', objectCategory: 'Виробництво', level: 'Середній', file: 'Warehouse.tsx' },
    { id: 'T-206', project: 'Поліграфія CRM', status: 'Черга', scene: 'Скролінг бічного меню та профілю', startDate: '2026-08-16', duration: '0.5 дня', estimation: '1.5 год', objectCategory: 'Верстка', level: 'Легкий', file: 'Sidebar.tsx' },
    { id: 'T-207', project: 'Друкарня Вінниця', status: 'Завершено', scene: 'Розрахунок меню Арома Кава', startDate: '2026-08-15', duration: '1 день', estimation: '2 год', objectCategory: 'Калькулятор', level: 'Легкий', file: 'Calculator.tsx' },
    { id: 'T-208', project: 'Поліграфія CRM', status: 'Завершено', scene: 'Оформлення відпусток та перерв', startDate: '2026-08-15', duration: '1 день', estimation: '3 год', objectCategory: 'HR модуль', level: 'Середній', file: 'Profile.tsx' },
    { id: 'T-209', project: 'Друкарня Вінниця', status: 'Черга', scene: 'Погодження макету з Замовником №3', startDate: '2026-08-14', duration: '1.5 дня', estimation: '3.5 год', objectCategory: 'Дизайн', level: 'Середній', file: 'Deals.tsx' },
    { id: 'T-210', project: 'Друкарня Вінниця', status: 'Черга', scene: 'Перевірка прикладки Різографа A3', startDate: '2026-08-14', duration: '0.5 дня', estimation: '1 год', objectCategory: 'Обладнання', level: 'Легкий', file: 'Production.tsx' }
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const toggleCategory = (cat: string) => {
    if (activeCategories.includes(cat)) {
      setActiveCategories(activeCategories.filter(c => c !== cat));
    } else {
      setActiveCategories([...activeCategories, cat]);
    }
  };

  const handleAddVacation = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: VacationRecord = {
      id: `V-${vacations.length + 1}`,
      user: fullName,
      teamMember: nickname,
      type: vacType,
      date: vacDate,
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      hours: vacHours,
      project: vacProject
    };
    setVacations([newRecord, ...vacations]);
    setShowVacationModal(false);
    alert('Заявку на відпустку / перерву успішно зареєстровано!');
  };

  // Safe avatar initials generator
  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'ПA';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (type: VacationRecord['type']) => {
    switch (type) {
      case 'Vacation':
        return <span className="ios-badge" style={{ backgroundColor: '#ff3b30', color: '#ffffff', fontWeight: '800' }}>- Відпустка</span>;
      case 'Remote':
        return <span className="ios-badge" style={{ backgroundColor: '#ffcc00', color: '#000000', fontWeight: '800' }}>Дистанційно</span>;
      case 'Holidays':
        return <span className="ios-badge" style={{ backgroundColor: '#34c759', color: '#ffffff', fontWeight: '800' }}>+ Свято / Вихідний</span>;
      case 'Unpaid':
        return <span className="ios-badge" style={{ backgroundColor: '#ff9500', color: '#ffffff', fontWeight: '800' }}>За свій рахунок</span>;
    }
  };

  return (
    <div className="main-content bg-[#f8fafc]" style={{ paddingBottom: '100px', minHeight: '100%' }}>
      
      {/* Top Banner Profile Summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-flat)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar with photo upload capability */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: '#007aff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.25)',
              overflow: 'hidden',
              border: '3px solid #ffffff'
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getInitials(fullName)
              )}
            </div>
            
            {/* Upload Button overlay badge */}
            <label style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              backgroundColor: '#007aff',
              color: '#ffffff',
              borderRadius: '50%',
              padding: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          </div>

          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{fullName}</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>{position} • Поліграфія Вінниця</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span className="ios-badge ios-badge-blue">
                {employmentStatus === 'Active' ? '🟢 Працює (Активний)' : employmentStatus === 'Hold' ? '🟠 На паузі / Відпустка' : employmentStatus === 'Freelancer' ? '🔵 Фрілансер' : '🔴 Звільнений'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowVacationModal(true)} 
            className="ios-btn ios-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Palmtree size={15} />
            Оформити відпустку / перерву
          </button>
        </div>
      </div>

      {/* KPI Productivity Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="ios-card bg-white" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(52, 199, 89, 0.1)', color: '#34c759', borderRadius: '10px' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>КПД / Продуктивність</span>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>96.4%</p>
          </div>
        </div>

        <div className="ios-card bg-white" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(0, 122, 255, 0.1)', color: '#007aff', borderRadius: '10px' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Виконано замовлень</span>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>48 тиражів</p>
          </div>
        </div>

        <div className="ios-card bg-white" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(255, 149, 0, 0.1)', color: '#ff9500', borderRadius: '10px' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Сер. час на макет</span>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>1.4 год</p>
          </div>
        </div>

        <div className="ios-card bg-white" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(88, 86, 214, 0.1)', color: '#5856d6', borderRadius: '10px' }}>
            <Award size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Оцінка якості</span>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>4.9 / 5.0</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Basic Information Card */}
        <div className="ios-card bg-white" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a', margin: 0 }}>
            Основна інформація
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px 20px', fontSize: '13px', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontWeight: '600' }}>Повне ім'я:</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>Нікнейм:</span>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>Робочий Email:</span>
            <input value={workingEmail} onChange={(e) => setWorkingEmail(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>Посада:</span>
            <input value={position} onChange={(e) => setPosition(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>Дата найму:</span>
            <input value={employmentDay} onChange={(e) => setEmploymentDay(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

            <span style={{ color: '#64748b', fontWeight: '600' }}>День народження:</span>
            <input value={birthday} onChange={(e) => setBirthday(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
        </div>

        {/* Contact details & Status Card (Ukrainian Labels) */}
        <div className="ios-card bg-white" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a', margin: 0 }}>
            Контактні дані & Статус
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label">Мобільний телефон</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} className="text-slate-400" />
                <input value={personalPhone} onChange={(e) => setPersonalPhone(e.target.value)} />
              </div>
            </div>

            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label">Особистий Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} className="text-slate-400" />
                <input value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} />
              </div>
            </div>

            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label">Відповідальний менеджер</label>
              <input value={resourceManager} onChange={(e) => setResourceManager(e.target.value)} />
            </div>

            {/* Employment Status Selector in Ukrainian */}
            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label">Статус працевлаштування</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                {[
                  { key: 'Active', label: '🟢 Працює' },
                  { key: 'Hold', label: '🟠 Відпустка / Пауза' },
                  { key: 'Freelancer', label: '🔵 Фрілансер' },
                  { key: 'Discharged', label: '🔴 Звільнений' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setEmploymentStatus(item.key as any)}
                    style={{
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: '750',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: employmentStatus === item.key ? '#007aff' : '#f1f5f9',
                      color: employmentStatus === item.key ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories tag clouds */}
            <div className="ios-input-group" style={{ marginBottom: 0 }}>
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
                        backgroundColor: isChecked ? '#e0f2fe' : '#ffffff',
                        color: isChecked ? '#0284c7' : '#64748b'
                      }}
                    >
                      {isChecked ? '✓ ' : '+ '}{cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vacation Admin Tracker (GudHub Style Table) */}
      <div className="ios-card bg-white" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} className="text-blue-500" />
              Журнал відпусток та відсутностей (Vacation Admin)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Облік лікарняних, графіку відпусток та дистанційної роботи команди</p>
          </div>
          <button onClick={() => setShowVacationModal(true)} className="ios-btn ios-btn-secondary" style={{ fontSize: '11px' }}>
            + Подати заявку
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ios-table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '8px 12px' }}>Користувач (User)</th>
                <th style={{ padding: '8px 12px' }}>Співробітник</th>
                <th style={{ padding: '8px 12px' }}>Тип (Type)</th>
                <th style={{ padding: '8px 12px' }}>Дата (Date)</th>
                <th style={{ padding: '8px 12px' }}>Час</th>
                <th style={{ padding: '8px 12px' }}>Години</th>
                <th style={{ padding: '8px 12px' }}>Проєкт / Примітка</th>
              </tr>
            </thead>
            <tbody>
              {vacations.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#007aff', color: '#fff', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {record.user.charAt(0)}
                      </div>
                      {record.user}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#3b82f6', fontWeight: '600' }}>{record.teamMember}</td>
                  <td style={{ padding: '10px 12px' }}>{getStatusBadge(record.type)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{record.date}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{record.time}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '700' }}>{record.hours} год</td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{record.project}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10 Recent User Tasks Table */}
      <div className="ios-card bg-white" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} className="text-blue-500" />
              Останні 10 завдань користувача (Tasks List)
            </h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Оперативний перелік виконаних та поточних виробничих задач</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ios-table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '8px 12px' }}>ID</th>
                <th style={{ padding: '8px 12px' }}>Проєкт</th>
                <th style={{ padding: '8px 12px' }}>Назва завдання / Файл</th>
                <th style={{ padding: '8px 12px' }}>Статус</th>
                <th style={{ padding: '8px 12px' }}>Дата початку</th>
                <th style={{ padding: '8px 12px' }}>Тривалість</th>
                <th style={{ padding: '8px 12px' }}>Оцінка</th>
                <th style={{ padding: '8px 12px' }}>Категорія</th>
                <th style={{ padding: '8px 12px' }}>Складність</th>
              </tr>
            </thead>
            <tbody>
              {profileTasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{task.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '700' }}>{task.project}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: '600' }}>{task.scene}</div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{task.file}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`ios-badge ${task.status === 'Завершено' ? 'ios-badge-green' : task.status === 'Черга' ? 'ios-badge-blue' : 'ios-badge-orange'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{task.startDate}</td>
                  <td style={{ padding: '10px 12px' }}>{task.duration}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '700', color: '#007aff' }}>{task.estimation}</td>
                  <td style={{ padding: '10px 12px' }}>{task.objectCategory}</td>
                  <td style={{ padding: '10px 12px' }}>
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

      {/* Vacation Order Modal */}
      {showVacationModal && (
        <div className="ios-modal-overlay">
          <form onSubmit={handleAddVacation} className="ios-modal" style={{ maxWidth: '480px' }}>
            <div className="ios-modal-header">
              <h3 className="ios-modal-title">Оформлення відпустки / відсутності</h3>
              <button type="button" onClick={() => setShowVacationModal(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>
            
            <div className="ios-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="ios-input-group">
                <label className="ios-label">Тип відсутності *</label>
                <select value={vacType} onChange={(e) => setVacType(e.target.value as any)}>
                  <option value="Vacation">- Відпустка (Vacation)</option>
                  <option value="Remote">Дистанційно (Remote)</option>
                  <option value="Holidays">+ Свято / Вихідний (Holidays)</option>
                  <option value="Unpaid">Відпустка за свій рахунок (Unpaid)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ios-input-group">
                  <label className="ios-label">Дата початку *</label>
                  <input type="date" value={vacDate} onChange={(e) => setVacDate(e.target.value)} required />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Кількість годин *</label>
                  <input type="number" min="1" max="160" value={vacHours} onChange={(e) => setVacHours(Number(e.target.value))} required />
                </div>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Проєкт / Примітка *</label>
                <input placeholder="напр. Щорічна планова відпустка" value={vacProject} onChange={(e) => setVacProject(e.target.value)} required />
              </div>
            </div>

            <div className="ios-modal-footer">
              <button type="button" onClick={() => setShowVacationModal(false)} className="ios-btn ios-btn-secondary">Скасувати</button>
              <button type="submit" className="ios-btn ios-btn-primary">Зберегти заявку</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
