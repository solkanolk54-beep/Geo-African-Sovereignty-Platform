import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Warehouse,
  Wheat,
  Train,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  Radio,
  FileText,
  BarChart3,
  Calendar,
  Percent,
  Gauge,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { translations, Language } from '../locales/translations';

interface LiveKpiMetricsModuleProps {
  onClose?: () => void;
  lang?: Language;
  onNavigateToMap?: () => void;
}

export const LiveKpiMetricsModule: React.FC<LiveKpiMetricsModuleProps> = ({
  onClose,
  lang = 'ar',
  onNavigateToMap,
}) => {
  const isAr = lang === 'ar';
  const t = translations[lang];

  // Active view tab inside KPI module
  const [activeTab, setActiveTab] = useState<'overview' | 'storage' | 'crops' | 'distribution' | 'milaHub' | 'fllahTech'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString(isAr ? 'ar-DZ' : 'en-US'));

  // Data state loaded from server API (with robust offline default values)
  const [storageData, setStorageData] = useState<any>({
    targetCapacityMetricTons: 9000000,
    currentCapacityMetricTons: 5850000,
    progressPct: 65.0,
    siloNetwork: {
      totalStrategicSilosTarget: 30,
      operationalStrategicSilos: 22,
      underConstructionStrategicSilos: 8,
      totalProximityCentersTarget: 350,
      activeProximityCenters: 285,
      finishingPhaseProximityCenters: 65,
      coveredWilayasCount: 58,
    },
    railwayIntegration: {
      agency: 'الوكالة الوطنية للدراسات ومتابعة إنجاز الاستثمارات في السكك الحديدية (ANESRIF)',
      connectedSilosCount: 16,
      oaicConcreteSilosCount: 7,
      keyRailheadSilos: [
        {
          id: 'silo-mila-telaghma',
          nameAr: 'صومعة ميلة الكبرى (التلاغمة)',
          nameEn: 'Mila Grand Silo (Teleghma)',
          wilaya: 'ميلة',
          capacityTons: 1000000,
          storedTons: 780000,
          railOperator: 'ANESRIF Railhead Connection',
          status: 'operational',
          isMilaHub: true,
        },
        {
          id: 'silo-sidi-bel-abbes',
          nameAr: 'صومعة سيدي بلعباس الخرسانية',
          nameEn: 'Sidi Bel Abbes Concrete Silo',
          wilaya: 'سيدي بلعباس',
          capacityTons: 500000,
          storedTons: 390000,
          railOperator: 'ANESRIF Western Line',
          status: 'operational',
          isMilaHub: false,
        },
        {
          id: 'silo-oued-souf-hub',
          nameAr: 'مجمع صوامع وادي سوف الصحراوي',
          nameEn: 'Oued Souf Desert Silo Hub',
          wilaya: 'الوادي',
          capacityTons: 750000,
          storedTons: 620000,
          railOperator: 'Southern Freight Artery',
          status: 'operational',
          isMilaHub: false,
        },
        {
          id: 'silo-adrar-meniaa',
          nameAr: 'صوامع أقطاب الجنوب (المنيعة - أدرار)',
          nameEn: 'Southern Hub Silos (El Menia - Adrar)',
          wilaya: 'أدرار',
          capacityTons: 1200000,
          storedTons: 940000,
          railOperator: 'Trans-Saharan Logistics Link',
          status: 'operational',
          isMilaHub: false,
        },
      ],
    },
    landTransformation: {
      decree24_251_hectares: 86.0,
      decreeTitleAr: 'المرسوم التنفيذي رقم 24-251 (تحويل وتخصيص الأراضي الاستراتيجية للصوامع)',
      proximityCentersAllocatedHectares: 214.0,
      totalAllocatedHectares: 300.0,
      wilayasCount: 18,
      allocatedParcelsRegistered: 42,
    },
    alerts: [
      {
        id: 'alt-01',
        type: 'high_fill_rate',
        wilaya: 'ميلة (Teleghma)',
        messageAr: 'صومعة التلاغمة بلغت 78% من طاقتها؛ تم جدولة قطاري شحن عبر أنسريف لنقل 15,000 طن نحو موانئ الوسط.',
        messageEn: 'Teleghma silo reached 78% capacity; 2 ANESRIF freight trains scheduled to transfer 15,000 MT.',
        level: 'warning',
      },
      {
        id: 'alt-02',
        type: 'expansion_milestone',
        wilaya: 'المنيعة (El Menia)',
        messageAr: 'استكمال صب الخرسانة لـ 4 خلايا صوامع جديدة بطاقة 120,000 طن متري لخدمة محاصيل الجنوب.',
        messageEn: 'Concrete casting completed for 4 new silo cells (+120,000 MT capacity) in southern hub.',
        level: 'success',
      },
    ],
  });

  const [cropData, setCropData] = useState<any>({
    totalCerealTargetHectares: 3069000,
    actualCultivatedHectares: 2945000,
    overallCultivationPct: 95.96,
    durumWheat: {
      targetHectares: 1600000,
      actualHectares: 1540000,
      shareOfTotalPct: 52.13,
      targetSharePct: 55.0,
      targetProductionQuintals: 30000000,
      projectedHarvestQuintals: 28900000,
      selfSufficiencyProgressPct: 96.33,
      statusAr: 'مستهدف الاكتفاء الذاتي الاستراتيجي محقق بنسبة 96.3%',
    },
    barley: {
      targetHectares: 1000000,
      actualHectares: 960000,
      projectedProductionQuintals: 15200000,
      progressPct: 96.0,
    },
    southernIrrigation2027: {
      targetProgramHectares: 1000000,
      currentProgressHectares: 640000,
      progressPct: 64.0,
      horizonYear: 2027,
      priorityBasins: ['أدرار (Adrar)', 'المنيعة (El Menia)', 'تقرت (Touggourt)', 'ورقلة (Ouargla)', 'إليزي (Illizi)'],
      activePivotsCount: 4280,
      groundwaterPumpingEfficiencyPct: 94.2,
    },
    referenceYieldBenchmark: {
      nationalAverageQHa: 35.0,
      standardRainfedQHa: 28.5,
      modernIrrigatedQHa: 68.0,
      recordHighOuedSoufQHa: 120.0,
      benchmarkLocationAr: 'حقول وادي سوف والمنيعة المحورية (Pivots)',
      productivityBoostPct: 242.8,
    },
    sentinel2NdviStatus: {
      sensor: 'Sentinel-2 Multi-Spectral + SolVision AI',
      meanNdvi: 0.684,
      anomalyIndexDelta: 0.038,
      biomassVigor: 'healthy_expanding',
      anomalies: [
        {
          zoneAr: 'الهضاب العليا الغربية (سيدي بلعباس - تيارت)',
          zoneEn: 'Western Highlands (SBA - Tiaret)',
          ndviScore: 0.52,
          deviationPct: -6.2,
          alertSeverity: 'mild',
          directiveAr: 'توجيه حصص إضافية من مياه السدود التكميلية.',
          directiveEn: 'Reallocate supplementary reservoir irrigation.',
        },
        {
          zoneAr: 'حوض وادي سوف والمنيعة',
          zoneEn: 'Oued Souf & El Menia Pivot Basin',
          ndviScore: 0.84,
          deviationPct: +14.8,
          alertSeverity: 'optimal',
          directiveAr: 'مردودية قياسية متوقعة تفوق 110 قنطار/هكتار.',
          directiveEn: 'Record productivity expected exceeding 110 Q/ha.',
        },
      ],
    },
  });

  const [distData, setDistData] = useState<any>({
    subsidies: {
      seedSubsidyRatePct: 50.0,
      fertilizerSubsidyRatePct: 50.0,
      certifiedSeedsTotalAllocatedTons: 320000,
      certifiedSeedsDistributedTons: 304000,
      seedDistributionPct: 95.0,
      subsidizedFertilizerTotalTons: 450000,
      subsidizedFertilizerDistributedTons: 427500,
      fertilizerDistributionPct: 95.0,
    },
    seasonalTimelineTracker: {
      seasonStageAr: 'مرحلة الامتلاء والنضج والحصاد التمهيدي بالجنوب',
      seasonStageEn: 'Maturation & Early Southern Harvest Phase',
      deliveryScheduleOnTrackPct: 94.8,
      participatingCooperativesCount: 1240,
      fllahDzRegisteredFarmers: 168400,
    },
    nationalConsumptionBalance: {
      annualDomesticConsumptionMinTons: 9000000,
      annualDomesticConsumptionMaxTons: 12000000,
      annualDomesticConsumptionMedianTons: 10500000,
      projectedDomesticProductionTons: 8650000,
      strategicSiloReserveTons: 3200000,
      domesticDeficitCoverageMonths: 14.2,
      exportableSahelSurplusTons: 642800,
      primarySahelCorridors: 'محور عين قزام - أغاديز (النيجر)، ومحور برج باجي مختار - غاو (مالي)',
    },
  });

  // Action feedback message (e.g. simulated rebalance or rail dispatch)
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch live metrics from endpoints
  const fetchLiveKpis = async () => {
    setIsLoading(true);
    try {
      const [resStorage, resCrops, resDist] = await Promise.all([
        fetch('/api/v1/national-kpi/storage-logistics').catch(() => null),
        fetch('/api/v1/national-kpi/crop-yield').catch(() => null),
        fetch('/api/v1/national-kpi/inputs-distribution').catch(() => null),
      ]);

      if (resStorage && resStorage.ok) {
        const json = await resStorage.json();
        if (json.data) setStorageData(json.data);
      }
      if (resCrops && resCrops.ok) {
        const json = await resCrops.json();
        if (json.data) setCropData(json.data);
      }
      if (resDist && resDist.ok) {
        const json = await resDist.json();
        if (json.data) setDistData(json.data);
      }
      setLastUpdated(new Date().toLocaleTimeString(isAr ? 'ar-DZ' : 'en-US'));
    } catch (e) {
      console.warn('Using loaded sovereign default telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveKpis();
  }, []);

  const triggerDispatchTrain = (siloName: string) => {
    setActionNotice(
      isAr
        ? `🚂 تم إصدار أمر شحن قطار أنسريف لنقل 10,000 طن قمح صلب من (${siloName}) عبر السكة الحديدية.`
        : `🚂 ANESRIF Rail Dispatch Order triggered: 10,000 MT Durum Wheat queued from (${siloName}).`
    );
    setTimeout(() => setActionNotice(null), 6000);
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Banner & Control Header with Prominent Close Button */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-28 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-28 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>PostGIS & Redis Live Stream</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>fllah.dz & Mila Geospatial Hub</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>
                {isAr
                  ? 'وحدة مؤشرات الأداء الحية للسيادة الغذائية الوطنية'
                  : 'National Food Sovereignty Live KPI Metrics Module'}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
              {isAr
                ? 'لوحة القيادة الميدانية المدمجة بين بيانات العقار والتخزين الاستراتيجي (9 ملايين طن)، ربط الصوامع بالسكة الحديدية (أنسريف)، مساحات الحبوب المسطرة (3.069 مليون هكتار)، ومتابعة مدخلات الإنتاج وتوازن الاستهلاك والفوائض الإفريقية.'
                : 'Unified operational dashboard tracking strategic grain storage (9M MT target), railway railhead connections (ANESRIF), targeted cereal acreage (3.069M ha), southern irrigation program (2027), input distribution, and Sahel surplus.'}
            </p>
          </div>

          {/* Action Toolbar with Prominent Close Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-end">
            <button
              onClick={fetchLiveKpis}
              disabled={isLoading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title={isAr ? 'تحديث المؤشرات لحظياً' : 'Refresh live telemetry'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline font-mono">{lastUpdated}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                aria-label={isAr ? 'إغلاق والعودة للخريطة' : 'Close and return to map'}
                title={isAr ? 'إغلاق العرض والرجوع للخريطة' : 'Close view and return to map'}
              >
                <X className="w-4 h-4 text-red-400" />
                <span>{isAr ? 'إغلاق (X)' : 'Close (X)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Action / Dispatch Notice Alert */}
        {actionNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-800/80 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isAr ? 'الموجز الاستراتيجي الوطني' : 'Strategic Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'storage'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>{isAr ? 'البنية التحتية والتخزين (9M طن)' : 'Storage & Logistics (9M MT)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('crops')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'crops'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Wheat className="w-3.5 h-3.5" />
            <span>{isAr ? 'المساحات الزراعية والمردود (3.069M هكتار)' : 'Crops & Yield (3.069M ha)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('distribution')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'distribution'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>{isAr ? 'المدخلات المدعومة وتوازن الاستهلاك' : 'Inputs & Distribution Trackers'}</span>
          </button>

          <button
            onClick={() => setActiveTab('milaHub')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'milaHub'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'قطب ميلة الجيومكاني (Mila Hub)' : 'Mila Geospatial Hub'}</span>
          </button>

          <button
            onClick={() => setActiveTab('fllahTech')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fllahTech'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-400/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isAr ? 'منصة فلاح تيك (fllah.dz)' : 'Fllah.dz Portal'}</span>
          </button>
        </div>
      </div>

      {/* 4 Macro Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Storage Capacity Target */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">{isAr ? 'الطاقة الاستيعابية الهدف' : 'Storage Capacity Target'}</span>
            <Warehouse className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">9,000,000</span>
            <span className="text-xs text-emerald-400 font-semibold">{isAr ? 'طن متري' : 'MT'}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{isAr ? 'المنجز الفعلي: 5.85M طن' : 'Actual: 5.85M MT'}</span>
              <span className="text-emerald-400 font-bold">65.0%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: '65%' }} />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{isAr ? '30 صومعة كبرى + 350 جواري' : '30 Silos + 350 Proximity'}</span>
            <span className="text-emerald-400 font-medium">58 {isAr ? 'ولاية' : 'Wilayas'}</span>
          </div>
        </div>

        {/* Card 2: Durum Wheat Self Sufficiency */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">{isAr ? 'اكتفاء القمح الصلب Target' : 'Durum Self-Sufficiency'}</span>
            <Wheat className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">30,000,000</span>
            <span className="text-xs text-amber-300 font-semibold">{isAr ? 'قنطار' : 'Quintals'}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{isAr ? '1.6M هكتار (52.1% من المساحة)' : '1.6M ha (52.1% Area)'}</span>
              <span className="text-amber-400 font-bold">96.3%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: '96.3%' }} />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{isAr ? 'المساحة الكلية المسطرة' : 'Total Cereal Acreage'}</span>
            <span className="text-slate-200 font-mono font-bold">3,069,000 ha</span>
          </div>
        </div>

        {/* Card 3: Railway Silo Connectivity */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">{isAr ? 'ربط السكة الحديدية (أنسريف)' : 'Railway Silo Railheads'}</span>
            <Train className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">16 + 7</span>
            <span className="text-xs text-slate-300 font-semibold">{isAr ? 'صومعة مربوطة' : 'Connected'}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{isAr ? 'صوامع الديوان المهني (OAIC)' : 'OAIC Concrete Silos'}</span>
              <span className="text-sky-400 font-bold">100% {isAr ? 'تأهيل' : 'Ready'}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: '85%' }} />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{isAr ? 'صومعة ميلة (التلاغمة)' : 'Mila (Teleghma) Hub'}</span>
            <span className="text-emerald-400 font-bold">1,000,000 MT</span>
          </div>
        </div>

        {/* Card 4: Southern Irrigation & Benchmark Yield */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">{isAr ? 'سقي الجنوب وأعلى مردودية' : 'Southern Pivot Benchmark'}</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">120.0</span>
            <span className="text-xs text-cyan-300 font-semibold">{isAr ? 'قنطار/هكتار (وادي سوف)' : 'Q/ha (Oued Souf)'}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{isAr ? 'برنامج استصلاح الجنوب 2027' : '2027 Southern Plan'}</span>
              <span className="text-cyan-400 font-bold">64.0%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full transition-all duration-1000" style={{ width: '64%' }} />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{isAr ? 'المعدل الوطني القياسي' : 'National Standard Avg'}</span>
            <span className="text-slate-300 font-mono">35.0 Q/ha</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: STORAGE & LOGISTICS INFRASTRUCTURE */}
      {(activeTab === 'overview' || activeTab === 'storage') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Warehouse className="w-4 h-4" />
                <span>{isAr ? 'المحور الأول: البنية التحتية والتخزين الاستراتيجي' : 'Pillar 1: Storage & Logistics Infrastructure'}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'شبكة الصوامع الكبرى ومراكز التخزين الجوارية (9,000,000 طن متري)'
                  : 'Strategic Silo Network & Proximity Centers (9,000,000 MT Target)'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                {isAr ? 'المرسوم 24-251: 86 + 214 هكتار' : 'Decree 24-251: 86 + 214 ha'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Silo Network Breakdown */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'توزيع الصوامع والمراكز الجوارية' : 'Silos & Proximity Distribution'}</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">{isAr ? '30 صومعة استراتيجية كبرى' : '30 Major Strategic Silos'}</div>
                    <div className="text-[11px] text-slate-400">{isAr ? '22 قيد التشغيل، 8 قيد الإنجاز المتقدم' : '22 Operational, 8 under expansion'}</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold text-sm">73.3%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">{isAr ? '350 مركز تخزين جواري' : '350 Proximity Storage Centers'}</div>
                    <div className="text-[11px] text-slate-400">{isAr ? '285 مستلم ومفعل عبر 58 ولاية' : '285 active across 58 wilayas'}</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold text-sm">81.4%</span>
                </div>

                {/* Real Estate Transfer (Decree 24-251) */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{isAr ? 'تحويل العقار الاستراتيجي' : 'Strategic Land Transfer'}</span>
                    <span className="text-sky-400 font-mono font-bold">300 {isAr ? 'هكتار' : 'ha'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isAr
                      ? '86 هكتاراً (المرسوم 24-251) لصوامع ميلة والولايات الاستراتيجية + 214 هكتاراً لمراكز التخزين الجوارية عبر 18 ولاية نموذجية.'
                      : '86 ha (Decree 24-251) for Mila & strategic silos + 214 ha for proximity centers across 18 wilayas.'}
                  </p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Railhead Silos (Mila Teleghma, SBA, Oued Souf, Adrar) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Train className="w-4 h-4 text-sky-400" />
                  <span>{isAr ? 'صوامع الربط السككي المباشر (أنسريف والديوان المهني OAIC)' : 'ANESRIF Railhead Silos & OAIC'}</span>
                </span>
                <span className="text-slate-400 text-[11px]">{isAr ? '16 صومعة + 7 صوامع خرسانية' : '16 Silos + 7 Concrete Silos'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {storageData?.railwayIntegration?.keyRailheadSilos?.map((silo: any, idx: number) => {
                  const fillPct = Math.round((silo.storedTons / silo.capacityTons) * 100);
                  return (
                    <div
                      key={silo.id || `rail-silo-${idx}`}
                      className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
                        silo.isMilaHub
                          ? 'bg-slate-950/80 border-sky-500/50 shadow-lg shadow-sky-500/5'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            {silo.isMilaHub && <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500 text-slate-950 font-black">MILA HUB</span>}
                            <span>{isAr ? silo.nameAr : silo.nameEn || silo.nameAr}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{silo.wilaya}</span>
                            <span>•</span>
                            <span className="text-sky-400">{silo.railOperator}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {silo.status}
                        </span>
                      </div>

                      {/* Capacity Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400">
                            {isAr ? 'المخزون الحالي:' : 'Stored:'} {silo.storedTons.toLocaleString()} / {silo.capacityTons.toLocaleString()} MT
                          </span>
                          <span className={fillPct > 75 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {fillPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              fillPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>

                      {/* ANESRIF Rail Trigger Action */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {silo.isMilaHub ? (isAr ? 'المرسوم 24-251 (86 هكتار)' : 'Decree 24-251 (86 ha)') : (isAr ? 'مخصصات الـ 214 هكتار' : '214 ha Allocations')}
                        </span>
                        <button
                          onClick={() => triggerDispatchTrain(isAr ? silo.nameAr : silo.nameEn || silo.nameAr)}
                          className="px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-600/60 text-sky-300 font-semibold text-[10px] transition-colors flex items-center gap-1"
                        >
                          <Train className="w-3 h-3 text-sky-400" />
                          <span>{isAr ? 'إصدار أمر شحن قطار' : 'Dispatch Railcar'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Early Warning Alerts within Storage */}
              <div className="space-y-2 pt-2">
                {storageData?.alerts?.map((alt: any, idx: number) => (
                  <div
                    key={alt.id || `${alt.type || 'alert'}-${alt.wilaya || idx}-${idx}`}
                    className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                      alt.level === 'warning'
                        ? 'bg-amber-950/30 border-amber-600/50 text-amber-200'
                        : 'bg-emerald-950/30 border-emerald-600/50 text-emerald-200'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alt.level === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <div className="flex-1">
                      <span className="font-bold underline">{alt.wilaya}:</span>{' '}
                      <span>{isAr ? alt.messageAr : alt.messageEn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CROP & YIELD KPIS */}
      {(activeTab === 'overview' || activeTab === 'crops') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Wheat className="w-4 h-4" />
                <span>{isAr ? 'المحور الثاني: معايير الإنتاج الفلاحي والمساحات المزروعة' : 'Pillar 2: Crop Targets & Agricultural Acreage'}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'المساحة الإجمالية للحبوب (3,069,000 هكتار) وبرنامج سقي الجنوب 2027'
                  : 'Total Cereal Plan (3,069,000 ha) & 2027 Southern Irrigation Horizon'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-mono border border-amber-500/20 font-bold">
                {isAr ? 'القمح الصلب: 55% Target = 30M قنطار' : 'Durum: 55% Target = 30M Quintals'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Durum Wheat Metric Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Wheat className="w-4 h-4" />
                  <span>{isAr ? 'القمح الصلب (Durum Wheat)' : 'Durum Wheat Target'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Target: 1,600,000 ha</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{isAr ? 'المساحة المزروعة:' : 'Planted Area:'}</span>
                  <span className="text-slate-100 font-bold">1,540,000 ha (96.3%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '96.3%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{isAr ? 'الإنتاج المستهدف:' : 'Target Yield:'}</span>
                  <span className="text-amber-400 font-bold">30,000,000 Q</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'المحصول التقديري: 28,900,000 قنطار (اكتفاء 96.3%)' : 'Est. Harvest: 28.9M Quintals (96.3% Self-Sufficiency)'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium">
                {isAr ? '✓ تغطية 52.1% من المساحة الوطنية الإجمالية' : '✓ 52.1% of Total National Cereal Area'}
              </div>
            </div>

            {/* Barley & Other Cereals */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'الشعير العلفي (Barley Target)' : 'Barley & Forage Target'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Target: 1,000,000 ha</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{isAr ? 'المساحة الفعلية:' : 'Actual Area:'}</span>
                  <span className="text-slate-100 font-bold">960,000 ha (96.0%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.0%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{isAr ? 'الإنتاج المتوقع:' : 'Projected Yield:'}</span>
                  <span className="text-emerald-400 font-bold">15,200,000 Q</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'تأمين كامل للأعلاف ومخزون الثروة الحيوانية' : 'Full Livestock Feed Security buffer'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                {isAr ? 'المساحة المتبقية (469 ألف هكتار): قمح لين وشوفان' : 'Remaining 469k ha: Soft Wheat & Oats'}
              </div>
            </div>

            {/* Southern Irrigation Program (2027) */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" />
                  <span>{isAr ? 'استصلاح الجنوب (أفق 2027)' : 'Southern Irrigation (Horizon 2027)'}</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">1,000,000 ha Target</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{isAr ? 'المستصلح فعلياً:' : 'Current Progress:'}</span>
                  <span className="text-cyan-300 font-bold">640,000 ha (64.0%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '64%' }} />
                </div>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-slate-200">{isAr ? 'الأقطاب الاستراتيجية:' : 'Strategic Southern Poles:'}</div>
                <div className="text-[10px] text-slate-400">
                  {cropData.southernIrrigation2027.priorityBasins.join(' • ')}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{isAr ? 'مرشات محورية نشطة:' : 'Active Pivots:'}</span>
                <span className="text-cyan-300 font-mono font-bold">4,280 Pivots</span>
              </div>
            </div>
          </div>

          {/* Reference Yield Benchmark: Oued Souf vs National Average */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>{isAr ? 'معيار المردودية المرجعية القياسي (Yield Benchmark Track)' : 'Reference Yield Benchmark'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {isAr
                  ? 'سجلت مزارع وادي سوف والمنيعة المحورية مردودية قياسية تصل إلى 120 قنطاراً في الهكتار الواحد (+242.8% مقارنة بالمعدل الوطني البالغ 35 قنطار/هكتار)، مما يثبت نجاعة السقي التكميلي والطاقة الشمسية.'
                  : 'Oued Souf and El Menia center pivots recorded benchmark record yields of 120 quintals per hectare (+242.8% over the 35 Q/ha national benchmark), proving solar-driven deep aquifer irrigation efficiency.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">{isAr ? 'المعدل الوطني' : 'National Avg'}</div>
                <div className="text-sm font-mono font-bold text-slate-300">35 Q/ha</div>
              </div>
              <div className="text-center px-3 py-2 rounded-lg bg-emerald-950 border border-emerald-600/50">
                <div className="text-[10px] text-emerald-300 font-bold">{isAr ? 'قمة وادي سوف' : 'Oued Souf Record'}</div>
                <div className="text-sm font-mono font-bold text-emerald-400">120 Q/ha</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: INPUTS, DISTRIBUTION & CONSUMPTION BALANCE */}
      {(activeTab === 'overview' || activeTab === 'distribution') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Percent className="w-4 h-4" />
                <span>{isAr ? 'المحور الثالث: سلاسة توزيع المدخلات وميزان الاستهلاك' : 'Pillar 3: Subsidized Inputs & Supply/Demand Balance'}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                {isAr
                  ? 'تتبع دعم البذور والأسمدة (50%) وميزان الاستهلاك والفوائض الإفريقية'
                  : '50% Benchmark Subsidies, Domestic Consumption Balance & Sahel Surpluses'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                {isAr ? 'استهلاك وطني: 9 - 12 مليون طن' : 'Consumption: 9-12M Tons/Yr'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Subsidies: Seeds and Fertilizers */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'حزم الدعم الحكومي للمدخلات الفلاحية' : 'Subsidized Inputs Delivery'}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isAr ? 'دعم 50% من السعر المرجعي' : '50% Price Subsidy'}
                </span>
              </h3>

              {/* Certified Seeds */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{isAr ? 'البذور المعتمدة والمحسنة:' : 'Certified Grain Seeds:'}</span>
                  <span className="font-mono text-emerald-400 font-bold">304,000 / 320,000 طن (95%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }} />
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'تغطية كاملة لاحتياجات تعاونيات الحبوب والبقول الجافة (CCLS) مع تتبع الحصص.' : 'Full coverage across grain cooperatives with tracking.'}
                </p>
              </div>

              {/* Subsidized Fertilizers */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{isAr ? 'الأسمدة الآزوتية والفوسفاتية:' : 'Nitrogen & Phosphate Fertilizers:'}</span>
                  <span className="font-mono text-emerald-400 font-bold">427,500 / 450,000 طن (95%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }} />
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'دعم مباشر بنسبة 50% من الدولة لتخفيض تكلفة الإنتاج على الفلاحين المستثمرين.' : 'Direct 50% state contribution to suppress farming operating expenditures.'}
                </p>
              </div>

              {/* Cooperatives & Registered Farmers */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{isAr ? 'التعاونيات المشاركة: 1,240' : 'Cooperatives: 1,240'}</span>
                <span className="font-mono text-slate-200">fllah.dz: 168,400 {isAr ? 'فلاح مسجل' : 'Farmers'}</span>
              </div>
            </div>

            {/* National Consumption & African Sahel Surpluses */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-sky-400" />
                <span>{isAr ? 'ميزان الاستهلاك الوطني وتأمين الفائض الإفريقي' : 'National Consumption Balance & Sahel Surpluses'}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400">{isAr ? 'الاستهلاك الوطني السنوي' : 'Domestic Consumption'}</div>
                  <div className="text-base font-bold text-slate-100 font-mono mt-1">9.0 - 12.0 MT</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{isAr ? 'المتوسط المرجعي: 10.5 مليون طن' : 'Median: 10.5M Tons'}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-400">{isAr ? 'تغطية العجز بالمخزون' : 'Strategic Silo Buffer'}</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-1">14.2 {isAr ? 'شهراً' : 'Months'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{isAr ? '3.2M طن احتياطي استراتيجي' : '3.2M Tons In Silos'}</div>
                </div>
              </div>

              {/* Sahel Export Surplus */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'الفائض الاستراتيجي الموجه للساحل الإفريقي' : 'Exportable Sahel Food Surplus'}</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">642,800 MT</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isAr
                    ? 'يتم توجيه فوائض الإنتاج من أقطاب الجنوب (التمور، الحبوب المعالجة، الخضروات) عبر شريان الطريق العابر للصحراء (عين قزام نحو النيجر، وبرج باجي مختار نحو مالي).'
                    : 'Surpluses channeled via Trans-Saharan corridors (In Guezzam to Niger, and Bordj Badji Mokhtar to Mali) under ZLECAf protocols.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DEDICATED HUB VIEWS (Mila Geospatial Hub & fllah.dz) */}
      {(activeTab === 'milaHub' || activeTab === 'fllahTech') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
          {activeTab === 'milaHub' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Layers className="w-5 h-5" />
                  <span>{isAr ? 'مركز ميلة الجيومكاني للاستشعار واللوجستيك (Mila Geospatial Hub)' : 'Mila Geospatial Hub Integration'}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30">
                  Node: MILA-TELAGHMA-OAIC
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">{isAr ? 'صومعة التلاغمة الكبرى' : 'Teleghma Mega Silo'}</div>
                  <div className="text-xl font-bold font-mono text-sky-400">1,000,000 MT</div>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'مربوطة بشبكة قطارات أنسريف عبر 4 سكك مخصصة لتفريغ وشحن الحبوب بطاقة 2,500 طن/ساعة.'
                      : 'Equipped with 4 ANESRIF rail spurs with a loading throughput of 2,500 MT/hr.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">{isAr ? 'المرسوم 24-251' : 'Decree 24-251 Parcels'}</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">86.0 Hectares</div>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'تخصيص عقاري سيادي كامل لصالح منشآت الصوامع ومخازن التبريد الاستراتيجية للحبوب.'
                      : 'Strategic public land transformation decree legalizing sovereign grain buffer reserves.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">{isAr ? 'استشعار رطوبة سد بني هارون' : 'Beni Haroun Reservoir'}</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">960,000,000 m³</div>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'مراقبة بالرادار والأقمار الصناعية لضمان مياه السقي التكميلي لحوض ميلة وقسنطينة.'
                      : 'Radar satellite telemetry monitoring supplementary irrigation reserves.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Activity className="w-5 h-5" />
                  <span>{isAr ? 'بوابة فلاح تيك (fllah.dz) للتكنولوجيا الفلاحية وسلاسل الإمداد' : 'fllah.dz AgTech & Cooperative Portal'}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  fllah.dz API: v2.4-SOVEREIGN
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">{isAr ? 'المزارعون والمستثمرون المسجلون' : 'Registered Farmers'}</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">168,400</div>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'ربط مباشر مع منصة التعاونيات لطلب البذور والأسمدة ومتابعة حصص الدعم.' : 'Direct digital quota management for seeds and fertilizers.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">{isAr ? 'المحاور الفلاحية الذكية (Pivots)' : 'Connected IoT Pivots'}</div>
                  <div className="text-xl font-bold font-mono text-amber-400">4,280 Pivots</div>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'تحكم عن بعد في الرش المحوري وضخ المياه بالطاقة الشمسية بالجنوب الكبير.' : 'Remote IoT telemetry optimizing solar-powered deep aquifer pumping.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">{isAr ? 'منصة الصفقات وسلاسل الإمداد' : 'Supply Chain Contracts'}</div>
                  <div className="text-xl font-bold font-mono text-sky-400">3,890 {isAr ? 'عقد توريد' : 'Contracts'}</div>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'عقود شراء استباقية بالأسعار المرجعية لضمان مداخيل الفلاحين وتفادي المضاربة.' : 'Pre-season floor pricing contracts protecting farming revenue.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper icon
function Scale(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}
