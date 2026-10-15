import React, { useState } from 'react';
import { AGRICULTURAL_ZONES } from '../data/regionalData';
import { AgriculturalZone } from '../types/platform';
import {
  Satellite,
  Droplets,
  Sun,
  AlertCircle,
  Eye,
  Activity,
  Layers,
  Database,
  CheckCircle2,
  X,
} from 'lucide-react';

interface EarthObservationViewProps {
  onClose?: () => void;
}

export const EarthObservationView: React.FC<EarthObservationViewProps> = ({ onClose }) => {
  const [selectedZone, setSelectedZone] = useState<AgriculturalZone>(AGRICULTURAL_ZONES[0]);
  const [activeSpectralBand, setActiveSpectralBand] = useState<'ndvi' | 'ndwi' | 'thermal'>('ndvi');

  return (
    <div className="space-y-6">
      {/* Header and Mission Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Satellite className="w-5 h-5 text-emerald-400" />
            <span>طبقة الاستشعار الفضائي ورصد الموارد (Earth Observation & Agronomy)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            مراقبة الرقعة الزراعية والمياه الجوفية بالساحل والجنوب عبر منظومات SolVision وصور ميلة وSentinel-2
          </p>
        </div>

        {/* Spectral Band Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSpectralBand('ndvi')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSpectralBand === 'ndvi'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            مؤشر الغطاء النباتي (NDVI)
          </button>
          <button
            onClick={() => setActiveSpectralBand('ndwi')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSpectralBand === 'ndwi'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            مؤشر رطوبة المياه (NDWI)
          </button>
          <button
            onClick={() => setActiveSpectralBand('thermal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSpectralBand === 'thermal'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            البصمة الحرارية والإجهاد المائي
          </button>
        </div>

        {/* Prominent Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/90 text-red-200 border border-red-700/80 hover:border-red-600 rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
            aria-label="إغلاق رصد الأقمار الصناعية والعودة للخريطة (X)"
            title="إغلاق والعودة للخريطة (X)"
          >
            <span>إغلاق (X)</span>
            <X className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>

      {/* Main Grid: Zone Explorer + Visual Satellite Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Showcase Card with Generated Pivot Imagery */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="relative aspect-video bg-slate-950">
            <img
              src="/src/assets/images/smart_farm_sahel_pivot_1791720844553.jpg"
              alt="رصد محاور الري الدائرية بالصحراء عبر منظومة SolVision"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-200 font-mono">SolVision Drone + Alsat-2B Multispectral</span>
            </div>

            <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between text-slate-100">
              <div>
                <span className="text-xs text-emerald-400 font-semibold tracking-wide">
                  {selectedZone.region}
                </span>
                <h3 className="text-lg font-bold mt-0.5">{selectedZone.nameAr}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedZone.groundwaterSource}</p>
              </div>

              <div className="text-left bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">مستوى احتياطي المياه</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {selectedZone.aquiferReserveLevelPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Spectral Metrics for the Zone */}
          <div className="p-5 grid grid-cols-3 gap-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">مؤشر اخضرار المحصول (NDVI)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {selectedZone.ndviCurrent}
                </span>
                <span className="text-[11px] text-slate-500">/ 1.0</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${selectedZone.ndviCurrent * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">مؤشر رطوبة التربة (NDWI)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-sky-400">
                  {selectedZone.ndwiWaterIndex}
                </span>
                <span className="text-[11px] text-slate-500">/ 1.0</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{ width: `${selectedZone.ndwiWaterIndex * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">خطر الجفاف الموسمي</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-sm font-bold ${
                    selectedZone.droughtRisk === 'low'
                      ? 'text-emerald-400'
                      : selectedZone.droughtRisk === 'moderate'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {selectedZone.droughtRisk === 'low'
                    ? 'منخفض (مستقر)'
                    : selectedZone.droughtRisk === 'moderate'
                    ? 'متوسط'
                    : 'مرتفع (إنذار مبكر)'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedZone.pivotsCount} محور ري نشط
              </span>
            </div>
          </div>
        </div>

        {/* Zone Selection & Early Warning Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>الأحواض الزراعية والمائية المرصودة</span>
              <span className="text-xs text-slate-500 font-normal">اختر الحوض للتحليل</span>
            </h3>

            <div className="space-y-2">
              {AGRICULTURAL_ZONES.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{zone.nameAr}</span>
                      <span
                        className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                          zone.droughtRisk === 'low'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-red-950 text-red-400'
                        }`}
                      >
                        {zone.droughtRisk === 'low' ? 'وفرة مائية' : 'عجز مائي'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                      <span>الإنتاج: {(zone.annualOutputTons / 1000).toFixed(0)} ألف طن</span>
                      <span aria-hidden="true">·</span>
                      <span>{zone.primaryCrops.slice(0, 2).join('، ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mila Geospatial & SolVision Integration Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>محطة صور ميلة وSolVision (الرصد الدقيق)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تدمج المنصة صور الأقمار الصناعية الجزائرية <strong>Alsat-1B/2B</strong> وبيانات الرادار <strong>Sentinel-1</strong> مع محطة <strong>صور ميلة</strong> لمتابعة سلامة السدود ومستويات التبخر، وتزود منظومة <strong>فلاح تيك</strong> بتوصيات فورية لحصص السقي ومنع هدر المياه في الصحراء.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-emerald-400 font-mono border-t border-slate-800/60">
              <span>معدل التحديث الفضائي: كل 5 أيام</span>
              <span>خوارزمية تصحيح السحب: مفعلة 100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
