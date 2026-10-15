import React from 'react';
import { translations, Language } from '../locales/translations';

interface SovereignLogoProps {
  size?: 'sm' | 'md' | 'lg';
  lang?: Language;
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SovereignLogo: React.FC<SovereignLogoProps> = ({
  size = 'md',
  lang = 'ar',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const isAr = lang === 'ar';

  // Dimension settings
  const iconDimensions = {
    sm: { w: 32, h: 32, textClass: 'text-sm', subClass: 'text-[10px]' },
    md: { w: 42, h: 42, textClass: 'text-base font-bold', subClass: 'text-[11px]' },
    lg: { w: 56, h: 56, textClass: 'text-xl font-extrabold', subClass: 'text-xs' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Sovereign Emblem (SVG Crest) */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-md pointer-events-none" />

        <svg
          width={iconDimensions.w}
          height={iconDimensions.h}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform hover:scale-105 duration-300 drop-shadow-md"
        >
          <defs>
            {/* Shield Outer Gradient */}
            <linearGradient id="crestGoldEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Shield Inner Dark Surface */}
            <radialGradient id="shieldCore" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="60%" stopColor="#022c22" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Golden Wheat Spike Gradient */}
            <linearGradient id="wheatGold" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>

            {/* Cyber Spatial Cyan */}
            <linearGradient id="cyberCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Glowing Ring Filter */}
            <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Outer Sovereign Shield Contour */}
          <path
            d="M 50,4 
               C 74,4 92,16 92,38 
               C 92,68 64,88 50,96 
               C 36,88 8,68 8,38 
               C 8,16 26,4 50,4 Z"
            fill="url(#shieldCore)"
            stroke="url(#crestGoldEmerald)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* 2. Inner Security Border */}
          <path
            d="M 50,9 
               C 70,9 86,19 86,39 
               C 86,65 62,83 50,90 
               C 38,83 14,65 14,39 
               C 14,19 30,9 50,9 Z"
            fill="none"
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="4 2"
            opacity="0.6"
          />

          {/* 3. African Continent Silhouette (Stylized Sahara Heart) */}
          <path
            d="M 40,24 
               C 48,22 62,23 68,27 
               C 73,31 71,38 65,42 
               C 62,44 64,52 61,59 
               C 58,66 52,72 50,75 
               C 48,72 44,65 43,58 
               C 42,52 36,45 34,40 
               C 32,34 33,26 40,24 Z"
            fill="#065f46"
            fillOpacity="0.45"
            stroke="#34d399"
            strokeWidth="1.2"
          />

          {/* 4. Trans-Saharan Corridor Line (N1 Core Artery) */}
          <polyline
            points="50,25 49,36 51,48 53,60"
            fill="none"
            stroke="url(#wheatGold)"
            strokeWidth="2.4"
            strokeLinecap="round"
            filter="url(#emblemGlow)"
          />

          {/* 5. Golden Wheat Ear / Food Sovereignty Emblem */}
          <g transform="translate(50, 48) scale(0.85)">
            {/* Central stem */}
            <line x1="0" y1="20" x2="0" y2="-20" stroke="url(#wheatGold)" strokeWidth="2" strokeLinecap="round" />
            
            {/* Grain Grains Left & Right */}
            <ellipse cx="-5" cy="-14" rx="4" ry="2" transform="rotate(-30 -5 -14)" fill="url(#wheatGold)" />
            <ellipse cx="5" cy="-14" rx="4" ry="2" transform="rotate(30 5 -14)" fill="url(#wheatGold)" />
            
            <ellipse cx="-6" cy="-6" rx="4.5" ry="2.2" transform="rotate(-30 -6 -6)" fill="url(#wheatGold)" />
            <ellipse cx="6" cy="-6" rx="4.5" ry="2.2" transform="rotate(30 6 -6)" fill="url(#wheatGold)" />
            
            <ellipse cx="-6" cy="2" rx="4.5" ry="2.2" transform="rotate(-30 -6 2)" fill="url(#wheatGold)" />
            <ellipse cx="6" cy="2" rx="4.5" ry="2.2" transform="rotate(30 6 2)" fill="url(#wheatGold)" />

            <ellipse cx="-5" cy="10" rx="4" ry="2" transform="rotate(-30 -5 10)" fill="url(#wheatGold)" />
            <ellipse cx="5" cy="10" rx="4" ry="2" transform="rotate(30 5 10)" fill="url(#wheatGold)" />
            
            {/* Top grain */}
            <ellipse cx="0" cy="-21" rx="2.5" ry="4" fill="url(#wheatGold)" />
          </g>

          {/* 6. AI Neural Constellation Nodes & Microcircuit Points */}
          <g>
            <circle cx="28" cy="30" r="2.2" fill="#38bdf8" />
            <circle cx="72" cy="32" r="2.2" fill="#38bdf8" />
            <circle cx="26" cy="54" r="2" fill="#34d399" />
            <circle cx="74" cy="54" r="2" fill="#34d399" />
            
            {/* Digital Constellation Lines */}
            <line x1="28" y1="30" x2="40" y2="24" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" strokeDasharray="2 1" />
            <line x1="72" y1="32" x2="68" y2="27" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" strokeDasharray="2 1" />
            <line x1="26" y1="54" x2="36" y2="45" stroke="#34d399" strokeWidth="0.8" opacity="0.6" strokeDasharray="2 1" />
            <line x1="74" y1="54" x2="62" y2="44" stroke="#34d399" strokeWidth="0.8" opacity="0.6" strokeDasharray="2 1" />
          </g>

          {/* 7. Apex North Star (Algeria Hub Point) */}
          <polygon
            points="50,15 52,20 57,21 53,24 54,29 50,26 46,29 47,24 43,21 48,20"
            fill="#fde047"
          />
        </svg>
      </div>

      {/* Brand Typography with Responsive Truncation and Proper RTL Alignment */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden text-start rtl:text-right ltr:text-left">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className={`tracking-tight text-white leading-tight truncate ${iconDimensions.textClass}`}>
            {translations[lang].title}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 shrink-0">
            {isAr ? 'سيادية 100%' : '100% Sovereign'}
          </span>
        </div>

        {showSubtitle && (
          <p
            className={`text-slate-400 font-normal leading-tight mt-0.5 truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl text-start rtl:text-right ltr:text-left ${iconDimensions.subClass}`}
            title={isAr
              ? 'تكامل الاستشعار الفضائي (SolVision)، سحابة NeoCloud، وسلاسل الإمداد القارية'
              : 'Integrated Earth Observation, NeoCloud Infrastructure & Continental Logistics'}
          >
            {isAr
              ? 'تكامل الاستشعار الفضائي (SolVision)، سحابة NeoCloud، وسلاسل الإمداد القارية'
              : 'Integrated Earth Observation, NeoCloud Infrastructure & Continental Logistics'}
          </p>
        )}
      </div>
    </div>
  );
};
