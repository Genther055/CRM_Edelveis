import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { NoteItem, NoteReply } from '../types';
import { 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  User as UserIcon,
  Clock
} from 'lucide-react';

interface NotesSectionProps {
  targetType: 'client' | 'deal' | 'task' | 'general';
  targetId?: string;
  title?: string;
  placeholder?: string;
  compact?: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  targetType,
  targetId,
  title = 'Замітки та коментарі',
  placeholder = 'Напишіть замітку або коментар...',
  compact = false
}) => {
  const { notes, addNote, editNote, deleteNote, addNoteReply, editNoteReply, deleteNoteReply, currentUser, theme } = useApp();
  const isDark = theme === 'dark';

  const [newNoteText, setNewNoteText] = useState('');
  
  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Replying state (which note is currently being replied to)
  const [replyingNoteId, setReplyingNoteId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Reply editing state
  const [editingReplyKey, setEditingReplyKey] = useState<{ noteId: string; replyId: string } | null>(null);
  const [editingReplyText, setEditingReplyText] = useState('');

  // Filter notes relevant to this target
  const relevantNotes = notes.filter(n => {
    if (n.targetType !== targetType) return false;
    if (targetId) {
      return String(n.targetId) === String(targetId);
    }
    return true;
  });

  const currentAuthor = currentUser?.name || 'Користувач';
  const currentRole = currentUser?.role === 'admin' 
    ? 'Адміністратор' 
    : (currentUser?.role === 'manager' ? 'Менеджер' : 'Оператор');

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    addNote({
      targetType,
      targetId: targetId ? String(targetId) : undefined,
      author: currentAuthor,
      authorRole: currentRole,
      text: newNoteText.trim(),
      replies: []
    });

    setNewNoteText('');
  };

  const handleStartEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
    setReplyingNoteId(null);
  };

  const handleSaveEditNote = (noteId: string) => {
    if (!editingNoteText.trim()) return;
    editNote(noteId, editingNoteText.trim());
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Видалити цю замітку та всі відповіді?')) {
      deleteNote(noteId);
    }
  };

  const handleAddReply = (noteId: string) => {
    if (!replyText.trim()) return;
    addNoteReply(noteId, replyText.trim(), currentAuthor, currentRole);
    setReplyText('');
    setReplyingNoteId(null);
  };

  const handleStartEditReply = (noteId: string, reply: NoteReply) => {
    setEditingReplyKey({ noteId, replyId: reply.id });
    setEditingReplyText(reply.text);
  };

  const handleSaveEditReply = (noteId: string, replyId: string) => {
    if (!editingReplyText.trim()) return;
    editNoteReply(noteId, replyId, editingReplyText.trim());
    setEditingReplyKey(null);
    setEditingReplyText('');
  };

  const handleDeleteReply = (noteId: string, replyId: string) => {
    if (window.confirm('Видалити цю відповідь?')) {
      deleteNoteReply(noteId, replyId);
    }
  };

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '8px' : '14px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ 
          fontSize: compact ? '12px' : '13px', 
          fontWeight: '800', 
          color: 'var(--text-dark)', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <MessageSquare size={compact ? 13 : 15} style={{ color: 'var(--primary)' }} />
          {title} ({relevantNotes.length})
        </h4>
      </div>

      {/* New Note Input Form */}
      <form onSubmit={handleCreateNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <textarea
          rows={compact ? 2 : 3}
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleCreateNote(e);
            }
          }}
          style={{
            padding: compact ? '6px 10px' : '10px 12px',
            fontSize: compact ? '11.5px' : '12.5px',
            backgroundColor: 'var(--bg-card-subtle)',
            color: 'var(--text-dark)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            resize: 'vertical',
            width: '100%',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-medium)' }}>
            Ctrl + Enter для швидкого додавання
          </span>
          <button
            type="submit"
            disabled={!newNoteText.trim()}
            className="ios-btn ios-btn-primary"
            style={{
              padding: compact ? '4px 10px' : '6px 14px',
              fontSize: compact ? '11px' : '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: newNoteText.trim() ? 1 : 0.6,
              cursor: newNoteText.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <Send size={12} />
            Додати замітку
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '8px' : '12px' }}>
        {relevantNotes.length === 0 ? (
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--text-medium)', 
            textAlign: 'center', 
            padding: compact ? '12px' : '20px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRadius: '8px',
            border: '1px dashed var(--border-light)'
          }}>
            Заміток поки немає. Додайте першу замітку вище.
          </div>
        ) : (
          relevantNotes.map(note => {
            const isEditingThisNote = editingNoteId === note.id;
            const isReplyingThisNote = replyingNoteId === note.id;
            const replies = note.replies || [];

            return (
              <div
                key={note.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: compact ? '10px' : '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                }}
              >
                {/* Note Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isDark ? '#374151' : 'rgba(0, 122, 255, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '800'
                    }}>
                      {note.author ? note.author.charAt(0).toUpperCase() : <UserIcon size={12} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ fontSize: '11.5px', color: 'var(--text-dark)' }}>
                        {note.author}
                      </strong>
                      {note.authorRole && (
                        <span style={{ 
                          fontSize: '9.5px', 
                          padding: '1px 6px', 
                          borderRadius: '4px', 
                          backgroundColor: 'var(--bg-card-subtle)', 
                          color: 'var(--text-medium)',
                          border: '1px solid var(--border-light)'
                        }}>
                          {note.authorRole}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-medium)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} />
                      {formatTimestamp(note.createdAt)}
                      {note.updatedAt && (
                        <span style={{ fontStyle: 'italic', opacity: 0.8 }}>(змінено)</span>
                      )}
                    </span>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditNote(note)}
                        title="Редагувати замітку"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-medium)',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px'
                        }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        title="Видалити замітку"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Note Content / Inline Edit */}
                {isEditingThisNote ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <textarea
                      rows={3}
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                      style={{
                        padding: '8px',
                        fontSize: '12px',
                        backgroundColor: 'var(--bg-card-subtle)',
                        color: 'var(--text-dark)',
                        border: '1px solid var(--primary)',
                        borderRadius: '6px',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleCancelEditNote}
                        className="ios-btn ios-btn-secondary ios-btn-small"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                      >
                        <X size={12} /> Скасувати
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditNote(note.id)}
                        className="ios-btn ios-btn-primary ios-btn-small"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                      >
                        <Check size={12} /> Зберегти
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    fontSize: compact ? '12px' : '12.5px', 
                    color: 'var(--text-dark)', 
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    padding: '2px 0'
                  }}>
                    {note.text}
                  </div>
                )}

                {/* Reply Toggle Link */}
                {!isEditingThisNote && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isReplyingThisNote) {
                          setReplyingNoteId(null);
                          setReplyText('');
                        } else {
                          setReplyingNoteId(note.id);
                          setReplyText('');
                        }
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      <CornerDownRight size={12} />
                      {isReplyingThisNote ? 'Закрити відповідь' : 'Відповісти'}
                    </button>
                  </div>
                )}

                {/* Reply Input Form */}
                {isReplyingThisNote && (
                  <div style={{
                    marginTop: '6px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: 'var(--text-medium)' }}>
                      <CornerDownRight size={11} />
                      <span>Відповідь для <strong>{note.author}</strong></span>
                    </div>
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Введіть вашу відповідь..."
                      autoFocus
                      style={{
                        padding: '6px 8px',
                        fontSize: '11.5px',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-dark)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingNoteId(null);
                          setReplyText('');
                        }}
                        className="ios-btn ios-btn-secondary ios-btn-small"
                        style={{ fontSize: '10.5px' }}
                      >
                        Скасувати
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddReply(note.id)}
                        disabled={!replyText.trim()}
                        className="ios-btn ios-btn-primary ios-btn-small"
                        style={{ fontSize: '10.5px', opacity: replyText.trim() ? 1 : 0.6 }}
                      >
                        Надіслати відповідь
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies List */}
                {replies.length > 0 && (
                  <div style={{
                    marginTop: '6px',
                    paddingLeft: '12px',
                    borderLeft: '2px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {replies.map(reply => {
                      const isEditingThisReply = editingReplyKey?.noteId === note.id && editingReplyKey?.replyId === reply.id;

                      return (
                        <div
                          key={reply.id}
                          style={{
                            backgroundColor: 'var(--bg-card-subtle)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <strong style={{ fontSize: '11px', color: 'var(--text-dark)' }}>
                                {reply.author}
                              </strong>
                              {reply.authorRole && (
                                <span style={{ 
                                  fontSize: '9px', 
                                  padding: '1px 4px', 
                                  borderRadius: '3px', 
                                  backgroundColor: isDark ? '#1f2937' : '#e2e8f0', 
                                  color: 'var(--text-medium)' 
                                }}>
                                  {reply.authorRole}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '9.5px', color: 'var(--text-medium)' }}>
                                {formatTimestamp(reply.createdAt)}
                                {reply.updatedAt && <span style={{ fontStyle: 'italic' }}> (змінено)</span>}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditReply(note.id, reply)}
                                  title="Редагувати відповідь"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--text-medium)',
                                    cursor: 'pointer',
                                    padding: '2px'
                                  }}
                                >
                                  <Edit3 size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReply(note.id, reply.id)}
                                  title="Видалити відповідь"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--danger)',
                                    cursor: 'pointer',
                                    padding: '2px'
                                  }}
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Reply Body / Edit */}
                          {isEditingThisReply ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                              <textarea
                                rows={2}
                                value={editingReplyText}
                                onChange={(e) => setEditingReplyText(e.target.value)}
                                style={{
                                  padding: '6px',
                                  fontSize: '11.5px',
                                  backgroundColor: 'var(--bg-card)',
                                  color: 'var(--text-dark)',
                                  border: '1px solid var(--primary)',
                                  borderRadius: '4px',
                                  width: '100%',
                                  outline: 'none'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => setEditingReplyKey(null)}
                                  className="ios-btn ios-btn-secondary ios-btn-small"
                                  style={{ fontSize: '10px', padding: '2px 6px' }}
                                >
                                  Скасувати
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditReply(note.id, reply.id)}
                                  className="ios-btn ios-btn-primary ios-btn-small"
                                  style={{ fontSize: '10px', padding: '2px 6px' }}
                                >
                                  Зберегти
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ 
                              fontSize: '11.5px', 
                              color: 'var(--text-dark)', 
                              lineHeight: '1.4', 
                              whiteSpace: 'pre-wrap' 
                            }}>
                              {reply.text}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
