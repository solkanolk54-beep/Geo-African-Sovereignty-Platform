import React, { useState } from 'react';
import { Cpu, Menu, X, Globe } from 'lucide-react';
import { SovereignLogo } from './SovereignLogo';
import { translations, Language } from '../locales/translations';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenArchitecture: () => void;
  lang?: Language;
  onToggleLang?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenArchitecture,
  lang = 'ar',
  onToggleLang,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[lang];
  const isAr = lang === 'ar';

  const navItems = [
    { id: 'gis-map', label: t.nav.gisMap },
    { id: 'national-kpi', label: (t.nav as any).nationalKpi || (isAr ? 'مؤشرات السيادة والأمن الغذائي' : 'National Food Sovereignty KPIs') },
    { id: 'earth-observation', label: t.nav.earthObservation },
    { id: 'supply-chain', label: t.nav.supplyChain },
    { id: 'agri-exports', label: t.nav.agriExports },
    { id: 'silo-inventory', label: t.nav.siloInventory },
    { id: 'predictive-ai', label: t.nav.predictiveAi },
    { id: 'offline-sync', label: t.nav.offlineSync },
    { id: 'sovereign-cloud', label: t.nav.sovereignCloud },
    { id: 'sandstorm-crisis', label: t.nav.sandstormCrisis },
    { id: 'backend-api', label: t.nav.backendApi },
  ];

  return (
    <header
      className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Responsive Flexible Header Container (flex-col on mobile, flex-row on md+) */}
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-4 px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Zone 1: Sovereign Logo & Mobile Controls Header Row */}
        <div className="flex items-center justify-between gap-2.5 min-w-0 w-full md:w-auto">
          <SovereignLogo
            size="md"
            lang={lang}
            onClick={() => setActiveTab('gis-map')}
            className="cursor-pointer min-w-0 flex-1 overflow-hidden"
          />

          {/* Quick Mobile Controls (Language Switcher & Hamburger Toggle) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0 rtl:flex-row ltr:flex-row">
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-mono font-bold text-emerald-400 transition-all shadow-sm flex items-center gap-1 shrink-0"
                aria-label={isAr ? 'تبديل اللغة إلى الإنجليزية' : 'Switch to Arabic'}
                title={isAr ? 'Switch language to English' : 'التحويل إلى اللغة العربية'}
              >
                <span>{isAr ? 'EN' : 'عربي'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors shrink-0"
              aria-label={isMobileMenuOpen ? t.nav.closeMenu : 'القائمة'}
              title={isMobileMenuOpen ? t.nav.closeMenu : 'القائمة'}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-red-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Zone 2: Clean single-line navigation links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-4 text-xs lg:text-sm font-medium text-slate-400 shrink-0">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === item.id
                  ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
          {/* Dropdown / Overflow trigger for remaining items */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 text-xs font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-800 whitespace-nowrap"
          >
            <span>{isAr ? 'المزيد من النظم...' : 'More modules...'}</span>
          </button>
        </nav>

        {/* Zone 3: Actions + Desktop Language Switcher + Close Button */}
        <div
          className={`items-center justify-between md:justify-end gap-2 shrink-0 w-full md:w-auto ${
            activeTab !== 'gis-map'
              ? 'flex pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80'
              : 'hidden md:flex'
          }`}
        >
          {/* Language Switcher Toggle (Desktop) */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="hidden md:flex px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/80 rounded-xl text-xs font-mono font-bold text-emerald-400 transition-all shadow-sm items-center gap-1.5 shrink-0"
              aria-label={isAr ? 'تبديل اللغة إلى الإنجليزية' : 'Switch to Arabic'}
              title={isAr ? 'Switch language to English' : 'التحويل إلى اللغة العربية'}
            >
              <span>{isAr ? 'English 🌐' : 'العربية 🌐'}</span>
            </button>
          )}

          {/* Prominent Close View button when not on main GIS Map */}
          {activeTab !== 'gis-map' && (
            <button
              onClick={() => setActiveTab('gis-map')}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-700/80 text-red-200 rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
              aria-label={t.nav.closeView}
              title={t.nav.closeView}
            >
              <span>{t.nav.closeView}</span>
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}

          {/* Architecture Modal Button */}
          <button
            onClick={onOpenArchitecture}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 rounded-lg hover:bg-emerald-900/40 transition-colors whitespace-nowrap shrink-0"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t.nav.architecture}</span>
          </button>

          {/* Tablet/Medium Screen Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hidden md:flex xl:hidden p-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors shrink-0"
            aria-label={isMobileMenuOpen ? t.nav.closeMenu : 'القائمة'}
            title={isMobileMenuOpen ? t.nav.closeMenu : 'القائمة'}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-red-400" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile & Overflow Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400">{t.nav.menuTitle}</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold bg-red-950/40 px-2.5 py-1 rounded border border-red-900/60"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.nav.closeMenu}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-[60vh] overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-start rtl:text-right ltr:text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60 font-bold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {activeTab === item.id && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
            {activeTab !== 'gis-map' && (
              <button
                onClick={() => {
                  setActiveTab('gis-map');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full sm:flex-1 py-2.5 px-3 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>{isAr ? 'إغلاق هذا القسم والعودة للخريطة' : 'Close this view and return to map'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenArchitecture();
                setIsMobileMenuOpen(false);
              }}
              className="w-full sm:flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.nav.architecture}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
