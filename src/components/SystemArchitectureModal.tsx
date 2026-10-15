import React from 'react';
import { Cpu, X, Server, Layers, Database, ArrowDown, Network, Shield } from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                المعمارية التقنية والبرمجية للمنصة (System Architecture)
              </h3>
              <p className="text-xs text-slate-400">
                نظام Microservices جيومكاني سيادي موزع على سحابة AtlasCloud وNeoCloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 space-y-6 font-mono text-xs">
          {/* Layer 1: Data Ingestion */}
          <div className="text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-widest block mb-2 font-sans font-semibold">
              طبقة مصادر البيانات الميدانية والفضائية (Data Ingestion Layer)
            </span>
            <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-300">
                أقمار صناعية (Alsat / Sentinel)
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sky-300">
                أجهزة IoT ومحطات الري بالصحراء
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-300">
                مدخلات ميدانية (Offline-First)
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Layer 2: API Gateway */}
          <div className="max-w-md mx-auto p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center">
            <div className="font-bold text-emerald-300 text-sm">
              API Gateway (Kong / Nginx Sovereignty Ingress)
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">
              إدارة المصادقة، التوجيه، التشفير السيادي، والتحكم في التدفق
            </div>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Layer 3: Microservices */}
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-widest block mb-2 text-center font-sans font-semibold">
              الخدمات الأساسية المستقلة (Core Microservices)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-bold text-emerald-400 text-xs">
                  GIS & Spatial Analytics Engine
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  معالجة الصور الفضائية (Raster data)، تحليلات التداخل المكاني، ومؤشرات الجفاف والرطوبة (NDVI, NDWI).
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-bold text-sky-400 text-xs">
                  Supply Chain & Logistics Service
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  إدارة نقاط التجميع بالموانئ الجافة (تمنراست/أدرار)، تتبع أساطيل التبريد (منظومة كريمة)، ومعابر الساحل.
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-bold text-purple-400 text-xs">
                  Predictive AI Engine (Gemini)
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  التنبؤ المبكر بالأزمات والاحتياجات الغذائية، الموازنة بين العرض والطلب الإقليمي، وإعادة التوجيه الذكي.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Layer 4: Storage & Caching Layer */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="font-bold text-slate-200 text-xs text-center font-sans">
              طبقة البيانات والمزامنة (Distributed Data Layer on AtlasCloud)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-emerald-400 font-bold block">PostgreSQL + PostGIS</span>
                <span className="text-[10px] text-slate-400 font-sans">قواعد البيانات الجغرافية والإحداثيات</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-red-400 font-bold block">Redis Cache & Queues</span>
                <span className="text-[10px] text-slate-400 font-sans">معالجة الخرائط وحالة الشحنات لحظياً</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-sky-400 font-bold block">Object Storage (GeoTIFF)</span>
                <span className="text-[10px] text-slate-400 font-sans">تخزين صور الأقمار الصناعية الوطنية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Explanation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>السيادة على البيانات (Data Sovereignty)</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              التخلص التام من التبعية للخوادم والمنصات الخارجية في إدارة الموارد. تم بناء وتوطين كافة الخوادم والخرائط الجيومكانية محلياً في الجزائر (سحابة NeoCloud وAtlasCloud) مع تشفير متقدم يمنع استغلال بيانات الأمن الغذائي.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="font-bold text-sky-400 flex items-center gap-2">
              <Network className="w-4 h-4" />
              <span>التكامل مع المنظومات الميدانية والوطنية</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              ربط مباشر ومحمي عبر واجهات API مع منظومة <strong>SolVision</strong> للمحاور الفلاحية، ومنظومة <strong>كريمة</strong> للتوزيع اللوجستي، ومحطة <strong>صور ميلة</strong> للسدود والأقمار الصناعية، وبوابة <strong>فلاح تيك (fllah.dz)</strong> لربط المستثمرين والتعاونيات بسلاسل الإمداد.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
        >
          إغلاق نافذة المعمارية التقنية
        </button>
      </div>
    </div>
  );
};
