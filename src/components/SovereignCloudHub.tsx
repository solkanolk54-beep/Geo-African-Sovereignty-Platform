import React, { useState, useEffect } from 'react';
import { SOVEREIGN_CLOUD_SYSTEMS } from '../data/regionalData';
import { CloudSystemInfo } from '../types/platform';
import {
  Cloud,
  Server,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Cpu,
  Layers,
  Database,
  Satellite,
  Activity,
  X,
} from 'lucide-react';

interface SovereignCloudHubProps {
  onClose?: () => void;
}

export const SovereignCloudHub: React.FC<SovereignCloudHubProps> = ({ onClose }) => {
  const [cloudData, setCloudData] = useState<any | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const fetchSystems = async () => {
    setIsPinging(true);
    try {
      const res = await fetch('/api/cloud-systems');
      const data = await res.json();
      setCloudData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-400" />
            <span>السحابة السيادية الوطنية وتكامل المنظومات (AtlasCloud & NeoCloud Hub)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            السيادة الرقمية الإفريقية التامة: خوادم وطنية مستقلة دون تبعية للأنظمة الخارجية مع تكامل SolVision وكريمة وميلة وفلاح تيك
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchSystems}
            disabled={isPinging}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-emerald-400' : ''}`} />
            <span>تحديث حالة اتصال العقد السيادية</span>
          </button>

          {/* Prominent Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/90 text-red-200 border border-red-700/80 hover:border-red-600 rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
              aria-label="إغلاق السحابة السيادية والعودة للخريطة (X)"
              title="إغلاق والعودة للخريطة (X)"
            >
              <span>إغلاق (X)</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Datacenter Showcase & Sovereign Principle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="relative aspect-video bg-slate-950">
            <img
              src="/src/assets/images/sovereign_datacenter_africa_1791720855036.jpg"
              alt="مركز البيانات السحابي الأخضر السيادي بالجزائر"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-emerald-400 font-mono">
              AtlasCloud & NeoCloud Sovereign Cluster
            </div>
            <div className="absolute bottom-4 right-4 left-4 text-slate-100">
              <span className="text-xs text-emerald-400 font-semibold">
                السيادة على البيانات الجيومكانية والغذائية
              </span>
              <h3 className="text-lg font-bold mt-0.5">
                حماية البيانات الاستراتيجية القارية من التبعية التقنية
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                تدار المنظومة عبر معمارية Microservices مستقلة تماماً تشمل PostGIS وRedis وObject Storage لمعالجة ملفات الراستر الفضائية GeoTIFF محلياً.
              </p>
            </div>
          </div>
        </div>

        {/* Core Sovereignty Architecture Specs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
              <ShieldCheck className="w-5 h-5" />
              <span>ميثاق السيادة الرقمية الإفريقية (Sovereignty Protocol)</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">مزود السحابة الوطنية:</span>
                <span className="font-semibold text-slate-100">NeoCloud & AtlasCloud</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">معيار الأمان والمطابقة:</span>
                <span className="font-semibold text-emerald-400">Tier-IV Sovereign Datacenter</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">سعة تخزين الراستر الفضائي:</span>
                <span className="font-mono text-emerald-400">12.4 Petabytes GeoTIFF</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">عقد قواعد بيانات PostGIS:</span>
                <span className="font-mono text-slate-100">16 Cluster Nodes Distributed</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">زمن الاستجابة المحلي:</span>
                <span className="font-mono text-emerald-400">&lt; 14 ms (Algiers & Oasis nodes)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-[11px] text-emerald-300 leading-relaxed">
            تضمن السحابة السيادية عدم تسريب أي إحداثية لمحاصيل الجنوب، مناسيب المياه الجوفية بحوض الألبيان، أو حمولات قوافل الإمداد العابرة للصحراء إلى أي خادم خارج القارة الإفريقية.
          </div>
        </div>
      </div>

      {/* Integrated Ecosystems Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200">
          المنظومات الوطنية المتكاملة في منصة السيادة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOVEREIGN_CLOUD_SYSTEMS.map((system) => (
            <div
              key={system.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{system.nameAr}</h4>
                  <span className="text-[11px] text-emerald-400 font-mono">{system.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  متصل ونشط
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{system.details}</p>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">{system.metricLabel}:</span>
                <span className="font-mono font-bold text-slate-200">{system.metricValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
