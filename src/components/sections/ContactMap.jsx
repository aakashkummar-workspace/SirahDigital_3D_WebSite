"use client";
import React, { useState } from 'react';

/**
 * The office on a map.
 *
 * The fade is driven by the iframe's own load event, not by a scroll trigger.
 * Google's embed paints white before it paints the map, and on a dark page a
 * white rectangle snapping into a 400px slot is the most violent thing that
 * happens on the route — so the frame stays at the card's own surface colour
 * until the tiles are actually there, then crosses over.
 *
 * `q` uses plain hyphens where the address has en-dashes. The geocoder is
 * happier with them, and the address is rendered from COMPANY everywhere a
 * human reads it, so nothing visible depends on this string.
 */

const QUERY =
  'Sirah Digital, 8th Floor, Innovate Featherlite - The Address, Pallavaram, Chennai 600044';

const SRC = `https://www.google.com/maps?q=${encodeURIComponent(QUERY)}&output=embed`;

export default function ContactMap() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-[24px]
        border border-ink/[0.18] bg-space-raised
        shadow-lift"
    >
      <iframe
        src={SRC}
        title="Sirah Digital office location - Pallavaram, Chennai"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-700 ease-brand
          ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
