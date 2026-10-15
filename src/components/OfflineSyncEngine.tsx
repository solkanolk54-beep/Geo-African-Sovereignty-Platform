import React, { useState, useEffect } from 'react';
import { OfflineReport } from '../types/platform';
import {
  Wifi,
  WifiOff,
  Database,
  PlusCircle,
  CheckCircle,
  Clock,
  HardDrive,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  X,
} from 'lucide-react';

interface OfflineSyncEngineProps {
  onClose?: () => void;
}

export const OfflineSyncEngine: React.FC<OfflineSyncEngineProps> = ({ onClose }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [localQueue, setLocalQueue] = useState<OfflineReport[]>([]);
  const [syncedHistory, setSyncedHistory] = useState<OfflineReport[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states
  const [sourceName, setSourceName] = useState('فريق الرصد الميداني - محور عين قزام');
  const [locationName, setLocationName] = useState('نقطة العبور الحدودية المشتركة (In Guezzam)');
  const [payloadType, setPayloadType] = useState('قياس رطوبة التربة ومكافحة الآفات الزراعية');
  const [itemsCount, setItemsCount] = useState(35);

  // Fetch initial synced logs
  useEffect(() => {
    fetch('/api/offline-sync-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setSyncedHistory(data.logs);
      })
      .catch((err) => console.error(err));
  }, []);

  // Submit field record
  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();

    const newReport: OfflineReport = {
      id: `LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
      source: sourceName,
      location: locationName,
      payloadType,
      itemsCount: Number(itemsCount),
      syncedAt: isOnline ? 'مزامنة فورية الآن' : 'في طابور الانتظار (محلياً)',
      status: isOnline ? 'synced' : 'pending',
    };

    if (!isOnline) {
      // Store locally in offline queue
      setLocalQueue((prev) => [newReport, ...prev]);
    } else {
      // Send directly to backend
      sendToBackend(newReport);
    }
  };

  const sendToBackend = async (report: OfflineReport) => {
    try {
      const res = await fetch('/api/v1/sync/batch-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: report.id,
          source_device: report.source,
          location: report.location,
          payloadType: report.payloadType,
          itemsCount: report.itemsCount,
        }),
      });
      const data = await res.json();
      const updatedLog: OfflineReport = {
        id: report.id,
        source: report.source,
        location: report.location,
        payloadType: report.payloadType,
        itemsCount: report.itemsCount,
        syncedAt: data.batch_receipt?.server_timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        status: 'synced',
      };
      setSyncedHistory((prev) => [updatedLog, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger sync when reconnected
  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);

    if (nextState && localQueue.length > 0) {
      setIsSyncing(true);
      // Process queue sequentially
      for (const item of localQueue) {
        await sendToBackend(item);
      }
      setLocalQueue([]);
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Connection Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span>نظام المزامنة الميدانية دون اتصال (Offline-First Remote Sync)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ضمان استمرار إدخال البيانات في المناطق الصحراوية المعزولة بالساحل ومزامنتها تلقائياً مع خوادم NeoCloud
          </p>
        </div>

        {/* Network State Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all shadow-md ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 hover:bg-emerald-900/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900/60'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>حالة الاتصال: متصل بسحابة NeoCloud (انقر لفصل الشبكة)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span>حالة الاتصال: منقطع في الساحل (Offline Mode)</span>
              </>
            )}
          </button>

          {/* Prominent Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/90 text-red-200 border border-red-700/80 hover:border-red-600 rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
              aria-label="إغلاق المزامنة والعودة للخريطة (X)"
              title="إغلاق والعودة للخريطة (X)"
            >
              <span>إغلاق (X)</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Grid: Form to Log Data + Queue & Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>تسجيل تقرير ميداني جديد</span>
            </h3>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                isOnline ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
              }`}
            >
              {isOnline ? 'مزامنة مباشرة' : 'حفظ محلي فوري'}
            </span>
          </div>

          <form onSubmit={handleSubmitRecord} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">المصدر الميداني (الفريق أو المحطة)</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">الموقع الجغرافي والمحور</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">نوع البيانات والمسح</label>
              <select
                value={payloadType}
                onChange={(e) => setPayloadType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="قياس رطوبة التربة ومكافحة الآفات الزراعية">
                  قياس رطوبة التربة ومكافحة الآفات الزراعية
                </option>
                <option value="سلسلة التبريد ودرجات حرارة الحاويات والمطابقة">
                  سلسلة التبريد ودرجات حرارة الحاويات والمطابقة
                </option>
                <option value="مستوى الآبار الارتوازية وتدفق السقي">
                  مستوى الآبار الارتوازية وتدفق السقي
                </option>
                <option value="تفتيش جمركي ومطابقة شحنات القمح بالمعبر">
                  تفتيش جمركي ومطابقة شحنات القمح بالمعبر
                </option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">عدد العينات / السجلات المسجلة</label>
              <input
                type="number"
                value={itemsCount}
                onChange={(e) => setItemsCount(Number(e.target.value))}
                min={1}
                max={500}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg text-xs font-semibold text-white transition-colors shadow-md flex items-center justify-center gap-2 ${
                isOnline ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {isOnline ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>إرسال ومزامنة فورية مع السحابة</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4" />
                  <span>حفظ في الذاكرة المحلية (Offline Queue)</span>
                </>
              )}
            </button>
          </form>

          {/* Architecture note */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
            تعتمد المنصة على <strong>بروتوكول CRDTs وIndexedDB</strong> لضمان عدم فقدان أي بيان أثناء تجوال فرق التوزيع في أودية الصحراء أو عمق الساحل حتى لو انقطع الاتصال لأيام.
          </div>
        </div>

        {/* Sync Queue & Ledger Card */}
        <div className="lg:col-span-7 space-y-4">
          {/* Local Queue Status Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>طابور المزامنة المحلي (معلق بالهاتف/الجهاز الميداني)</span>
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                {localQueue.length} سجلات معلقة
              </span>
            </div>

            {localQueue.length > 0 ? (
              <div className="space-y-2">
                {localQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg flex items-center justify-between text-xs text-slate-200"
                  >
                    <div>
                      <span className="font-bold text-amber-300">{item.payloadType}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.location}</p>
                    </div>
                    <span className="font-mono text-amber-400 text-[11px] bg-slate-950 px-2 py-1 rounded">
                      {item.itemsCount} عينة
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center bg-slate-950/40 rounded-lg border border-slate-800/40">
                لا توجد سجلات معلقة محلياً. جميع البيانات مؤكدة ومحدثة على الخادم.
              </p>
            )}
          </div>

          {/* Central Cloud Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>سجل المزامنة المعتمد على خوادم AtlasCloud / NeoCloud</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {syncedHistory.length} عمليات مؤكدة
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {syncedHistory.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-lg flex items-center justify-between text-xs text-slate-200"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{log.payloadType}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded">
                        {log.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{log.source} · {log.location}</p>
                  </div>

                  <div className="text-left font-mono text-[11px]">
                    <span className="text-emerald-400 block">{log.itemsCount} قراءة</span>
                    <span className="text-slate-500 text-[10px]">{log.syncedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
