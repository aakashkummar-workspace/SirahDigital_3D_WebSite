'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import ChatLauncher from './ChatLauncher';

/**
 * The chat: launcher plus panel, and the open state they share.
 *
 * ── what this replaced ───────────────────────────────────────────────────
 * A GoHighLevel / LeadConnector script tag. That widget could only do one
 * thing — collect a name, a phone number and a date of birth behind a consent
 * checkbox — which is a lead form, not an assistant. It also cost a
 * third-party script on every route, and its conversation lived in a dashboard
 * rather than in this repo, so nobody could review a copy change in a diff.
 *
 * The bot that replaced it answers from src/lib/chat: a BM25 index built over
 * this site's own data at module load, wrapped in authored intents. It runs in
 * the browser, so there is no request, no API key and no vendor. Leads it does
 * capture go to /api/contact — the same endpoint the contact page posts to, so
 * chat and form land in one place.
 *
 * ── why the panel is loaded separately ───────────────────────────────────
 * The panel pulls in the whole content index, and nobody opens this site to
 * use the chat. ssr:false keeps it out of the server render, and the dynamic
 * import keeps it out of the initial bundle — it arrives when the launcher is
 * first clicked, which is the first moment it can matter.
 *
 * Mounted from the (site) layout, which does not remount between routes, so an
 * open conversation survives client-side navigation.
 */

const ChatPanel = dynamic(() => import('./ChatPanel'), { ssr: false });

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Distinct from `open`: once the panel has been opened it stays mounted, so
  // closing and reopening does not throw the conversation away.
  const [mounted, setMounted] = useState(false);

  function openChat() {
    setMounted(true);
    setOpen(true);
  }

  return (
    <>
      <ChatLauncher open={open} onOpen={openChat} />
      {mounted && <ChatPanel open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
