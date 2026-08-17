import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  MapPin, 
  Users as UsersIcon, 
  DollarSign, 
  Trash,
  Copy,
  Settings as SettingsIcon,
  HelpCircle,
  Clock,
  Shuffle,
  Truck,
  Globe,
  ShoppingBag
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  branch: string;
}

interface Currency {
  code: string;
  symbol: string;
  rate: number;
  isBase: boolean;
}

export const Settings: React.FC = () => {
  const { 
    customFields, 
    addCustomField, 
    deleteCustomField,
    transitionMatrix,
    updateTransitionMatrix,
    stageDurations,
    updateStageDurations,
    novaPoshtaAccounts,
    addNovaPoshtaAccount,
    deleteNovaPoshtaAccount,
    npVolumeCalcEnabled,
    setNpVolumeCalcEnabled
  } = useApp();

  const [branches] = useState<Branch[]>([
    { id: 'B-1', name: 'Головний офіс / Виробництво', address: 'вул. Поліграфічна, 12, Вінниця', phone: '+380432669868' }
  ]);

  const [members] = useState<TeamMember[]>(
    [
      { id: '1', name: 'Працівник А (Директор)', email: 'worker.a@example.com', role: 'admin', branch: 'Головний офіс' },
      { id: '2', name: 'Працівник Е (Старший менеджер)', email: 'worker.f@example.com', role: 'manager', branch: 'Головний офіс' },
      { id: '3', name: 'Працівник Д (Друкар-оператор)', email: 'worker.e@example.com', role: 'operator', branch: 'Головний офіс' }
    ]
  );

  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'UAH', symbol: '₴', rate: 1.00, isBase: true },
    { code: 'USD', symbol: '$', rate: 41.20, isBase: false },
    { code: 'EUR', symbol: '€', rate: 44.80, isBase: false }
  ]);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'branches' | 'users' | 'currencies' | 'customfields' | 'matrix_sla' | 'nova_poshta' | 'rozetka' | 'ukr_poshta'>('profile');

  // Company Profile state - default to ТОВ Едельвейс і К
  const [companyName, setCompanyName] = useState('ТОВ Едельвейс і К');
  const [companyEdrpou, setCompanyEdrpou] = useState('44123456');
  const [companyPhone, setCompanyPhone] = useState('+380432999999');

  // Nova Poshta / Rozetka / UkrPoshta state
  const [newNpAccountName, setNewNpAccountName] = useState('');
  const [rozetkaXmlUrl, setRozetkaXmlUrl] = useState('https://edelweiss.vn.ua/exports/rozetka_feed.xml');
  const [rozetkaAutoSync, setRozetkaAutoSync] = useState(true);
  const [ukrPoshtaAccounts, setUkrPoshtaAccounts] = useState<string[]>(['УкрПошта Головне відділення (Вінниця)']);
  const [newUpAccount, setNewUpAccount] = useState('');



  const copyPermissions = (fromMemberName: string) => {
    alert(`Права доступу користувача "${fromMemberName}" успішно скопійовані!`);
  };

  const stagesList = [
    { key: 'design', label: 'Черга макетування' },
    { key: 'print_queue', label: 'Черга друку' },
    { key: 'printing', label: 'У друці' },
    { key: 'post_press', label: 'Післядрукарська обробка' },
    { key: 'ready', label: 'Готово до видачі' }
  ];

  const handleToggleTransition = (fromStage: string, toStage: string) => {
    const currentAllowed = transitionMatrix[fromStage] || [];
    let updated;
    if (currentAllowed.includes(toStage)) {
      updated = currentAllowed.filter(s => s !== toStage);
    } else {
      updated = [...currentAllowed, toStage];
    }
    updateTransitionMatrix({
      ...transitionMatrix,
      [fromStage]: updated
    });
  };

  const handleDurationChange = (stageKey: string, val: number) => {
    updateStageDurations({
      ...stageDurations,
      [stageKey]: val
    });
  };

  const handleAddNpAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNpAccountName.trim()) return;
    addNovaPoshtaAccount(newNpAccountName);
    setNewNpAccountName('');
    alert('Акаунт Нової Пошти підключено успішно!');
  };

  const handleAddUpAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpAccount.trim()) return;
    setUkrPoshtaAccounts([...ukrPoshtaAccounts, newUpAccount]);
    setNewUpAccount('');
    alert('Акаунт УкрПошти підключено успішно!');
  };

  return (
    <div className="main-content" style={{ backgroundColor: 'var(--bg-system)' }}>
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Налаштування системи</h1>
          <p className="subtitle">Керування профілем друкарні, користувачами, філіями та інтеграціями маркетплейсів</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'profile' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'profile' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Building2 size={14} />
            Профіль компанії
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('branches')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'branches' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'branches' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <MapPin size={14} />
            Філії та склади
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'users' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'users' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <UsersIcon size={14} />
            Працівники та права
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('currencies')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'currencies' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'currencies' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <DollarSign size={14} />
            Валюти і курси
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('customfields')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'customfields' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'customfields' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <SettingsIcon size={14} />
            Користувацькі поля (Формули)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matrix_sla')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'matrix_sla' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'matrix_sla' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Shuffle size={14} />
            Матриця та SLA етапів
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('nova_poshta')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'nova_poshta' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'nova_poshta' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Truck size={14} />
            Акаунти Нової Пошти
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('rozetka')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'rozetka' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'rozetka' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <ShoppingBag size={14} />
            Інтеграція Rozetka
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ukr_poshta')}
            className="ios-btn"
            style={{
              width: '100%',
              textAlign: 'left',
              justifyContent: 'flex-start',
              backgroundColor: activeSubTab === 'ukr_poshta' ? 'var(--primary)' : 'rgba(120, 120, 128, 0.08)',
              color: activeSubTab === 'ukr_poshta' ? '#ffffff' : 'var(--text-dark)'
            }}
          >
            <Globe size={14} />
            Інтеграція УкрПошта
          </button>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3 ios-card bg-white min-h-[400px]">
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Загальні відомості</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="ios-input-group">
                  <label className="ios-label">Юридична назва</label>
                  <input 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">ЄДРПОУ / ІПН</label>
                  <input 
                    value={companyEdrpou}
                    onChange={(e) => setCompanyEdrpou(e.target.value)}
                  />
                </div>
                <div className="ios-input-group">
                  <label className="ios-label">Контактний телефон</label>
                  <input 
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => alert('Налаштування профілю збережено.')}
                  className="ios-btn ios-btn-primary"
                >
                  Зберегти зміни
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (window.confirm('Ви впевнені, що хочете очистити базу даних та скинути всі збережені дані до початкових тестових значень?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="ios-btn ios-btn-secondary"
                  style={{ color: 'var(--danger)', borderColor: 'rgba(255,59,48,0.2)' }}
                >
                  Скинути демо-дані
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'branches' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">Філії та Складські Локації</h2>
              </div>

              <div className="space-y-4">
                {branches.map(branch => (
                  <div key={branch.id} className="border border-slate-150 p-4 rounded-lg flex justify-between items-center bg-[#f9f9f9]" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px' }}>{branch.name}</h4>
                      <p style={{ fontSize: '11px', color: '#636366', marginTop: '2px' }}>{branch.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Команда друкарні</h2>
              
              <div className="space-y-4">
                {members.map(member => (
                  <div key={member.id} className="border border-slate-150 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#f9f9f9]" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px' }}>{member.name}</h4>
                      <p style={{ fontSize: '11px', color: '#636366', fontFamily: 'var(--font-mono)' }}>{member.email}</p>
                      <span className="ios-badge ios-badge-blue mt-2">
                        {member.role === 'admin' ? 'Адміністратор' : member.role === 'manager' ? 'Менеджер' : 'Оператор цеху'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => copyPermissions(member.name)}
                        className="ios-btn ios-btn-secondary ios-btn-small"
                      >
                        <Copy size={12} />
                        Копіювати права
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'currencies' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Валютні налаштування</h2>
              
              <div className="space-y-3">
                {currencies.map(cur => (
                  <div key={cur.code} className="border border-slate-150 p-3 rounded-lg flex justify-between items-center bg-[#f9f9f9] text-xs" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <span className="font-bold text-slate-800" style={{ fontSize: '13px' }}>{cur.code} ({cur.symbol})</span>
                      {cur.isBase && (
                        <span className="ios-badge ios-badge-green ml-2">Базова</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Курс:</span>
                      <input 
                        type="number"
                        disabled={cur.isBase}
                        value={cur.rate}
                        onChange={(e) => setCurrencies(currencies.map(c => c.code === cur.code ? { ...c, rate: Number(e.target.value) } : c))}
                        style={{ width: '80px', textAlign: 'center', height: '28px', padding: '2px 4px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'customfields' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Користувацькі поля (Формули)</h2>
              
              <div className="space-y-4">
                {customFields.map(cf => (
                  <div key={cf.id} className="border border-slate-150 p-4 rounded-lg flex justify-between items-center bg-[#f9f9f9]" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px' }}>{cf.name}</h4>
                      <span className="ios-badge ios-badge-purple mt-1 inline-block">
                        Тип: {cf.type === 'formula' ? `Формула (${cf.formulaExpression})` : cf.type === 'number' ? 'Число' : 'Текст'}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => deleteCustomField(cf.id)}
                      className="text-red-500 hover:text-red-655 p-1.5 rounded hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Field Form */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Створити нове поле</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="ios-input-group">
                    <label className="ios-label">Назва поля</label>
                    <input 
                      id="cf-new-name"
                      placeholder="напр. Площа виробу"
                    />
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Тип поля</label>
                    <select id="cf-new-type" onChange={(e) => {
                      const formulaEl = document.getElementById('cf-formula-group');
                      if (formulaEl) {
                        formulaEl.style.display = e.target.value === 'formula' ? 'block' : 'none';
                      }
                    }}>
                      <option value="number">Число</option>
                      <option value="text">Текст</option>
                      <option value="formula">Формула (Математичний вираз)</option>
                    </select>
                  </div>
                  
                  <div className="ios-input-group" id="cf-formula-group" style={{ display: 'none' }}>
                    <label className="ios-label">Формула виразу (напр. {"{Ширина} * {Висота}"})</label>
                    <input 
                      id="cf-new-formula"
                      placeholder="{Ширина} * {Висота} * 0.05"
                    />
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px', color: '#8e8e93', fontSize: '10px' }}>
                      <HelpCircle size={12} />
                      <span>
                        Використовуйте назви існуючих числових полів у фігурних дужках. Приклад: <code>{"{Ширина} * {Висота}"}</code>.
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('cf-new-name') as HTMLInputElement;
                      const typeSelect = document.getElementById('cf-new-type') as HTMLSelectElement;
                      const formulaInput = document.getElementById('cf-new-formula') as HTMLInputElement;
                      if (!nameInput?.value) return;
                      addCustomField({
                        name: nameInput.value,
                        type: typeSelect.value as any,
                        formulaExpression: typeSelect.value === 'formula' ? formulaInput.value : undefined
                      });
                      nameInput.value = '';
                      formulaInput.value = '';
                      alert('Користувацьке поле успішно додано!');
                    }}
                    className="ios-btn ios-btn-primary"
                    style={{ width: 'fit-content', marginTop: '6px' }}
                  >
                    Додати поле
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'matrix_sla' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Матриця переходів та SLA ліміти</h2>
              
              {/* Transition Matrix Grid builder */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Shuffle size={14} style={{ color: 'var(--primary)' }} />
                  Матриця дозволених переходів статусів замовлень
                </h3>
                <p style={{ fontSize: '11px', color: '#8e8e93' }}>
                  Поставте прапорці, щоб дозволити перехід з поточного етапу (рядок) на наступний (стовпчик).
                </p>

                <div className="ios-table-container">
                  <table className="ios-table" style={{ fontSize: '11px' }}>
                    <thead>
                      <tr>
                        <th>З етапу / На етап</th>
                        {stagesList.map(st => <th key={st.key}>{st.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {stagesList.map(fromSt => (
                        <tr key={fromSt.key}>
                          <td style={{ fontWeight: '700' }}>{fromSt.label}</td>
                          {stagesList.map(toSt => {
                            const isAllowed = (transitionMatrix[fromSt.key] || []).includes(toSt.key);
                            const isSame = fromSt.key === toSt.key;
                            return (
                              <td key={toSt.key} style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox"
                                  disabled={isSame}
                                  checked={isAllowed}
                                  onChange={() => handleToggleTransition(fromSt.key, toSt.key)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SLA limits list builder */}
              <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={14} style={{ color: 'var(--primary)' }} />
                  Контроль термінів перебування (SLA)
                </h3>
                <p style={{ fontSize: '11px', color: '#8e8e93' }}>
                  Встановіть ліміт часу в годинах для кожного з виробничих етапів. Угоди, що перебувають на етапі довше ліміту, будуть позначені червоним кольором.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', alignItems: 'center' }}>
                  {stagesList.map(st => (
                    <React.Fragment key={st.key}>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>{st.label}:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input 
                          type="number"
                          value={stageDurations[st.key] || 0}
                          onChange={(e) => handleDurationChange(st.key, Number(e.target.value))}
                          style={{ height: '28px', padding: '2px 6px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '11px', color: '#8e8e93' }}>год</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'nova_poshta' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">Підключені акаунти Нової Пошти</h2>
                <p style={{ fontSize: '11px', color: '#636366', marginTop: '4px' }}>
                  Інтеграція з Новою Поштою дозволяє автоматично генерувати ТТН (товарно-транспортні накладні), розраховувати вартість доставки та відслідковувати статус посилок безпосередньо з системи.
                </p>
              </div>
              
              <div className="space-y-3">
                {novaPoshtaAccounts.map(acc => (
                  <div key={acc} className="border border-slate-150 p-3 rounded-lg flex justify-between items-center bg-[#f9f9f9] text-xs" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <span className="font-bold text-slate-850" style={{ fontSize: '13px' }}>{acc}</span>
                    <button 
                      type="button"
                      onClick={() => deleteNovaPoshtaAccount(acc)}
                      className="text-red-500 hover:text-red-655 p-1.5 rounded hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Volume Weight Calculator Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'rgba(0,122,255,0.05)', borderRadius: '8px', border: '1px solid rgba(0,122,255,0.1)', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '750', color: 'var(--text-dark)' }}>
                  <input 
                    type="checkbox" 
                    checked={npVolumeCalcEnabled} 
                    onChange={(e) => setNpVolumeCalcEnabled(e.target.checked)} 
                  />
                  Включити калькулятор об'єму за габаритами (Висота х Ширина х Довжина коробки)
                </label>
              </div>

              {/* Add NP Account Form */}
              <form onSubmit={handleAddNpAccount} className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Підключити додатковий акаунт</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div className="ios-input-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                    <label className="ios-label">Назва акаунту (напр. ФОП Петренко)</label>
                    <input 
                      required
                      placeholder="Введіть назву або API токен..."
                      value={newNpAccountName}
                      onChange={(e) => setNewNpAccountName(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="ios-btn ios-btn-primary"
                    style={{ height: '36px' }}
                  >
                    Підключити
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'rozetka' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">Інтеграція з маркетплейсом Rozetka</h2>
                <p style={{ fontSize: '11px', color: '#636366', marginTop: '4px' }}>
                  Синхронізація товарів, цін, статусів залишків на складі та автоматичний імпорт нових замовлень безпосередньо у воронку CRM ТОВ Едельвейс.
                </p>
              </div>
              
              <div style={{ backgroundColor: 'rgba(0,122,255,0.05)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(0,122,255,0.1)' }}>
                <span className="text-xs font-bold text-slate-800 block mb-1">Генератор XML прайс-листа</span>
                <p style={{ fontSize: '11px', color: '#636366', marginBottom: '8px' }}>
                  Використовуйте це посилання для автоматичного імпорту товарів та залишків складу на Rozetka.
                </p>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input readOnly value={rozetkaXmlUrl} style={{ fontSize: '11px', height: '28px', backgroundColor: '#ffffff' }} />
                  <button 
                    type="button" 
                    onClick={() => { navigator.clipboard.writeText(rozetkaXmlUrl); alert('Посилання скопійовано!'); }} 
                    className="ios-btn ios-btn-secondary ios-btn-small"
                  >
                    Копіювати
                  </button>
                </div>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Адреса XML посилання на сайті</label>
                <input value={rozetkaXmlUrl} onChange={(e) => setRozetkaXmlUrl(e.target.value)} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  <input type="checkbox" checked={rozetkaAutoSync} onChange={(e) => setRozetkaAutoSync(e.target.checked)} />
                  Автоматична синхронізація замовлень та чатів (кожні 10 хв)
                </label>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <span className="text-xs font-bold text-slate-800 block mb-2">Статус листувань та ТТН</span>
                <p style={{ fontSize: '11px', color: '#636366' }}>
                  Синхронізовано чатів: <strong>14 активних діалогів</strong>. Нові замовлення автоматично надходять у розділ *"Угоди"*.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'ukr_poshta' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-800">Інтеграція з УкрПошта</h2>
                <p style={{ fontSize: '11px', color: '#636366', marginTop: '4px' }}>
                  Генерація супровідних ярликів та ТТН для доставки поштових відправлень по Україні (Експрес/Стандарт) та за кордон через API УкрПошти.
                </p>
              </div>
              
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Підключені кабінети УкрПошти</span>
                {ukrPoshtaAccounts.map(acc => (
                  <div key={acc} className="border border-slate-150 p-3 rounded-lg flex justify-between items-center bg-[#f9f9f9] text-xs">
                    <span className="font-bold text-slate-850" style={{ fontSize: '12px' }}>{acc}</span>
                    <button 
                      type="button"
                      onClick={() => setUkrPoshtaAccounts(ukrPoshtaAccounts.filter(a => a !== acc))}
                      className="text-red-500 hover:text-red-655 p-1.5 rounded hover:bg-slate-100 border-none bg-transparent cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddUpAccount} className="border-t border-slate-100 pt-6 mt-6">
                <span className="text-xs font-bold text-slate-800 block mb-2">Додати кабінет УкрПошти</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div className="ios-input-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                    <label className="ios-label">Назва акаунту (напр. ТОВ Едельвейс Міжнародний)</label>
                    <input 
                      required
                      placeholder="Введіть назву кабінету..."
                      value={newUpAccount}
                      onChange={(e) => setNewUpAccount(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="ios-btn ios-btn-primary" style={{ height: '36px' }}>Підключити</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
