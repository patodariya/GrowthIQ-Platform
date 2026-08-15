import React, { useEffect, useRef, useState } from 'react';
import { Button, TextInput } from '@carbon/react';
import { Light, Close, SendAlt } from '@carbon/icons-react';
import { chatWithCoach, ICA_ENABLED } from '../../services/ica';
import './AiCoach.scss';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const GREETING =
  "Hi Aarav 👋 I'm your GrowthIQ career coach. Ask me anything about your path to Band 8 — I can spot your biggest gaps, suggest next steps, or draft a promotion summary from your evidence.";

const SUGGESTIONS = [
  'How do I reach Band 8?',
  'What are my biggest gaps?',
  'Draft my promotion summary',
];

const FALLBACK =
  "I can't reach the coaching service right now. The proxy server needs to be running locally with a valid ICA_API_KEY. Start it with: cd proxy && npm start. While offline, your profile shows Leadership (70) is the key gap to the Band 8 bar of 85 — leading a cross-squad workshop or owning a client outcome would move that needle fastest.";

const AiCoach: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextHistory: Msg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      // Drop the synthetic greeting from what we send to the model.
      const history = nextHistory.filter((m, i) => !(i === 0 && m.role === 'assistant'));
      // Always attempt the proxy — ICA_ENABLED only gates background banner calls,
      // not the interactive coach. Fall back to the static message on any failure.
      const reply = await chatWithCoach(history);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: FALLBACK }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="ai-coach-fab"
        aria-label="Open Career Coach"
        onClick={() => setOpen(true)}
      >
        <Light size={20} />
        <span>Ask Coach</span>
      </button>
    );
  }

  return (
    <div className="ai-coach" role="dialog" aria-label="Career Coach">
      <div className="ai-coach__header">
        <div className="ai-coach__title">
          <span className="ai-coach__mark">
            <Light size={14} />
          </span>
          <div>
            <p className="ai-coach__name">Career Coach</p>
            <p className="ai-coach__sub">Grounded in your GrowthIQ profile</p>
          </div>
        </div>
        <button
          type="button"
          className="ai-coach__close"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <Close size={20} />
        </button>
      </div>

      <div className="ai-coach__body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble bubble--${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bubble bubble--assistant bubble--typing">
            <span />
            <span />
            <span />
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div className="ai-coach__suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="ai-coach__chip" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="ai-coach__footer"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <TextInput
          id="ai-coach-input"
          labelText="Message the coach"
          hideLabel
          placeholder="Ask about your growth…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          size="sm"
        />
        <Button
          type="submit"
          kind="primary"
          size="sm"
          hasIconOnly
          renderIcon={SendAlt}
          iconDescription="Send"
          disabled={loading || !input.trim()}
        />
      </form>
    </div>
  );
};

export default AiCoach;

// Made with Bob
