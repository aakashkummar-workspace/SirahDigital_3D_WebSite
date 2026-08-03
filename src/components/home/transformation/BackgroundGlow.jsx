"use client";
import React from 'react';

/**
 * The ambient wash inside the card, shifting red → cyan → emerald as the story
 * advances.
 *
 * z-0 rather than -z-10: this sits inside a card that has its own background,
 * and a negative z-index child would paint behind that background and vanish.
 */
export default function BackgroundGlow({ accent }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-1/3 right-[-10%] w-[70%] h-[120%] rounded-full blur-3xl transition-[background] duration-1000 ease-brand"
        style={{ background: `radial-gradient(closest-side, ${accent}26, transparent 72%)` }}
      />
      <div
        className="absolute bottom-[-30%] left-[-8%] w-[55%] h-[95%] rounded-full blur-3xl transition-[background] duration-1000 ease-brand"
        style={{ background: `radial-gradient(closest-side, ${accent}1a, transparent 70%)` }}
      />
    </div>
  );
}
