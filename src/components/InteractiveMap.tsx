import React, { useState, useEffect, useRef } from 'react';
import { apiService, PostgisRoute } from '../services/apiService';
import {
  LOGISTICS_HUBS,
  TRADE_CORRIDORS,
  SHIPMENT_CARGOS,
  REGIONAL_BALANCE,
  AGRICULTURAL_ZONES,
} from '../data/regionalData';
import { LogisticsHub, TradeCorridor, ShipmentCargo } from '../types/platform';
import { StrategicPipelineSimulationModal } from './StrategicPipelineSimulationModal';
import {
  Navigation,
  Database,
  Layers,
  MapPin,
  Truck,
  TrendingUp,
  AlertTriangle,
  Sun,
  Snowflake,
  RotateCcw,
  RefreshCw,
  Clock,
  CheckCircle,
  Wheat,
  X,
  Flame,
  Droplets,
  Zap,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  Info,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Satellite,
  Mountain,
  Activity,
  Check,
} from 'lucide-react';

interface InteractiveMapProps {
  onSelectShipment?: (shipment: ShipmentCargo) => void;
  onOpenAiPlanner?: () => void;
  onOpenAgriAnalytics?: () => void;
  onOpenSiloInventory?: () => void;
  onOpenNationalKpi?: () => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onSelectShipment,
  onOpenAiPlanner,
  onOpenAgriAnalytics,
  onOpenSiloInventory,
  onOpenNationalKpi,
}) => {
  const [routes, setRoutes] = useState<PostgisRoute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [activeLayer, setActiveLayer] = useState<'all' | 'corridors' | 'pipelines' | 'hubs' | 'heatmap' | 'convoys' | 'agri'>('all');
  const [isPipelineSimOpen, setIsPipelineSimOpen] = useState<boolean>(false);
  const [selectedHub, setSelectedHub] = useState<LogisticsHub | null>(
    LOGISTICS_HUBS.find((h) => h.id === 'hub-tamanrasset') || null
  );
  const [selectedCorridor, setSelectedCorridor] = useState<TradeCorridor | null>(TRADE_CORRIDORS[0]);
  const [selectedCargo, setSelectedCargo] = useState<ShipmentCargo | null>(null);

  // Zoom and Pan states
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Base Map Mode: 'terrain' | 'solvision' | 'supply_chains'
  const [baseMapMode, setBaseMapMode] = useState<'terrain' | 'solvision' | 'supply_chains'>('supply_chains');
  const [showLayerSwitcherMenu, setShowLayerSwitcherMenu] = useState<boolean>(false);

  // Fullscreen, Region, and Legend states
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [activeRegionPreset, setActiveRegionPreset] = useState<'all' | 'south' | 'sahel'>('all');

  const containerRef = useRef<HTMLDivElement>(null);

  // جلب بيانات المسارات المكانية الحقيقية من PostGIS فور تحميل المكون
  const fetchSpatialData = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const data = await apiService.getSupplyRoutes();
      if (Array.isArray(data) && data.length > 0) {
        setRoutes(data);
      } else {
        setRoutes(
          TRADE_CORRIDORS.map((c) => ({
            id: c.id,
            route_name: c.nameAr,
            corridor_code: c.id,
            distance_km: c.distanceKm,
            avg_transit_time_hours: Math.round(c.averageTransitDays * 24),
            road_condition: c.condition,
            solar_stops_count: c.solarFuelStations,
            cold_depots_count: c.coldStorageStops,
            end_destination: c.destination,
            geometry: {
              type: 'LineString',
              coordinates: c.coordinatesPath.map((p) => [p.x, p.y]),
            },
          }))
        );
      }
    } catch (err: any) {
      console.warn('تعذر الاتصال المباشر بخادم PostGIS الخارجي، استخدام المحرك المكاني الاحتياطي');
      setErrorNotice('تم تفعيل المحرك المكاني السيادي الاحتياطي (AtlasCloud Spatial Engine)');
      setRoutes(
        TRADE_CORRIDORS.map((c) => ({
          id: c.id,
          route_name: c.nameAr,
          corridor_code: c.id,
          distance_km: c.distanceKm,
          avg_transit_time_hours: Math.round(c.averageTransitDays * 24),
          road_condition: c.condition,
          solar_stops_count: c.solarFuelStations,
          cold_depots_count: c.coldStorageStops,
          end_destination: c.destination,
          geometry: {
            type: 'LineString',
            coordinates: c.coordinatesPath.map((p) => [p.x, p.y]),
          },
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpatialData();
  }, []);

  // Keyboard shortcut to close fullscreen with Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        if (showLayerSwitcherMenu) setShowLayerSwitcherMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, showLayerSwitcherMenu]);

  // Zoom helpers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.35, 0.85);
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveRegionPreset('all');
  };

  // Region Presets
  const applyRegionPreset = (preset: 'all' | 'south' | 'sahel') => {
    setActiveRegionPreset(preset);
    if (preset === 'all') {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    } else if (preset === 'south') {
      // Focus on South Algeria (Adrar, Ouargla, Tamanrasset)
      setZoomLevel(1.6);
      setPanOffset({ x: 0, y: 80 });
    } else if (preset === 'sahel') {
      // Focus on Border & Sahel (In Guezzam, Agadez, Niamey, Gao)
      setZoomLevel(1.9);
      setPanOffset({ x: -20, y: -210 });
    }
  };

  // Drag / Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Click selections
  const handleHubClick = (hub: LogisticsHub, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedHub(hub);
    setSelectedCorridor(null);
    setSelectedCargo(null);
  };

  const handleCorridorClick = (corridor: TradeCorridor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCorridor(corridor);
    setSelectedHub(null);
    setSelectedCargo(null);
  };

  const handleCargoClick = (cargo: ShipmentCargo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCargo(cargo);
    setSelectedHub(null);
    setSelectedCorridor(null);
    if (onSelectShipment) onSelectShipment(cargo);
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 p-2 sm:p-4 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>المرصد الجيومكاني الإفريقي والممر العابر للصحراء</span>
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/80 text-emerald-300 hidden sm:inline-block">
              GIS 4K HD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            خريطة تفاعلية عالية الدقة للممر القاري العابر للصحراء (الجزائر - النيجر - مالي - تشاد) وسلاسل التبريد وصوامع التخزين
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPipelineSimOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 hover:brightness-110 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all whitespace-nowrap shrink-0"
            title="فتح محاكاة الأنبوب الاستراتيجي العابر للصحراء (TSGP)"
          >
            <Flame className="w-3.5 h-3.5 fill-current text-slate-950" />
            <span>محاكاة الأنبوب الاستراتيجي (TSGP)</span>
          </button>

          {onOpenAgriAnalytics && (
            <button
              onClick={onOpenAgriAnalytics}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-800/80 rounded-lg text-xs font-semibold shadow transition-all whitespace-nowrap shrink-0"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>إحصائيات التصدير الزراعي</span>
            </button>
          )}

          {onOpenSiloInventory && (
            <button
              onClick={onOpenSiloInventory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-800/80 rounded-lg text-xs font-semibold shadow transition-all whitespace-nowrap shrink-0"
            >
              <Database className="w-3.5 h-3.5" />
              <span>مخزون الصوامع (NeoCloud)</span>
            </button>
          )}

          {onOpenNationalKpi && (
            <button
              onClick={onOpenNationalKpi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-800/80 rounded-lg text-xs font-semibold shadow transition-all whitespace-nowrap shrink-0"
              title="مؤشرات السيادة والأمن الغذائي الوطني (fllah.dz & Mila Hub)"
            >
              <Wheat className="w-3.5 h-3.5 text-amber-400" />
              <span>مؤشرات الأمن الغذائي (9M طن)</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
              isFullscreen
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title={isFullscreen ? 'تصغير الخريطة وإلغاء ملء الشاشة' : 'تكبير الخريطة على كامل الشاشة (Fullscreen)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>إلغاء ملء الشاشة</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ملء الشاشة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Layer Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg overflow-x-auto text-xs">
        <button
          onClick={() => setActiveLayer('all')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeLayer === 'all'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          جميع الطبقات
        </button>
        <button
          onClick={() => setActiveLayer('corridors')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeLayer === 'corridors'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          الممرات القارية ({routes.length})
        </button>
        <button
          onClick={() => setActiveLayer('pipelines')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeLayer === 'pipelines'
              ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          الأنابيب الاستراتيجية (TSGP)
        </button>
        <button
          onClick={() => setActiveLayer('hubs')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeLayer === 'hubs'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          الموانئ الجافة والمراكز
        </button>
        <button
          onClick={() => setActiveLayer('agri')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeLayer === 'agri'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          أحواض الإنتاج (SolVision)
        </button>
        <button
          onClick={() => setActiveLayer('heatmap')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeLayer === 'heatmap'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          خريطة الفائض والعجز
        </button>
        <button
          onClick={() => setActiveLayer('convoys')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeLayer === 'convoys'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          شاحنات التبريد (RFID)
        </button>
      </div>

      {/* Main Map Viewport & Live Spatial Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Map Container - Large, Clear, and Responsive */}
        <div
          ref={containerRef}
          className={`bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl transition-all ${
            isFullscreen
              ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none p-1'
              : 'lg:col-span-8 h-[62vh] min-h-[500px] sm:min-h-[580px] lg:h-[680px]'
          }`}
        >
          {/* Prominent Floating Close Button when Fullscreen */}
          {isFullscreen && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-2xl transition-all border border-red-400/60 ring-2 ring-red-500/40"
                aria-label="إغلاق ملء الشاشة (X)"
                title="إغلاق ملء الشاشة والعودة للوضع العادي (Esc)"
              >
                <X className="w-4 h-4" />
                <span>إغلاق ملء الشاشة (Esc)</span>
              </button>
            </div>
          )}
          {/* Top Left Floating Toolbar: Map Info & Presets */}
          <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-80px)] sm:max-w-none">
            {/* PostGIS Status Pill */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] text-slate-200 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-400">PostGIS Live</span>
              <span className="text-slate-400 font-mono hidden sm:inline">| {routes.length} مسار</span>
              <button
                onClick={fetchSpatialData}
                title="تحديث البيانات الجيومكانية"
                className="hover:text-emerald-400 p-0.5"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Region Presets */}
            <div className="hidden sm:flex items-center bg-slate-900/90 backdrop-blur-md p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => applyRegionPreset('all')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  activeRegionPreset === 'all'
                    ? 'bg-emerald-950 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                كامل الممر
              </button>
              <button
                onClick={() => applyRegionPreset('south')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  activeRegionPreset === 'south'
                    ? 'bg-emerald-950 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الجنوب الجزائري
              </button>
              <button
                onClick={() => applyRegionPreset('sahel')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  activeRegionPreset === 'sahel'
                    ? 'bg-emerald-950 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الساحل والحدود
              </button>
            </div>

            {/* Dedicated Map Layer Switcher (مفتاح تبديل الطبقات) */}
            <div className="relative">
              <button
                onClick={() => setShowLayerSwitcherMenu(!showLayerSwitcherMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md shadow transition-all ${
                  showLayerSwitcherMenu
                    ? 'bg-emerald-600 text-slate-950 border-emerald-400 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/95 hover:bg-slate-850 text-slate-200 border-slate-700/90'
                }`}
                title="مفتاح تبديل طبقات الخريطة: تضاريس، أقمار صناعية، سلاسل الإمداد"
                aria-label="مفتاح تبديل الطبقات"
              >
                <Layers className={`w-3.5 h-3.5 ${showLayerSwitcherMenu ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>
                  {baseMapMode === 'terrain'
                    ? 'خرائط التضاريس'
                    : baseMapMode === 'solvision'
                    ? 'أقمار SolVision'
                    : 'سلاسل الإمداد'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showLayerSwitcherMenu ? 'rotate-180 text-slate-950' : 'text-slate-400'}`} />
              </button>

              {/* Floating Layer Switcher Popover Menu */}
              {showLayerSwitcherMenu && (
                <div className="absolute top-full mt-1.5 right-0 sm:left-0 sm:right-auto w-72 sm:w-80 bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-xl p-3 shadow-2xl z-40 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-100">مفتاح طبقات الخريطة (Layer Switcher)</span>
                    </div>
                    <button
                      onClick={() => setShowLayerSwitcherMenu(false)}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 3 Main Base Map Layers */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
                      الطبقة الجغرافية الأساسية
                    </span>

                    {/* 1. خرائط سلاسل الإمداد */}
                    <button
                      onClick={() => {
                        setBaseMapMode('supply_chains');
                        setShowLayerSwitcherMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-right text-xs transition-colors border ${
                        baseMapMode === 'supply_chains'
                          ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md ${baseMapMode === 'supply_chains' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>خرائط سلاسل الإمداد</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 rounded">
                              الأساسي
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            مسارات N1، الموانئ الجافة، شاحنات التبريد، وأنابيب TSGP
                          </div>
                        </div>
                      </div>
                      {baseMapMode === 'supply_chains' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>

                    {/* 2. صور الأقمار الصناعية لـ SolVision */}
                    <button
                      onClick={() => {
                        setBaseMapMode('solvision');
                        setShowLayerSwitcherMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-right text-xs transition-colors border ${
                        baseMapMode === 'solvision'
                          ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md ${baseMapMode === 'solvision' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                          <Satellite className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>صور الأقمار الصناعية لـ SolVision</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-cyan-900/60 border border-cyan-700/50 text-cyan-300 rounded font-mono">
                              10m HD
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            تصوير طيفي حقيقي من Sentinel-2 لمراقبة الغطاء النباتي والكثبان
                          </div>
                        </div>
                      </div>
                      {baseMapMode === 'solvision' && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>

                    {/* 3. خرائط التضاريس */}
                    <button
                      onClick={() => {
                        setBaseMapMode('terrain');
                        setShowLayerSwitcherMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-right text-xs transition-colors border ${
                        baseMapMode === 'terrain'
                          ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md ${baseMapMode === 'terrain' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                          <Mountain className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>خرائط التضاريس (Terrain Elevation)</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-900/60 border border-amber-700/50 text-amber-300 rounded">
                              طوبوغرافيا
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            إبراز كتل الهقار، طاسيلي، العروق الرملية، وحوض نهر النيجر
                          </div>
                        </div>
                      </div>
                      {baseMapMode === 'terrain' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  </div>

                  {/* Quick Info footer & Explicit Close Button */}
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="font-mono text-emerald-400">CRS: EPSG:4326</span>
                    <button
                      onClick={() => setShowLayerSwitcherMenu(false)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
                    >
                      إغلاق القائمة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Right Floating Zoom & Controls HUD */}
          <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-emerald-400 rounded-lg transition-colors"
              title="تكبير الخريطة (Zoom In)"
              aria-label="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-emerald-400 rounded-lg transition-colors"
              title="تصغير الخريطة (Zoom Out)"
              aria-label="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-amber-400 rounded-lg transition-colors"
              title="إعادة ضبط المشهد والمركز"
              aria-label="إعادة ضبط"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-px bg-slate-800 my-0.5" />
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded-lg transition-colors ${
                isFullscreen
                  ? 'bg-red-950 text-red-300 border border-red-700 hover:bg-red-900 shadow-md'
                  : 'hover:bg-slate-800 text-slate-200 hover:text-cyan-400'
              }`}
              title={isFullscreen ? 'إغلاق ملء الشاشة (Esc)' : 'ملء الشاشة'}
              aria-label={isFullscreen ? 'إغلاق ملء الشاشة' : 'ملء الشاشة'}
            >
              {isFullscreen ? <X className="w-4 h-4 text-red-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Map Interactive Canvas */}
          <div
            className={`w-full h-full relative select-none bg-radial from-slate-900 via-slate-950 to-[#020617] ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Satellite Background Layer for SolVision Mode */}
            {baseMapMode === 'solvision' && (
              <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                <img
                  src="/src/assets/images/hero_geo_african_satellite_1791720822340.jpg"
                  alt="صور الأقمار الصناعية لـ SolVision"
                  className="w-full h-full object-cover opacity-60 mix-blend-screen scale-105 filter brightness-110 contrast-125"
                  referrerPolicy="no-referrer"
                />
                {/* Sentinel-2 HUD Badge in SolVision Mode */}
                <div className="absolute bottom-16 right-3 z-20 flex items-center gap-1.5 bg-cyan-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-600/80 text-[10px] text-cyan-200 font-mono shadow-lg">
                  <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                  <span>SolVision Sentinel-2 Multispectral (B2/B3/B4/B8 NDVI)</span>
                </div>
              </div>
            )}

            {/* Subtle Texture for Supply Chains Mode */}
            {baseMapMode === 'supply_chains' && (
              <img
                src="/src/assets/images/hero_geo_african_satellite_1791720822340.jpg"
                alt="خريطة إفريقيا الفضائية"
                className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none mix-blend-screen"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Terrain Relief Map HUD in Terrain Mode */}
            {baseMapMode === 'terrain' && (
              <div className="absolute bottom-16 right-3 z-20 flex items-center gap-1.5 bg-amber-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-600/80 text-[10px] text-amber-200 font-mono shadow-lg pointer-events-none">
                <Mountain className="w-3.5 h-3.5 text-amber-400" />
                <span>SRTM DEM 30m Digital Elevation Model (طبوغرافيا التضاريس)</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs text-emerald-400 text-xs font-mono">
                <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-emerald-800 shadow-xl">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري جلب المسارات المكانية اللحظية من خادم PostGIS...</span>
                </div>
              </div>
            )}

            {/* High-Resolution Vector Cartography SVG */}
            <svg
              viewBox="160 60 700 720"
              className="w-full h-full absolute inset-0 pointer-events-auto"
              style={{
                touchAction: 'none',
              }}
            >
              <defs>
                {/* SVG Filters & Gradients for Crisp Glowing Presentation */}
                <linearGradient id="medSeaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#082f49" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
                </linearGradient>

                {/* Dynamic Algeria Fill based on baseMapMode */}
                <linearGradient id="algeriaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  {baseMapMode === 'terrain' ? (
                    <>
                      <stop offset="0%" stopColor="#78350f" stopOpacity="0.55" />
                      <stop offset="50%" stopColor="#b45309" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#451a03" stopOpacity="0.65" />
                    </>
                  ) : baseMapMode === 'solvision' ? (
                    <>
                      <stop offset="0%" stopColor="#064e3b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#082f49" stopOpacity="0.3" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#022c22" stopOpacity="0.5" />
                    </>
                  )}
                </linearGradient>

                {/* Sahel Gradient */}
                <linearGradient id="sahelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  {baseMapMode === 'terrain' ? (
                    <>
                      <stop offset="0%" stopColor="#92400e" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#78350f" stopOpacity="0.55" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#78350f" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#451a03" stopOpacity="0.35" />
                    </>
                  )}
                </linearGradient>

                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Transform Group for Zoom & Pan */}
              <g
                transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                style={{
                  transformOrigin: '510px 420px',
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                {/* 1. Base Oceans & Seas */}
                {/* Mediterranean Sea Water */}
                <path
                  d="M 160 60 L 860 60 L 860 170 Q 750 160 690 130 Q 640 120 520 120 Q 370 130 280 140 Q 200 160 160 170 Z"
                  fill="url(#medSeaGrad)"
                  stroke="#0284c7"
                  strokeWidth="0.8"
                  opacity={baseMapMode === 'solvision' ? '0.5' : '0.75'}
                />
                <text x="560" y="95" fill="#38bdf8" fontSize="12" fontWeight="600" opacity="0.65" letterSpacing="2">
                  البحر الأبيض المتوسط (MEDITERRANEAN SEA)
                </text>

                {/* 2. Clear Country Territory Polygons with High Contrast Borders */}
                {/* ALGERIA TERRITORY (الجمهورية الجزائرية الديمقراطية الشعبية) */}
                <path
                  d="M 370 130 L 520 120 L 640 120 L 685 145 L 675 220 L 710 260 L 710 370 L 630 450 L 565 540 L 530 540 L 450 490 L 375 490 L 330 400 L 230 330 L 230 280 L 340 210 Z"
                  fill="url(#algeriaGrad)"
                  stroke={baseMapMode === 'terrain' ? '#d97706' : baseMapMode === 'solvision' ? '#06b6d4' : '#10b981'}
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  className="transition-all"
                />

                {/* TUNISIA BORDER */}
                <path
                  d="M 640 120 L 690 130 L 705 190 L 675 220 L 685 145 Z"
                  fill="#0f172a"
                  fillOpacity="0.4"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                />
                <text x="680" y="165" fill="#94a3b8" fontSize="9" fontWeight="bold">تونس</text>

                {/* LIBYA BORDER */}
                <path
                  d="M 675 220 L 705 190 L 830 210 L 830 420 L 710 370 L 710 260 Z"
                  fill="#0f172a"
                  fillOpacity="0.35"
                  stroke="#64748b"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                />
                <text x="740" y="290" fill="#94a3b8" fontSize="11" fontWeight="bold">ليبيا (LIBYA)</text>

                {/* NIGER TERRITORY (النيجر) */}
                <path
                  d="M 530 540 L 565 540 L 630 450 L 710 370 L 780 430 L 780 620 L 630 730 L 480 730 L 460 640 L 450 490 Z"
                  fill="url(#sahelGrad)"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <text x="630" y="550" fill="#fde68a" fontSize="12" fontWeight="bold" opacity="0.8">
                  النيجر (NIGER)
                </text>

                {/* MALI TERRITORY (مالي) */}
                <path
                  d="M 230 330 L 330 400 L 375 490 L 450 490 L 460 640 L 480 730 L 380 750 L 260 740 L 230 550 L 190 400 Z"
                  fill="#0f172a"
                  fillOpacity="0.45"
                  stroke="#94a3b8"
                  strokeWidth="1.4"
                  strokeDasharray="4 2"
                />
                <text x="330" y="560" fill="#cbd5e1" fontSize="11" fontWeight="bold" opacity="0.8">
                  مالي (MALI)
                </text>

                {/* CHAD BORDER (تشاد) */}
                <path
                  d="M 780 430 L 850 450 L 850 760 L 760 760 L 780 620 Z"
                  fill="#0f172a"
                  fillOpacity="0.3"
                  stroke="#64748b"
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                />
                <text x="800" y="580" fill="#94a3b8" fontSize="10" fontWeight="bold">تشاد</text>

                {/* NIGERIA / GULF REGION (نيجيريا) */}
                <path
                  d="M 480 730 L 630 730 L 660 780 L 460 780 Z"
                  fill="#022c22"
                  fillOpacity="0.4"
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <text x="540" y="760" fill="#86efac" fontSize="10" fontWeight="bold">نيجيريا (NIGERIA)</text>

                {/* 3. Geographical Topography & Terrain Elevation Elements */}
                {/* Atlas Mountains Ribbon */}
                <path
                  d="M 330 170 Q 450 150 580 150 Q 640 145 670 160"
                  fill="none"
                  stroke={baseMapMode === 'terrain' ? '#d97706' : '#475569'}
                  strokeWidth={baseMapMode === 'terrain' ? '5.5' : '3.5'}
                  strokeDasharray={baseMapMode === 'terrain' ? 'none' : '2 3'}
                  opacity={baseMapMode === 'terrain' ? '0.85' : '0.4'}
                />
                <text x="440" y="165" fill={baseMapMode === 'terrain' ? '#fde68a' : '#64748b'} fontSize={baseMapMode === 'terrain' ? '9' : '8'} fontWeight="bold">
                  سلسلة الأطلس الصحراوي (Saharan Atlas) {baseMapMode === 'terrain' ? '⛰️ 2,328m' : ''}
                </text>

                {/* Great Sand Erg Outlines */}
                <ellipse
                  cx="440"
                  cy="240"
                  rx="45"
                  ry="25"
                  fill="#f59e0b"
                  fillOpacity={baseMapMode === 'terrain' ? '0.18' : '0.04'}
                  stroke="#f59e0b"
                  strokeWidth={baseMapMode === 'terrain' ? '1.5' : '0.8'}
                  strokeDasharray={baseMapMode === 'terrain' ? 'none' : '3 3'}
                />
                <text x="440" y="243" fill="#d97706" fontSize="7.5" fontWeight="bold" textAnchor="middle" opacity="0.8">
                  العرق الغربي الكبير (Grand Erg Occidental)
                </text>

                <ellipse
                  cx="610"
                  cy="260"
                  rx="50"
                  ry="30"
                  fill="#f59e0b"
                  fillOpacity={baseMapMode === 'terrain' ? '0.18' : '0.04'}
                  stroke="#f59e0b"
                  strokeWidth={baseMapMode === 'terrain' ? '1.5' : '0.8'}
                  strokeDasharray={baseMapMode === 'terrain' ? 'none' : '3 3'}
                />
                <text x="610" y="263" fill="#d97706" fontSize="7.5" fontWeight="bold" textAnchor="middle" opacity="0.8">
                  العرق الشرقي الكبير (Grand Erg Oriental)
                </text>

                {/* Hoggar & Tassili Massif Topography */}
                <circle
                  cx="560"
                  cy="430"
                  r="48"
                  fill={baseMapMode === 'terrain' ? '#78350f' : '#334155'}
                  fillOpacity={baseMapMode === 'terrain' ? '0.35' : '0.12'}
                  stroke={baseMapMode === 'terrain' ? '#f59e0b' : '#475569'}
                  strokeWidth={baseMapMode === 'terrain' ? '2' : '1'}
                  strokeDasharray={baseMapMode === 'terrain' ? 'none' : '4 3'}
                />
                {baseMapMode === 'terrain' && (
                  <>
                    <circle cx="560" cy="430" r="30" fill="#92400e" fillOpacity="0.4" stroke="#fbbf24" strokeWidth="1.2" />
                    <circle cx="560" cy="430" r="14" fill="#b45309" fillOpacity="0.6" stroke="#fef08a" strokeWidth="1" />
                    <text x="560" y="433" fill="#fef08a" fontSize="7" fontWeight="900" textAnchor="middle">
                      قمة تاهات 2,908m
                    </text>
                  </>
                )}
                <text
                  x="560"
                  y={baseMapMode === 'terrain' ? '390' : '415'}
                  fill={baseMapMode === 'terrain' ? '#fef08a' : '#94a3b8'}
                  fontSize={baseMapMode === 'terrain' ? '9' : '8'}
                  fontWeight="bold"
                  textAnchor="middle"
                  opacity="0.9"
                >
                  كتلة الهقار وطاسيلي ناجر (Hoggar Plateau)
                </text>

                {/* River Niger Ribbon */}
                <path
                  d="M 260 740 Q 320 700 420 630 Q 480 680 490 720 Q 520 760 550 780"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth={baseMapMode === 'terrain' ? '3.5' : '2.5'}
                  opacity={baseMapMode === 'terrain' ? '0.9' : '0.7'}
                />
                <text x="350" y="690" fill="#38bdf8" fontSize="8.5" fontWeight="bold">حوض نهر النيجر (Niger Basin)</text>

                {/* Country Name in Algeria Center */}
                <text
                  x="480"
                  y="280"
                  fill={baseMapMode === 'terrain' ? '#d97706' : baseMapMode === 'solvision' ? '#38bdf8' : '#10b981'}
                  fontSize="22"
                  fontWeight="900"
                  letterSpacing="4"
                  opacity="0.35"
                  textAnchor="middle"
                >
                  الجزائر ALGERIA
                </text>

                {/* 4. Heatmap Surplus / Deficit Glow Areas */}
                {(activeLayer === 'all' || activeLayer === 'heatmap') && (
                  <g>
                    {REGIONAL_BALANCE.map((item) => (
                      <g key={item.zoneId}>
                        <circle
                          cx={item.coordinates.x}
                          cy={item.coordinates.y}
                          r={item.status === 'surplus' ? 44 : 36}
                          fill={item.status === 'surplus' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                          stroke={item.status === 'surplus' ? '#10b981' : '#ef4444'}
                          strokeWidth="1.5"
                          strokeDasharray={item.status === 'surplus' ? 'none' : '4 2'}
                        />
                        <circle
                          cx={item.coordinates.x}
                          cy={item.coordinates.y}
                          r="4"
                          fill={item.status === 'surplus' ? '#10b981' : '#ef4444'}
                        />
                        <rect
                          x={item.coordinates.x - 42}
                          y={item.coordinates.y + 12}
                          width="84"
                          height="16"
                          rx="4"
                          fill="#020617"
                          fillOpacity="0.85"
                          stroke={item.status === 'surplus' ? '#059669' : '#dc2626'}
                          strokeWidth="0.8"
                        />
                        <text
                          x={item.coordinates.x}
                          y={item.coordinates.y + 24}
                          textAnchor="middle"
                          fill={item.status === 'surplus' ? '#6ee7b7' : '#fca5a5'}
                          fontSize="9"
                          fontWeight="700"
                          className="pointer-events-none"
                        >
                          {item.status === 'surplus'
                            ? `+${(item.volumeTons / 1000).toFixed(0)}k طن فائض`
                            : `-${(item.volumeTons / 1000).toFixed(0)}k طن عجز`}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* 5. Agricultural Production Zones (SolVision) */}
                {(activeLayer === 'all' || activeLayer === 'agri') && (
                  <g>
                    {AGRICULTURAL_ZONES.map((zone) => (
                      <g key={zone.id}>
                        <circle
                          cx={zone.coordinates.x}
                          cy={zone.coordinates.y}
                          r="22"
                          fill="rgba(34, 197, 94, 0.16)"
                          stroke="#22c55e"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={zone.coordinates.x}
                          cy={zone.coordinates.y}
                          r="6"
                          fill="#4ade80"
                        />
                        <rect
                          x={zone.coordinates.x - 36}
                          y={zone.coordinates.y - 25}
                          width="72"
                          height="15"
                          rx="3"
                          fill="#022c22"
                          stroke="#16a34a"
                          strokeWidth="1"
                        />
                        <text
                          x={zone.coordinates.x}
                          y={zone.coordinates.y - 14}
                          textAnchor="middle"
                          fill="#86efac"
                          fontSize="8.5"
                          fontWeight="700"
                        >
                          {zone.nameAr.split(' ')[1] || zone.nameAr}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* 6. Trade Corridors & Strategic Pipelines Lines (High Contrast Glowing Vectors) */}
                {(activeLayer === 'all' || activeLayer === 'corridors' || activeLayer === 'pipelines') && (
                  <g>
                    {TRADE_CORRIDORS.filter(
                      (c) => activeLayer !== 'pipelines' || c.corridorType?.includes('pipeline')
                    ).map((corridor) => {
                      const isSelected = selectedCorridor?.id === corridor.id;
                      const isGas = corridor.corridorType === 'pipeline-gas';
                      const isWater = corridor.corridorType === 'pipeline-water';
                      const isPipeline = isGas || isWater;
                      const points = corridor.coordinatesPath.map((p) => `${p.x},${p.y}`).join(' ');

                      const strokeBase = isGas
                        ? isSelected ? '#f59e0b' : '#b45309'
                        : isWater
                        ? isSelected ? '#0284c7' : '#0369a1'
                        : isSelected ? '#10b981' : '#047857';

                      const strokeGlow = isGas
                        ? isSelected ? '#fde047' : '#fbbf24'
                        : isWater
                        ? isSelected ? '#7dd3fc' : '#38bdf8'
                        : isSelected ? '#34d399' : '#10b981';

                      return (
                        <g
                          key={corridor.id}
                          onClick={(e) => handleCorridorClick(corridor, e)}
                          className="cursor-pointer group"
                        >
                          {/* Ambient Glow */}
                          <polyline
                            points={points}
                            fill="none"
                            stroke={strokeBase}
                            strokeWidth={isSelected ? '14' : isPipeline ? '10' : '8'}
                            opacity={isSelected ? '0.75' : isPipeline ? '0.5' : '0.35'}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Core High-Intensity Line */}
                          <polyline
                            points={points}
                            fill="none"
                            stroke={strokeGlow}
                            strokeWidth={isSelected ? '4.5' : isPipeline ? '3.5' : '2.8'}
                            strokeDasharray={
                              isGas
                                ? '8 4'
                                : isWater
                                ? '6 3'
                                : corridor.id.includes('mali')
                                ? '6 4'
                                : 'none'
                            }
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter={isSelected ? (isGas ? 'url(#glowAmber)' : 'url(#glowGreen)') : undefined}
                          />

                          {/* Interactive Milestone Nodes Along Route */}
                          {corridor.coordinatesPath.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r={isSelected ? '4' : '2.5'}
                              fill={strokeGlow}
                              stroke="#0f172a"
                              strokeWidth="1"
                            />
                          ))}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* 7. Cargo Convoys (Live RFID Real-Time Movement) */}
                {(activeLayer === 'all' || activeLayer === 'convoys') && (
                  <g>
                    {SHIPMENT_CARGOS.map((cargo) => {
                      const isSelected = selectedCargo?.id === cargo.id;
                      return (
                        <g
                          key={cargo.id}
                          onClick={(e) => handleCargoClick(cargo, e)}
                          className="cursor-pointer group"
                        >
                          <circle
                            cx={cargo.currentLocation.x}
                            cy={cargo.currentLocation.y}
                            r={isSelected ? '14' : '10'}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2"
                            strokeDasharray="2 2"
                            opacity="0.9"
                          />
                          <rect
                            x={cargo.currentLocation.x - 7}
                            y={cargo.currentLocation.y - 7}
                            width="14"
                            height="14"
                            rx="3"
                            fill={isSelected ? '#0284c7' : '#0369a1'}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          {/* Truck Icon Pill Badge */}
                          <rect
                            x={cargo.currentLocation.x + 9}
                            y={cargo.currentLocation.y - 8}
                            width="68"
                            height="16"
                            rx="4"
                            fill="#0c4a6e"
                            stroke="#38bdf8"
                            strokeWidth="1"
                          />
                          <text
                            x={cargo.currentLocation.x + 43}
                            y={cargo.currentLocation.y + 4}
                            fill="#f0f9ff"
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            🚚 {cargo.tonnage}t {cargo.commodityAr}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* 8. Logistics Hubs Markers & Badges (Crystal Clear & Scaled) */}
                {(activeLayer === 'all' || activeLayer === 'hubs') && (
                  <g>
                    {LOGISTICS_HUBS.map((hub) => {
                      const isSelected = selectedHub?.id === hub.id;
                      const isAlgeria = hub.country === 'الجزائر';
                      const isMajor = hub.type === 'Central Dry Port' || hub.id === 'hub-tamanrasset' || hub.id === 'hub-inguezzam';

                      const dotColor = isAlgeria
                        ? hub.type === 'Cold-Chain Depot'
                          ? '#06b6d4'
                          : '#10b981'
                        : '#f59e0b';

                      const badgeBg = isSelected
                        ? '#064e3b'
                        : isAlgeria
                        ? '#022c22'
                        : '#451a03';

                      const badgeBorder = isSelected
                        ? '#34d399'
                        : isAlgeria
                        ? '#059669'
                        : '#d97706';

                      return (
                        <g
                          key={hub.id}
                          onClick={(e) => handleHubClick(hub, e)}
                          className="cursor-pointer group"
                        >
                          {/* Selected Pulse Ring */}
                          {isSelected && (
                            <circle
                              cx={hub.coordinates.x}
                              cy={hub.coordinates.y}
                              r="20"
                              fill="none"
                              stroke="#34d399"
                              strokeWidth="2.5"
                              strokeDasharray="4 3"
                            />
                          )}

                          {/* Outer Anchor Ring */}
                          <circle
                            cx={hub.coordinates.x}
                            cy={hub.coordinates.y}
                            r={isMajor ? '9' : '7'}
                            fill={dotColor}
                            stroke="#0f172a"
                            strokeWidth="2.5"
                            filter={isSelected ? 'url(#glowGreen)' : undefined}
                          />

                          {/* Inner Core Dot */}
                          <circle
                            cx={hub.coordinates.x}
                            cy={hub.coordinates.y}
                            r="3"
                            fill="#ffffff"
                          />

                          {/* High-Contrast Pill Label Above City (Never Blends with Background) */}
                          <g transform={`translate(${hub.coordinates.x}, ${hub.coordinates.y - 12})`}>
                            <rect
                              x="-42"
                              y="-16"
                              width="84"
                              height="17"
                              rx="4"
                              fill={badgeBg}
                              fillOpacity="0.95"
                              stroke={badgeBorder}
                              strokeWidth={isSelected ? '1.8' : '1'}
                              className="transition-all group-hover:stroke-white"
                            />
                            <text
                              x="0"
                              y="-4"
                              textAnchor="middle"
                              fill={isSelected ? '#ffffff' : '#f1f5f9'}
                              fontSize={isMajor ? '9.5' : '8.5'}
                              fontWeight="bold"
                              className="pointer-events-none"
                            >
                              {hub.nameAr.split(' ')[0]} {hub.nameAr.split(' ')[1] || ''}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            </svg>

            {/* Bottom Collapsible Legend (Clean, Compact, Toggleable) */}
            <div className="absolute bottom-2 left-2 right-2 z-30 transition-all">
              <div className="bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>دليل الرموز والممرات</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      انقر على أي عقدة أو ممر لمعاينة التفاصيل
                    </span>
                    <button
                      onClick={() => setShowLegend(!showLegend)}
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                    >
                      <span>{showLegend ? 'طي الدليل' : 'عرض التفاصيل'}</span>
                      {showLegend ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Content */}
                {showLegend && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <span>مراكز الجنوب الجزائري</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-cyan-400 shrink-0" />
                      <span>سلاسل التبريد والصوامع</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <span>محطات الساحل الإفريقي</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-1 bg-emerald-400 rounded shrink-0" />
                      <span>الطريق العابر للصحراء (N1)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-1 bg-amber-400 rounded shrink-0" />
                      <span>أنبوب الغاز القاري (TSGP)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-sky-600 shrink-0" />
                      <span>شاحنات التبريد (RFID)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-emerald-400 bg-emerald-950 shrink-0" />
                      <span>أقطاب الإنتاج الفلاحي</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-red-400 bg-red-950 shrink-0" />
                      <span>مناطق العجز الغذائي</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Detail Inspector Panel (Selected Item Card) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Hub Card */}
          {selectedHub && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative shadow-xl">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    {selectedHub.type}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    {selectedHub.nameAr}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedHub.nameFr}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                    {selectedHub.country}
                  </span>
                  <button
                    onClick={() => setSelectedHub(null)}
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                    aria-label="إغلاق تفاصيل المركز (X)"
                    title="إغلاق (X)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
                  <span className="text-xs text-slate-400">السعة الاستيعابية</span>
                  <p className="text-lg font-bold font-mono tabular-nums text-slate-100 mt-0.5">
                    {(selectedHub.capacityTons / 1000).toFixed(0)}k طن
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
                  <span className="text-xs text-slate-400">المخزون الاستراتيجي الحالي</span>
                  <p className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                    {(selectedHub.currentStockTons / 1000).toFixed(0)}k طن
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">سلسلة التبريد وحفظ الحبوب:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>{selectedHub.temperatureControlled ? 'متاحة ومؤمنة' : 'قيد التطوير'}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">التغذية بالطاقة الشمسية الصحراوية:</span>
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" />
                    <span>{selectedHub.solarPowered ? 'محطات شمسية مستقلة' : 'شبكة مركزية'}</span>
                  </span>
                </div>
              </div>

              {onOpenAiPlanner && (
                <button
                  onClick={onOpenAiPlanner}
                  className="w-full mt-2 py-2 px-3 bg-emerald-950/80 hover:bg-emerald-900/60 border border-emerald-800/80 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>محاكاة موازنة الإمداد من هذا المركز عبر الذكاء الاصطناعي</span>
                </button>
              )}
            </div>
          )}

          {/* Selected Cargo Card */}
          {selectedCargo && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative shadow-xl">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span>تتبع الشحنة الرقمية (RFID / QR)</span>
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    {selectedCargo.commodityAr}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedCargo.rfidCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-sky-950 border border-sky-800 text-sky-300 rounded font-mono">
                    {selectedCargo.tonnage} طن
                  </span>
                  <button
                    onClick={() => setSelectedCargo(null)}
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                    aria-label="إغلاق تفاصيل الشحنة (X)"
                    title="إغلاق (X)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">درجة حرارة الحاوية لحظياً:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedCargo.tempCelsius}°C (الهدف: {selectedCargo.targetTempCelsius}°C)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-3/4 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Selected Corridor Card */}
          {selectedCorridor && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative shadow-xl">
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    {selectedCorridor.corridorType?.includes('pipeline') ? (
                      <>
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400 font-bold">الأنبوب الاستراتيجي الإفريقي</span>
                      </>
                    ) : (
                      <span>شريان التجارة الإفريقي</span>
                    )}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    {selectedCorridor.nameAr}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedCorridor.nameFr}</p>
                </div>
                <button
                  onClick={() => setSelectedCorridor(null)}
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 shrink-0"
                  aria-label="إغلاق تفاصيل المسار أو الأنبوب (X)"
                  title="إغلاق تفاصيل المسار (X)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
                  <span className="text-xs text-slate-400">طول المسار</span>
                  <p className="text-lg font-bold font-mono tabular-nums text-slate-100 mt-0.5">
                    {selectedCorridor.distanceKm} كم
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
                  <span className="text-xs text-slate-400">
                    {selectedCorridor.corridorType?.includes('pipeline') ? 'طبيعة التدفق' : 'متوسط مدة العبور'}
                  </span>
                  <p className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                    {selectedCorridor.corridorType?.includes('pipeline')
                      ? 'تدفق لحظي مستمر'
                      : `${selectedCorridor.averageTransitDays} يوم`}
                  </p>
                </div>
              </div>

              {selectedCorridor.flowCapacity && (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>طاقة الضخ السنوية:</span>
                    <span className="font-mono text-amber-300 font-bold">{selectedCorridor.flowCapacity}</span>
                  </div>
                  {selectedCorridor.currentThroughput && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>التدفق اليومي الفعلي:</span>
                      <span className="font-mono text-emerald-300 font-bold">{selectedCorridor.currentThroughput}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Dedicated Pipeline Simulation Button */}
              {selectedCorridor.corridorType?.includes('pipeline') && (
                <button
                  onClick={() => setIsPipelineSimOpen(true)}
                  className="w-full mt-2 py-2.5 px-3 bg-gradient-to-r from-amber-600 via-emerald-600 to-sky-600 hover:brightness-110 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Flame className="w-4 h-4 fill-current" />
                  <span>تشغيل محاكاة تدفق هذا الأنبوب الاستراتيجي (Run Simulation)</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Hub Navigation Helper */}
          {!selectedHub && !selectedCorridor && !selectedCargo && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 block">المراكز اللوجستية الاستراتيجية الرئيسية:</span>
              <div className="flex flex-wrap gap-1.5">
                {LOGISTICS_HUBS.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => handleHubClick(hub)}
                    className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700/60 transition-colors"
                  >
                    {hub.nameAr.split(' ')[0]} {hub.nameAr.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Routes List Fetched Directly from PostGIS Backend */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>مسارات شبكة الإمداد القارية (بيانات PostGIS المباشرة)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مجلوبة حياً عبر <code className="font-mono text-emerald-300">apiService.getSupplyRoutes()</code> من قاعدة بيانات PostGIS
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>متصل ومزامن لحظياً</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-emerald-400 font-bold leading-snug">
                  {route.route_name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                  {route.corridor_code}
                </span>
              </div>

              <div className="text-slate-300 flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">الوجهة:</span>
                <span className="font-semibold text-slate-200">
                  {route.end_destination || route.route_name.split(' - ').pop()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-0.5">
                <span>المسافة: <strong className="font-mono text-slate-200">{route.distance_km} كم</strong></span>
                <span>زمن العبور: <strong className="font-mono text-amber-400">{route.avg_transit_time_hours} ساعة</strong></span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{route.solar_stops_count || 6} محطات شمسية</span>
                <span>{route.cold_depots_count || 3} غرف تبريد</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Pipeline Simulation Modal */}
      <StrategicPipelineSimulationModal
        isOpen={isPipelineSimOpen}
        onClose={() => setIsPipelineSimOpen(false)}
      />
    </div>
  );
};
