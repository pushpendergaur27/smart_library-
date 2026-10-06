import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import api from '../services/api';

const WELCOME =
  "Hi! I'm your Library Assistant.\nAsk me about books, authors, genres, availability or reviews.";

const CHIPS = [
  'Books in Computer Science',
  'Best book in Fiction',
  'Do you have Clean Code?',
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = async (text) => {
    const msg = typeof text === 'string' ? text.trim() : input.trim();
    if (!msg || typing) return;
    setInput('');
    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setTyping(true);
    try {
      const { data } = await api.post('/chat', { message: msg });
      setMessages((m) => [...m, { from: 'bot', text: data.reply || 'Sorry, I could not generate a reply.' }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: 'bot', text: "Sorry, I couldn't reach the library service right now. Please try again in a moment." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <>
      <style>{`
        .sla-chat-fab {
          position: fixed; right: 24px; bottom: 24px; z-index: 1085;
          width: 56px; height: 56px; border-radius: 50%; border: none;
          background: #1a237e; color: #fff; cursor: pointer;
          box-shadow: 0 8px 24px rgba(26, 35, 126, 0.4);
          display: flex; align-items: center; justify-content: center;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .sla-chat-fab:hover { transform: scale(1.06); box-shadow: 0 10px 28px rgba(26, 35, 126, 0.5); }
        .sla-chat-panel {
          position: fixed; right: 24px; bottom: 24px; z-index: 1090;
          width: 370px; height: min(560px, calc(100vh - 48px));
          background: #fff; border-radius: 16px; overflow: hidden;
          box-shadow: 0 16px 48px rgba(15, 23, 42, 0.28);
          display: flex; flex-direction: column;
          animation: sla-chat-in .18s ease-out;
        }
        @keyframes sla-chat-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sla-chat-header {
          background: #1a237e; color: #fff; padding: 14px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .sla-chat-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255, 255, 255, 0.16);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sla-chat-title { font-weight: 600; font-size: 15px; line-height: 1.2; }
        .sla-chat-sub {
          font-size: 11.5px; opacity: 0.85; display: flex; align-items: center; gap: 5px; margin-top: 2px;
        }
        .sla-chat-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block;
        }
        .sla-chat-close {
          margin-left: auto; background: transparent; border: none; color: #fff;
          cursor: pointer; padding: 6px; border-radius: 8px; display: flex;
        }
        .sla-chat-close:hover { background: rgba(255, 255, 255, 0.15); }
        .sla-chat-body {
          flex: 1; overflow-y: auto; background: #f6f8fb;
          padding: 14px 12px; display: flex; flex-direction: column; gap: 10px;
        }
        .sla-chat-msg {
          max-width: 86%; padding: 9px 12px; font-size: 14px; line-height: 1.5;
          white-space: pre-line; word-break: break-word;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
        }
        .sla-chat-bot {
          align-self: flex-start; background: #fff; color: #1f2937;
          border: 1px solid #e4e9f2; border-radius: 14px 14px 14px 4px;
        }
        .sla-chat-user {
          align-self: flex-end; background: #1a237e; color: #fff;
          border-radius: 14px 14px 4px 14px;
        }
        .sla-chat-chips {
          display: flex; flex-wrap: wrap; gap: 6px; padding: 0 2px 4px;
        }
        .sla-chat-chip {
          background: #fff; border: 1px solid #c9d4ea; color: #1a237e;
          font-size: 12.5px; padding: 6px 12px; border-radius: 999px; cursor: pointer;
          transition: background .12s ease;
        }
        .sla-chat-chip:hover { background: #eef2ff; }
        .sla-chat-typing {
          align-self: flex-start; background: #fff; border: 1px solid #e4e9f2;
          border-radius: 14px 14px 14px 4px; padding: 12px 14px; display: flex; gap: 4px;
        }
        .sla-chat-typing span {
          width: 6px; height: 6px; border-radius: 50%; background: #9aa6bf;
          animation: sla-chat-bounce 1.2s infinite ease-in-out;
        }
        .sla-chat-typing span:nth-child(2) { animation-delay: 0.15s; }
        .sla-chat-typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes sla-chat-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .sla-chat-footer {
          background: #fff; border-top: 1px solid #e4e9f2; padding: 10px;
          display: flex; gap: 8px; align-items: center;
        }
        .sla-chat-input {
          flex: 1; border: 1px solid #d5dde9; border-radius: 999px;
          padding: 10px 14px; font-size: 14px; outline: none; background: #fff;
        }
        .sla-chat-input:focus { border-color: #1a237e; }
        .sla-chat-send {
          width: 40px; height: 40px; border-radius: 50%; border: none;
          background: #1a237e; color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sla-chat-send:disabled { opacity: 0.45; cursor: default; }
        @media (max-width: 480px) {
          .sla-chat-panel {
            right: 12px; bottom: 12px; left: 12px; width: auto;
            height: min(560px, calc(100vh - 24px));
          }
          .sla-chat-fab { right: 16px; bottom: 16px; }
        }
      `}</style>

      {!open && (
        <button
          className="sla-chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open library assistant chat"
          title="Library Assistant"
        >
          <FiMessageCircle size={26} />
        </button>
      )}

      {open && (
        <div className="sla-chat-panel" role="dialog" aria-label="Library Assistant">
          <div className="sla-chat-header">
            <div className="sla-chat-avatar">
              <FiMessageCircle size={20} />
            </div>
            <div>
              <div className="sla-chat-title">Library Assistant</div>
              <div className="sla-chat-sub">
                <span className="sla-chat-dot" /> Online &middot; asks about books, authors &amp; reviews
              </div>
            </div>
            <button className="sla-chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <FiX size={20} />
            </button>
          </div>

          <div className="sla-chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`sla-chat-msg ${m.from === 'bot' ? 'sla-chat-bot' : 'sla-chat-user'}`}>
                {m.text}
              </div>
            ))}
            {messages.length === 1 && !typing && (
              <div className="sla-chat-chips">
                {CHIPS.map((c) => (
                  <button key={c} className="sla-chat-chip" onClick={() => send(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            {typing && (
              <div className="sla-chat-typing" aria-label="Assistant is typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          <form className="sla-chat-footer" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              className="sla-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a book, author or genre..."
              aria-label="Chat message"
            />
            <button
              type="submit"
              className="sla-chat-send"
              disabled={typing || !input.trim()}
              aria-label="Send message"
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
