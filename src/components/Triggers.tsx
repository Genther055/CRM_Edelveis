import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  ShieldCheck, 
  Trash, 
  ToggleLeft, 
  ToggleRight,
  Settings as SettingsIcon,
  AlertCircle,
  Coins,
  Bot,
  Mail
} from 'lucide-react';

interface TriggerRule {
  id: string;
  name: string;
  event: string;
  action: string;
  active: boolean;
}

interface ValidationRule {
  id: string;
  name: string;
  targetField: string;
  condition: string;
  errorMessage: string;
  active: boolean;
}

export const Triggers: React.FC = () => {
  const { 
    autoPaymentTriggers, 
    addAutoPaymentTrigger, 
    deleteAutoPaymentTrigger,
    addSystemNotification,
    smsTemplates,
    addSmsTemplate,
    deleteSmsTemplate
  } = useApp();

  const [triggers, setTriggers] = useState<TriggerRule[]>([
    { id: 'TR-1', name: 'Авто-завдання: Перевірка макета', event: 'Нова угода створена', action: 'Створити завдання "Перевірити макет" для Дизайнера', active: true },
    { id: 'TR-2', name: 'SMS-сповіщення: Готовність тиражу', event: 'Етап змінено на "Готово"', action: 'Надіслати SMS "Замовлення {name} готове до видачі!"', active: true },
    { id: 'TR-3', name: 'Авто-списання складу', event: 'Угода переведена в статус "Готово"', action: 'Списати зарезервовану сировину', active: true }
  ]);

  const [validations, setValidations] = useState<ValidationRule[]>([
    { id: 'VL-1', name: 'Макет є обов\'язковим', targetField: 'Файли макета', condition: 'Не порожньо при переході у "Друк"', errorMessage: 'Неможливо розпочати друк: завантажте оригінал-макет!', active: true },
    { id: 'VL-2', name: 'Контроль передплати перед друком', targetField: 'Сума передплати', condition: '>= 50% від бюджету перед друком', errorMessage: 'Потрібно внести щонайменше 50% оплати для запуску тиражу!', active: false }
  ]);

  const [activeTab, setActiveTab] = useState<'triggers' | 'validations' | 'autopay' | 'sms'>('triggers');

  // Auto Payment creation state
  const [newStage, setNewStage] = useState('ready');
  const [newCategory, setNewCategory] = useState('Оплата клієнта');
  const [newWallet, setNewWallet] = useState('ПриватБанк ФОП');
  const [newPercent, setNewPercent] = useState(100);

  // SMS template creation state
  const [newSmsName, setNewSmsName] = useState('');
  const [newSmsText, setNewSmsText] = useState('Вітаємо {name}! ТОВ Едельвейс і К виконує ваше замовлення №{id}.');

  const toggleTrigger = (id: string) => {
    setTriggers(triggers.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const toggleValidation = (id: string) => {
    setValidations(validations.map(v => v.id === id ? { ...v, active: !v.active } : v));
  };

  const deleteTrigger = (id: string) => {
    setTriggers(triggers.filter(t => t.id !== id));
  };

  const deleteValidation = (id: string) => {
    setValidations(validations.filter(v => v.id !== id));
  };

  const handleCreateAutoPayRule = (e: React.FormEvent) => {
    e.preventDefault();
    addAutoPaymentTrigger({
      dealStage: newStage,
      category: newCategory,
      wallet: newWallet,
      percentage: newPercent,
      active: true
    });
    addSystemNotification(`🤖 Keepin Bot: Створено нове правило автооплати для етапу "${newStage}"`);
    alert('Правило автооплати успішно додано!');
  };

  const handleCreateSmsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmsName.trim() || !newSmsText.trim()) return;
    addSmsTemplate({ name: newSmsName, text: newSmsText });
    setNewSmsName('');
    alert('Шаблон SMS збережено успішно!');
  };

  return (
    <div className="main-content bg-[#f2f2f7]">
      <div className="header-title-container">
        <div>
          <h1 className="page-title text-slate-900">Тригери та Автоматизація</h1>
          <p className="subtitle">Налаштування автоматичних процесів та правил роботи Keepin Bot</p>
        </div>
      </div>

      {/* iOS Segmented Control */}
      <div style={{
        display: 'flex',
        backgroundColor: 'rgba(120, 120, 128, 0.12)',
        padding: '2px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('triggers')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'triggers' ? '#ffffff' : 'transparent',
            color: 'var(--text-dark)',
            boxShadow: activeTab === 'triggers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Zap size={14} style={{ color: activeTab === 'triggers' ? 'var(--primary)' : 'inherit' }} />
          Автоматичні дії
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('validations')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'validations' ? '#ffffff' : 'transparent',
            color: 'var(--text-dark)',
            boxShadow: activeTab === 'validations' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <ShieldCheck size={14} style={{ color: activeTab === 'validations' ? 'var(--primary)' : 'inherit' }} />
          Правила валідації
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('autopay')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'autopay' ? '#ffffff' : 'transparent',
            color: 'var(--text-dark)',
            boxShadow: activeTab === 'autopay' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Bot size={14} style={{ color: activeTab === 'autopay' ? 'var(--primary)' : 'inherit' }} />
          Автооплати (Keepin Bot)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sms')}
          className="ios-btn"
          style={{
            flexGrow: 1,
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'sms' ? '#ffffff' : 'transparent',
            color: 'var(--text-dark)',
            boxShadow: activeTab === 'sms' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Mail size={14} style={{ color: activeTab === 'sms' ? 'var(--primary)' : 'inherit' }} />
          SMS Шаблони (Без прив'язки)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List Container */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'triggers' && (
            <div className="space-y-4">
              {triggers.map(rule => (
                <div key={rule.id} className="ios-card bg-white flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px' }}>{rule.name}</h4>
                    <p style={{ fontSize: '11px', color: '#636366', marginTop: '2px' }}>
                      Коли: <strong>{rule.event}</strong>
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>
                      Виконати: {rule.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => toggleTrigger(rule.id)} className="text-slate-400 hover:text-slate-650 transition-colors border-none bg-transparent cursor-pointer">
                      {rule.active ? <ToggleRight size={28} style={{ color: 'var(--primary)' }} /> : <ToggleLeft size={28} />}
                    </button>
                    <button type="button" onClick={() => deleteTrigger(rule.id)} className="text-red-500 hover:text-red-655 p-1 rounded hover:bg-slate-50 border-none bg-transparent cursor-pointer">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'validations' && (
            <div className="space-y-4">
              {validations.map(rule => (
                <div key={rule.id} className="ios-card bg-white flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px' }}>{rule.name}</h4>
                      {!rule.active && (
                        <span className="ios-badge" style={{ backgroundColor: 'rgba(120,120,128,0.1)', color: '#636366' }}>Вимкнено</span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#636366' }}>
                      Поле: <strong>{rule.targetField}</strong> | Умова: <strong>{rule.condition}</strong>
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-red-655 font-medium" style={{ color: 'var(--danger)' }}>
                      <AlertCircle size={12} />
                      Помилка: "{rule.errorMessage}"
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => toggleValidation(rule.id)} className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer">
                      {rule.active ? <ToggleRight size={28} style={{ color: 'var(--primary)' }} /> : <ToggleLeft size={28} />}
                    </button>
                    <button type="button" onClick={() => deleteValidation(rule.id)} className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-slate-50 border-none bg-transparent cursor-pointer">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'autopay' && (
            <div className="space-y-4">
              {autoPaymentTriggers.map(rule => (
                <div key={rule.id} className="ios-card bg-white flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Coins size={14} style={{ color: 'var(--primary)' }} />
                        Автопроведення: {rule.percentage}% від угоди
                      </h4>
                      {!rule.active && (
                        <span className="ios-badge" style={{ backgroundColor: 'rgba(120,120,128,0.1)', color: '#636366' }}>Вимкнено</span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#636366' }}>
                      Етап: <strong style={{ color: 'var(--primary)' }}>{rule.dealStage}</strong> | Категорія: <strong>{rule.category}</strong>
                    </p>
                    <p style={{ fontSize: '11px', color: '#636366' }}>
                      Гаманець: <strong>{rule.wallet}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => deleteAutoPaymentTrigger(rule.id)} className="text-red-550 hover:text-red-600 p-1.5 rounded hover:bg-slate-50 border-none bg-transparent cursor-pointer">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-4">
              {smsTemplates.map(tpl => (
                <div key={tpl.id} className="ios-card bg-white flex items-center justify-between">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-800" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={13} style={{ color: 'var(--primary)' }} />
                      Шаблон: {tpl.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#475569', backgroundColor: '#f9f9f9', padding: '6px 10px', borderRadius: '6px', border: '0.5px solid var(--border-light)' }}>
                      {tpl.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => deleteSmsTemplate(tpl.id)} className="text-red-550 hover:text-red-600 p-1.5 rounded hover:bg-slate-50 border-none bg-transparent cursor-pointer">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Builder / Settings panel */}
        <div className="ios-card bg-white space-y-6">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <SettingsIcon size={16} style={{ color: 'var(--primary)' }} />
            Створити нове правило
          </h2>

          {activeTab === 'autopay' && (
            <form onSubmit={handleCreateAutoPayRule} className="space-y-4">
              <div className="ios-input-group">
                <label className="ios-label">Етап угоди для автооплати</label>
                <select value={newStage} onChange={(e) => setNewStage(e.target.value)}>
                  <option value="design">Черга макетування</option>
                  <option value="print_queue">Черга друку</option>
                  <option value="printing">У друці</option>
                  <option value="post_press">Післядрукарська обробка</option>
                  <option value="ready">Готово</option>
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Категорія надходжень</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="Оплата клієнта">Оплата клієнта</option>
                  <option value="Інші доходи">Інші доходи</option>
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Цільовий гаманець</label>
                <select value={newWallet} onChange={(e) => setNewWallet(e.target.value)}>
                  <option value="ПриватБанк ФОП">ПриватБанк ФОП</option>
                  <option value="Безготівковий рахунок ТОВ">Безготівковий рахунок ТОВ</option>
                  <option value="Готівка каса">Готівка каса</option>
                </select>
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Процент оплати (%)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="100"
                  value={newPercent}
                  onChange={(e) => setNewPercent(Number(e.target.value))}
                />
              </div>

              <button 
                type="submit"
                className="ios-btn ios-btn-primary w-full"
              >
                Підключити Keepin Bot
              </button>
            </form>
          )}

          {activeTab === 'sms' && (
            <form onSubmit={handleCreateSmsTemplate} className="space-y-4">
              <div className="ios-input-group">
                <label className="ios-label">Назва шаблону</label>
                <input 
                  required
                  placeholder="напр. Нагадування оплати"
                  value={newSmsName}
                  onChange={(e) => setNewSmsName(e.target.value)}
                />
              </div>

              <div className="ios-input-group">
                <label className="ios-label">Текст SMS шаблону</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Привіт {name}! Будь ласка, оплатіть рахунок."
                  value={newSmsText}
                  onChange={(e) => setNewSmsText(e.target.value)}
                  style={{ resize: 'none' }}
                />
                <span style={{ fontSize: '10px', color: '#8e8e93', marginTop: '4px', display: 'block' }}>
                  Змінні підстановки: <code>{`{name}`}</code> (Ім'я клієнта), <code>{`{id}`}</code> (ID замовлення).
                </span>
              </div>

              <button 
                type="submit"
                className="ios-btn ios-btn-primary w-full"
              >
                Зберегти шаблон
              </button>
            </form>
          )}

          {activeTab !== 'autopay' && activeTab !== 'sms' && (
            <div className="space-y-4">
              <div className="ios-input-group">
                <label className="ios-label">Назва правила</label>
                <input 
                  placeholder="напр. Авто-перенос на склад"
                />
              </div>

              {activeTab === 'triggers' ? (
                <>
                  <div className="ios-input-group">
                    <label className="ios-label">Подія-тригер (Event)</label>
                    <select>
                      <option>Зміна етапу угоди</option>
                      <option>Оплата замовлення</option>
                      <option>Створення нового ліду</option>
                      <option>Користувач призначений</option>
                    </select>
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Дія автоматизації (Action)</label>
                    <select>
                      <option>Надіслати SMS клієнту</option>
                      <option>Створити завдання</option>
                      <option>Списати товари зі складу</option>
                      <option>Відправити Webhook сповіщення</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="ios-input-group">
                    <label className="ios-label">Поле для перевірки</label>
                    <select>
                      <option>Файли макета</option>
                      <option>Сума передплати</option>
                      <option>ІПН / ЄДРПОУ юридичної особи</option>
                      <option>Адреса доставки</option>
                    </select>
                  </div>
                  <div className="ios-input-group">
                    <label className="ios-label">Текст помилки при помилці</label>
                    <input 
                      placeholder="напр. Додайте реквізити!"
                    />
                  </div>
                </>
              )}

              <button 
                type="button"
                onClick={() => alert('Створення правил збережено як конфігурація тригерів.')}
                className="ios-btn ios-btn-primary w-full"
              >
                Додати правило в CRM
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
