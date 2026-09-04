import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, 
  ArrowRight, 
  Send,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const [activePortalTab, setActivePortalTab] = useState<'client' | 'staff'>('client');
  
  // Staff mode state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState<'manager' | 'operator'>('manager');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fast direct client access
  const handleDirectClientAccess = () => {
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
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
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

        {/* 1. CLIENT PORTAL - TELEGRAM BOT ONLY LOGIN */}
        {activePortalTab === 'client' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Telegram Card */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1.5px solid #bae6fd',
              borderRadius: '14px',
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2,132,199,0.3)'
              }}>
                <Send size={22} style={{ marginLeft: '-2px' }} />
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#0369a1', margin: '0 0 4px 0' }}>
                  Вхід через Telegram-бота
                </h3>
                <p style={{ fontSize: '11.5px', color: '#475569', margin: 0, lineHeight: '1.45' }}>
                  Авторизація для покупців та бізнес-партнерів здійснюється через наш офіційний бот друкарні
                </p>
              </div>

              {/* Benefits */}
              <div style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1px solid #e0f2fe',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155' }}>
                  <CheckCircle2 size={13} style={{ color: '#0284c7', flexShrink: 0 }} />
                  <span>Миттєва реєстрація без логінів та паролів</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155' }}>
                  <CheckCircle2 size={13} style={{ color: '#0284c7', flexShrink: 0 }} />
                  <span>Вибір статусу: <strong>Покупець</strong> або <strong>Бізнес (ФОП/ТОВ)</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#334155' }}>
                  <CheckCircle2 size={13} style={{ color: '#0284c7', flexShrink: 0 }} />
                  <span>Авто-сповіщення про готовність друку та ТТН</span>
                </div>
              </div>

              {/* Main CTA: Open Telegram Bot */}
              <a
                href="https://t.me/edelveis_polygraphy_bot"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(2,132,199,0.25)',
                  marginTop: '4px'
                }}
              >
                <Send size={16} />
                <span>Увійти через @edelveis_polygraphy_bot</span>
              </a>
            </div>

            {/* Quick Online Calculator Direct Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleDirectClientAccess}
                className="ios-btn ios-btn-secondary"
                style={{
                  width: '100%',
                  height: '38px',
                  fontSize: '12.5px',
                  fontWeight: '750',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-system)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <Zap size={14} style={{ color: '#007aff' }} />
                <span>Розрахувати ціни онлайн (Без авторизації)</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        )}

        {/* 2. STAFF LOGIN FORM */}
        {activePortalTab === 'staff' && (
          <form onSubmit={handleStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: 'var(--danger)',
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
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {successMsg}
              </div>
            )}

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
