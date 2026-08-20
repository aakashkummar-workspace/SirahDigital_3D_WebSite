'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { answerQuestion, GREETING_PAIR, QUICK_REPLIES_BY_LANG } from '@/lib/chat/answer';
import { DEFAULT_LANG, UI, pick } from '@/lib/chat/persona';

/**
 * The chat panel.
 *
 * The bot runs entirely in the browser: answerQuestion is a pure function over
 * a content index built at module load, so there is no request, no key and no
 * third-party script. That is the whole reason this replaced the LeadConnector
 * widget — the vendor could only ever collect a name and a number, and this can
 * actually answer the question that brought someone here.
 *
 * ── conversation state lives here ────────────────────────────────────────
 * lib/chat is pure by design, so the remembered name and the turn count are
 * held in this component and passed in on every call. A reply can ask for a
 * change by coming back with `setName` or `clearName`, which is applied when
 * the reply is committed. Nothing mutates across visitors.
 *
 * ── the delay is not decoration ──────────────────────────────────────────
 * The answer is ready synchronously. Rendering it instantly reads as a lookup
 * table rather than a reply, and — more practically — a message that appears in
 * the same frame as the question gives a screen reader nothing to announce as a
 * change. The typing pause is short, proportional to the answer's length, and
 * skipped entirely under reduced motion.
 */

// Floor only. The answer now arrives over the network, which supplies most of
// the pause on its own; this just stops the fallback path from replying in the
// same frame as the question.
const TYPING_MIN_MS = 320;

let messageSeq = 0;
const nextId = () => `m${++messageSeq}`;

/** Renders **bold** spans. The bot's only markup, and the only one allowed. */
function RichText({ value }) {
  const parts = useMemo(() => String(value || '').split(/(\*\*[^*]+\*\*)/g), [value]);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function ReplyLink({ link, onNavigate }) {
  const className = `sirah-panel__link ${link.primary ? 'sirah-panel__link--primary' : ''}`;
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </Link>
  );
}

/** The inline hand-off form. Posts to the same endpoint the contact page uses. */
function LeadForm({ lang, name, onDone, onCancel }) {
  const [values, setValues] = useState({ name: name || '', email: '', message: '' });
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: values.name,
          email: values.email,
          message: values.message,
          source: 'chat',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        setError(data.error || 'That did not go through. Please try again.');
        setState('idle');
        return;
      }
      setState('done');
      onDone(values.name);
    } catch {
      setError('That did not go through. Please try again.');
      setState('idle');
    }
  }

  if (state === 'done') {
    return <p className="sirah-panel__leaddone">{pick(UI.leadDone, lang)}</p>;
  }

  return (
    <form className="sirah-panel__lead" onSubmit={submit}>
      <p className="sirah-panel__leadtitle">{pick(UI.leadTitle, lang)}</p>
      <input
        type="text"
        required
        value={values.name}
        onChange={set('name')}
        placeholder={pick(UI.leadName, lang)}
        aria-label={pick(UI.leadName, lang)}
      />
      <input
        type="email"
        required
        value={values.email}
        onChange={set('email')}
        placeholder={pick(UI.leadEmail, lang)}
        aria-label={pick(UI.leadEmail, lang)}
      />
      <textarea
        required
        rows={2}
        value={values.message}
        onChange={set('message')}
        placeholder={pick(UI.leadMessage, lang)}
        aria-label={pick(UI.leadMessage, lang)}
      />
      {error && <p className="sirah-panel__leaderror">{error}</p>}
      <div className="sirah-panel__leadrow">
        <button type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? pick(UI.leadSending, lang) : pick(UI.leadSubmit, lang)}
        </button>
        <button type="button" className="sirah-panel__leadcancel" onClick={onCancel}>
          {pick(UI.leadCancel, lang)}
        </button>
      </div>
    </form>
  );
}

