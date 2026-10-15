import React, { useState } from 'react';
import {
  Snowflake,
  Coins,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Thermometer,
  ShieldCheck,
  X,
  Activity,
} from 'lucide-react';
import { translations, Language } from '../locales/translations';

interface SimulationDashboardProps {
  onClose?: () => void;
  lang?: Language;
}

export const SimulationDashboard: React.FC<SimulationDashboardProps> = ({
  onClose,
  lang = 'ar',
}) => {
  const [simulationState, setSimulationState] = useState<'IDLE' | 'RUNNING' | 'SANDSTORM_ALERT' | 'REROUTED'>('IDLE');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({
    temp: -18.5, // درجة حرارة المبردة بالـ مئوية
    costDZD: 145000, // التكلفة التقديرية بالدينار الجزائري
    distanceKm: 1250 // المسافة المتبقية
  });

  const isAr = lang === 'ar';
  const t = translations[lang];

  const addLog = (msg: string) => {
    setLogMessages(prev => [msg, ...prev]);
  };

  const startSimulation = () => {
    setSimulationState('RUNNING');
    setLogMessages([]);
    setMetrics({ temp: -18.5, costDZD: 145000, distanceKm: 1250 });
    
    if (isAr) {
      addLog('[00:01] 🚀 بدء رحلة الشحنة المبردة (RFID: ALG-TMR-2026-904) من أدرار نحو غاو (مالي).');
      addLog('[00:02] ❄️ حالة التبريد مستقرة (-18.5°م). نظام مراقبة سلسلة التبريد يعمل بكفاءة.');
    } else {
      addLog('[00:01] 🚀 Reefer convoy dispatched (RFID: ALG-TMR-2026-904) from Adrar towards Gao (Mali).');
      addLog('[00:02] ❄️ Cold chain nominal (-18.5°C). Dual-compressor solar telemetry active.');
    }

    setTimeout(() => {
      setSimulationState('SANDSTORM_ALERT');
      setMetrics(prev => ({ ...prev, temp: -16.2 })); // ارتفاع طفيف نتيجة التوقف
      if (isAr) {
        addLog('[00:04] ⚠️ تحذير (SolVision AI): تم رصد عاصفة رملية عنيفة تعيق المقطع الرئيسي للطريق!');
        addLog('[00:04] 🔴 تلوين المسار باللون الأحمر: إيقاف الحركة المؤقتة. ارتفاع طفيف في حرارة الحاوية إلى -16.2°م.');
      } else {
        addLog('[00:04] ⚠️ Warning (SolVision AI): Severe sandstorm detected blocking primary corridor sector!');
        addLog('[00:04] 🔴 Route highlighted RED: Convoy paused. Container temperature slightly rose to -16.2°C.');
      }
    }, 3000);

    setTimeout(() => {
      setSimulationState('REROUTED');
      setMetrics({ temp: -18.0, costDZD: 158000, distanceKm: 1310 }); // إضافة تكلفة ومسافة الالتفاف مع تبريد مستقر
      if (isAr) {
        addLog('[00:07] 🔄 خوارزمية PostGIS المكانية: حساب المسار البديل عبر محطة التبريد الشمسية.');
        addLog('[00:07] 🟢 تلوين المسار باللون الأخضر: استئناف المسار الآمن. إعادة ضبط التبريد إلى -18.0°م.');
        addLog('[00:07] 💰 تحديث الموازنة: إضافة 13,000 دج تكلفة التفاف لتفادي تلف السلع (حماية الحصص الغذائية).');
      } else {
        addLog('[00:07] 🔄 PostGIS Spatial Engine: Alternative bypass calculated via Solar Refrigeration Hub.');
        addLog('[00:07] 🟢 Route highlighted GREEN: Safe transit resumed. Cold chain re-stabilized at -18.0°C.');
        addLog('[00:07] 💰 Budget Update: +13,000 DZD detour fuel/op cost added to safeguard strategic food cargo.');
      }
    }, 6500);
  };

  return (
    <div
      className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-white shadow-xl space-y-6"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Snowflake className="w-4 h-4 text-cyan-400" />
            <span>{t.sim.coldChainBadge}</span>
          </div>
          <h3 className="text-xl font-bold text-emerald-400">{t.sim.headerTitle}</h3>
          <p className="text-sm text-slate-400 mt-1">{t.sim.headerDesc}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={startSimulation}
            disabled={simulationState === 'RUNNING' || simulationState === 'SANDSTORM_ALERT'}
            className={`px-5 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 text-xs shadow-lg ${
              simulationState === 'RUNNING' || simulationState === 'SANDSTORM_ALERT'
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {simulationState === 'IDLE' ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.startSim}</span>
              </>
            ) : simulationState === 'REROUTED' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.reSim}</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>{t.simulating}</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/90 text-red-200 border border-red-700/80 rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
              aria-label={t.sim.closeBtn}
              title={t.sim.closeBtn}
            >
              <span>{t.sim.closeBtn}</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Alert banner for Sandstorm and Detour state */}
      {simulationState === 'SANDSTORM_ALERT' && (
        <div className="bg-red-950/60 border border-red-600 rounded-lg p-3 text-xs flex items-center justify-between text-red-200 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-bold">{t.sim.alertBanner}</span>
          </div>
          <span className="font-mono bg-red-900/80 px-2 py-0.5 rounded border border-red-500 text-[11px]">
            {isAr ? `ارتفاع الحرارة إلى ${metrics.temp}°م` : `Temp rose to ${metrics.temp}°C`}
          </span>
        </div>
      )}

      {simulationState === 'REROUTED' && (
        <div className="bg-emerald-950/60 border border-emerald-600 rounded-lg p-3 text-xs flex items-center justify-between text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{t.sim.rerouteSuccess}</span>
          </div>
          <span className="font-mono bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500 text-[11px]">
            {isAr ? `استقرار التبريد عند ${metrics.temp}°م` : `Stabilized at ${metrics.temp}°C`}
          </span>
        </div>
      )}

      {/* لوحة المؤشرات المتقدمة (الحرارة، التكلفة، المسافة) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cold Chain Temperature */}
        <div className={`p-4 rounded-lg border transition-all ${
          metrics.temp > -17
            ? 'bg-amber-950/50 border-amber-500 shadow-md shadow-amber-900/20'
            : 'bg-slate-800/90 border-slate-700'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <span>{t.temp}</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
              metrics.temp <= -18
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'bg-amber-950 text-amber-300 border border-amber-600'
            }`}>
              {metrics.temp <= -18 ? t.sim.tempStable : t.sim.tempFluctuate}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 flex items-center gap-2 mt-1">
            <span>{metrics.temp}{isAr ? '°م' : '°C'}</span>
            {metrics.temp > -17 && <span className="text-amber-400 text-lg">⚠️</span>}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-700/60 pt-2">
            <span>{t.sim.tempTarget}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.sim.foodSafe}</span>
            </span>
          </div>
        </div>

        {/* Estimated Cost (DZD) */}
        <div className="p-4 rounded-lg border bg-slate-800/90 border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{t.cost}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
              {t.sim.costSub}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {metrics.costDZD.toLocaleString()} {isAr ? 'دج' : 'DZD'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-700/60 pt-2">
            <span>{t.sim.costDiff}</span>
            <span className={`font-mono font-bold ${simulationState === 'REROUTED' ? 'text-amber-400' : 'text-slate-300'}`}>
              {simulationState === 'REROUTED' ? t.sim.costExtra : t.sim.costStandard}
            </span>
          </div>
        </div>

        {/* Remaining Distance */}
        <div className="p-4 rounded-lg border bg-slate-800/90 border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>{t.distance}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
              {t.sim.corridorSub}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {metrics.distanceKm} {isAr ? 'كم' : 'km'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-700/60 pt-2">
            <span>{t.sim.deviation}</span>
            <span className={`font-mono font-bold ${simulationState === 'REROUTED' ? 'text-cyan-400' : 'text-slate-300'}`}>
              {simulationState === 'REROUTED' ? t.sim.deviationExtra : t.sim.deviationStandard}
            </span>
          </div>
        </div>
      </div>

      {/* سجل الأحداث اللحظي */}
      <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="text-slate-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.logsTitle}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">RFID: ALG-TMR-2026-904</span>
        </div>

        <div className="h-48 overflow-y-auto space-y-1.5 pr-1">
          {logMessages.length === 0 ? (
            <div className="text-slate-600 italic py-6 text-center">
              {t.idleLog}
            </div>
          ) : (
            logMessages.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded border text-xs leading-relaxed ${
                  log.includes('🔴') || log.includes('⚠️')
                    ? 'bg-red-950/40 border-red-900/60 text-red-200'
                    : log.includes('🟢') || log.includes('💰')
                    ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
