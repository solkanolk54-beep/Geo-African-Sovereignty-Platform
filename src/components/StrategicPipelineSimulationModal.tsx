import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Flame,
  Droplets,
  Zap,
  Gauge,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface StrategicPipelineSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategicPipelineSimulationModal: React.FC<StrategicPipelineSimulationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [pipelineType, setPipelineType] = useState<'tsgp-gas' | 'albian-water'>('tsgp-gas');
  const [simState, setSimState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [flowProgress, setFlowProgress] = useState<number>(0);
  const [simStep, setSimStep] = useState<number>(0);
  const [flowLogs, setFlowLogs] = useState<string[]>([]);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const runPipelineSimulation = () => {
    setSimState('running');
    setFlowProgress(10);
    setSimStep(1);
    setFlowLogs([
      '-------------------------------------------------------',
      pipelineType === 'tsgp-gas'
        ? '[محاكاة الأنبوب الاستراتيجي TSGP] تهيئة محطات الضخ المركزية بحاسي الرمل ومحور الجنوب...'
        : '[محاكاة أنبوب التحويل المائي الألبياني] بدء تشغيل الآبار العميقة بحوض الألبيان (عين صالح)...',
    ]);

    setTimeout(() => {
      setFlowProgress(40);
      setSimStep(2);
      setFlowLogs((prev) => [
        ...prev,
        pipelineType === 'tsgp-gas'
          ? '[مستوى 1] الضغط المستقر: 84.5 بار - انسياب 82.4M م³ غاز يومياً لتغذية محطات توليد الطاقة وتبريد الصوامع.'
          : '[مستوى 1] تدفق 96,500 م³ مياه عذبة نقية يومياً نحو خزان عين صالح والتغذية المستمرة لمحور أراك.',
      ]);
    }, 700);

    setTimeout(() => {
      setFlowProgress(75);
      setSimStep(3);
      setFlowLogs((prev) => [
        ...prev,
        pipelineType === 'tsgp-gas'
          ? '[مستوى 2] عبور تمنراست وعين قزام نحو أغاديز ونيامي: تأمين الطاقة لمحطات التبريد القارية وتثبيت شبكات الكهرباء المشتركة.'
          : '[مستوى 2] وصول الضخ إلى خزانات تمنراست الاستراتيجية: تأمين الري المستدام للدوائر الزراعية المحورية وسقاية القوافل.',
      ]);
    }, 1500);

    setTimeout(() => {
      setFlowProgress(100);
      setSimStep(4);
      setSimState('completed');
      setFlowLogs((prev) => [
        ...prev,
        '✅ اكتملت محاكاة التدفق الاستراتيجي بنجاح تام بنسبة كفاءة 99.8%.',
        '-> منظومة المراقبة السيادية (AtlasCloud SCADA): كافة الصمامات ومحطات الطاقة تعمل بالحالة الاسمية (Nominal).',
        '-------------------------------------------------------',
      ]);
    }, 2300);
  };

  const resetSimulation = () => {
    setSimState('idle');
    setFlowProgress(0);
    setSimStep(0);
    setFlowLogs([]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Clear X Close Button */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {pipelineType === 'tsgp-gas' ? <Flame className="w-5 h-5 text-amber-400" /> : <Droplets className="w-5 h-5 text-sky-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  محاكاة التدفق الاستراتيجي
                </span>
                <span className="text-xs text-slate-400">| Trans-Saharan Strategic Pipeline Simulation</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mt-1">
                {pipelineType === 'tsgp-gas'
                  ? 'محاكاة الأنبوب الاستراتيجي العابر للصحراء (TSGP - الغاز والطاقة النظيفة)'
                  : 'محاكاة أنبوب التحويل المائي الاستراتيجي (حوض الألبيان - عين صالح - تمنراست)'}
              </h3>
            </div>
          </div>

          {/* Prominent X Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-xl text-xs font-bold transition-all shadow-sm group shrink-0"
            aria-label="إغلاق المحاكاة (X)"
            title="إغلاق المحاكاة والعودة للخريطة (اضغط X أو Esc)"
          >
            <span>إغلاق (X)</span>
            <X className="w-5 h-5 text-red-400 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Pipeline Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              setPipelineType('tsgp-gas');
              resetSimulation();
            }}
            className={`p-4 rounded-xl border text-right transition-all flex items-start gap-3 ${
              pipelineType === 'tsgp-gas'
                ? 'bg-amber-950/30 border-amber-500/60 text-white shadow-lg shadow-amber-950/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Flame className={`w-5 h-5 shrink-0 mt-0.5 ${pipelineType === 'tsgp-gas' ? 'text-amber-400' : 'text-slate-500'}`} />
            <div>
              <p className="font-bold text-sm text-slate-100">
                أنبوب الغاز والطاقة الاستراتيجي (TSGP)
              </p>
              <p className="text-xs text-slate-400 mt-1">
                4,128 كم: شريان الطاقة لتشغيل محطات التوليد وسلاسل التبريد بين نيجيريا، النيجر، والجزائر.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setPipelineType('albian-water');
              resetSimulation();
            }}
            className={`p-4 rounded-xl border text-right transition-all flex items-start gap-3 ${
              pipelineType === 'albian-water'
                ? 'bg-sky-950/30 border-sky-500/60 text-white shadow-lg shadow-sky-950/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Droplets className={`w-5 h-5 shrink-0 mt-0.5 ${pipelineType === 'albian-water' ? 'text-sky-400' : 'text-slate-500'}`} />
            <div>
              <p className="font-bold text-sm text-slate-100">
                أنبوب التحويل المائي الألبياني الاستراتيجي
              </p>
              <p className="text-xs text-slate-400 mt-1">
                750 كم: نقل 100,000 م³ مياه جوفية عذبة يومياً من عين صالح لتأمين تمنراست والدوائر الزراعية.
              </p>
            </div>
          </button>
        </div>

        {/* Live Simulation Progress Visualizer */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>مؤشر تدفق السوائل والغاز عبر الأنبوب:</span>
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{flowProgress}%</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                pipelineType === 'tsgp-gas'
                  ? 'bg-gradient-to-r from-amber-500 via-emerald-400 to-sky-400 shadow-md shadow-amber-500/30'
                  : 'bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 shadow-md shadow-sky-500/30'
              }`}
              style={{ width: `${flowProgress}%` }}
            />
          </div>

          {/* Stepper Node Points */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[11px]">
            <div className={`p-2 rounded-lg border ${simStep >= 1 ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <span className="block font-bold">المصدر / الضخ</span>
              <span className="text-[10px] text-slate-400">حاسي الرمل / عين صالح</span>
            </div>
            <div className={`p-2 rounded-lg border ${simStep >= 2 ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <span className="block font-bold">الضغط الصحراوي</span>
              <span className="text-[10px] text-slate-400">محطة أراك والمحاور</span>
            </div>
            <div className={`p-2 rounded-lg border ${simStep >= 3 ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <span className="block font-bold">قاعدة تمنراست</span>
              <span className="text-[10px] text-slate-400">تغذية الصوامع والتبريد</span>
            </div>
            <div className={`p-2 rounded-lg border ${simStep >= 4 ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <span className="block font-bold">العمق الإفريقي</span>
              <span className="text-[10px] text-slate-400">النيجر والساحل</span>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>معدل الضخ اليومي</span>
            </span>
            <p className="text-base font-bold font-mono text-slate-100 mt-1">
              {pipelineType === 'tsgp-gas' ? '82.4M م³ / يومياً' : '96,500 م³ / يومياً'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>تغذية الطاقة للمخازن</span>
            </span>
            <p className="text-base font-bold font-mono text-emerald-400 mt-1">
              {pipelineType === 'tsgp-gas' ? '1,200 ميغاوات مكافئ' : '100% اكتفاء ذاتي'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>مؤشر الأمان والسلامة</span>
            </span>
            <p className="text-base font-bold font-mono text-sky-400 mt-1">
              99.8% (مؤمن سيادياً)
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span>انخفاض تكلفة التبريد</span>
            </span>
            <p className="text-base font-bold font-mono text-purple-300 mt-1">
              -42% عبر الطاقة المستدامة
            </p>
          </div>
        </div>

        {/* Live Terminal Output Console */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-2">
            <span>سجل عمليات المحاكاة اللحظية (SCADA Simulation Telemetry):</span>
            <span className="text-[11px] text-emerald-400">AtlasCloud NeoCloud Node #1</span>
          </div>
          <div className="h-28 overflow-y-auto space-y-1 text-slate-300 text-[11px]">
            {flowLogs.length === 0 ? (
              <span className="text-slate-500 italic">
                اضغط على زر &quot;تشغيل محاكاة التدفق&quot; لبدء ضخ واختبار مسار الأنبوب الاستراتيجي...
              </span>
            ) : (
              flowLogs.map((log, index) => (
                <p key={index} className="leading-relaxed">
                  {log}
                </p>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions with Explicit X Close Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={runPipelineSimulation}
              disabled={simState === 'running'}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Play className={`w-4 h-4 fill-current ${simState === 'running' ? 'animate-spin' : ''}`} />
              <span>
                {simState === 'running'
                  ? 'جارٍ تشغيل التدفق...'
                  : simState === 'completed'
                  ? 'إعادة تشغيل المحاكاة'
                  : 'بدء تشغيل محاكاة الأنبوب الاستراتيجي'}
              </span>
            </button>

            {simState !== 'idle' && (
              <button
                onClick={resetSimulation}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>

          {/* Prominent Footer Close Button */}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>إغلاق المحاكاة (X) والعودة للخريطة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
