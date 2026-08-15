import React, { useState } from 'react';
import { Search, UserPlus, Phone, Mail, Calendar, Briefcase, Filter } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: 'Директор' | 'Бухгалтер' | 'Менеджер замовлень' | 'Дизайнер' | 'Друкар офсетного друку' | 'Оператор цифрового друку' | 'Палітурник / Порізчик' | 'Кур\'єр' | 'Технолог, оператор рулонної етикетки';
  phone: string;
  email: string;
  birthday: string;
  hireDate: string;
  status: 'Активний' | 'Відпустка' | 'Лікарняний' | 'Призупинено';
}

export const Employees: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [employees] = useState<Employee[]>([
    { id: '1', name: 'Працівник А (Директор)', role: 'Директор', phone: '+38 (067) 111-2233', email: 'worker.a@example.com', birthday: '14.05.1989', hireDate: '12.01.2024', status: 'Активний' },
    { id: '2', name: 'Працівник Б (Технолог)', role: 'Технолог, оператор рулонної етикетки', phone: '+38 (096) 698-6820', email: 'worker.b@example.com', birthday: '27.04.2004', hireDate: '06.03.2026', status: 'Активний' },
    { id: '3', name: 'Працівник В (Бухгалтер)', role: 'Бухгалтер', phone: '+38 (050) 222-3344', email: 'worker.c@example.com', birthday: '08.12.1978', hireDate: '15.02.2023', status: 'Активний' },
    { id: '4', name: 'Працівник Г (Дизайнер)', role: 'Дизайнер', phone: '+38 (093) 333-4455', email: 'worker.d@example.com', birthday: '21.09.1994', hireDate: '10.05.2024', status: 'Активний' },
    { id: '5', name: 'Працівник Д (Друкар)', role: 'Друкар офсетного друку', phone: '+38 (067) 444-5566', email: 'worker.e@example.com', birthday: '03.02.1985', hireDate: '01.09.2022', status: 'Активний' },
    { id: '6', name: 'Працівник Е (Менеджер)', role: 'Менеджер замовлень', phone: '+38 (096) 555-6677', email: 'worker.f@example.com', birthday: '30.07.1996', hireDate: '18.11.2024', status: 'Активний' },
    { id: '7', name: 'Працівник Є (Порізчик)', role: 'Палітурник / Порізчик', phone: '+38 (050) 666-7788', email: 'worker.g@example.com', birthday: '18.06.1991', hireDate: '12.03.2023', status: 'Активний' },
    { id: '8', name: 'Працівник Ж (Дизайнер)', role: 'Дизайнер', phone: '+38 (093) 777-8899', email: 'worker.h@example.com', birthday: '05.11.1999', hireDate: '01.10.2025', status: 'Відпустка' },
    { id: '9', name: 'Працівник З (Цифровий друк)', role: 'Оператор цифрового друку', phone: '+38 (067) 888-9900', email: 'worker.i@example.com', birthday: '12.01.1993', hireDate: '04.04.2024', status: 'Активний' },
    { id: '10', name: 'Працівник И (Друкар)', role: 'Друкар офсетного друку', phone: '+38 (096) 999-0011', email: 'worker.j@example.com', birthday: '27.03.1982', hireDate: '15.08.2022', status: 'Лікарняний' },
    { id: '11', name: 'Працівник І (Порізчик)', role: 'Палітурник / Порізчик', phone: '+38 (050) 000-1122', email: 'worker.k@example.com', birthday: '14.04.1988', hireDate: '20.06.2023', status: 'Активний' },
    { id: '12', name: 'Працівник Ї (Кур\'єр)', role: 'Кур\'єр', phone: '+38 (093) 111-2233', email: 'worker.l@example.com', birthday: '09.10.2000', hireDate: '01.12.2025', status: 'Активний' },
    { id: '13', name: 'Працівник Й (Менеджер)', role: 'Менеджер замовлень', phone: '+38 (067) 222-3344', email: 'worker.m@example.com', birthday: '25.02.1991', hireDate: '15.05.2024', status: 'Активний' },
    { id: '14', name: 'Працівник К (Цифровий друк)', role: 'Оператор цифрового друку', phone: '+38 (050) 333-4455', email: 'worker.n@example.com', birthday: '17.08.1995', hireDate: '10.02.2025', status: 'Активний' },
    { id: '15', name: 'Працівник Л (Бухгалтер)', role: 'Бухгалтер', phone: '+38 (093) 444-5566', email: 'worker.o@example.com', birthday: '11.01.1980', hireDate: '01.11.2023', status: 'Активний' },
    { id: '16', name: 'Працівник М (Друкар)', role: 'Друкар офсетного друку', phone: '+38 (067) 555-6677', email: 'worker.p@example.com', birthday: '22.05.1987', hireDate: '05.07.2022', status: 'Відпустка' },
    { id: '17', name: 'Працівник Н (Порізчик)', role: 'Палітурник / Порізчик', phone: '+38 (050) 666-7788', email: 'worker.q@example.com', birthday: '13.09.1992', hireDate: '14.04.2024', status: 'Активний' },
    { id: '18', name: 'Працівник О (Кур\'єр)', role: 'Кур\'єр', phone: '+38 (093) 777-8899', email: 'worker.r@example.com', birthday: '03.04.2001', hireDate: '10.01.2026', status: 'Активний' },
    { id: '19', name: 'Працівник П (Менеджер)', role: 'Менеджер замовлень', phone: '+38 (067) 888-9900', email: 'worker.s@example.com', birthday: '19.06.1997', hireDate: '01.03.2025', status: 'Активний' },
    { id: '20', name: 'Працівник Р (Цифровий друк)', role: 'Оператор цифрового друку', phone: '+38 (050) 999-0011', email: 'worker.t@example.com', birthday: '15.11.1990', hireDate: '12.09.2024', status: 'Активний' }
  ]);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.phone.includes(search) || 
                          emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'Активний': return <span className="ios-badge ios-badge-green">Працює</span>;
      case 'Відпустка': return <span className="ios-badge ios-badge-yellow">Відпустка</span>;
      case 'Лікарняний': return <span className="ios-badge ios-badge-red">Лікарняний</span>;
      default: return <span className="ios-badge ios-badge-orange">Призупинено</span>;
    }
  };

  return (
    <div className="main-content bg-[#f8fafc]">
      {/* Top Header */}
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Співробітники компанії</h1>
          <p className="subtitle">Реєстр особових справ та персональних даних штату поліграфії (20 чоловік)</p>
        </div>
        <button 
          onClick={() => alert('Створення картки нового співробітника буде доступно у наступному релізі.')}
          className="ios-btn ios-btn-primary"
          style={{ backgroundColor: '#10b981' }}
        >
          <UserPlus size={16} />
          Додати працівника
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '10px 14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '250px' }}>
          <Search style={{ position: 'absolute', left: '8px', top: '8px', color: '#94a3b8' }} size={13} />
          <input 
            placeholder="Шукати за ПІБ, телефоном..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '28px', height: '28px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
          <Briefcase size={14} style={{ color: '#64748b' }} />
          <span>Посада:</span>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ height: '28px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 4px', backgroundColor: '#ffffff' }}
          >
            <option value="all">Всі посади</option>
            <option value="Директор">Директор</option>
            <option value="Бухгалтер">Бухгалтер</option>
            <option value="Менеджер замовлень">Менеджер замовлень</option>
            <option value="Дизайнер">Дизайнер</option>
            <option value="Друкар офсетного друку">Друкар офсетного друку</option>
            <option value="Оператор цифрового друку">Оператор цифрового друку</option>
            <option value="Палітурник / Порізчик">Палітурник / Порізчик</option>
            <option value="Кур'єр">Кур'єр</option>
            <option value="Технолог, operator рулонної етикетки">Технолог, оператор рулонної етикетки</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
          <Filter size={14} style={{ color: '#64748b' }} />
          <span>Статус:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '28px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 4px', backgroundColor: '#ffffff' }}
          >
            <option value="all">Всі статуси</option>
            <option value="Активний">Працює</option>
            <option value="Відпустка">Відпустка</option>
            <option value="Лікарняний">Лікарняний</option>
          </select>
        </div>
      </div>

      {/* Grid of employees */}
      <div className="ios-table-container" style={{ backgroundColor: '#ffffff' }}>
        <table className="ios-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>Прізвище, Ім'я, По батькові</th>
              <th>Посада</th>
              <th>Контакти</th>
              <th>День народження</th>
              <th>Дата найму</th>
              <th style={{ width: '120px' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className={emp.id === 'EMP-02' ? 'hover:bg-blue-50' : ''} style={{ backgroundColor: emp.id === 'EMP-02' ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{emp.id}</td>
                <td>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{emp.name}</div>
                  {emp.id === 'EMP-02' && <span style={{ fontSize: '9px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>Власник кабінету</span>}
                </td>
                <td style={{ fontWeight: '600', color: '#475569' }}>{emp.role}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} style={{ color: '#94a3b8' }} />
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{emp.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Mail size={12} style={{ color: '#94a3b8' }} />
                    <span>{emp.email}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                    <Calendar size={12} style={{ color: '#94a3b8' }} />
                    <span>{emp.birthday}</span>
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{emp.hireDate}</td>
                <td>{getStatusBadge(emp.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
