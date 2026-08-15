import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, User as UserIcon, Printer, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'manager' | 'operator'>('manager');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!username || !password) {
      setError('Будь ласка, заповніть усі поля');
      return;
    }

    if (isRegisterMode) {
      if (!name) {
        setError("Будь ласка, введіть ім'я");
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
        name,
        role
      };
      
      localStorage.setItem('crm_registered_users', JSON.stringify([...registered, newUser]));
      setSuccessMsg('Реєстрація успішна! Тепер ви можете увійти.');
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
        setError('Невірний логін або пароль. Спробуйте ще раз (пароль такий самий, як логін)');
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
      backgroundColor: '#f2f2f7', // Default iOS light background
      background: 'radial-gradient(circle at top right, #e5e5ea 0%, #f2f2f7 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '36px 30px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)', // Light glassmorphic
        color: '#1c1c1e',
        borderRadius: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            color: '#007aff', // iOS Blue
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <Printer size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.6px', color: '#1c1c1e' }}>ТОВ Едельвейс і К</h2>
          <p style={{ fontSize: '13px', color: '#8e8e93', marginTop: '3px', fontWeight: '500' }}>
            {isRegisterMode ? 'Створення облікового запису' : 'Вхід у систему керування CRM'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ff3b3014',
            border: '1px solid #ff3b3030',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '12px',
            color: '#ff3b30',
            marginBottom: '20px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: '#34c75914',
            border: '1px solid #34c75930',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '12px',
            color: '#34c759',
            marginBottom: '20px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegisterMode && (
            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label" style={{ color: '#3a3a3c', fontWeight: '600' }}>Повне ім'я</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '13px', color: '#8e8e93' }}>
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Петро Поліграф"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '42px', backgroundColor: '#ffffff', color: '#1c1c1e', border: '1px solid rgba(0, 0, 0, 0.1)' }}
                />
              </div>
            </div>
          )}

          <div className="ios-input-group" style={{ marginBottom: 0 }}>
            <label className="ios-label" style={{ color: '#3a3a3c', fontWeight: '600' }}>Логін</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '13px', color: '#8e8e93' }}>
                <UserIcon size={18} />
              </span>
              <input
                type="text"
                placeholder="Введіть логін"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '42px', backgroundColor: '#ffffff', color: '#1c1c1e', border: '1px solid rgba(0, 0, 0, 0.1)' }}
              />
            </div>
          </div>

          <div className="ios-input-group" style={{ marginBottom: 0 }}>
            <label className="ios-label" style={{ color: '#3a3a3c', fontWeight: '600' }}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '13px', color: '#8e8e93' }}>
                <KeyRound size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px', backgroundColor: '#ffffff', color: '#1c1c1e', border: '1px solid rgba(0, 0, 0, 0.1)' }}
              />
            </div>
          </div>

          {isRegisterMode && (
            <div className="ios-input-group" style={{ marginBottom: 0 }}>
              <label className="ios-label" style={{ color: '#3a3a3c', fontWeight: '600' }}>Роль працівника</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                style={{ backgroundColor: '#ffffff', color: '#1c1c1e', border: '1px solid rgba(0, 0, 0, 0.1)' }}
              >
                <option value="manager">Менеджер замовлень</option>
                <option value="operator">Оператор цеху</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="ios-btn ios-btn-primary"
            style={{
              height: '44px',
              fontSize: '15px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#007aff',
              marginTop: '10px',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.2)',
              border: 'none',
              borderRadius: '10px'
            }}
          >
            <span>{isRegisterMode ? 'Зареєструватись' : 'Увійти'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', fontSize: '13px' }}>
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            style={{ background: 'transparent', border: 'none', color: '#007aff', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegisterMode ? 'Вже маєте акаунт? Увійти' : 'Створити обліковий запис'}
          </button>
        </div>

        {!isRegisterMode && (
          <div style={{ marginTop: '24px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '20px' }}>
            <p style={{ fontSize: '11px', color: '#8e8e93', textTransform: 'uppercase', fontWeight: '700', marginBottom: '10px', letterSpacing: '0.5px' }}>
              Швидкий вхід:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={() => handleQuickSelect('admin')}
                className="ios-btn ios-btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px', color: '#1c1c1e', backgroundColor: '#f2f2f7', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                Адмін
              </button>
              <button 
                type="button"
                onClick={() => handleQuickSelect('manager')}
                className="ios-btn ios-btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px', color: '#1c1c1e', backgroundColor: '#f2f2f7', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                Менеджер
              </button>
              <button 
                type="button"
                onClick={() => handleQuickSelect('operator')}
                className="ios-btn ios-btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px', color: '#1c1c1e', backgroundColor: '#f2f2f7', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                Друкар
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