export default function ChatPanel({ open, onClose }) {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  // Conversation state. Refs rather than state: they are read inside async
  // callbacks that would otherwise close over a stale value, and nothing
  // renders from them directly.
  const nameRef = useRef(null);
  const turnRef = useRef(0);
  // What the last answer was about. A one-turn memory, which is all a pronoun
  // ever reaches back for — "how much for that?" means the thing just named,
  // never something five messages ago. Refusals and clarifications do not
  // overwrite it: they had no subject, so the previous one still stands.
  const lastIntentRef = useRef(null);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const reducedRef = useRef(false);
  // The answer is awaited now, so a panel unmounted mid-flight would otherwise
  // set state on a dead component when the request lands.
  const aliveRef = useRef(true);

  useEffect(() => {
    reducedRef.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // The greeting is seeded rather than hard-coded into the list, so switching
  // language before saying anything re-greets in the new one.
  useEffect(() => {
    if (messages.length > 0) return;
    setMessages([
      {
        id: nextId(),
        from: 'bot',
        text: pick(GREETING_PAIR, lang),
        followUps: QUICK_REPLIES_BY_LANG[lang],
      },
    ]);
  }, [lang, messages.length]);

  useEffect(() => {
    if (!open) return;
    // Focus the field, but not on a touch keyboard where it would shove the
    // panel off screen the moment it opens.
    if (window.matchMedia?.('(pointer: fine)').matches) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, leadOpen]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Escape closes, matching every other dismissible surface on the site.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /**
   * Ask /api/chat, which answers from the CMS-backed index.
   *
   * The local answerQuestion is kept as the fallback rather than deleted, and
   * that is the whole reason the content index still ships in this bundle. It
   * earns its place: the CMS is a separate service that can be redeploying,
   * cold-starting or simply not configured, and a bot that returns "something
   * went wrong" in any of those cases is worse than one answering from content
   * that is a deploy old. The visitor is never shown which path ran.
   */
  const ask = useCallback(async (text, turn) => {
    const ctx = { lang, name: nameRef.current, turn, lastIntent: lastIntentRef.current };
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, ...ctx }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data.reply) return data.reply;
      }
    } catch {
      /* offline, aborted, or the route is down — fall through */
    }
    return answerQuestion(text, ctx);
  }, [lang]);

  const commit = useCallback(async (question) => {
    const text = String(question || '').trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: nextId(), from: 'user', text }]);
    setDraft('');
    setLeadOpen(false);
    setTyping(true);

    const turn = turnRef.current;
    turnRef.current += 1;

    // The round trip supplies the pause that used to be faked. The floor is
    // still enforced because the fallback path answers in under a millisecond,
    // and a reply landing in the same frame as the question reads as a lookup
    // table rather than an answer — and gives a screen reader no change to
    // announce.
    const startedAt = Date.now();
    const reply = await ask(text, turn);
    if (!aliveRef.current) return;

    const floor = reducedRef.current ? 0 : TYPING_MIN_MS;
    const waited = Date.now() - startedAt;
    if (waited < floor) {
      await new Promise((resolve) => {
        timerRef.current = setTimeout(resolve, floor - waited);
      });
      if (!aliveRef.current) return;
    }

    if (reply.setName) nameRef.current = reply.setName;
    if (reply.clearName) nameRef.current = null;
    if (reply.intent && reply.intent !== 'out-of-scope' && reply.intent !== 'clarify') {
      lastIntentRef.current = reply.intent;
    }

    setTyping(false);
    setMessages((prev) => [...prev, { id: nextId(), from: 'bot', ...reply }]);
    if (reply.leadForm) setLeadOpen(true);
  }, [ask]);

  function onSubmit(e) {
    e.preventDefault();
    commit(draft);
  }

  function switchLang() {
    const next = lang === 'en' ? 'ta' : 'en';
    setLang(next);
    // A conversation half in each language reads as a bug. Start clean, but
    // keep the name — that is the one thing worth carrying across.
    setMessages([
      {
        id: nextId(),
        from: 'bot',
        text: pick(GREETING_PAIR, next),
        followUps: QUICK_REPLIES_BY_LANG[next],
      },
    ]);
    setLeadOpen(false);
  }

  return (
    <div
      className={`sirah-panel ${open ? 'sirah-panel--open' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-label={pick(UI.title, lang)}
      aria-hidden={!open}
      // inert would be better, but React 18 does not forward it; this keeps the
      // closed panel out of the tab order without it being display:none, which
      // would drop the open/close transition.
      {...(open ? {} : { tabIndex: -1 })}
    >
      <header className="sirah-panel__head">
        <span className="sirah-panel__avatar">
          <Image src="/chat-avatar.png" alt="" width={40} height={40} />
        </span>
        <span className="sirah-panel__id">
          <b>{pick(UI.title, lang)}</b>
          <i>
            <em aria-hidden="true" /> {pick(UI.status, lang)}
          </i>
        </span>
        <button
          type="button"
          className="sirah-panel__lang"
          onClick={switchLang}
          title={pick(UI.langToggle, lang)}
        >
          {lang === 'en' ? 'த' : 'EN'}
        </button>
        <button
          type="button"
          className="sirah-panel__close"
          onClick={onClose}
          aria-label={pick(UI.close, lang)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div className="sirah-panel__log" ref={listRef} role="log" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`sirah-msg sirah-msg--${m.from}`}>
            <div className="sirah-msg__bubble">
              <p className="sirah-msg__text">
                <RichText value={m.text} />
              </p>

              {m.lead && (
                <Link href={m.lead.href} className="sirah-msg__lead" onClick={onClose}>
                  <b>{m.lead.title}</b>
                  {m.lead.kind && <i>{m.lead.kind}</i>}
                </Link>
              )}

              {m.bullets?.length > 0 && (
                <ul className="sirah-msg__bullets">
                  {m.bullets.map((b, i) => (
                    <li key={i}>
                      {b.href ? (
                        <Link href={b.href} onClick={onClose}>
                          {b.title}
                        </Link>
                      ) : (
                        <b>{b.title}</b>
                      )}
                      {b.detail && <span>{b.detail}</span>}
                    </li>
                  ))}
                </ul>
              )}

              {m.extra && <p className="sirah-msg__extra">{m.extra}</p>}

              {m.contact && (
                <div className="sirah-msg__contact">
                  <a href={`mailto:${m.contact.email}`}>{m.contact.email}</a>
                  <a href={m.contact.phoneHref}>{m.contact.phone}</a>
                  <span>{m.contact.address}</span>
                </div>
              )}

              {m.links?.length > 0 && (
                <div className="sirah-msg__links">
                  {m.links.map((l, i) => (
                    <ReplyLink key={i} link={l} onNavigate={onClose} />
                  ))}
                  {/* Offered, not imposed. The form used to unfold on its own
                      whenever an answer was less than certain, which put a
                      name-and-email field under questions the bot had simply
                      failed to understand. */}
                  {m.offerLead && !leadOpen && (
                    <button
                      type="button"
                      className="sirah-panel__link"
                      onClick={() => setLeadOpen(true)}
                    >
                      {pick(UI.leadTitle, lang)}
                    </button>
                  )}
                </div>
              )}
            </div>

            {m.followUps?.length > 0 && (
              <div className="sirah-panel__chips">
                {m.followUps.map((f, i) => {
                  const label = typeof f === 'string' ? f : f.label;
                  const send = typeof f === 'string' ? f : f.send || f.label;
                  return (
                    <button key={i} type="button" onClick={() => commit(send)}>
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="sirah-msg sirah-msg--bot">
            <div className="sirah-msg__bubble sirah-msg__bubble--typing">
              <span className="sirah-typing" aria-label={pick(UI.typing, lang)}>
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        )}

        {leadOpen && (
          <LeadForm
            lang={lang}
            name={nameRef.current}
            onCancel={() => setLeadOpen(false)}
            onDone={(n) => {
              if (n) nameRef.current = n;
            }}
          />
        )}
      </div>

      <form className="sirah-panel__compose" onSubmit={onSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={pick(UI.placeholder, lang)}
          aria-label={pick(UI.placeholder, lang)}
          autoComplete="off"
        />
        <button type="submit" aria-label={pick(UI.send, lang)} disabled={!draft.trim()}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M3.4 20.4l17.5-8.4L3.4 3.6 3.4 10l12 2-12 2z" fill="currentColor" />
          </svg>
        </button>
      </form>

      <p className="sirah-panel__foot">{pick(UI.disclaimer, lang)}</p>
    </div>
  );
}
