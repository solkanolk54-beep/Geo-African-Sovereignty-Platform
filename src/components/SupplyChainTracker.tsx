import React, { useState } from 'react';
import { SHIPMENT_CARGOS, LOGISTICS_HUBS, TRADE_CORRIDORS } from '../data/regionalData';
import { ShipmentCargo } from '../types/platform';
import {
  Truck,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Thermometer,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  FileText,
  X,
} from 'lucide-react';

interface SupplyChainTrackerProps {
  onClose?: () => void;
}

export const SupplyChainTracker: React.FC<SupplyChainTrackerProps> = ({ onClose }) => {
  const [shipments, setShipments] = useState<ShipmentCargo[]>(SHIPMENT_CARGOS);
  const [selectedCargo, setSelectedCargo] = useState<ShipmentCargo>(SHIPMENT_CARGOS[0]);
  const [isRerouting, setIsRerouting] = useState(false);
  const [rerouteResult, setRerouteResult] = useState<any | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Trigger smart rerouting simulation via backend
  const triggerSmartReroute = async () => {
    setIsRerouting(true);
    try {
      const res = await fetch('/api/v1/supply-chain/reroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor_id: 'TSH-DZ-NER-02 (المقطع عين قزام - أغاديز)',
          disruption_reason: 'عاصفة رملية وتكدس جمركي بالبوابة الحدودية',
        }),
      });
      const data = await res.json();
      setRerouteResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRerouting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>سلاسل الإمداد والتتبع القاري (Trans-Saharan Logistics & Traceability)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة حركة الشحن، التبريد، والشهادات الرقمية عبر الطريق العابر للصحراء وموانئ الجنوب الجافة
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Dynamic Reroute Button */}
          <button
            onClick={triggerSmartReroute}
            disabled={isRerouting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-colors whitespace-nowrap"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRerouting ? 'animate-spin' : ''}`} />
            <span>{isRerouting ? 'جارٍ تحليل المسار البديل عبر PostGIS...' : 'محاكاة إعادة التوجيه الذكي للممر'}</span>
          </button>

          {/* Prominent Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/90 text-red-200 border border-red-700/80 hover:border-red-600 rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
              aria-label="إغلاق التتبع والعودة للخريطة (X)"
              title="إغلاق والعودة للخريطة (X)"
            >
              <span>إغلاق (X)</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Reroute Alert Banner if triggered */}
      {rerouteResult && (
        <div className="bg-amber-950/40 border border-amber-600/60 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>اقتراح إعادة التوجيه التلقائي (محرك PostGIS المكاني - /api/v1/supply-chain/reroute):</span>
            </div>
            <button
              onClick={() => setRerouteResult(null)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              إغلاق
            </button>
          </div>
          <p className="text-slate-200 font-medium">
            {rerouteResult.postgis_calculated_alternative?.alternative_route_name || rerouteResult.suggestedAlternative}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-slate-300 pt-1 font-mono text-[11px]">
            <span>
              التوفير الزمني المقدر:{' '}
              {rerouteResult.postgis_calculated_alternative?.time_delta_hours || rerouteResult.estimatedTimeDifferenceHours} ساعة
            </span>
            <span aria-hidden="true">·</span>
            <span>
              خفض استهلاك الوقود:{' '}
              {rerouteResult.postgis_calculated_alternative?.fuel_savings_percentage || rerouteResult.fuelSavingsPercent}%
            </span>
            <span aria-hidden="true">·</span>
            <span>
              المحطات البديلة:{' '}
              {rerouteResult.postgis_calculated_alternative?.intermediate_cold_depots?.join(' ← ') ||
                rerouteResult.recommendedStops?.map((s: any) => s.name).join(' ← ')}
            </span>
          </div>
        </div>
      )}

      {/* Hero Terminal Image and Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Logistics Base Visual Showcase */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="relative aspect-[4/3] bg-slate-950">
            <img
              src="/src/assets/images/trans_saharan_logistics_hub_1791720834806.jpg"
              alt="الميناء الجاف وقاعدة الترانزيت اللوجستي بالصحراء الكبرى"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-emerald-400 font-mono">
              قاعدة تمنراست اللوجستية الحرة (Sahara Dry Port)
            </div>
            <div className="absolute bottom-4 right-4 left-4 text-slate-100">
              <span className="text-xs text-emerald-400 font-semibold">
                شريان التجارة الإفريقية الحرة (ZLECAf Gateway)
              </span>
              <h3 className="text-base font-bold mt-0.5">
                ربط صوامع الشمال والجنوب بمراكز التوزيع في النيجر ومالي
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                طاقة شحن يومية تفوق 15,000 طن، مجهزة بوحدات تبريد شمسية ومسارات جمركية رقمية فورية.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Cargo Detail & QR Digital Origin Certificate */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                بطاقة التتبع الرقمي والمنشأ (RFID/QR)
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedCargo.commodityAr}</h3>
              <p className="text-xs text-slate-400 font-mono">{selectedCargo.rfidCode}</p>
            </div>
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 transition-colors"
              title="عرض رمز الاستجابة السريعة QR للشهادة"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          {/* Telemetry and Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
              <span className="text-slate-400">الحمولة الإجمالية</span>
              <p className="text-base font-bold font-mono text-slate-100 mt-0.5">
                {selectedCargo.tonnage} طن
              </p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
              <span className="text-slate-400">حالة التبريد</span>
              <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {selectedCargo.tempCelsius}°C (مثالي)
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">مسار القافلة:</span>
              <span className="font-semibold text-slate-200">
                {selectedCargo.originHub} ← {selectedCargo.destinationHub}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">الموقع اللحظي:</span>
              <span className="font-semibold text-slate-200">{selectedCargo.currentLocation.label}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">الناقل المعتمد:</span>
              <span className="font-semibold text-slate-200">{selectedCargo.carrier}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">رمز التوثيق السيادي:</span>
              <span className="font-mono text-emerald-400">{selectedCargo.qrToken}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-3 text-xs text-emerald-300">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-bold">شهادة المنشأ الإفريقية الموحدة (ZLECAf Sovereign Pass)</p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                معتمدة عبر منظومة كريمة وسحابة NeoCloud، تخول العبور الميسر دون توقف عند البوابات الحدودية.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Cargo Fleet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>قوافل الشحن الفلاحي واللوجستي قيد العبور الفعلي</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {shipments.length} قوافل نشطة لحظياً
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">معرف القافلة</th>
                <th className="py-3 px-4">نوع المحصول / السلعة</th>
                <th className="py-3 px-4">الحمولة</th>
                <th className="py-3 px-4">الموقع الميداني</th>
                <th className="py-3 px-4">حرارة التبريد</th>
                <th className="py-3 px-4">الوضع الجمركي</th>
                <th className="py-3 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {shipments.map((cargo) => (
                <tr
                  key={cargo.id}
                  onClick={() => setSelectedCargo(cargo)}
                  className={`cursor-pointer transition-colors ${
                    selectedCargo.id === cargo.id ? 'bg-slate-800/80' : 'hover:bg-slate-850'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{cargo.id}</td>
                  <td className="py-3 px-4">{cargo.commodityAr}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">{cargo.tonnage} طن</td>
                  <td className="py-3 px-4 text-slate-400">{cargo.currentLocation.label}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{cargo.tempCelsius}°C</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono ${
                        cargo.customsStatus === 'cleared-digital'
                          ? 'bg-emerald-950 text-emerald-400'
                          : cargo.customsStatus === 'border-check'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {cargo.customsStatus === 'cleared-digital'
                        ? 'مصدق إلكترونياً'
                        : cargo.customsStatus === 'border-check'
                        ? 'فحص آلي بالمعبر'
                        : 'عابر'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCargo(cargo);
                        setShowQrModal(true);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
                    >
                      عرض الـ QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Certificate Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>شهادة المنشأ الجغرافي الرقمي (ZLECAf Pass)</span>
              </h4>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Stylized QR Code Graphic */}
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
              <div className="w-44 h-44 border-4 border-slate-900 p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-slate-900 bg-emerald-600" />
                  <div className="w-10 h-10 border-4 border-slate-900 bg-emerald-600" />
                </div>
                <div className="text-center font-mono text-[10px] font-bold text-slate-900">
                  {selectedCargo.qrToken}
                </div>
                <div className="flex justify-between">
                  <div className="w-10 h-10 border-4 border-slate-900 bg-emerald-600" />
                  <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                </div>
              </div>
              <span className="text-[11px] text-slate-600 mt-2 font-mono">
                Scan via NeoCloud Customs Terminal
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-lg font-mono">
              <div>المحصول: {selectedCargo.commodityAr}</div>
              <div>الحمولة: {selectedCargo.tonnage} طن متري</div>
              <div>المصدر: الجزائر (الأحواض الجنوبية)</div>
              <div>الوجهة: الساحل الإفريقي</div>
              <div>التشفير: RSA-4096 Sovereign Cloud Key</div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
