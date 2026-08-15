import React, { useState } from 'react';
import { 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Search
} from 'lucide-react';

interface CallRecord {
  id: string;
  name: string;
  phone: string;
  type: 'inbound' | 'outbound' | 'missed';
  time: string;
  agent: string;
}

export const Calls: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([
    { id: 'R-1', name: 'Олег Петренко', phone: '+380671234567', type: 'inbound', time: '11:15', agent: 'Анна' },
    { id: 'R-2', name: 'Невідомий номер', phone: '+380935556677', type: 'missed', time: '10:40', agent: 'Немає' },
    { id: 'R-3', name: 'Тетяна Кравченко', phone: '+380931112233', type: 'outbound', time: '09:20', agent: 'Анна' },
    { id: 'R-4', name: 'Ігор Шевченко', phone: '+385098765432', type: 'inbound', time: 'Вчора 16:45', agent: 'Анна' }
  ]);

  const [search, setSearch] = useState('');
  const [dialNumber, setDialNumber] = useState('');

  const filteredCalls = calls.filter(call => 
    call.name.toLowerCase().includes(search.toLowerCase()) || 
    call.phone.includes(search)
  );

  const handleKeyPress = (num: string) => {
    setDialNumber(prev => prev + num);
  };

  const handleBackspace = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const simulateCall = (type: 'inbound' | 'outbound' | 'missed') => {
    if (!dialNumber.trim()) return;

    const matchedContact = calls.find(c => c.phone === dialNumber);
    const newRecord: CallRecord = {
      id: `R-${Date.now().toString().slice(-3)}`,
      name: matchedContact ? matchedContact.name : 'Невідомий номер',
      phone: dialNumber,
      type: type,
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      agent: 'Анна'
    };

    setCalls([newRecord, ...calls]);
    setDialNumber('');
    alert(`Симуляція дзвінка завершена: додано до журналу.`);
  };

  const getCallTypeIcon = (type: CallRecord['type']) => {
    switch (type) {
      case 'inbound': return <PhoneIncoming size={14} className="text-emerald-500" />;
      case 'outbound': return <PhoneOutgoing size={14} className="text-blue-500" />;
      case 'missed': return <PhoneMissed size={14} className="text-red-500" />;
    }
  };

  return (
    <div className="main-content bg-[#f8fafc]">
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Дзвінки та Телефонія</h1>
          <p className="subtitle">Облік дзвінків, інтеграція АТС (Binotel, Phonet, UniTalk)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
        {/* Dial Pad & Simulator Card */}
        <div className="ios-card bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            Телефонна панель
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '10px' }}>
              <input 
                type="text" 
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="+380"
                style={{ width: '100%', border: 'none', backgroundColor: 'transparent', textAlign: 'center', fontSize: '16px', fontWeight: '700', letterSpacing: '1px', outline: 'none' }}
              />
            </div>

            {/* Keypad Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '200px', margin: '0 auto' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px', maxWidth: '200px', margin: '8px auto 0 auto', width: '100%' }}>
              <button
                type="button"
                onClick={handleBackspace}
                style={{
                  flexGrow: 1,
                  padding: '6px 0',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#475569'
                }}
              >
                Стерти
              </button>
              <button
                type="button"
                onClick={() => simulateCall('outbound')}
                disabled={!dialNumber}
                style={{
                  flexGrow: 1.5,
                  padding: '6px 0',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  opacity: dialNumber ? 1 : 0.5
                }}
              >
                <PhoneCall size={12} />
                Виклик
              </button>
            </div>
          </div>
        </div>

        {/* Call Logs List Card */}
        <div className="ios-card bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Журнал дзвінків</h2>
            <div style={{ position: 'relative', width: '200px' }}>
              <Search style={{ position: 'absolute', left: '8px', top: '8px', color: '#94a3b8' }} size={12} />
              <input 
                placeholder="Шукати дзвінок..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '26px', height: '28px', fontSize: '11px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
            {filteredCalls.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '11px' }}>
                Журнал порожній
              </div>
            ) : (
              filteredCalls.map(call => (
                <div 
                  key={call.id} 
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px', display: 'flex' }}>
                      {getCallTypeIcon(call.type)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>{call.name}</span>
                        {call.name === 'Невідомий номер' && (
                          <button 
                            type="button"
                            onClick={() => alert(`Створення картки для ${call.phone}`)}
                            style={{ border: 'none', background: 'transparent', color: '#3b82f6', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer' }}
                          >
                            + картка
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{call.phone}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
                      <div>Відповідальний: <strong>{call.agent}</strong></div>
                      <div style={{ fontSize: '9px', marginTop: '1px' }}>{call.time}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
