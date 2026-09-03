import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, 
  ArrowRight, 
  Building2, 
  ShoppingBag, 
  Send 
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const [activePortalTab, setActivePortalTab] = useState<'client' | 'staff'>('client');
  
  // Client mode state: 'buyer' vs 'business'
  const [clientType, setClientType] = useState<'buyer' | 'business'>('buyer');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [edrpou, setEdrpou] = useState('');

  // Staff mode state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState<'manager' | 'operator'>('manager');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Client Fast Login / Registration
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (clientType === 'buyer') {
      if (!clientName.trim() || !clientPhone.trim()) {
        setError("Будь ласка, вкажіть ваше ім'я та контактний номер телефону");
        return;
      }
    } else {
      if (!companyName.trim() || !clientPhone.trim()) {
        setError("Будь ласка, вкажіть назву компанії/ФОП та контактний номер телефону");
        return;
      }
    }

    // Save client info to localStorage session
    const clientUser = {
      id: `client_${Date.now()}`,
      name: clientType === 'buyer' ? clientName : companyName,
      contactPerson: clientName || companyName,
      phone: clientPhone,
      edrpou: clientType === 'business' ? edrpou : '',
      clientType: clientType,
      role: 'client'
    };
    localStorage.setItem('crm_client_profile', JSON.stringify(clientUser));
    
    // Perform login with client role
    login('client', 'client');
  };

  // Handle Staff Login
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!username || !password) {
      setError('Будь ласка, заповніть усі поля');
      return;
    }

    if (isRegisterMode) {
      if (!staffName) {
        setError("Будь ласка, введіть ім'я співробітника");
        return;
      }
      
      const savedUsers = localStorage.getItem('crm_registered_users');
      const registered = savedUsers ? JSON.parse(savedUsers) : [];
      
      if (registered.some((u: any) => u.username === username.toLowerCase())) {
        setError('Користувач з таким логіном вже існує');
        return;
      }

      const newUser = {
        id: `U-${Date.now()}`,
        username: username.toLowerCase(),
        name: staffName,
        role
      };
      
      localStorage.setItem('crm_registered_users', JSON.stringify([...registered, newUser]));
      setSuccessMsg('Співробітника зареєстровано! Тепер ви можете увійти.');
      setIsRegisterMode(false);
      setPassword('');
    } else {
      const savedUsers = localStorage.getItem('crm_registered_users');
      const registered = savedUsers ? JSON.parse(savedUsers) : [];
      const foundLocal = registered.find((u: any) => u.username === username.toLowerCase() && password === username);
      
      if (foundLocal) {
        login(username, username);
        return;
      }

      const success = login(username, password);
      if (!success) {
        setError('Невірний логін або пароль. Спробуйте ще раз');
      }
    }
  };

  const handleQuickSelect = (uname: string) => {
    setUsername(uname);
    setPassword(uname);
    login(uname, uname);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-system)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        padding: '32px 28px',
        boxShadow: 'var(--shadow-hover)',
        border: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-dark)',
        borderRadius: '18px'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--primary)',
            marginBottom: '12px',
            border: '1px solid var(--border-light)'
          }}>
            <Printer size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-dark)', margin: 0 }}>
            Поліграфія «Едельвейс і К»
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-medium)', marginTop: '4px', fontWeight: '500' }}>
            Онлайн-калькулятор цін, замовлення та CRM-система
          </p>
        </div>

        {/* Portal Mode Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--bg-system)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid var(--border-light)'
        }}>
          <button
            type="button"
            onClick={() => { setActivePortalTab('client'); setError(''); }}
            style={{
              padding: '8px 12px',
              fontSize: '12.5px',
              fontWeight: '800',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activePortalTab === 'client' ? '#007aff' : 'transparent',
              color: activePortalTab === 'client' ? '#ffffff' : 'var(--text-dark)',
              boxShadow: activePortalTab === 'client' ? '0 2px 8px rgba(0,122,255,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Кабінет клієнта
          </button>
          <button
            type="button"
            onClick={() => { setActivePortalTab('staff'); setError(''); }}
            style={{
              padding: '8px 12px',
              fontSize: '12.5px',
              fontWeight: '800',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activePortalTab === 'staff' ? '#007aff' : 'transparent',
              color: activePortalTab === 'staff' ? '#ffffff' : 'var(--text-dark)',
              boxShadow: activePortalTab === 'staff' ? '0 2px 8px rgba(0,122,255,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Вхід для персоналу
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            color: 'var(--danger)',
            marginBottom: '16px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            color: 'var(--accent)',
            marginBottom: '16px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        {/* 1. CLIENT PORTAL FORM (BUYER VS BUSINESS) */}
        {activePortalTab === 'client' && (
          <form onSubmit={handleClientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Simple Buyer vs Business Choice */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-medium)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Оберіть статус замовника:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setClientType('buyer')}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    border: clientType === 'buyer' ? '2px solid #007aff' : '1px solid var(--border-light)',
                    backgroundColor: clientType === 'buyer' ? '#eff6ff' : 'var(--bg-system)',
                    color: clientType === 'buyer' ? '#007aff' : 'var(--text-dark)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ShoppingBag size={20} />
                  <strong style={{ fontSize: '13px' }}>Покупець</strong>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-medium)' }}>Фізична особа</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClientType('business')}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    border: clientType === 'business' ? '2px solid #007aff' : '1px solid var(--border-light)',
                    backgroundColor: clientType === 'business' ? '#eff6ff' : 'var(--bg-system)',
                    color: clientType === 'business' ? '#007aff' : 'var(--text-dark)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Building2 size={20} />
                  <strong style={{ fontSize: '13px' }}>Бізнес</strong>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-medium)' }}>ФОП / ТОВ / Компанія</span>
                </button>
              </div>
            </div>

            {/* Dynamic Inputs Based on Choice */}
            {clientType === 'buyer' ? (
              <>
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Ваше ім'я</label>
                  <input
                    type="text"
                    required
                    placeholder="Наприклад: Олена або Михайло"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Номер телефону</label>
                  <input
                    type="tel"
                    required
                    placeholder="+38 (0__) ___-__-__"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Назва компанії або ФОП</label>
                  <input
                    type="text"
                    required
                    placeholder="ТОВ «ФармаТрейд» або ФОП Шевченко"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div className="ios-input-group" style={{ marginBottom: 0 }}>
                  <label className="ios-label">Контактна особа</label>
                  <input
                    type="text"
                    placeholder="Ім'я менеджера / замовника"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    style={{ width: '100%', height: '38px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">Телефон</label>
                    <input
                      type="tel"
                      required
                      placeholder="+380..."
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>

                  <div className="ios-input-group" style={{ marginBottom: 0 }}>
                    <label className="ios-label">ЄДРПОУ / ІПН</label>
                    <input
                      type="text"
                      placeholder="8 або 10 цифр"
                      value={edrpou}
                      onChange={(e) => setEdrpou(e.target.value)}
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="ios-btn ios-btn-primary"
              style={{
                height: '42px',
                fontSize: '14px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#007aff',
                marginTop: '6px',
                borderRadius: '10px'
              }}
            >
              <span>{clientType === 'buyer' ? 'Розрахувати замовлення' : 'Увійти в кабінет бізнесу'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Telegram Bot Link Button */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', textAlign: 'center' }}>
              <a
                href="https://t.me/edelveis_polygraphy_bot"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#0284c7',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd'
                }}
              >
                <Send size={14} />
                <span>Увійти через Telegram-бота @edelveis_polygraphy_bot</span>
              </a>
            </div>
          </form>
        )}

        {/* 2. STAFF LOGIN FORM */}
        {activePortalTab === 'staff' && (
          <form onSubmit={handleStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegisterMode && (
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Ім'я співробітника</label>
                <input
                  type="text"
                  placeholder="Олександр Менеджер"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  style={{ width: '100%', height: '38px' }}
                />
              </div>
            )}

            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label">Логін</label>
              <input
                type="text"
                placeholder="admin / manager / operator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>

            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label">Пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
            </div>

            {isRegisterMode && (
              <div className="ios-input-group" style={{ marginBottom: 0 }}>
                <label className="ios-label">Роль</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value="manager">Менеджер замовлень</option>
                  <option value="operator">Друкар / Оператор цеху</option>
                </select>
              </div>
            )}

            <button 
              type="submit" 
              className="ios-btn ios-btn-primary"
              style={{
                height: '42px',
                fontSize: '14px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: '#007aff',
                marginTop: '6px',
                borderRadius: '10px'
              }}
            >
              <span>{isRegisterMode ? 'Зареєструвати' : 'Увійти в CRM'}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px', fontSize: '12px' }}>
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                style={{ background: 'transparent', border: 'none', color: '#007aff', fontWeight: '600', cursor: 'pointer' }}
              >
                {isRegisterMode ? 'Вже маєте акаунт? Увійти' : 'Створити акаунт співробітника'}
              </button>
            </div>

            {/* Quick staff select */}
            {!isRegisterMode && (
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <p style={{ fontSize: '10.5px', color: 'var(--text-medium)', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>
                  Швидкий вхід (Демо):
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={() => handleQuickSelect('admin')}
                    className="ios-btn ios-btn-secondary ios-btn-small"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Адмін
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickSelect('manager')}
                    className="ios-btn ios-btn-secondary ios-btn-small"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Менеджер
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickSelect('operator')}
                    className="ios-btn ios-btn-secondary ios-btn-small"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Друкар
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
};
