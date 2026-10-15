import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Database,
  Layers,
  ThermometerSnowflake,
  Wind,
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Download,
  Share2,
  Sparkles,
  Truck,
  Globe2,
  ChevronRight,
  TrendingUp,
  Cpu,
  Clock,
  ExternalLink,
  Flame,
  Radio,
  Sliders,
  Scale,
  X
} from 'lucide-react';
import { SiloHub, SiloUnit, NeoCloudTelemetryPacket } from '../types/platform';
import { INITIAL_SILO_HUBS, INITIAL_NEOCLOUD_PACKETS } from '../data/siloData';
import { apiService } from '../services/apiService';

interface InventoryManagementDashboardProps {
  onOpenSupplyChain?: () => void;
  onOpenAgriExports?: () => void;
  onOpenMap?: () => void;
  onClose?: () => void;
}

export const InventoryManagementDashboard: React.FC<InventoryManagementDashboardProps> = ({
  onOpenSupplyChain,
  onOpenAgriExports,
  onOpenMap,
  onClose,
}) => {
  // State
  const [hubs, setHubs] = useState<SiloHub[]>(INITIAL_SILO_HUBS);
  const [recentPackets, setRecentPackets] = useState<NeoCloudTelemetryPacket[]>(INITIAL_NEOCLOUD_PACKETS);
  const [selectedHub, setSelectedHub] = useState<SiloHub>(INITIAL_SILO_HUBS[0]);
  const [selectedUnit, setSelectedUnit] = useState<SiloUnit | null>(INITIAL_SILO_HUBS[0].siloUnits[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [activeCrop, setActiveCrop] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<string>('الآن');
  const [neocloudLatency, setNeocloudLatency] = useState(14);
  const [activeTabSubView, setActiveTabSubView] = useState<'silo-battery' | 'corridor-map' | 'telemetry-stream'>('silo-battery');

  // Modals state
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

  // Form states for modals
  const [intakeForm, setIntakeForm] = useState({
    hubId: INITIAL_SILO_HUBS[0].id,
    unitId: INITIAL_SILO_HUBS[0].siloUnits[0]?.unitId || '',
    tons: 1500,
    commodity: 'قمح صلب صحراوي (Durum)',
    sourceFarmOrConvoy: 'حقول توات والمنيعة - قافلة النخبة #88',
    moisturePct: 10.9,
    tempCelsius: 14.8,
  });

  const [dispatchForm, setDispatchForm] = useState({
    hubId: INITIAL_SILO_HUBS[0].id,
    unitId: INITIAL_SILO_HUBS[0].siloUnits[0]?.unitId || '',
    tons: 1200,
    destination: 'أغاديز - النيجر (الممر العابر للصحراء)',
    carrier: 'مجمع النقل البري الإفريقي SNTR',
    zlecafPassToken: 'ZLC-DZ-NER-2026-908',
  });

  const [rebalanceForm, setRebalanceForm] = useState({
    sourceHubId: 'silo-hub-adrar',
    targetHubId: 'silo-hub-tamanrasset',
    tons: 2500,
  });

  // Load from backend
  const fetchSiloData = async () => {
    try {
      const res = await apiService.getSiloInventory({
        region: activeRegion !== 'all' ? activeRegion : undefined,
        crop: activeCrop !== 'all' ? activeCrop : undefined,
        search: searchQuery || undefined,
      });
      if (res?.data?.hubs) {
        setHubs(res.data.hubs);
        // keep selected hub synced
        const updatedSelected = res.data.hubs.find((h: SiloHub) => h.id === selectedHub.id);
        if (updatedSelected) {
          setSelectedHub(updatedSelected);
          if (selectedUnit) {
            const updatedUnit = updatedSelected.siloUnits.find((u: SiloUnit) => u.unitId === selectedUnit.unitId);
            if (updatedUnit) setSelectedUnit(updatedUnit);
          }
        }
      }
      if (res?.data?.recentTelemetryPackets) {
        setRecentPackets(res.data.recentTelemetryPackets);
      }
      if (res?.data?.neocloudStreamStatus?.latencyMs) {
        setNeocloudLatency(res.data.neocloudStreamStatus.latencyMs);
      }
      setLastSyncTime(new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Fallback to local state:', err);
    }
  };

  // Live NeoCloud Simulation Loop (every 3.5s when active)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // Simulate minor sensor micro-fluctuations (IoT telemetry)
      setHubs((prevHubs) => {
        return prevHubs.map((hub) => {
          if (Math.random() > 0.4) return hub; // only random hubs pulse
          const randomUnitIndex = Math.floor(Math.random() * (hub.siloUnits?.length || 1));
          const updatedUnits = hub.siloUnits.map((unit, idx) => {
            if (idx !== randomUnitIndex) return unit;
            const deltaTemp = (Math.random() * 0.2 - 0.1);
            const newTemp = Number(Math.max(3.0, Math.min(22.0, unit.temperatureC + deltaTemp)).toFixed(1));
            return {
              ...unit,
              temperatureC: newTemp,
            };
          });
          return {
            ...hub,
            lastTelemetryAt: 'الآن (بث حي)',
            siloUnits: updatedUnits,
          };
        });
      });

      // Random jitter latency
      setNeocloudLatency((prev) => Math.max(11, Math.min(26, prev + (Math.floor(Math.random() * 3) - 1))));
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Aggregate Corridor Metrics
  const corridorSummary = useMemo(() => {
    const totalCapacity = hubs.reduce((acc, h) => acc + h.totalCapacityTons, 0);
    const totalStock = hubs.reduce((acc, h) => acc + h.currentStockTons, 0);
    const totalAvailable = Math.max(0, totalCapacity - totalStock);
    const avgUtilization = totalCapacity > 0 ? (totalStock / totalCapacity) * 100 : 0;
    const totalDailyIntake = hubs.reduce((acc, h) => acc + (h.dailyIntakeTons || 0), 0);
    const totalDailyDispatch = hubs.reduce((acc, h) => acc + (h.dailyDispatchTons || 0), 0);
    const totalSilosCount = hubs.reduce((acc, h) => acc + (h.silosCount || 0), 0);
    const alertHubsCount = hubs.filter((h) => h.utilizationRate >= 85).length;

    return {
      totalCapacity,
      totalStock,
      totalAvailable,
      avgUtilization,
      totalDailyIntake,
      totalDailyDispatch,
      totalSilosCount,
      alertHubsCount,
    };
  }, [hubs]);

  // Filtered Hubs
  const filteredHubs = useMemo(() => {
    return hubs.filter((hub) => {
      // Region filter
      if (activeRegion !== 'all' && hub.region !== activeRegion) return false;

      // Commodity filter
      if (activeCrop !== 'all') {
        const hasCrop = hub.siloUnits?.some((u) => u.commodity.includes(activeCrop));
        if (!hasCrop) return false;
      }

      // Status filter
      if (statusFilter === 'high' && hub.utilizationRate < 85) return false;
      if (statusFilter === 'normal' && (hub.utilizationRate >= 85 || hub.utilizationRate < 50)) return false;
      if (statusFilter === 'low' && hub.utilizationRate >= 50) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchName = hub.nameAr.toLowerCase().includes(q) || hub.nameEn.toLowerCase().includes(q);
        const matchLoc = hub.locationAr.toLowerCase().includes(q);
        const matchUnit = hub.siloUnits?.some((u) => u.name.toLowerCase().includes(q) || u.commodity.toLowerCase().includes(q));
        if (!matchName && !matchLoc && !matchUnit) return false;
      }

      return true;
    });
  }, [hubs, activeRegion, activeCrop, statusFilter, searchQuery]);

  // Handle Hub Selection
  const selectHub = (hub: SiloHub) => {
    setSelectedHub(hub);
    if (hub.siloUnits && hub.siloUnits.length > 0) {
      setSelectedUnit(hub.siloUnits[0]);
    } else {
      setSelectedUnit(null);
    }
  };

  // Toggle Fan / Aeration
  const toggleUnitAeration = (unitId: string) => {
    const updatedHub = {
      ...selectedHub,
      siloUnits: selectedHub.siloUnits.map((u) => {
        if (u.unitId !== unitId) return u;
        const newFanState = !u.aerationFanActive;
        const newTemp = newFanState ? Math.max(12.5, u.temperatureC - 0.5) : u.temperatureC;
        return {
          ...u,
          aerationFanActive: newFanState,
          temperatureC: Number(newTemp.toFixed(1)),
          status: newFanState ? ('aeration-active' as const) : u.status,
        };
      }),
    };

    setSelectedHub(updatedHub);
    setHubs((prev) => prev.map((h) => (h.id === updatedHub.id ? updatedHub : h)));

    // Emit packet locally
    const packet: NeoCloudTelemetryPacket = {
      packetId: `NEO-PKT-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toLocaleTimeString('ar-DZ') + ' UTC',
      nodeId: selectedHub.neocloudNodeId,
      hubId: selectedHub.id,
      hubNameAr: selectedHub.nameAr,
      siloUnitId: unitId,
      eventType: 'aeration-cycle',
      detailAr: `تحديث دورة التهوية والتبريد الشمسي للصومعة ${unitId} - حالة المروحة: ${!selectedUnit?.aerationFanActive ? 'نشطة' : 'متوقفة'}`,
      tempCelsius: selectedUnit?.temperatureC || 14.8,
      moisturePct: selectedUnit?.moisturePct || 11.0,
      sha256Sig: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
    };
    setRecentPackets((prev) => [packet, ...prev.slice(0, 19)]);

    showNotification(
      `تم ${!selectedUnit?.aerationFanActive ? 'تشغيل' : 'إيقاف'} دورة التهوية الشمسية بنجاح عبر عقدة NeoCloud`,
      'info'
    );
  };

  // Submit Intake
  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.intakeGrain(intakeForm);
      if (res?.updatedHub) {
        setHubs((prev) => prev.map((h) => (h.id === res.updatedHub.id ? res.updatedHub : h)));
        if (selectedHub.id === res.updatedHub.id) {
          setSelectedHub(res.updatedHub);
        }
      }
      if (res?.packet) {
        setRecentPackets((prev) => [res.packet, ...prev.slice(0, 19)]);
      }
      setIsIntakeModalOpen(false);
      showNotification(`تم تسجيل تفريغ ${intakeForm.tons.toLocaleString()} طن وإصدار إيصال التوثيق الرقمي بنجاح`, 'success');
    } catch (err) {
      // local fallback update
      applyLocalIntake(intakeForm);
      setIsIntakeModalOpen(false);
      showNotification(`تم تسجيل تفريغ الحبوب محلياً ومزامنتها مع NeoCloud`, 'success');
    }
  };

  const applyLocalIntake = (form: typeof intakeForm) => {
    setHubs((prev) =>
      prev.map((h) => {
        if (h.id !== form.hubId) return h;
        const updatedUnits = h.siloUnits.map((u) => {
          if (u.unitId !== form.unitId) return u;
          const newStored = Math.min(u.capacityTons, u.storedTons + form.tons);
          const newFill = Number(((newStored / u.capacityTons) * 100).toFixed(1));
          return {
            ...u,
            storedTons: newStored,
            fillPct: newFill,
            status: newFill >= 90 ? ('warning-high' as const) : ('optimal' as const),
          };
        });
        const totalStored = updatedUnits.reduce((acc, u) => acc + u.storedTons, 0);
        const totalCap = updatedUnits.reduce((acc, u) => acc + u.capacityTons, 0);
        return {
          ...h,
          currentStockTons: totalStored,
          utilizationRate: Number(((totalStored / totalCap) * 100).toFixed(1)),
          dailyIntakeTons: (h.dailyIntakeTons || 0) + form.tons,
          siloUnits: updatedUnits,
          lastTelemetryAt: 'الآن',
        };
      })
    );
  };

  // Submit Dispatch
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.dispatchGrain(dispatchForm);
      if (res?.updatedHub) {
        setHubs((prev) => prev.map((h) => (h.id === res.updatedHub.id ? res.updatedHub : h)));
        if (selectedHub.id === res.updatedHub.id) {
          setSelectedHub(res.updatedHub);
        }
      }
      if (res?.packet) {
        setRecentPackets((prev) => [res.packet, ...prev.slice(0, 19)]);
      }
      setIsDispatchModalOpen(false);
      showNotification(`تم شحن وتوجيه ${dispatchForm.tons.toLocaleString()} طن نحو ${dispatchForm.destination}`, 'success');
    } catch (err) {
      applyLocalDispatch(dispatchForm);
      setIsDispatchModalOpen(false);
      showNotification(`تم تسجيل شحن القافلة وتوليد تصريح العبور ZLECAF`, 'success');
    }
  };

  const applyLocalDispatch = (form: typeof dispatchForm) => {
    setHubs((prev) =>
      prev.map((h) => {
        if (h.id !== form.hubId) return h;
        const updatedUnits = h.siloUnits.map((u) => {
          if (u.unitId !== form.unitId) return u;
          const newStored = Math.max(0, u.storedTons - form.tons);
          const newFill = Number(((newStored / u.capacityTons) * 100).toFixed(1));
          return {
            ...u,
            storedTons: newStored,
            fillPct: newFill,
            status: newFill < 30 ? ('under-stocked' as const) : ('optimal' as const),
          };
        });
        const totalStored = updatedUnits.reduce((acc, u) => acc + u.storedTons, 0);
        const totalCap = updatedUnits.reduce((acc, u) => acc + u.capacityTons, 0);
        return {
          ...h,
          currentStockTons: totalStored,
          utilizationRate: Number(((totalStored / totalCap) * 100).toFixed(1)),
          dailyDispatchTons: (h.dailyDispatchTons || 0) + form.tons,
          siloUnits: updatedUnits,
          lastTelemetryAt: 'الآن',
        };
      })
    );
  };

  // Submit Rebalance
  const handleRebalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.rebalanceSilos(rebalanceForm);
      if (res?.sourceHub && res?.targetHub) {
        setHubs((prev) =>
          prev.map((h) => {
            if (h.id === res.sourceHub.id) return res.sourceHub;
            if (h.id === res.targetHub.id) return res.targetHub;
            return h;
          })
        );
      }
      if (res?.packet) {
        setRecentPackets((prev) => [res.packet, ...prev.slice(0, 19)]);
      }
      setIsRebalanceModalOpen(false);
      showNotification(`تم تفعيل خطة إعادة الموازنة اللوجستية ونقل الحبوب على مسار الصحراء`, 'info');
    } catch (err) {
      setIsRebalanceModalOpen(false);
      showNotification(`تم جدولة أمر النقل والموازنة الاستراتيجية عبر NeoCloud`, 'info');
    }
  };

  // Show Toast Notification
  const showNotification = (text: string, type: 'success' | 'info' | 'alert') => {
    setNotificationMsg({ text, type });
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  // Export CSV of Silo Data
  const exportSiloCsv = () => {
    const headers = ['Hub ID', 'Hub Name (AR)', 'Location', 'Region', 'Total Capacity (Tons)', 'Current Stock (Tons)', 'Utilization Rate %', 'Silos Count', 'NeoCloud Node', 'Daily Intake (Tons)', 'Daily Dispatch (Tons)'];
    const rows = hubs.map((h) => [
      h.id,
      `"${h.nameAr}"`,
      `"${h.locationAr}"`,
      h.region,
      h.totalCapacityTons,
      h.currentStockTons,
      h.utilizationRate,
      h.silosCount,
      h.neocloudNodeId,
      h.dailyIntakeTons || 0,
      h.dailyDispatchTons || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Silo_Inventory_Sahara_Route_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans" dir="rtl">
      {/* Toast Notification */}
      {notificationMsg && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border text-sm transition-all animate-bounce ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
              : notificationMsg.type === 'alert'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200'
              : 'bg-cyan-950/90 border-cyan-500/80 text-cyan-200'
          }`}
        >
          {notificationMsg.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {notificationMsg.type === 'alert' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          {notificationMsg.type === 'info' && <Radio className="w-5 h-5 text-cyan-400 shrink-0" />}
          <span className="font-medium">{notificationMsg.text}</span>
          <button onClick={() => setNotificationMsg(null)} className="mr-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner & Command Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                <Database className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                    لوحة إدارة مخزون الصوامع الاستراتيجية (Inventory Management Dashboard)
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    NeoCloud Real-Time IoT
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  رصد ومراقبة سعات التخزين الاسمية والاحتياطيات الحبوبية المبردة على امتداد محاور الممر العابر للصحراء (Algeria - Sahel Trade Route)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Streaming Toggle */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isLiveStreaming
                  ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 shadow-sm shadow-emerald-900/50'
                  : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="تفعيل أو إيقاف استلام نبضات الاستشعار التلقائية"
            >
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{isLiveStreaming ? 'البث الحي NeoCloud: نشط' : 'البث الحي: متوقف مؤقتاً'}</span>
            </button>

            {/* Sync Now */}
            <button
              onClick={fetchSiloData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>تحديث البيانات</span>
            </button>

            {/* Action 1: Intake */}
            <button
              onClick={() => {
                setIntakeForm({
                  ...intakeForm,
                  hubId: selectedHub.id,
                  unitId: selectedHub.siloUnits[0]?.unitId || '',
                });
                setIsIntakeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>تسجيل تفريغ وارد</span>
            </button>

            {/* Action 2: Dispatch */}
            <button
              onClick={() => {
                setDispatchForm({
                  ...dispatchForm,
                  hubId: selectedHub.id,
                  unitId: selectedHub.siloUnits[0]?.unitId || '',
                });
                setIsDispatchModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white shadow transition-colors"
            >
              <ArrowUpFromLine className="w-3.5 h-3.5" />
              <span>شحن وتصدير قاري</span>
            </button>

            {/* Action 3: Rebalance */}
            <button
              onClick={() => setIsRebalanceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-700 hover:bg-cyan-600 text-white shadow transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>موازنة لوجستية</span>
            </button>

            {/* Action 4: Certificate */}
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition-colors"
              title="عرض الختم الرقمي السحابي للسيادة الغذائية"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>شهادة NeoCloud</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportSiloCsv}
              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
              title="تصدير جدول السعات كملف CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Prominent Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/90 text-red-200 border border-red-700/80 hover:border-red-600 rounded-lg text-xs font-bold transition-all shadow-md shrink-0 ml-1"
                aria-label="إغلاق إدارة الصوامع والعودة للخريطة (X)"
                title="إغلاق والعودة للخريطة (X)"
              >
                <span>إغلاق (X)</span>
                <X className="w-4 h-4 text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Telemetry Status Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>بوابة NeoCloud IoT:</span>
              <span className="font-mono text-emerald-300">neocloud.stream.agri.gov.dz</span>
            </span>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <span>العقد المتصلة: <strong className="font-mono text-white">12 مجمعاً إقليمياً</strong></span>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <span>المجسات الميدانية: <strong className="font-mono text-white">1,488 مجساً ذكياً</strong></span>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <span>زمن الاستجابة (Latency): <strong className="font-mono text-emerald-400">{neocloudLatency} ms</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span>آخر تحديث حزمي: <strong className="font-mono text-slate-300">{lastSyncTime}</strong></span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
              TLS 1.3 / ChaCha20
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate Corridor Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Capacity */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>طاقة صوامع الممر الكلية</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg lg:text-xl font-bold font-mono text-white tabular-nums">
            {(corridorSummary.totalCapacity / 1000).toFixed(0)} <span className="text-xs font-sans text-slate-400">ألف طن</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>عبر {corridorSummary.totalSilosCount} صومعة وعنبر</span>
            <span className="text-emerald-400 font-mono">100%</span>
          </div>
        </div>

        {/* Current Stored Stock */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>المخزون الفعلي المعبأ</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg lg:text-xl font-bold font-mono text-amber-300 tabular-nums">
            {(corridorSummary.totalStock / 1000).toFixed(0)} <span className="text-xs font-sans text-slate-400">ألف طن</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>نسبة الإشغال الإجمالية</span>
            <span className="text-amber-400 font-mono font-bold">{corridorSummary.avgUtilization.toFixed(1)}%</span>
          </div>
        </div>

        {/* Available Space */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>الفراغ التخزيني المتاح</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg lg:text-xl font-bold font-mono text-cyan-300 tabular-nums">
            {(corridorSummary.totalAvailable / 1000).toFixed(0)} <span className="text-xs font-sans text-slate-400">ألف طن</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>جاهز لاستيعاب الحصاد</span>
            <span className="text-cyan-400 font-mono">{(100 - corridorSummary.avgUtilization).toFixed(1)}%</span>
          </div>
        </div>

        {/* 24h Inflow */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>التدفق الوارد (24 ساعة)</span>
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg lg:text-xl font-bold font-mono text-emerald-300 tabular-nums">
            +{(corridorSummary.totalDailyIntake).toLocaleString()} <span className="text-xs font-sans text-slate-400">طن/يوم</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span>حصاد دوائر الرش المحوري</span>
          </div>
        </div>

        {/* 24h Outflow */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>التدفق المصدر (24 ساعة)</span>
            <ArrowUpFromLine className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg lg:text-xl font-bold font-mono text-blue-300 tabular-nums">
            -{(corridorSummary.totalDailyDispatch).toLocaleString()} <span className="text-xs font-sans text-slate-400">طن/يوم</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span>شحن قوافل الساحل والشمال</span>
          </div>
        </div>

        {/* Strategic Buffer Days */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>أيام الأمان الغذائي السيادي</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg lg:text-xl font-bold font-mono text-emerald-400 tabular-nums">
            205 <span className="text-xs font-sans text-slate-400">يوماً</span>
          </div>
          <div className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>تغطية كاملة لاحتياج الساحل</span>
          </div>
        </div>
      </div>

      {/* Live NeoCloud Telemetry Ribbon */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-white">نبضات البث السحابي اللحظي (NeoCloud Stream):</span>
        </div>

        {/* Ticker marquee */}
        <div className="overflow-hidden flex-1 relative h-6">
          <div className="flex items-center gap-6 whitespace-nowrap animate-none overflow-x-auto text-xs text-slate-300 scrollbar-none">
            {recentPackets.slice(0, 4).map((pkt) => (
              <div key={pkt.packetId} className="inline-flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 shrink-0">
                <span className="font-mono text-slate-500 text-[10px]">{pkt.timestamp}</span>
                <span className="text-emerald-400 font-medium">[{pkt.hubNameAr}]</span>
                <span className="text-slate-300">{pkt.detailAr}</span>
                <span className="text-[10px] font-mono text-amber-400/80">حرارة: {pkt.tempCelsius}°م</span>
                <span className="text-[10px] font-mono text-slate-500">{pkt.sha256Sig}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setActiveTabSubView('telemetry-stream')}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 font-medium"
        >
          <span>عرض سجل البث التام</span>
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* Main Interactive Work Area: Hub Selector + Visual Silo Battery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hubs List and Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">مراكز الصوامع على مسار الصحراء</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {filteredHubs.length} / {hubs.length} مجمع
              </span>
            </div>

            {/* Search Box */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الموقع، أو نوع المحصول..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Region Filter Segmented Tabs */}
            <div className="space-y-1.5 mb-3">
              <span className="text-[11px] text-slate-400 block font-medium">القطاع الجغرافي:</span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <button
                  onClick={() => setActiveRegion('all')}
                  className={`px-2 py-1.5 rounded text-center transition-colors ${
                    activeRegion === 'all'
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  كافة القطاعات
                </button>
                <button
                  onClick={() => setActiveRegion('Sahara-Central')}
                  className={`px-2 py-1.5 rounded text-center transition-colors ${
                    activeRegion === 'Sahara-Central'
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  وسط الصحراء (توات وميزاب)
                </button>
                <button
                  onClick={() => setActiveRegion('Sahara-South')}
                  className={`px-2 py-1.5 rounded text-center transition-colors ${
                    activeRegion === 'Sahara-South'
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  أقصى الجنوب (الهقار والحدود)
                </button>
                <button
                  onClick={() => setActiveRegion('Sahel-Corridor')}
                  className={`px-2 py-1.5 rounded text-center transition-colors ${
                    activeRegion === 'Sahel-Corridor'
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  محطات الساحل (النيجر ومالي)
                </button>
              </div>
            </div>

            {/* Commodity Filter */}
            <div className="flex items-center gap-2 mb-3 text-[11px]">
              <span className="text-slate-400 shrink-0">المحصول:</span>
              <select
                value={activeCrop}
                onChange={(e) => setActiveCrop(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">كافة المحاصيل المخزنة</option>
                <option value="قمح صلب">قمح صلب (Durum Wheat)</option>
                <option value="قمح لين">قمح لين (Soft Wheat)</option>
                <option value="شعير">شعير علفي (Barley)</option>
                <option value="تمور">تمور دقلة نور مبردة</option>
                <option value="بذور">بذور معتمدة</option>
              </select>
            </div>

            {/* Hubs Scrollable List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredHubs.map((hub) => {
                const isSelected = selectedHub.id === hub.id;
                const isHigh = hub.utilizationRate >= 85;

                return (
                  <div
                    key={hub.id}
                    onClick={() => selectHub(hub)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isHigh ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                            }`}
                          />
                          <h3 className="text-xs font-bold text-white leading-snug">
                            {hub.nameAr}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{hub.locationAr}</p>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                          isHigh
                            ? 'bg-amber-950/80 border border-amber-700 text-amber-300'
                            : 'bg-slate-850 text-emerald-400 border border-slate-700'
                        }`}
                      >
                        {hub.utilizationRate}%
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-2.5">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh
                              ? 'bg-gradient-to-l from-amber-500 to-amber-400'
                              : 'bg-gradient-to-l from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${Math.min(100, hub.utilizationRate)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>المخزون: {(hub.currentStockTons / 1000).toFixed(0)}k طن</span>
                        <span>السعة: {(hub.totalCapacityTons / 1000).toFixed(0)}k طن</span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        <span className="font-mono">{hub.neocloudNodeId.replace('NEOCLOUD-EDGE-', '')}</span>
                      </span>
                      <span>{hub.silosCount} صومعة</span>
                      <span className="text-slate-500 font-mono">{hub.lastTelemetryAt}</span>
                    </div>
                  </div>
                );
              })}

              {filteredHubs.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  لا توجد مراكز صوامع مطابقة لمعايير البحث المحددة.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Silo Battery & Detailed Telemetry (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Selected Hub Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-mono text-emerald-300">
                    {selectedHub.neocloudNodeId}
                  </span>
                  <span className="text-xs text-slate-400">· {selectedHub.country}</span>
                  <span className="text-xs text-slate-400">· {selectedHub.region}</span>
                </div>
                <h2 className="text-lg lg:text-xl font-bold text-white mt-1">
                  {selectedHub.nameAr}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">{selectedHub.locationAr}</p>
              </div>

              {/* Action buttons inside hub */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIntakeForm({
                      ...intakeForm,
                      hubId: selectedHub.id,
                      unitId: selectedUnit?.unitId || selectedHub.siloUnits[0]?.unitId || '',
                    });
                    setIsIntakeModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1.5 transition-colors"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>تفريغ في {selectedHub.nameAr.split(' ')[2] || 'المركز'}</span>
                </button>
                <button
                  onClick={() => {
                    setDispatchForm({
                      ...dispatchForm,
                      hubId: selectedHub.id,
                      unitId: selectedUnit?.unitId || selectedHub.siloUnits[0]?.unitId || '',
                    });
                    setIsDispatchModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-700 hover:bg-amber-600 text-white flex items-center gap-1.5 transition-colors"
                >
                  <ArrowUpFromLine className="w-3.5 h-3.5" />
                  <span>شحن قافلة</span>
                </button>
              </div>
            </div>

            {/* Hub Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">السعة التخزينية المتاحة</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {((selectedHub.totalCapacityTons - selectedHub.currentStockTons) / 1000).toFixed(1)}k طن
                </span>
                <span className="text-[10px] text-slate-500">من إجمالي {(selectedHub.totalCapacityTons / 1000).toFixed(0)}k طن</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">نسبة الإشغال اللحظية</span>
                <span className={`text-base font-bold font-mono mt-0.5 block ${
                  selectedHub.utilizationRate >= 85 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {selectedHub.utilizationRate}%
                </span>
                <span className="text-[10px] text-slate-500">حالة استقرار آمنة</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">التبريد بالطاقة الشمسية</span>
                <span className="text-base font-bold text-emerald-300 mt-0.5 block flex items-center gap-1">
                  <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
                  <span>100% نشط</span>
                </span>
                <span className="text-[10px] text-slate-500">ألواح كهروضوئية 1.5 MW</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">أيام الأمان التخزيني</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {selectedHub.securityBufferDays} يوماً
                </span>
                <span className="text-[10px] text-emerald-400">مخزون استراتيجي سيادي</span>
              </div>
            </div>

            {selectedHub.alertNotice && (
              <div className="mt-3 p-2.5 bg-amber-950/40 border border-amber-800/80 rounded-lg flex items-center gap-2 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{selectedHub.alertNotice}</span>
              </div>
            )}
          </div>

          {/* Sub Navigation: Silo Battery vs Route Map vs Telemetry Stream */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTabSubView('silo-battery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTabSubView === 'silo-battery'
                    ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>بطارية الصوامع الرأسية (Silo Battery Visualizer)</span>
              </button>

              <button
                onClick={() => setActiveTabSubView('corridor-map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTabSubView === 'corridor-map'
                    ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>مخطط الممر الصحراوي الجيومكاني</span>
              </button>

              <button
                onClick={() => setActiveTabSubView('telemetry-stream')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTabSubView === 'telemetry-stream'
                    ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>سجل بث NeoCloud الحي</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              {selectedHub.siloUnits?.length || 0} وحدات صومعة مراقبة
            </span>
          </div>

          {/* VIEW 1: SILO BATTERY VISUALIZER */}
          {activeTabSubView === 'silo-battery' && (
            <div className="space-y-4">
              {/* Interactive Cylindrical Silo Tanks Grid */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>محاكاة المقاطع الرأسية للصوامع (Vertical Silo Cross-Sections)</span>
                      <span className="text-[10px] text-emerald-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        مجسات الرادار اللاتلامسي نشطة
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      انقر على أي صومعة لعرض قراءات مجسات الأعماق، الرطوبة، والتحكم في دورة التهوية
                    </p>
                  </div>
                </div>

                {/* Grid of Silo Cylinders */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {selectedHub.siloUnits?.map((unit) => {
                    const isUnitSelected = selectedUnit?.unitId === unit.unitId;
                    const isHigh = unit.fillPct >= 90;
                    const isColdDate = unit.commodity.includes('تمور') || unit.commodity.includes('بطاطا');

                    // Color theme for grain
                    const fillGradient = isColdDate
                      ? 'from-teal-600 via-teal-500 to-emerald-400'
                      : isHigh
                      ? 'from-amber-600 via-amber-500 to-yellow-400'
                      : 'from-amber-600 via-yellow-600 to-amber-400';

                    return (
                      <div
                        key={unit.unitId}
                        onClick={() => setSelectedUnit(unit)}
                        className={`relative rounded-xl border p-3 flex flex-col items-center cursor-pointer transition-all ${
                          isUnitSelected
                            ? 'bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        {/* Silo Top Dome Header */}
                        <div className="w-16 h-4 bg-slate-800 rounded-t-full border-t border-x border-slate-700 relative flex items-center justify-center">
                          {unit.aerationFanActive && (
                            <Wind className="w-2.5 h-2.5 text-cyan-400 animate-spin absolute" />
                          )}
                        </div>

                        {/* Silo Vertical Cylinder Container */}
                        <div className="w-24 h-48 bg-slate-900 border-2 border-slate-700 rounded-b-lg relative overflow-hidden flex flex-col justify-end shadow-inner">
                          {/* Laser / Radar Measurement beam line */}
                          <div
                            className="absolute top-0 inset-x-0 border-b border-rose-500/70 border-dashed z-10"
                            style={{ top: `${Math.max(4, 100 - unit.fillPct)}%` }}
                          />

                          {/* Grain Fill Mass with Animated Waves */}
                          <div
                            className={`w-full bg-gradient-to-t ${fillGradient} transition-all duration-700 relative`}
                            style={{ height: `${unit.fillPct}%` }}
                          >
                            <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:6px_6px] opacity-40" />
                          </div>

                          {/* Live percentage label inside cylinder */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                            <span className="text-sm font-bold font-mono text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                              {unit.fillPct}%
                            </span>
                            <span className="text-[10px] font-mono text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                              {(unit.storedTons / 1000).toFixed(1)}k طن
                            </span>
                          </div>

                          {/* Height meters gauge */}
                          <div className="absolute left-1 top-2 bottom-2 w-1 border-r border-slate-700/60 flex flex-col justify-between text-[8px] font-mono text-slate-500 pointer-events-none">
                            <span>{unit.maxHeightMeters}m</span>
                            <span>{unit.radarLevelMeters}m</span>
                            <span>0m</span>
                          </div>
                        </div>

                        {/* Silo Unit Labels */}
                        <div className="mt-2 text-center w-full">
                          <span className="text-xs font-bold text-white block truncate">
                            {unit.unitId}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate" title={unit.commodity}>
                            {unit.commodity.split(' ')[0]} {unit.commodity.split(' ')[1] || ''}
                          </span>

                          <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-mono">
                            <span className="flex items-center text-cyan-400">
                              <ThermometerSnowflake className="w-2.5 h-2.5 ml-0.5" />
                              {unit.temperatureC}°م
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-amber-400">
                              {unit.moisturePct}% رطوبة
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Silo Unit Deep-Dive Drawer */}
              {selectedUnit && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">
                            {selectedUnit.name}
                          </h4>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {selectedUnit.unitId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          المحصول: <strong className="text-slate-200">{selectedUnit.commodity}</strong> · تاريخ آخر تعقيم ومكافحة: <span className="font-mono text-slate-300">{selectedUnit.pestInspectionDate}</span>
                        </p>
                      </div>
                    </div>

                    {/* Aeration fan toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleUnitAeration(selectedUnit.unitId)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selectedUnit.aerationFanActive
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                            : 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Wind className={`w-3.5 h-3.5 ${selectedUnit.aerationFanActive ? 'animate-spin text-cyan-400' : ''}`} />
                        <span>
                          {selectedUnit.aerationFanActive ? 'دورة التهوية: نشطة' : 'تشغيل دورة التهوية والتبريد'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Multi-depth probe readings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
                    {/* Temperature */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>حرارة الكتلة الحبوبية</span>
                        <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-cyan-300">
                        {selectedUnit.temperatureC}°م
                      </div>
                      <span className="text-[10px] text-emerald-400 mt-1 block">
                        نطاق آمن (مثالي أقل من 18°م)
                      </span>
                    </div>

                    {/* Moisture */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>الرطوبة النسبية للحبوب</span>
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-amber-300">
                        {selectedUnit.moisturePct}%
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        رطوبة تخزين جاف مثالية (10-12%)
                      </span>
                    </div>

                    {/* Inflow / Outflow Throughput */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>معدل الشحن والتفريغ اللحظي</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-sm font-bold font-mono text-white">
                        +{selectedUnit.inflowRateTph} / -{selectedUnit.outflowRateTph} <span className="text-[10px] font-sans text-slate-400">طن/ساعة</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        موزع سيور إلكتروني
                      </span>
                    </div>

                    {/* Radar Level */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>منسوب عمود الحبوب (رادار)</span>
                        <Radio className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="text-lg font-bold font-mono text-white">
                        {selectedUnit.radarLevelMeters}m <span className="text-xs text-slate-400 font-sans">/ {selectedUnit.maxHeightMeters}m</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        دقة المجس: ±2 مم
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: CORRIDOR GEOSPATIAL PATH */}
          {activeTabSubView === 'corridor-map' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    <span>سلسلة صوامع الممر العابر للصحراء (الشمال نحو الساحل)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    التوزيع المتسلسل لقواعد التخزين الاستراتيجي على طول طريق الوحدة الإفريقية
                  </p>
                </div>
                {onOpenMap && (
                  <button
                    onClick={onOpenMap}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
                  >
                    <span>فتح الخريطة التفاعلية الكاملة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Step-by-Step Sahara Route Chain */}
              <div className="space-y-3">
                {hubs.map((hub, index) => {
                  const isCurrentSelected = selectedHub.id === hub.id;
                  const isNearFull = hub.utilizationRate >= 85;

                  return (
                    <div
                      key={hub.id}
                      onClick={() => selectHub(hub)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isCurrentSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center text-slate-300 shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">
                              {hub.nameAr}
                            </h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {hub.country}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {hub.locationAr} · {hub.silosCount} صومعة
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">المخزون / السعة</span>
                          <span className="text-slate-200 font-bold">
                            {(hub.currentStockTons / 1000).toFixed(0)}k / {(hub.totalCapacityTons / 1000).toFixed(0)}k طن
                          </span>
                        </div>

                        <div className="w-24">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span>الإشغال</span>
                            <span className={isNearFull ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                              {hub.utilizationRate}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isNearFull ? 'bg-amber-400' : 'bg-emerald-400'}`}
                              style={{ width: `${hub.utilizationRate}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectHub(hub);
                            setActiveTabSubView('silo-battery');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 transition-colors"
                        >
                          معاينة الصوامع
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: TELEMETRY AUDIT STREAM */}
          {activeTabSubView === 'telemetry-stream' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>سجل حزم الاستشعار السحابية الموثقة (NeoCloud Telemetry Stream Log)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    سجل لحظي غير قابل للتعديل للحركات المخزنية، قياسات الرطوبة، وأوامر الشحن
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                  {recentPackets.length} حزمة محفوظة
                </span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {recentPackets.map((pkt) => (
                  <div
                    key={pkt.packetId}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {pkt.timestamp}
                        </span>
                        <span className="font-bold text-emerald-300">
                          {pkt.hubNameAr}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-850 text-slate-400">
                          {pkt.nodeId}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            pkt.eventType === 'intake'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : pkt.eventType === 'dispatch'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          }`}
                        >
                          {pkt.eventType.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs">{pkt.detailAr}</p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                      <span className="text-cyan-400">حرارة: {pkt.tempCelsius}°م</span>
                      <span className="text-amber-400">رطوبة: {pkt.moisturePct}%</span>
                      <span className="text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {pkt.sha256Sig}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: RECORD GRAIN INTAKE                             */}
      {/* ======================================================== */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">تسجيل تفريغ محصول وارد إلى الصوامع</h3>
              </div>
              <button
                onClick={() => setIsIntakeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">مركز الصوامع المستلم:</label>
                <select
                  value={intakeForm.hubId}
                  onChange={(e) => {
                    const hub = hubs.find((h) => h.id === e.target.value);
                    setIntakeForm({
                      ...intakeForm,
                      hubId: e.target.value,
                      unitId: hub?.siloUnits[0]?.unitId || '',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                >
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nameAr} ({h.locationAr})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">وحدة الصومعة المستهدفة:</label>
                  <select
                    value={intakeForm.unitId}
                    onChange={(e) => setIntakeForm({ ...intakeForm, unitId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  >
                    {hubs.find((h) => h.id === intakeForm.hubId)?.siloUnits.map((u) => (
                      <option key={u.unitId} value={u.unitId}>
                        {u.unitId} - {u.commodity.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">الكمية المفرغة (طن):</label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="50"
                    value={intakeForm.tons}
                    onChange={(e) => setIntakeForm({ ...intakeForm, tons: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">المصدر ومحدد القافلة الميدانية:</label>
                <input
                  type="text"
                  value={intakeForm.sourceFarmOrConvoy}
                  onChange={(e) => setIntakeForm({ ...intakeForm, sourceFarmOrConvoy: e.target.value })}
                  placeholder="مثال: حقول الرش المحوري بالمنيعة - قافلة #88"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">نسبة الرطوبة المقاسة (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="8"
                    max="18"
                    value={intakeForm.moisturePct}
                    onChange={(e) => setIntakeForm({ ...intakeForm, moisturePct: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">درجة حرارة الحبوب (°م):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="35"
                    value={intakeForm.tempCelsius}
                    onChange={(e) => setIntakeForm({ ...intakeForm, tempCelsius: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-emerald-200 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>سيتم توقيع إيصال الاستلام بحزام أمان SHA-256 وبثه فوراً عبر شبكة NeoCloud الوطنية.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  تأكيد وتوقيع إيصال التفريغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DISPATCH TRANS-SAHARAN EXPORT CONVOY            */}
      {/* ======================================================== */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">شحن وتوجيه قافلة تصدير عبر الممر الصحراوي</h3>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">مركز الصوامع المصدر للشحنة:</label>
                <select
                  value={dispatchForm.hubId}
                  onChange={(e) => {
                    const hub = hubs.find((h) => h.id === e.target.value);
                    setDispatchForm({
                      ...dispatchForm,
                      hubId: e.target.value,
                      unitId: hub?.siloUnits[0]?.unitId || '',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                >
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nameAr} (متوفر: {(h.currentStockTons / 1000).toFixed(0)}k طن)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">الصومعة المحددة:</label>
                  <select
                    value={dispatchForm.unitId}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, unitId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  >
                    {hubs.find((h) => h.id === dispatchForm.hubId)?.siloUnits.map((u) => (
                      <option key={u.unitId} value={u.unitId}>
                        {u.unitId} ({(u.storedTons / 1000).toFixed(1)}k طن)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">الكمية المشحونة (طن):</label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="50"
                    value={dispatchForm.tons}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, tons: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">الوجهة على مسار الصحراء:</label>
                <input
                  type="text"
                  value={dispatchForm.destination}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, destination: e.target.value })}
                  placeholder="مثال: أغاديز - النيجر (الممر العابر للصحراء)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">الناقل المعتمد:</label>
                  <input
                    type="text"
                    value={dispatchForm.carrier}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, carrier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">رمز مرور ZLECAF الرقمي:</label>
                  <input
                    type="text"
                    value={dispatchForm.zlecafPassToken}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, zlecafPassToken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-amber-200 text-[11px] flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>سيتم خصم الكمية تلقائياً من مخزون الصومعة وتوليد مانيفست الشحن الرقمي المعتمد.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium"
                >
                  إصدار أمر الشحن والتحريك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CORRIDOR REBALANCE LOGISTICS                    */}
      {/* ======================================================== */}
      {isRebalanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">الموازنة اللوجستية الذكية بين الصوامع</h3>
              </div>
              <button
                onClick={() => setIsRebalanceModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRebalanceSubmit} className="space-y-4 mt-4 text-xs">
              <p className="text-slate-300 text-xs">
                تتيح هذه الوظيفة تفريغ الضغط التخزيني عن الصوامع التي قاربت الامتلاء (أكثر من 85%) وإعادة توجيه الفائض نحو صوامع الاحتياط على مسار الصحراء.
              </p>

              <div>
                <label className="block text-slate-300 font-medium mb-1">المركز المصدر (المثقل):</label>
                <select
                  value={rebalanceForm.sourceHubId}
                  onChange={(e) => setRebalanceForm({ ...rebalanceForm, sourceHubId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                >
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nameAr} - إشغال {h.utilizationRate}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">المركز المستهدف لاستيعاب الفائض:</label>
                <select
                  value={rebalanceForm.targetHubId}
                  onChange={(e) => setRebalanceForm({ ...rebalanceForm, targetHubId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                >
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nameAr} - متوفر {((h.totalCapacityTons - h.currentStockTons) / 1000).toFixed(0)}k طن
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">حجم التحويل الاستراتيجي (طن):</label>
                <input
                  type="number"
                  min="500"
                  max="15000"
                  step="250"
                  value={rebalanceForm.tons}
                  onChange={(e) => setRebalanceForm({ ...rebalanceForm, tons: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRebalanceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-medium"
                >
                  تفعيل خطة الموازنة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: NEOCLOUD CRYPTOGRAPHIC INTEGRITY CERTIFICATE     */}
      {/* ======================================================== */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">شهادة السيادة الغذائية الرقمية (NeoCloud Integrity Seal)</h3>
              </div>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <p>
                تم التحقق من مطابقة بيانات المخزون المجمعة مع العقد السيادية لسحابة الجزائر الوطنية Tier-IV، وهي محصنة ضد أي تعديل غير مصرح به.
              </p>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Root Authority:</span>
                  <span className="text-emerald-300">Algerian Food Security Telemetry Mesh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway:</span>
                  <span className="text-slate-300">neocloud.stream.agri.gov.dz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Block Signature:</span>
                  <span className="text-amber-300 truncate max-w-[220px]">
                    0x8a901b22e4fa78c41d99ef87b321a0029b4a
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Corridor Total:</span>
                  <span className="text-white font-bold">{corridorSummary.totalStock.toLocaleString()} Metric Tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Timestamp:</span>
                  <span className="text-slate-300">{new Date().toISOString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  إغلاق الشهادة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
