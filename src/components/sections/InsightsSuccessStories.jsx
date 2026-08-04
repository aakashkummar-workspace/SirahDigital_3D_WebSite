"use client";
import React, { useRef } from 'react';
import { LATEST_INSIGHTS, SUCCESS_STORIES } from '@/data/insightsData';

// Sleek vector preview graphic renderer for cards
function ThumbnailVisual({ theme }) {
  return (
    <div className="w-full h-full bg-[#F4F6FA] flex items-center justify-center p-6 transition-transform duration-500 group-hover:scale-105 select-none">
      {theme === 'network' && (
        <svg className="w-full h-full text-[#251D4B]/20" viewBox="0 0 240 135" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="120" cy="67" r="36" stroke="#251D4B" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="120" cy="67" r="10" fill="#251D4B" fillOpacity="0.15" stroke="#251D4B" strokeWidth="2" />
          <circle cx="60" cy="40" r="6" fill="#5A6075" />
          <circle cx="180" cy="40" r="6" fill="#5A6075" />
          <circle cx="70" cy="100" r="6" fill="#5A6075" />
          <circle cx="170" cy="100" r="6" fill="#5A6075" />
          <line x1="120" y1="67" x2="60" y2="40" stroke="#5A6075" strokeWidth="1.2" />
          <line x1="120" y1="67" x2="180" y2="40" stroke="#5A6075" strokeWidth="1.2" />
          <line x1="120" y1="67" x2="70" y2="100" stroke="#5A6075" strokeWidth="1.2" />
          <line x1="120" y1="67" x2="170" y2="100" stroke="#5A6075" strokeWidth="1.2" />
        </svg>
      )}
      {theme === 'ocr' && (
        <svg className="w-full h-full text-[#251D4B]/20" viewBox="0 0 240 135" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="70" y="25" width="100" height="85" rx="8" stroke="#251D4B" strokeWidth="1.5" fill="#FFFFFF" />
          <line x1="85" y1="45" x2="155" y2="45" stroke="#251D4B" strokeWidth="2" strokeLinecap="round" />
          <line x1="85" y1="60" x2="135" y2="60" stroke="#5A6075" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="85" y1="75" x2="145" y2="75" stroke="#5A6075" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="85" y1="90" x2="115" y2="90" stroke="#5A6075" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="60" y1="67" x2="180" y2="67" stroke="#251D4B" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      )}
      {theme === 'crm' && (
        <svg className="w-full h-full text-[#251D4B]/20" viewBox="0 0 240 135" fill="none" stroke="currentColor">
          <rect x="55" y="30" width="130" height="75" rx="12" fill="#FFFFFF" stroke="#251D4B" strokeWidth="1.5" />
          <circle cx="90" cy="60" r="14" fill="#5A6075" fillOpacity="0.2" stroke="#251D4B" strokeWidth="1.5" />
          <rect x="115" y="52" width="50" height="6" rx="3" fill="#251D4B" />
          <rect x="115" y="64" width="35" height="5" rx="2.5" fill="#5A6075" />
          <circle cx="120" cy="85" r="4" fill="#5A6075" />
          <circle cx="135" cy="85" r="4" fill="#5A6075" />
          <circle cx="150" cy="85" r="4" fill="#5A6075" />
        </svg>
      )}
      {theme === 'analytics' && (
        <svg className="w-full h-full text-[#251D4B]/20" viewBox="0 0 240 135" fill="none" stroke="currentColor">
          <rect x="60" y="75" width="20" height="35" rx="4" fill="#5A6075" fillOpacity="0.3" />
          <rect x="95" y="55" width="20" height="55" rx="4" fill="#5A6075" fillOpacity="0.5" />
          <rect x="130" y="35" width="20" height="75" rx="4" fill="#251D4B" />
          <rect x="165" y="45" width="20" height="65" rx="4" fill="#5A6075" fillOpacity="0.7" />
          <path d="M60 70 L95 50 L130 30 L165 40" stroke="#251D4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {theme === 'api' && (
        <svg className="w-full h-full text-[#251D4B]/20" viewBox="0 0 240 135" fill="none" stroke="currentColor">
          <rect x="50" y="35" width="60" height="65" rx="8" fill="#FFFFFF" stroke="#251D4B" strokeWidth="1.5" />
          <rect x="130" y="35" width="60" height="65" rx="8" fill="#FFFFFF" stroke="#251D4B" strokeWidth="1.5" />
          <path d="M110 67 L130 67" stroke="#251D4B" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="120" cy="67" r="5" fill="#251D4B" />
        </svg>
      )}
      {theme === 'logistics' && (
        <svg className="w-full h-full text-[#251D4B]/20" viewBox="0 0 240 135" fill="none" stroke="currentColor">
          <path d="M50 85 L120 40 L190 85 L120 115 Z" fill="#FFFFFF" stroke="#251D4B" strokeWidth="1.5" />
          <path d="M120 40 L120 115" stroke="#251D4B" strokeWidth="1" />
          <path d="M50 85 L120 67 L190 85" stroke="#5A6075" strokeWidth="1" />
        </svg>
      )}
      {theme === 'finance' && (
        <svg className="w-full h-full text-[#251D4B]/20" viewBox="0 0 240 135" fill="none" stroke="currentColor">
          <circle cx="120" cy="67" r="40" fill="#FFFFFF" stroke="#251D4B" strokeWidth="1.5" />
          <path d="M100 67 C100 50, 140 50, 140 67 C140 84, 100 84, 100 100" stroke="#251D4B" strokeWidth="2" strokeLinecap="round" />
          <line x1="120" y1="42" x2="120" y2="92" stroke="#251D4B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

// Custom Carousel Row Component with smooth scrolling controls
function ContentCarousel({ items, isSuccessSection = false }) {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const amount = direction === 'left' ? -340 : 340;
    containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {/* Navigation Arrows on far left and far right header level */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-[#251D4B]">
          {isSuccessSection ? 'Customer Success Stories' : 'Latest Insights'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Previous items"
            className="w-10 h-10 rounded-full border border-[#E6EAF2] text-[#251D4B] hover:bg-[#251D4B] hover:text-white transition-all flex items-center justify-center active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Next items"
            className="w-10 h-10 rounded-full border border-[#E6EAF2] text-[#251D4B] hover:bg-[#251D4B] hover:text-white transition-all flex items-center justify-center active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={item.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`group shrink-0 snap-start block ${
              isSuccessSection
                ? 'w-[85vw] sm:w-[320px] md:w-[380px] lg:w-[420px]'
                : 'w-[82vw] sm:w-[280px] lg:w-[320px]'
            }`}
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#E6EAF2] bg-[#F4F6FA] cursor-pointer">
              <ThumbnailVisual theme={item.theme} />

              {/* Hover Dark Overlay & Play Button */}
              <div className="absolute inset-0 bg-[#251D4B]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="px-4 py-2 rounded-full bg-white text-[#251D4B] font-bold text-xs tracking-wider uppercase shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
                </span>
              </div>

              {/* Duration badge in corner */}
              <span className="absolute bottom-3 right-3 px-2 py-1 rounded bg-[#251D4B]/80 text-white font-mono text-[10px] tracking-wider">
                {item.duration}
              </span>
            </div>

            {/* Content Details */}
            {!isSuccessSection ? (
              <div className="mt-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#5A6075] block">
                  {item.category}
                </span>
                <h4 className="text-base font-bold text-[#251D4B] mt-1.5 leading-snug group-hover:text-[#5A6075] transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-xs text-[#5A6075] mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-4 pt-3 border-t border-[#E6EAF2] flex items-center justify-between text-xs text-[#5A6075] font-mono">
                  <span>Published</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <h4 className="text-base md:text-lg font-bold text-[#251D4B] leading-snug group-hover:text-[#5A6075] transition-colors">
                  &ldquo;{item.headline}&rdquo;
                </h4>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#E6EAF2]">
                  <div>
                    <p className="text-sm font-semibold text-[#251D4B]">{item.customerName}</p>
                    <p className="text-xs font-mono text-[#5A6075]">{item.company}</p>
                  </div>
                  <span className="text-xs font-mono text-[#5A6075] uppercase">{item.date}</span>
                </div>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function InsightsSuccessStories() {
  return (
    <section className="bg-white text-[#251D4B] py-24 md:py-32 w-full border-t border-[#E6EAF2]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs md:text-sm font-semibold tracking-[0.25em] text-[#5A6075] uppercase mb-3 block">
            INSIGHTS &amp; SUCCESS STORIES
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#251D4B] tracking-tight leading-tight">
            Learn From Real AI Implementations
          </h2>
          <p className="text-base md:text-xl text-[#5A6075] mt-4 leading-relaxed max-w-2xl">
            Explore educational AI content from Sirah Digital along with real client transformation stories.
          </p>
        </div>

        {/* Section 1: Latest Insights */}
        <ContentCarousel items={LATEST_INSIGHTS} isSuccessSection={false} />

        {/* Section 2: Customer Success Stories */}
        <div className="mt-20 md:mt-28">
          <ContentCarousel items={SUCCESS_STORIES} isSuccessSection={true} />
        </div>
      </div>
    </section>
  );
}
