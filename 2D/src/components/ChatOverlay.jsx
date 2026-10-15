import React, { useState } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, Radio, Globe } from 'lucide-react';
import { sounds } from '../utils/audio';

export const ChatOverlay = ({ messages, onSendMessage, player }) => {
  const [activeTab, setActiveTab] = useState('proximity'); // 'proximity' | 'global'
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sounds.playNotification();
    onSendMessage(inputText.trim(), activeTab);
    setInputText('');
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'proximity') return m.channel === 'proximity' || m.isProximity;
    return m.channel === 'global' || !m.isProximity;
  });

  return (
    <div className={`glass-panel chat-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="chat-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={18} style={{ color: '#00C6BD' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Chat</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isMinimized && (
            <div className="chat-tabs" onClick={(e) => e.stopPropagation()}>
              <div
                className={`chat-tab ${activeTab === 'proximity' ? 'active' : ''}`}
                onClick={() => setActiveTab('proximity')}
              >
                <Radio size={12} style={{ display: 'inline', marginRight: 4 }} />
                Cercanía
              </div>
              <div
                className={`chat-tab ${activeTab === 'global' ? 'active' : ''}`}
                onClick={() => setActiveTab('global')}
              >
                <Globe size={12} style={{ display: 'inline', marginRight: 4 }} />
                General
              </div>
            </div>
          )}

          {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Message Feed */}
          <div className="chat-messages">
            {filteredMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: 20 }}>
                {activeTab === 'proximity'
                  ? 'No hay mensajes cercanos aún. Acércate a tus compañeros para conversar.'
                  : 'Canal General de DataKnow. Envía un mensaje a todo el equipo.'}
              </div>
            ) : (
              filteredMessages.map((msg, idx) => (
                <div key={idx} className={`chat-msg ${msg.channel === 'proximity' ? 'proximity' : ''}`}>
                  <div className="chat-msg-meta">
                    <span className="msg-author">{msg.senderName}</span>
                    <span className="msg-role">{msg.senderRole}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#64748b' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                  <div className="msg-text">{msg.text}</div>
                </div>
              ))
            )}
          </div>

          {/* Input Box */}
          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              placeholder={activeTab === 'proximity' ? 'Hablar con los que están cerca...' : 'Enviar mensaje a toda la oficina...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="glass-button primary" style={{ padding: '8px 12px' }}>
              <Send size={16} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
