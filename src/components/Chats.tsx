import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  MessageCircle, 
  Globe, 
  FileText,
  Paperclip,
  CheckCheck
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'client' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isComment?: boolean;
}

interface Chat {
  id: string;
  clientName: string;
  channel: 'Viber' | 'Telegram' | 'Instagram' | 'Facebook' | 'WebChat';
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export const Chats: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'C-1',
      clientName: 'Катерина Сидоренко',
      channel: 'Instagram',
      lastMessage: 'Надіслала макет для друку буклетів. Чекаю на відповідь.',
      timestamp: '11:42',
      unread: 1,
      messages: [
        { id: 'm1', sender: 'client', senderName: 'Катерина', text: 'Вітаю! Які терміни друку 100 буклетів?', timestamp: '11:35' },
        { id: 'm2', sender: 'agent', senderName: 'Менеджер Анна', text: 'Доброго дня! Друк займає 1-2 робочих дні після затвердження макета.', timestamp: '11:38' },
        { id: 'm3', sender: 'client', senderName: 'Катерина', text: 'Надіслала макет для друку буклетів. Чекаю на відповідь.', timestamp: '11:42' }
      ]
    },
    {
      id: 'C-2',
      clientName: 'Олександр (ФОП Мельник)',
      channel: 'Telegram',
      lastMessage: 'Оплату за рахунком №142 здійснив.',
      timestamp: '10:15',
      unread: 0,
      messages: [
        { id: 'm4', sender: 'agent', senderName: 'Менеджер Анна', text: 'Рахунок №142 виставлено на суму 4500 грн.', timestamp: '09:50' },
        { id: 'm5', sender: 'client', senderName: 'Олександр', text: 'Оплату за рахунком №142 здійснив.', timestamp: '10:15' },
        { id: 'm6', sender: 'system', senderName: 'Система', text: 'Менеджер Анна підтвердив оплату. Статус угоди змінено на "Черга друку".', timestamp: '10:20' }
      ]
    },
    {
      id: 'C-3',
      clientName: 'Дмитро Васильєв',
      channel: 'Viber',
      lastMessage: 'Чи можете ви додати тиснення золотом на обкладинку?',
      timestamp: 'Вчора',
      unread: 0,
      messages: [
        { id: 'm7', sender: 'client', senderName: 'Дмитро', text: 'Доброго вечора. Цікавить виготовлення блокнотів з вашим логотипом.', timestamp: 'Вчора 18:30' },
        { id: 'm8', sender: 'client', senderName: 'Дмитро', text: 'Чи можете ви додати тиснення золотом на обкладинку?', timestamp: 'Вчора 18:32' }
      ]
    }
  ]);

  const [activeChatId, setActiveChatId] = useState<string>('C-1');
  const [inputValue, setInputValue] = useState('');
  const [isCommentMode, setIsCommentMode] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender: 'agent',
      senderName: isCommentMode ? 'Менеджер (Коментар)' : 'Менеджер Анна',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      isComment: isCommentMode
    };

    setChats(chats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: isCommentMode ? chat.lastMessage : inputValue,
          unread: 0,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));

    setInputValue('');
  };

  const getChannelIcon = (channel: Chat['channel']) => {
    switch (channel) {
      case 'Telegram': return <MessageCircle size={12} className="text-blue-500" />;
      case 'Viber': return <MessageSquare size={12} className="text-purple-600" />;
      case 'Instagram': return <span style={{ fontSize: '10px' }}>📸</span>;
      case 'Facebook': return <MessageCircle size={12} className="text-blue-700" />;
      default: return <Globe size={12} className="text-slate-400" />;
    }
  };

  return (
    <div className="main-content bg-[#f8fafc]">
      <div className="header-title-container">
        <div>
          <h1 className="page-title">Мультиканальні чати</h1>
          <p className="subtitle">Об'єднані листування з Instagram, Telegram та Viber</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '0', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', height: 'calc(100vh - 130px)' }}>
        {/* Chats Sidebar */}
        <div style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Діалоги
            </span>
          </div>
          <div style={{ overflowY: 'auto', flexGrow: 1 }}>
            {chats.map(chat => (
              <button
                key={chat.id}
                type="button"
                onClick={() => {
                  setActiveChatId(chat.id);
                  setChats(chats.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: '10px',
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: activeChatId === chat.id ? '#ffffff' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#475569', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', position: 'relative', flexShrink: 0 }}>
                  {chat.clientName.charAt(0)}
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', backgroundColor: '#ffffff', borderRadius: '50%', padding: '2px', display: 'flex', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    {getChannelIcon(chat.channel)}
                  </div>
                </div>
                <div style={{ overflow: 'hidden', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.clientName}
                    </h4>
                    <span style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{chat.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div style={{ alignSelf: 'center', backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '8px', fontWeight: '800', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', flexShrink: 0 }}>
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          {/* Active Chat Header */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' }}>
                {activeChat.clientName.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{activeChat.clientName}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px', color: '#64748b', fontWeight: '500' }}>
                  {getChannelIcon(activeChat.channel)}
                  <span>Канал: {activeChat.channel}</span>
                </div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => alert(`Створення картки угоди для ${activeChat.clientName}`)}
              style={{
                padding: '5px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FileText size={12} />
              Створити угоду
            </button>
          </div>

          {/* Messages Stream */}
          <div style={{ flexGrow: 1, padding: '16px 20px', overflowY: 'auto', backgroundColor: '#fafbfd', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeChat.messages.map(msg => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: '600', color: '#64748b', backgroundColor: '#e2e8f0/60', padding: '3px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      🔧 {msg.text}
                    </span>
                  </div>
                );
              }

              const isAgent = msg.sender === 'agent';
              const isComment = msg.isComment;

              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isAgent ? 'flex-end' : 'flex-start' }}>
                  <div 
                    style={{
                      maxWidth: '65%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                      backgroundColor: isComment ? '#fef08a' : isAgent ? '#0f172a' : '#ffffff',
                      borderColor: isComment ? '#fde047' : isAgent ? '#0f172a' : '#e2e8f0',
                      color: isComment ? '#713f12' : isAgent ? '#ffffff' : '#0f172a'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '20px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>
                        {msg.senderName}
                      </span>
                      <span style={{ fontSize: '8px', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>{msg.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '11px', lineHeight: '1.4', margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </p>
                    {isAgent && !isComment && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px', opacity: 0.7 }}>
                        <CheckCheck size={11} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Text Area */}
          <div style={{ padding: '12px 18px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setIsCommentMode(false)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '9px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  backgroundColor: !isCommentMode ? '#0f172a' : '#f1f5f9',
                  color: !isCommentMode ? '#ffffff' : '#475569'
                }}
              >
                Клієнту
              </button>
              <button
                type="button"
                onClick={() => setIsCommentMode(true)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '9px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  backgroundColor: isCommentMode ? '#eab308' : '#f1f5f9',
                  color: isCommentMode ? '#ffffff' : '#475569'
                }}
              >
                Коментар
              </button>
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flexGrow: 1 }}>
                <textarea
                  placeholder={isCommentMode ? "Залиште замітку для менеджерів..." : "Введіть відповідь..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  rows={2}
                  style={{
                    fontSize: '12px',
                    lineHeight: '1.3',
                    resize: 'none',
                    padding: '8px 10px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => alert('Виберіть файл зображення або оригінал-макет.')}
                  style={{
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    display: 'flex'
                  }}
                >
                  <Paperclip size={14} />
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: isCommentMode ? '#eab308' : '#0f172a',
                    color: '#ffffff',
                    display: 'flex'
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
