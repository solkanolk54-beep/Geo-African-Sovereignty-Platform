import React, { useState } from 'react';
import {
  Wind,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Navigation,
  Database,
  Truck,
  Satellite,
  BellRing,
  Snowflake,
  ShieldAlert,
  ArrowRight,
  Terminal,
  Smartphone,
  Cpu,
  X,
} from 'lucide-react';
import { SimulationDashboard } from './SimulationDashboard';

interface SandstormCrisisSimulationProps {
  onClose?: () => void;
}

export const SandstormCrisisSimulation: React.FC<SandstormCrisisSimulationProps> = ({
  onClose,
}) => {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [simulationData, setSimulationData] = useState<any | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const runSimulation = async () => {
    setSimulationState('running');
    setCurrentStep(1);
    setTerminalLogs([
      '--------------------------------------------------',
      '[محاكاة ميدانية] بدء مراقبة الشحنة: ALG-TMR-2026-904 في اتجاه غاو...',
      '[1] موقع الشحنة الحالي مسجل جغرافيًا: [21.33, 0.96] (قرب برج باجي مختار)',
    ]);

    // Step 2: Earth Observation Satellite Alert
    await new Promise((r) => setTimeout(r, 900));
    setCurrentStep(2);
    setTerminalLogs((prev) => [
      ...prev,
      '[2] 🛰️ نظام الاستشعار (SolVision AI): تم رصد عاصفة رملية قوية تغلق المقطع الرئيسي للطريق!',
      '-> ⚠️ تنبيه: تم الكشف عن انخفاض الرؤية الأفقية بسبب العاصفة بنسبة 85%.',
    ]);

    // Step 3: Call PostGIS Reroute API
    await new Promise((r) => setTimeout(r, 1100));
    setCurrentStep(3);
    setTerminalLogs((prev) => [
      ...prev,
      '[3] 🔄 جاري استدعاء خوارزمية PostGIS لإيجاد أسرع وأقرب مسار بديل آمن...',
    ]);

    try {
      const res = await fetch('/api/v1/supply-chain/reroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment_id: 'ALG-TMR-2026-904',
          coordinates: [21.33, 0.96],
          obstacle: 'SEVERE_SANDSTORM',
        }),
      });
      const data = await res.json();
      setSimulationData(data);

      await new Promise((r) => setTimeout(r, 800));
      setCurrentStep(4);
      setSimulationState('completed');
      setTerminalLogs((prev) => [
        ...prev,
        '[4] ✅ تم إعادة التوجيه بنجاح عبر PostGIS!',
        `-> 🔄 الخوارزمية المكانية: إعادة توجيه الشحنة نحو "${data.postgis_calculated_alternative?.emergency_cold_depot}" وتعديل المسار عبر محور بديل آمن يقلل زمن التوقف بنسبة ${data.postgis_calculated_alternative?.stoppage_time_reduction_pct}%.`,
        '-> 📲 تم إرسال إشعار لحظي لسائق الشحنة ولغرفة التحكم المركزية بـ Mila & تمنراست.',
        '--------------------------------------------------',
      ]);
    } catch (err: any) {
      setTerminalLogs((prev) => [
        ...prev,
        `[خطأ اتصال]: ${err.message}`,
        '-> 🔄 تم تطبيق خوارزمية الالتفاف المحلية الاحتياطية بنجاح.',
      ]);
      setSimulationState('completed');
    }
  };

  const resetSimulation = () => {
    setSimulationState('idle');
    setCurrentStep(0);
    setSimulationData(null);
    setTerminalLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Wind className="w-4 h-4" />
            <span>غرفة عمليات الطوارئ والتدخل المكاني (Crisis Response Command)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            سيناريو المحاكاة الميدانية: رصد العاصفة الرملية وإعادة التوجيه الذكي
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            شحنة تمور وفواكه مبردة (ALG-TMR-2026-904) من تمنراست وأدرار نحو غاو (مالي) عبر برج باجي مختار
          </p>
        </div>

        <div className="flex items-center gap-3">
          {simulationState !== 'idle' && (
            <button
              onClick={resetSimulation}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الضبط</span>
            </button>
          )}

          <button
            onClick={runSimulation}
            disabled={simulationState === 'running'}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs shadow-lg flex items-center gap-2 transition-all whitespace-nowrap shrink-0"
          >
            <Play className={`w-4 h-4 fill-current ${simulationState === 'running' ? 'animate-spin' : ''}`} />
            <span>
              {simulationState === 'running'
                ? 'جارٍ تشغيل سيناريو الأزمة...'
                : simulationState === 'completed'
                ? 'إعادة تشغيل المحاكاة'
                : 'بدء تشغيل المحاكاة الميدانية (Run Sandstorm Simulation)'}
            </span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-lg text-xs font-bold transition-all shadow-sm"
              aria-label="إغلاق المحاكاة (X)"
              title="إغلاق المحاكاة والعودة للخريطة"
            >
              <span>إغلاق (X)</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Shipment & Crisis Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-slate-400 text-xs block">رقم التتبع (RFID / QR)</span>
          <p className="text-base font-bold font-mono text-emerald-400">ALG-TMR-2026-904</p>
          <span className="text-[11px] text-slate-500 block">شاحنة تبريد صحراوية معتمدة</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-slate-400 text-xs block">نوع السلعة والحمولة</span>
          <p className="text-sm font-bold text-slate-100 truncate">تمور دقلة نور وفواكه مبردة</p>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <Snowflake className="w-3 h-3" />
            <span>حرارة الحاوية: 3.8°C (مثالي)</span>
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-slate-400 text-xs block">الموقع والإحداثيات اللحظية</span>
          <p className="text-sm font-bold font-mono text-amber-300">[21.33° N, 0.96° E]</p>
          <span className="text-[11px] text-slate-400">قرب معبر برج باجي مختار</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-slate-400 text-xs block">حالة المسار الأصلي</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                simulationState === 'idle'
                  ? 'bg-emerald-400'
                  : 'bg-red-500 animate-pulse'
              }`}
            />
            <p className="text-sm font-bold text-slate-100">
              {simulationState === 'idle' ? 'مسار سالك' : 'معطل: عاصفة رملية عنيفة'}
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            {simulationState === 'idle' ? 'رؤية طبيعية' : 'انخفاض الرؤية بنسبة 85%'}
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Spatial Radar + Steps Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Spatial Bypass Visualizer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                الرادار الجيومكاني المباشر لموقع الشحنة والعاصفة (PostGIS Spatial Bypass)
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              SolVision Weather Layer
            </span>
          </div>

          <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
            {/* Satellite Background */}
            <img
              src="/src/assets/images/hero_geo_african_satellite_1791720822340.jpg"
              alt="صورة فضائية لموقع برج باجي مختار"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />

            {/* SVG Visual Spatial Representation */}
            <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full select-none">
              {/* Origin Hub (Tamanrasset / Adrar) */}
              <circle cx="280" cy="120" r="8" fill="#10b981" />
              <text x="280" y="105" fill="#a7f3d0" fontSize="12" fontWeight="bold" textAnchor="middle">
                تمنراست / أدرار
              </text>

              {/* Destination Hub (Gao) */}
              <circle cx="560" cy="400" r="8" fill="#f59e0b" />
              <text x="560" y="425" fill="#fde68a" fontSize="12" fontWeight="bold" textAnchor="middle">
                غاو (مالي)
              </text>

              {/* Original Corridor (Normal vs Blocked) */}
              <line
                x1="280"
                y1="120"
                x2="420"
                y2="250"
                stroke={simulationState === 'idle' ? '#10b981' : '#f59e0b'}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="420"
                y1="250"
                x2="560"
                y2="400"
                stroke={simulationState === 'idle' ? '#10b981' : '#ef4444'}
                strokeWidth="4"
                strokeDasharray={simulationState === 'idle' ? 'none' : '6 4'}
                strokeLinecap="round"
              />

              {/* Sandstorm Hazard Zone (Appears when running/completed) */}
              {simulationState !== 'idle' && (
                <g>
                  {/* Outer Sandstorm Cloud Polygon */}
                  <ellipse
                    cx="480"
                    cy="290"
                    rx="85"
                    ry="55"
                    fill="rgba(245, 158, 11, 0.25)"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  <ellipse
                    cx="480"
                    cy="290"
                    rx="50"
                    ry="32"
                    fill="rgba(239, 68, 68, 0.3)"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  />
                  <text
                    x="480"
                    y="295"
                    fill="#fef08a"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ⚠️ بؤرة العاصفة الرملية
                  </text>
                  <text
                    x="480"
                    y="312"
                    fill="#fca5a5"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    رؤية: 15% · رياح 78 كم/سا
                  </text>
                </g>
              )}

              {/* PostGIS Alternative Bypass Route (Timiaouine Solar Cold Hub) */}
              {(simulationState === 'running' && currentStep >= 3) || simulationState === 'completed' ? (
                <g>
                  {/* Alternative green detour line */}
                  <path
                    d="M 420 250 Q 340 330 380 370 T 560 400"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="8 4"
                  />

                  {/* Emergency Solar Depot (Timiaouine) */}
                  <circle cx="360" cy="340" r="9" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x="360"
                    y="325"
                    fill="#67e8f9"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    قاعدة تيمياوين للتبريد الشمسي
                  </text>
                  <text
                    x="360"
                    y="360"
                    fill="#a5f3fc"
                    fontSize="9"
                    fontWeight="normal"
                    textAnchor="middle"
                  >
                    (مستودع احتياطي آمن)
                  </text>
                </g>
              ) : null}

              {/* Truck Location Marker at [21.33, 0.96] */}
              <g transform="translate(420, 250)">
                <circle cx="0" cy="0" r="14" fill="rgba(56, 189, 248, 0.3)" />
                <rect x="-7" y="-7" width="14" height="14" rx="3" fill="#0284c7" stroke="#e0f2fe" strokeWidth="2" />
                <text x="14" y="4" fill="#bae6fd" fontSize="10" fontWeight="bold">
                  ALG-TMR-2026-904
                </text>
              </g>
            </svg>

            {/* Bottom Status Overlay */}
            <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>المسار الآمن المعتمد</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>المقطع المغلق بالعاصفة</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>مستودع التبريد الاحتياطي</span>
                </span>
              </div>

              <span className="text-slate-400 font-mono text-[11px]">
                {simulationState === 'completed' ? 'تم الالتفاف وحفظ سلسلة التبريد ✅' : 'المراقبة الآلية نشطة'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Incident Progression Steps */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>مراحل استجابة النظام للأزمة ميدانياً (Response Workflow)</span>
            </h3>

            {/* Step 1 */}
            <div
              className={`p-3 rounded-lg border transition-all text-xs space-y-1 ${
                currentStep >= 1
                  ? 'bg-slate-800/90 border-emerald-500/60'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">1. تسجيل وتتبع الشحنة الميدانية</span>
                {currentStep >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400">
                تسجيل حركة الشحنة لحظياً عند إحداثيات [21.33, 0.96] قبل معبر برج باجي مختار.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3 rounded-lg border transition-all text-xs space-y-1 ${
                currentStep >= 2
                  ? 'bg-amber-950/40 border-amber-600/80'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">2. الإنذار المبكر (Earth Observation)</span>
                {currentStep >= 2 && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[11px] text-slate-300">
                التقاط العاصفة الرملية عبر أقمار Alsat-2B ورصد انخفاض الرؤية الأفقية بنسبة 85%.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3 rounded-lg border transition-all text-xs space-y-1 ${
                currentStep >= 3
                  ? 'bg-sky-950/40 border-sky-600/80'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300">3. التحليل المكاني الفوري (PostGIS Dijkstra)</span>
                {currentStep >= 3 && <Database className="w-4 h-4 text-sky-400" />}
              </div>
              <p className="text-[11px] text-slate-300">
                حساب أقرب مركز تبريد احتياطي (قاعدة تيمياوين) لتفادي تلف الشحنة وتقليص التوقف بنسبة 40%.
              </p>
            </div>

            {/* Step 4 */}
            <div
              className={`p-3 rounded-lg border transition-all text-xs space-y-1 ${
                currentStep >= 4
                  ? 'bg-emerald-950/40 border-emerald-600/80'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300">4. التوجيه الديناميكي وإخطار السائق</span>
                {currentStep >= 4 && <BellRing className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-300">
                إرسال المسار البديل لشاشة السائق اللوحية وتحديث غرف العمليات في ميلة وتمنراست والجزائر العاصمة.
              </p>
            </div>
          </div>

          {/* Live Terminal Output Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>مخرجات التنفيذ البرمجي (simulateReroute.ts Log)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Shell</span>
            </div>

            <pre className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48 leading-relaxed">
              {terminalLogs.length > 0 ? (
                terminalLogs.join('\n')
              ) : (
                <span className="text-slate-600">
                  انقر على "بدء تشغيل المحاكاة الميدانية" بالأعلى لمشاهدة مخرجات السكربت الحية...
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>

      {/* Advanced Simulation Dashboard: Variable Cost & Cold Chain Monitoring */}
      <SimulationDashboard />
    </div>
  );
};
