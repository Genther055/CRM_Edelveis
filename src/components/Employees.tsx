import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  UserX, 
  ArrowRightLeft, 
  Lock, 
  Unlock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { blockUser, unblockUser, isUserBlocked } from '../utils/security';

interface Employee {
  id: string;
  name: string;
  username: string;
  role: 'Директор' | 'Бухгалтер' | 'Менеджер замовлень' | 'Дизайнер' | 'Друкар офсетного друку' | 'Оператор цифрового друку' | 'Палітурник / Порізчик' | 'Кур\'єр' | 'Технолог, оператор рулонної етикетки';
  phone: string;
  email: string;
  birthday: string;
  hireDate: string;
  status: 'Активний' | 'Відпустка' | 'Лікарняний' | 'Заблоковано (Звільнений)';
  activeDealsCount: number;
  activeClientsCount: number;
}

export const Employees: React.FC = () => {
  const { clients, orders, currentUser, addSystemNotification } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Працівник А (Директор)', username: 'admin', role: 'Директор', phone: '+38 (067) 111-2233', email: 'worker.a@edelveis.vn.ua', birthday: '14.05.1989', hireDate: '12.01.2024', status: 'Активний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '2', name: 'Працівник Б (Технолог)', username: 'technolog', role: 'Технолог, оператор рулонної етикетки', phone: '+38 (096) 698-6820', email: 'worker.b@edelveis.vn.ua', birthday: '27.04.2004', hireDate: '06.03.2026', status: 'Активний', activeDealsCount: 4, activeClientsCount: 8 },
    { id: '3', name: 'Працівник В (Бухгалтер)', username: 'accountant', role: 'Бухгалтер', phone: '+38 (050) 222-3344', email: 'worker.c@edelveis.vn.ua', birthday: '08.12.1978', hireDate: '15.02.2023', status: 'Активний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '4', name: 'Працівник Г (Дизайнер)', username: 'designer_g', role: 'Дизайнер', phone: '+38 (093) 333-4455', email: 'worker.d@edelveis.vn.ua', birthday: '21.09.1994', hireDate: '10.05.2024', status: 'Активний', activeDealsCount: 6, activeClientsCount: 12 },
    { id: '5', name: 'Працівник Д (Друкар)', username: 'operator', role: 'Друкар офсетного друку', phone: '+38 (067) 444-5566', email: 'worker.e@edelveis.vn.ua', birthday: '03.02.1985', hireDate: '01.09.2022', status: 'Активний', activeDealsCount: 8, activeClientsCount: 0 },
    { id: '6', name: 'Працівник Е (Менеджер)', username: 'manager', role: 'Менеджер замовлень', phone: '+38 (096) 555-6677', email: 'worker.f@edelveis.vn.ua', birthday: '30.07.1996', hireDate: '18.11.2024', status: 'Активний', activeDealsCount: 14, activeClientsCount: 28 },
    { id: '7', name: 'Працівник Є (Порізчик)', username: 'cutter', role: 'Палітурник / Порізчик', phone: '+38 (050) 666-7788', email: 'worker.g@edelveis.vn.ua', birthday: '18.06.1991', hireDate: '12.03.2023', status: 'Активний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '8', name: 'Працівник Ж (Дизайнер)', username: 'designer_zh', role: 'Дизайнер', phone: '+38 (093) 777-8899', email: 'worker.h@edelveis.vn.ua', birthday: '05.11.1999', hireDate: '01.10.2025', status: 'Відпустка', activeDealsCount: 2, activeClientsCount: 5 },
    { id: '9', name: 'Працівник З (Цифровий друк)', username: 'digital_print', role: 'Оператор цифрового друку', phone: '+38 (067) 888-9900', email: 'worker.i@edelveis.vn.ua', birthday: '12.01.1993', hireDate: '04.04.2024', status: 'Активний', activeDealsCount: 5, activeClientsCount: 0 },
    { id: '10', name: 'Працівник И (Друкар)', username: 'printer_y', role: 'Друкар офсетного друку', phone: '+38 (096) 999-0011', email: 'worker.j@edelveis.vn.ua', birthday: '27.03.1982', hireDate: '15.08.2022', status: 'Лікарняний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '11', name: 'Працівник І (Порізчик)', username: 'cutter_i', role: 'Палітурник / Порізчик', phone: '+38 (050) 000-1122', email: 'worker.k@edelveis.vn.ua', birthday: '14.04.1988', hireDate: '20.06.2023', status: 'Активний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '12', name: 'Працівник Ї (Кур\'єр)', username: 'courier', role: 'Кур\'єр', phone: '+38 (093) 111-2233', email: 'worker.l@edelveis.vn.ua', birthday: '09.10.2000', hireDate: '01.12.2025', status: 'Активний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '13', name: 'Працівник Й (Менеджер)', username: 'manager_y', role: 'Менеджер замовлень', phone: '+38 (067) 222-3344', email: 'worker.m@edelveis.vn.ua', birthday: '25.02.1991', hireDate: '15.05.2024', status: 'Активний', activeDealsCount: 11, activeClientsCount: 22 },
    { id: '14', name: 'Працівник К (Цифровий друк)', username: 'digital_k', role: 'Оператор цифрового друку', phone: '+38 (050) 333-4455', email: 'worker.n@edelveis.vn.ua', birthday: '17.08.1995', hireDate: '10.02.2025', status: 'Активний', activeDealsCount: 3, activeClientsCount: 0 },
    { id: '15', name: 'Працівник Л (Бухгалтер)', username: 'accountant_l', role: 'Бухгалтер', phone: '+38 (093) 444-5566', email: 'worker.o@edelveis.vn.ua', birthday: '11.01.1980', hireDate: '01.11.2023', status: 'Активний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '16', name: 'Працівник М (Друкар)', username: 'printer_m', role: 'Друкар офсетного друку', phone: '+38 (067) 555-6677', email: 'worker.p@edelveis.vn.ua', birthday: '22.05.1987', hireDate: '05.07.2022', status: 'Відпустка', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '17', name: 'Працівник Н (Порізчик)', username: 'cutter_n', role: 'Палітурник / Порізчик', phone: '+38 (050) 666-7788', email: 'worker.q@edelveis.vn.ua', birthday: '13.09.1992', hireDate: '14.04.2024', status: 'Активний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '18', name: 'Працівник О (Кур\'єр)', username: 'courier_o', role: 'Кур\'єр', phone: '+38 (093) 777-8899', email: 'worker.r@edelveis.vn.ua', birthday: '03.04.2001', hireDate: '10.01.2026', status: 'Активний', activeDealsCount: 0, activeClientsCount: 0 },
    { id: '19', name: 'Працівник П (Менеджер)', username: 'manager_p', role: 'Менеджер замовлень', phone: '+38 (067) 888-9900', email: 'worker.s@edelveis.vn.ua', birthday: '19.06.1997', hireDate: '01.03.2025', status: 'Активний', activeDealsCount: 9, activeClientsCount: 19 },
    { id: '20', name: 'Працівник Р (Цифровий друк)', username: 'digital_r', role: 'Оператор цифрового друку', phone: '+38 (050) 999-0011', email: 'worker.t@edelveis.vn.ua', birthday: '15.11.1990', hireDate: '12.09.2024', status: 'Активний', activeDealsCount: 2, activeClientsCount: 0 }
  ]);

  // Modal states for Security Kill-Switch & Reassignment
  const [selectedEmpForAction, setSelectedEmpForAction] = useState<Employee | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [targetRecipientId, setTargetRecipientId] = useState('6'); // Default Працівник Е
  const [blockReason, setBlockReason] = useState('Звільнення з посади');

  // Handle Block / Fire Employee
  const handleConfirmBlock = () => {
    if (!selectedEmpForAction) return;

    // 1. Mark in security kill-switch registry
    blockUser(selectedEmpForAction.username, blockReason);
    blockUser(selectedEmpForAction.name, blockReason);

    // 2. Update employee status in local state
    setEmployees(prev => prev.map(e => e.id === selectedEmpForAction.id ? { ...e, status: 'Заблоковано (Звільнений)' } : e));

    addSystemNotification(`⛔ Доступ співробітника ${selectedEmpForAction.name} миттєво заблоковано. Сесії розірвано.`);
    setShowBlockModal(false);

    // If employee has deals/clients, offer immediate transfer
    if (selectedEmpForAction.activeDealsCount > 0 || selectedEmpForAction.activeClientsCount > 0) {
      setShowReassignModal(true);
    }
  };

  // Handle Unblock Employee
  const handleUnblock = (emp: Employee) => {
    unblockUser(emp.username);
    unblockUser(emp.name);
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'Активний' } : e));
    addSystemNotification(`✅ Доступ співробітника ${emp.name} розблоковано.`);
  };

  // Handle Transfer Deals & Clients to Another Manager
  const handleConfirmReassign = () => {
    if (!selectedEmpForAction) return;
    const recipient = employees.find(e => e.id === targetRecipientId);
    const recipientName = recipient ? recipient.name : 'Новий відповідальний';

    // Transfer stats
    setEmployees(prev => prev.map(e => {
      if (e.id === selectedEmpForAction.id) {
        return { ...e, activeDealsCount: 0, activeClientsCount: 0 };
      }
      if (e.id === targetRecipientId) {
        return {
          ...e,
          activeDealsCount: e.activeDealsCount + selectedEmpForAction.activeDealsCount,
          activeClientsCount: e.activeClientsCount + selectedEmpForAction.activeClientsCount
        };
      }
      return e;
    }));

    addSystemNotification(`🔄 ${selectedEmpForAction.activeDealsCount} угод та ${selectedEmpForAction.activeClientsCount} клієнтів успішно передано менеджеру ${recipientName}.`);
    setShowReassignModal(false);
    setSelectedEmpForAction(null);
  };

  const filteredEmployees = employees.filter(emp => {
    const isBlocked = isUserBlocked(emp.username) || emp.status === 'Заблоковано (Звільнений)';
    const actualStatus = isBlocked ? 'Заблоковано (Звільнений)' : emp.status;

    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.phone.includes(search) || 
                          emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    const matchesStatus = filterStatus === 'all' || actualStatus === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (emp: Employee) => {
    const isBlocked = isUserBlocked(emp.username) || emp.status === 'Заблоковано (Звільнений)';
    if (isBlocked) {
      return (
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#b91c1c', backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Lock size={12} /> Заблоковано
        </span>
      );
    }
    switch (emp.status) {
      case 'Активний': return <span className="ios-badge ios-badge-green">Працює</span>;
      case 'Відпустка': return <span className="ios-badge ios-badge-yellow">Відпустка</span>;
      case 'Лікарняний': return <span className="ios-badge ios-badge-red">Лікарняний</span>;
      default: return <span className="ios-badge ios-badge-orange">Призупинено</span>;
    }
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)', height: '100%', overflowY: 'auto', padding: '24px 28px 48px 28px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '0.5px solid var(--border-light)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
              <ShieldCheck size={20} />
            </span>
            <div>
              <h1 className="page-title" style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--text-dark)' }}>
                Співробітники & Безпека доступу
              </h1>
              <p className="subtitle" style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-medium)' }}>
                Реєстр персоналу (20 співробітників), ролі доступу, миттєве блокування (Kill-Switch) та передача справ
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {currentUser?.role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#15803d', backgroundColor: '#dcfce7', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <ShieldCheck size={14} />
              <span>AES-256 Захист активний</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '10px 14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '250px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-medium)' }} size={14} />
          <input 
            placeholder="Шукати за ПІБ, телефоном..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', height: '30px', fontSize: '12px', border: '1px solid var(--border-light)', borderRadius: '6px', backgroundColor: 'var(--bg-system)', color: 'var(--text-dark)', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-medium)' }}>
          <Briefcase size={14} style={{ color: 'var(--text-medium)' }} />
          <span>Посада:</span>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '0 8px', backgroundColor: 'var(--bg-system)', color: 'var(--text-dark)' }}
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
            <option value="Технолог, оператор рулонної етикетки">Технолог, оператор рулонної етикетки</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-medium)' }}>
          <Filter size={14} style={{ color: 'var(--text-medium)' }} />
          <span>Статус:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '30px', fontSize: '12px', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '0 8px', backgroundColor: 'var(--bg-system)', color: 'var(--text-dark)' }}
          >
            <option value="all">Всі статуси</option>
            <option value="Активний">Працює</option>
            <option value="Відпустка">Відпустка</option>
            <option value="Лікарняний">Лікарняний</option>
            <option value="Заблоковано (Звільнений)">Заблоковані (Звільнені)</option>
          </select>
        </div>
      </div>

      {/* Grid of employees */}
      <div className="ios-table-container" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '14px', overflow: 'hidden' }}>
        <table className="ios-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '60px', color: 'var(--text-medium)' }}>ID</th>
              <th style={{ color: 'var(--text-medium)' }}>Співробітник</th>
              <th style={{ color: 'var(--text-medium)' }}>Посада</th>
              <th style={{ color: 'var(--text-medium)' }}>Контакти</th>
              <th style={{ color: 'var(--text-medium)' }}>Активні справи</th>
              <th style={{ width: '120px', color: 'var(--text-medium)' }}>Статус</th>
              <th style={{ width: '160px', textAlign: 'right', color: 'var(--text-medium)' }}>Безпека & Доступ</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => {
              const isBlocked = isUserBlocked(emp.username) || emp.status === 'Заблоковано (Звільнений)';
              return (
                <tr 
                  key={emp.id} 
                  style={{ 
                    backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.04)' : emp.id === '1' ? 'rgba(0, 122, 255, 0.04)' : 'transparent', 
                    borderBottom: '1px solid var(--border-light)',
                    opacity: isBlocked ? 0.75 : 1
                  }}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-dark)' }}>{emp.id}</td>
                  <td>
                    <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{emp.name}</div>
                    <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: 'var(--text-medium)' }}>@{emp.username}</span>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '12px' }}>{emp.role}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dark)', fontSize: '11.5px' }}>
                      <Phone size={11} style={{ color: 'var(--text-medium)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{emp.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: 'var(--text-medium)', fontSize: '11px' }}>
                      <Mail size={11} style={{ color: 'var(--text-medium)' }} />
                      <span>{emp.email}</span>
                    </div>
                  </td>
                  <td>
                    {(emp.activeDealsCount > 0 || emp.activeClientsCount > 0) ? (
                      <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: '700', color: '#0284c7' }}>{emp.activeDealsCount} угод</span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-medium)' }}>{emp.activeClientsCount} клієнтів</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-medium)' }}>Немає</span>
                    )}
                  </td>
                  <td>{getStatusBadge(emp)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {emp.id !== '1' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {isBlocked ? (
                          <button
                            type="button"
                            onClick={() => handleUnblock(emp)}
                            className="ios-btn ios-btn-secondary ios-btn-small"
                            style={{ fontSize: '11px', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a' }}
                            title="Розблокувати доступ до CRM"
                          >
                            <Unlock size={12} />
                            <span>Розблокувати</span>
                          </button>
                        ) : (
                          <>
                            {(emp.activeDealsCount > 0 || emp.activeClientsCount > 0) && (
                              <button
                                type="button"
                                onClick={() => { setSelectedEmpForAction(emp); setShowReassignModal(true); }}
                                className="ios-btn ios-btn-secondary ios-btn-small"
                                style={{ fontSize: '11px', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Передати справи іншому менеджеру"
                              >
                                <ArrowRightLeft size={12} />
                                <span>Передати</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => { setSelectedEmpForAction(emp); setShowBlockModal(true); }}
                              className="ios-btn ios-btn-small"
                              style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Заблокувати доступ (Звільнення)"
                            >
                              <UserX size={12} />
                              <span>Звільнити</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: BLOCK / FIRE EMPLOYEE CONFIRMATION */}
      {showBlockModal && selectedEmpForAction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', marginBottom: '12px' }}>
              <ShieldAlert size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>
                Блокування доступу співробітника
              </h3>
            </div>

            <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5', margin: '0 0 14px 0' }}>
              Ви збираєтеся заблокувати доступ для <strong>{selectedEmpForAction.name}</strong> (@{selectedEmpForAction.username}).
            </p>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '14px', fontSize: '11.5px', color: '#991b1b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>• Усі активні сесії співробітника будуть <strong>миттєво розірвані</strong> (Force Logout).</div>
              <div>• Повторний вхід за старим логіном та паролем буде <strong>заборонений</strong>.</div>
              <div>• Бот @edelveis_i_k_bot припинить надсилати робочі сповіщення.</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="ios-label">Причина блокування:</label>
              <select className="ios-input" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} style={{ width: '100%', height: '36px' }}>
                <option value="Звільнення з посади">Звільнення з посади</option>
                <option value="Тимчасове призупинення">Тимчасове призупинення</option>
                <option value="Підозра у компрометації облікового запису">Підозра у компрометації облікового запису</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowBlockModal(false)} className="ios-btn ios-btn-secondary">
                Скасувати
              </button>
              <button 
                type="button" 
                onClick={handleConfirmBlock}
                className="ios-btn"
                style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: '800' }}
              >
                Підтвердити блокування
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REASSIGN DEALS & CLIENTS */}
      {showReassignModal && selectedEmpForAction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0284c7', marginBottom: '12px' }}>
              <ArrowRightLeft size={24} />
              <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>
                Передача замовлень та клієнтів
              </h3>
            </div>

            <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5', margin: '0 0 14px 0' }}>
              У співробітника <strong>{selectedEmpForAction.name}</strong> залишилося:
              <br />
              <strong style={{ color: '#0284c7' }}>{selectedEmpForAction.activeDealsCount} активних угод</strong> та <strong style={{ color: '#0284c7' }}>{selectedEmpForAction.activeClientsCount} закріплених клієнтів</strong>.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="ios-label">Оберіть менеджера-наступника:</label>
              <select className="ios-input" value={targetRecipientId} onChange={(e) => setTargetRecipientId(e.target.value)} style={{ width: '100%', height: '36px' }}>
                {employees.filter(e => e.id !== selectedEmpForAction.id && e.status === 'Активний').map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowReassignModal(false)} className="ios-btn ios-btn-secondary">
                Пропустити
              </button>
              <button 
                type="button" 
                onClick={handleConfirmReassign}
                className="ios-btn ios-btn-primary"
                style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', fontWeight: '800' }}
              >
                Передати справи
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
