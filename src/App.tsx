import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { InteractiveMap } from './components/InteractiveMap';
import { EarthObservationView } from './components/EarthObservationView';
import { SupplyChainTracker } from './components/SupplyChainTracker';
import { AgriculturalExportAnalytics } from './components/AgriculturalExportAnalytics';
import { InventoryManagementDashboard } from './components/InventoryManagementDashboard';
import { PredictiveAiEngine } from './components/PredictiveAiEngine';
import { OfflineSyncEngine } from './components/OfflineSyncEngine';
import { SovereignCloudHub } from './components/SovereignCloudHub';
import { BackendApiDocs } from './components/BackendApiDocs';
import { SandstormCrisisSimulation } from './components/SandstormCrisisSimulation';
import { LiveKpiMetricsModule } from './components/LiveKpiMetricsModule';
import { SystemArchitectureModal } from './components/SystemArchitectureModal';
import { translations, Language } from './locales/translations';
import { Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('gis-map');
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>('ar');

  const t = translations[lang];
  const isAr = lang === 'ar';

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Bar with Sovereign Logo & Language Switcher */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Editorial Strategic Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>{t.banner.badge}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal">{t.banner.subbadge}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {t.banner.headline}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {t.banner.description}
            </p>
          </div>

          {/* Key Quantitative Metrics Strip */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block">{t.banner.metricLogistics}</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                1.85M {isAr ? 'طن متري' : 'MT'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{t.banner.metricLogisticsSub}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{t.banner.metricCorridor}</span>
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                2,315 {isAr ? 'كم' : 'km'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{t.banner.metricCorridorSub}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{t.banner.metricSensing}</span>
              <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
                0.3m / 10m
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{t.banner.metricSensingSub}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{t.banner.metricSovereignty}</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                100% {isAr ? 'وطنية' : 'National'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{t.banner.metricSovereigntySub}</span>
            </div>
          </div>
        </section>

        {/* Dynamic View Component */}
        {activeTab === 'gis-map' && (
          <InteractiveMap
            onOpenAiPlanner={() => setActiveTab('predictive-ai')}
            onSelectShipment={() => setActiveTab('supply-chain')}
            onOpenAgriAnalytics={() => setActiveTab('agri-exports')}
            onOpenSiloInventory={() => setActiveTab('silo-inventory')}
            onOpenNationalKpi={() => setActiveTab('national-kpi')}
          />
        )}

        {activeTab === 'earth-observation' && (
          <EarthObservationView onClose={() => setActiveTab('gis-map')} />
        )}

        {activeTab === 'supply-chain' && (
          <SupplyChainTracker onClose={() => setActiveTab('gis-map')} />
        )}

        {activeTab === 'agri-exports' && (
          <AgriculturalExportAnalytics onClose={() => setActiveTab('gis-map')} />
        )}

        {activeTab === 'silo-inventory' && (
          <InventoryManagementDashboard
            onOpenSupplyChain={() => setActiveTab('supply-chain')}
            onOpenAgriExports={() => setActiveTab('agri-exports')}
            onOpenMap={() => setActiveTab('gis-map')}
            onClose={() => setActiveTab('gis-map')}
          />
        )}

        {activeTab === 'predictive-ai' && (
          <PredictiveAiEngine onClose={() => setActiveTab('gis-map')} />
        )}

        {activeTab === 'offline-sync' && (
          <OfflineSyncEngine onClose={() => setActiveTab('gis-map')} />
        )}

        {activeTab === 'sovereign-cloud' && (
          <SovereignCloudHub onClose={() => setActiveTab('gis-map')} />
        )}

        {activeTab === 'sandstorm-crisis' && (
          <SandstormCrisisSimulation onClose={() => setActiveTab('gis-map')} />
        )}

        {activeTab === 'national-kpi' && (
          <LiveKpiMetricsModule
            onClose={() => setActiveTab('gis-map')}
            lang={lang}
            onNavigateToMap={() => setActiveTab('gis-map')}
          />
        )}

        {activeTab === 'backend-api' && (
          <BackendApiDocs onClose={() => setActiveTab('gis-map')} />
        )}
      </main>

      {/* Architecture Deep Dive Modal */}
      <SystemArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400 mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-300 font-semibold">
              {t.footer.rights}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{t.footer.poweredBy}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{isAr ? 'تكامل Sol-Ecosystem وSolVision ومنظومة كريمة ومحطة ميلة وفلاح تيك' : 'Integrated Sol-Ecosystem, SolVision, Karima & FellahTech'}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>{t.footer.version}</span>
            <span>v2026.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
