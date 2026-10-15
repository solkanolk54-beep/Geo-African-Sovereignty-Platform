import React, { useState } from 'react';
import {
  Server,
  Code2,
  Terminal,
  Database,
  Play,
  Copy,
  Check,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Send,
  Zap,
  X,
} from 'lucide-react';

interface ApiEndpoint {
  id: string;
  category: string;
  method: 'GET' | 'POST';
  path: string;
  titleAr: string;
  descriptionAr: string;
  defaultPayload?: any;
  defaultQuery?: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'eo-indices',
    category: 'الاستشعار عن بعد (Earth Observation)',
    method: 'GET',
    path: '/api/v1/earth-observation/indices',
    defaultQuery: '?region_id=albien-basin&start_date=2026-10-01&end_date=2026-10-11',
    titleAr: 'جلب مؤشرات الغطاء النباتي والجفاف والرطوبة',
    descriptionAr: 'استرجاع مؤشرات NDVI, NDWI, VCI لحوض الألبيان أو أدرار أو ميلة مع معرفات ملفات الراستر GeoTIFF بسحابة NeoCloud.',
  },
  {
    id: 'eo-alerts',
    category: 'الاستشعار عن بعد (Earth Observation)',
    method: 'POST',
    path: '/api/v1/earth-observation/alerts/trigger',
    defaultPayload: {
      target_basin: 'حوض الساحل الأوسط (النيجر - مالي)',
      sensitivity: 'high'
    },
    titleAr: 'تشغيل فحص آلي لاستشعار الجفاف والآفات',
    descriptionAr: 'استدعاء خوارزميات الاستشعار المبكر الموزعة على محطة SolVision ومحرك التحليل المكاني.',
  },
  {
    id: 'sc-routes',
    category: 'سلاسل الإمداد (Supply Chain & GIS)',
    method: 'GET',
    path: '/api/v1/supply-chain/routes',
    defaultQuery: '',
    titleAr: 'جلب الممرات القارية بصيغة PostGIS ST_AsGeoJSON',
    descriptionAr: 'استعلام مكاني يعيد المسارات الهندسية للطريق العابر للصحراء ومحطات التبريد والتزود بالطاقة.',
  },
  {
    id: 'sc-shipments',
    category: 'سلاسل الإمداد (Supply Chain & GIS)',
    method: 'POST',
    path: '/api/v1/supply-chain/shipments',
    defaultPayload: {
      tracking_code: 'ALG-ML-2026-891',
      cargo_type: 'لحوم مبردة، تمور دقلة نور وزيوت غذائية',
      origin_hub: 'Adrar Logistics Center',
      destination: 'Gao, Mali',
      current_coordinates: [27.8765, -0.2845]
    },
    titleAr: 'تسجيل شحنة مبردة جديدة برمز ZLECAf Pass',
    descriptionAr: 'ربط الشحنة بالمعرف الجغرافي RFID وتوليد شهادة المنشأ الرقمية في قاعدة بيانات PostGIS.',
  },
  {
    id: 'sc-reroute',
    category: 'سلاسل الإمداد (Supply Chain & GIS)',
    method: 'POST',
    path: '/api/v1/supply-chain/reroute',
    defaultPayload: {
      corridor_id: 'TSH-DZ-NER-02',
      disruption_reason: 'عاصفة رملية وتكدس جمركي بالمعبر الحدودي'
    },
    titleAr: 'محرك إعادة التوجيه الذكي للمسارات',
    descriptionAr: 'حساب أقصر مسار آمن بديل عبر عقد PostGIS مع تفادي الاختناقات وحفظ كفاءة التبريد.',
  },
  {
    id: 'ai-demand',
    category: 'الذكاء الاصطناعي للتنبؤ (Predictive AI)',
    method: 'POST',
    path: '/api/v1/ai-engine/predict-demand',
    defaultPayload: {
      target_market: 'أسواق الساحل (نيامي، أغاديز، غاو، كيدال)',
      commodity: 'القمح الصلب، السميد، التمور، البقوليات',
      horizon_months: 6,
      weather_scenario: 'جفاف متوسط وانخفاض منسوب الأمطار بنسبة 20%'
    },
    titleAr: 'التنبؤ بالعرض والطلب الإقليمي وموازنة الأسعار',
    descriptionAr: 'استدعاء نموذج الذكاء الاصطناعي (Gemini Flash) لتوليد خطة إمداد استباقية من صوامع الجنوب الجزائري.',
  },
  {
    id: 'ai-water',
    category: 'الذكاء الاصطناعي للتنبؤ (Predictive AI)',
    method: 'GET',
    path: '/api/v1/ai-engine/water-stress',
    defaultQuery: '?aquifer_id=albien-basin&season=summer',
    titleAr: 'تحليل الإجهاد المائي ومناسيب المياه الجوفية',
    descriptionAr: 'تقييم مستويات استهلاك مياه حوض الألبيان وتوقع المناطق المعرضة للعطش مع حصص السقي الرشيد.',
  },
  {
    id: 'sync-batch',
    category: 'المزامنة الميدانية (Offline-First Sync)',
    method: 'POST',
    path: '/api/v1/sync/batch-upload',
    defaultPayload: {
      batch_id: 'BATCH-SAHEL-FIELD-409',
      source_device: 'جهاز استطلاع ميداني - واحة بيلما (النيجر)',
      records: [
        { type: 'soil_moisture', value: 14.2, coords: [18.68, 12.92] },
        { type: 'convoy_temp_check', truck_id: 'TRK-99', temp: 4.1 }
      ]
    },
    titleAr: 'رفع حزمة البيانات المجمعة بدون إنترنت',
    descriptionAr: 'استقبال وتخزين السجلات الميدانية في PostgreSQL مع حل النزاعات وتأكيد المعاملة دون ضياع أي سجل.',
  },
  {
    id: 'silo-inventory',
    category: 'مخزون الصوامع وسحابة NeoCloud (Silos & NeoCloud)',
    method: 'GET',
    path: '/api/v1/inventory/silos',
    defaultQuery: '?region=Sahara-Central&crop=قمح صلب',
    titleAr: 'جلب بيانات مخزون وسعات الصوامع على مسار الصحراء',
    descriptionAr: 'استعلام لحظي يعيد سعات التخزين الاسمية، الحجم المخزن، نسب الإشغال، وحزم البث السحابي NeoCloud لـ 12 مركزاً إقليمياً.',
  },
  {
    id: 'silo-intake',
    category: 'مخزون الصوامع وسحابة NeoCloud (Silos & NeoCloud)',
    method: 'POST',
    path: '/api/v1/inventory/silos/intake',
    defaultPayload: {
      hubId: 'silo-hub-adrar',
      unitId: 'ADR-S01',
      tons: 1200,
      commodity: 'قمح صلب صحراوي (Durum)',
      sourceFarmOrConvoy: 'حقول توات والمنيعة - قافلة #88',
      moisturePct: 10.9,
      tempCelsius: 14.8
    },
    titleAr: 'تسجيل تفريغ شحنة حبوب وتوليد حزمة NeoCloud',
    descriptionAr: 'إضافة محصول إلى وحدة الصومعة، إعادة حساب المؤشرات، وإصدار إيصال رقمي مختوم بـ SHA-256.',
  },
  {
    id: 'silo-dispatch',
    category: 'مخزون الصوامع وسحابة NeoCloud (Silos & NeoCloud)',
    method: 'POST',
    path: '/api/v1/inventory/silos/dispatch',
    defaultPayload: {
      hubId: 'silo-hub-tamanrasset',
      unitId: 'TMR-S01',
      tons: 800,
      destination: 'أغاديز - النيجر (الممر العابر للصحراء)',
      carrier: 'الأسطول الوطني المبرد SNTR',
      zlecafPassToken: 'ZLC-DZ-NER-2026-908'
    },
    titleAr: 'شحن وتوجيه قافلة تصدير قارية وتحديث المخزون',
    descriptionAr: 'خصم الشحنة من رصيد الصومعة وتوليد إشعار التتبع القاري مع تصريح العبور ZLECAF.',
  },
  {
    id: 'neocloud-status',
    category: 'مخزون الصوامع وسحابة NeoCloud (Silos & NeoCloud)',
    method: 'GET',
    path: '/api/v1/neocloud/stream-status',
    defaultQuery: '',
    titleAr: 'التحقق من حالة بث شبكة NeoCloud IoT',
    descriptionAr: 'فحص صحة اتصال العقد الحافية، معدل نبضات الاستشعار، وزمن الاستجابة لمستشعرات الصوامع.',
  }
];

interface BackendApiDocsProps {
  onClose?: () => void;
}

export const BackendApiDocs: React.FC<BackendApiDocsProps> = ({ onClose }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0]);
  const [requestQuery, setRequestQuery] = useState(selectedEndpoint.defaultQuery || '');
  const [requestBody, setRequestBody] = useState(
    selectedEndpoint.defaultPayload ? JSON.stringify(selectedEndpoint.defaultPayload, null, 2) : ''
  );
  const [activeTab, setActiveTab] = useState<'tester' | 'schema' | 'fastapi' | 'docker'>('tester');
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseResult, setResponseResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestQuery(ep.defaultQuery || '');
    setRequestBody(ep.defaultPayload ? JSON.stringify(ep.defaultPayload, null, 2) : '');
    setResponseResult(null);
  };

  const executeApiCall = async () => {
    setIsExecuting(true);
    setResponseResult(null);
    const startTime = performance.now();

    try {
      const url = `${selectedEndpoint.path}${selectedEndpoint.method === 'GET' ? requestQuery : ''}`;
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (selectedEndpoint.method === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const endTime = performance.now();

      setResponseResult({
        status: res.status,
        statusText: res.statusText,
        durationMs: Math.round(endTime - startTime),
        data: data,
      });
    } catch (err: any) {
      setResponseResult({
        status: 500,
        statusText: 'Network / Client Error',
        durationMs: 0,
        error: err.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const postgisSchemaSql = `-- =========================================================================
-- Geo-African Sovereignty Platform - PostGIS DDL Schema (schema.sql)
-- Sovereign Infrastructure: NeoCloud & AtlasCloud Cluster
-- Compatible with: PostgreSQL 16+ with PostGIS 3.4
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 1. الممرات القارية وسلاسل الإمداد (Trans-Saharan Corridors)
CREATE TABLE IF NOT EXISTS supply_routes (
    id VARCHAR(64) PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    corridor_code VARCHAR(32) UNIQUE NOT NULL,
    origin_hub VARCHAR(128) NOT NULL,
    destination_hub VARCHAR(128) NOT NULL,
    distance_km NUMERIC(8,2) NOT NULL,
    avg_transit_time_hours NUMERIC(6,2) NOT NULL,
    road_condition VARCHAR(64) DEFAULT 'Optimal Asphalt',
    solar_stops_count INT DEFAULT 0,
    cold_depots_count INT DEFAULT 0,
    path_geom GEOMETRY(LineString, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supply_routes_geom ON supply_routes USING GIST (path_geom);

-- 2. الشحنات المبردة وشهادات المنشأ (Traceability & ZLECAf Pass)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_code VARCHAR(64) UNIQUE NOT NULL,
    cargo_type VARCHAR(128) NOT NULL,
    origin_hub VARCHAR(128) NOT NULL,
    destination VARCHAR(128) NOT NULL,
    current_geom GEOMETRY(Point, 4326) NOT NULL,
    rfid_tag VARCHAR(64),
    zlecaf_pass_token VARCHAR(128) NOT NULL,
    temperature_celsius NUMERIC(4,1) DEFAULT 4.0,
    status VARCHAR(32) DEFAULT 'registered' CHECK (status IN ('registered', 'in-transit', 'border-check', 'cleared')),
    carrier_service VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipments_current_geom ON shipments USING GIST (current_geom);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_code);

-- 3. الأحواض المائية والرقعة الزراعية (Agricultural Basins & Groundwater)
CREATE TABLE IF NOT EXISTS agricultural_basins (
    id VARCHAR(64) PRIMARY KEY,
    basin_name VARCHAR(128) NOT NULL,
    region VARCHAR(64) NOT NULL,
    aquifer_source VARCHAR(128) NOT NULL,
    active_pivots_count INT DEFAULT 0,
    boundary_geom GEOMETRY(Polygon, 4326) NOT NULL,
    safe_yield_m3_year BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agri_basins_geom ON agricultural_basins USING GIST (boundary_geom);

-- 4. مؤشرات الاستشعار الفضائي (Remote Sensing Indices & Rasters)
CREATE TABLE IF NOT EXISTS earth_indices_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    basin_id VARCHAR(64) REFERENCES agricultural_basins(id),
    reading_date DATE NOT NULL,
    ndvi_mean NUMERIC(4,3),
    ndwi_mean NUMERIC(4,3),
    vci_score NUMERIC(5,2),
    soil_moisture_pct NUMERIC(5,2),
    geotiff_raster_uri VARCHAR(255),
    satellite_mission VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. سجل المزامنة الميدانية (Offline-First Sync Ledger)
CREATE TABLE IF NOT EXISTS offline_sync_records (
    id VARCHAR(64) PRIMARY KEY,
    source_device VARCHAR(128) NOT NULL,
    location_label VARCHAR(128),
    payload_type VARCHAR(128) NOT NULL,
    records_count INT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const fastapiPythonCode = `# =========================================================================
# Geo-African Sovereignty Platform - Python FastAPI Microservice
# SolVision & Mila Earth Observation Engine (fastapi_geo_engine.py)
# =========================================================================

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np

app = FastAPI(
    title="SolVision & Geo-African Earth Observation API",
    description="Python FastAPI engine for Sentinel-2 / Alsat Rasters and Drought Prediction",
    version="1.0.0"
)

class AlertTriggerRequest(BaseModel):
    target_basin: str
    sensitivity: str = "high"

@app.get("/api/v1/earth-observation/spectral-calc")
async def calculate_spectral_indices(b4_nir_val: float, b8_red_val: float, swir_val: float):
    """
    Calculates NDVI and NDWI directly from multispectral bands:
    NDVI = (NIR - RED) / (NIR + RED)
    NDWI = (NIR - SWIR) / (NIR + SWIR)
    """
    ndvi = (b4_nir_val - b8_red_val) / (b4_nir_val + b8_red_val + 1e-6)
    ndwi = (b4_nir_val - swir_val) / (b4_nir_val + swir_val + 1e-6)
    vci = float(np.clip(ndvi * 100.0, 0, 100))

    return {
        "status": "success",
        "ndvi": round(float(ndvi), 3),
        "ndwi": round(float(ndwi), 3),
        "vci": round(vci, 1),
        "drought_risk": "low" if ndvi > 0.5 else "high"
    }

@app.post("/api/v1/earth-observation/alerts/trigger")
async def trigger_drought_detection(request: AlertTriggerRequest):
    return {
        "status": "success",
        "basin": request.target_basin,
        "alert_detected": True,
        "affected_surface_ha": 48500,
        "directive": "تفعيل جسر الإمداد البري عبر تمنراست"
    }
`;

  const dockerComposeYaml = `version: '3.8'

services:
  # 1. قاعدة البيانات المكانية السيادية PostGIS
  db:
    image: postgis/postgis:15-3.3
    container_name: atlas_cloud_postgis
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_sovereign_password
      POSTGRES_DB: geo_sovereignty_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
    networks:
      - sovereignty_net
    restart: always

  # 2. خدمة التخزين المؤقت والرسائل الفورية Redis
  redis:
    image: redis:7-alpine
    container_name: atlas_cloud_redis
    ports:
      - "6379:6379"
    networks:
      - sovereignty_net
    restart: always

  # 3. الخادم الخلفي الرئيسي (Node.js API)
  backend:
    build: .
    container_name: geo_african_backend
    environment:
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:secure_sovereign_password@db:5432/geo_sovereignty_db
      - REDIS_URL=redis://redis:6379
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    ports:
      - "5000:5000"
    depends_on:
      - db
      - redis
    networks:
      - sovereignty_net
    restart: always

  # 4. خادم الذكاء الاصطناعي ومعالجة صور الأقمار الصناعية (Python FastAPI)
  ai_engine:
    image: python:3.10-slim
    container_name: solvision_ai_engine
    working_dir: /app
    volumes:
      - ./ai_service:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    networks:
      - sovereignty_net
    restart: always

volumes:
  pgdata:

networks:
  sovereignty_net:
    driver: bridge`;

  const dockerfileText = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>خطة ووثيقة ربط الخوادم الفعلية (Backend API Integration Specification)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            دليل نقاط النهاية الحية (v1 Endpoints)، محاكي الطلبات الفوري، ومخططات PostGIS وFastAPI لسحابة NeoCloud
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'tester'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            المجرب التفاعلي للـ APIs
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'schema'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            مخطط PostGIS SQL (schema.sql)
          </button>
          <button
            onClick={() => setActiveTab('fastapi')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'fastapi'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            خادم Python FastAPI للاستشعار
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'docker'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            بيئة التشغيل Docker Compose
          </button>
        </div>

        {/* Prominent Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/90 text-red-200 border border-red-700/80 hover:border-red-600 rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
            aria-label="إغلاق وثيقة APIs والعودة للخريطة (X)"
            title="إغلاق والعودة للخريطة (X)"
          >
            <span>إغلاق (X)</span>
            <X className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>

      {/* Tab 1: Interactive API Tester */}
      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Endpoints Sidebar Directory */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              نقاط النهاية البرمجية المعتمدة (REST API v1)
            </h3>

            <div className="space-y-1.5">
              {API_ENDPOINTS.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-right p-3 rounded-lg border transition-all text-xs space-y-1 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{ep.titleAr}</span>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          ep.method === 'GET'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {ep.method}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 truncate">{ep.path}</p>
                    <span className="text-[10px] text-slate-500 block">{ep.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Request Configurator & Live Response Viewer */}
          <div className="lg:col-span-8 space-y-4">
            {/* Request Builder Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                        selectedEndpoint.method === 'GET'
                          ? 'bg-sky-950 text-sky-400 border border-sky-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-100">
                      {selectedEndpoint.path}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedEndpoint.descriptionAr}</p>
                </div>

                <button
                  onClick={executeApiCall}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Send className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>{isExecuting ? 'جارٍ الإرسال والتنفيذ...' : 'إرسال الطلب للخادم الفعلي'}</span>
                </button>
              </div>

              {/* URL / Query Parameter Editor */}
              {selectedEndpoint.method === 'GET' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    بارامترات الاستعلام (Query Parameters)
                  </label>
                  <input
                    type="text"
                    value={requestQuery}
                    onChange={(e) => setRequestQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500"
                    placeholder="?region_id=albien-basin"
                  />
                </div>
              )}

              {/* JSON Body Editor */}
              {selectedEndpoint.method === 'POST' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    جسم الطلب (JSON Request Payload)
                  </label>
                  <textarea
                    rows={6}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Live Response Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-bold text-slate-200">
                    استجابة الخادم الحية (Server Response)
                  </h4>
                  {responseResult && (
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        responseResult.status < 400
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {responseResult.status} {responseResult.statusText} · {responseResult.durationMs}ms
                    </span>
                  )}
                </div>

                {responseResult && (
                  <button
                    onClick={() =>
                      copyToClipboard(JSON.stringify(responseResult.data, null, 2), 'response')
                    }
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                  >
                    {copiedKey === 'response' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الـ JSON</span>
                  </button>
                )}
              </div>

              {responseResult ? (
                <pre className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                  {JSON.stringify(responseResult.data || responseResult.error, null, 2)}
                </pre>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800/60 p-8 rounded-lg text-center text-xs text-slate-500">
                  انقر على زر "إرسال الطلب للخادم الفعلي" بالأعلى لاختبار استجابة نقطة النهاية مباشرة من الخادم الداخلي.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PostGIS SQL Schema */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>مخطط قواعد البيانات الجغرافية PostGIS (schema.sql)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                جداول الممرات القارية (LineString)، الشحنات (Point)، وأحواض المياه (Polygon) مع فهارس GIST المكانية
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(postgisSchemaSql, 'sql')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
            >
              {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>نسخ كود الـ SQL</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {postgisSchemaSql}
          </pre>
        </div>
      )}

      {/* Tab 3: Python FastAPI Microservice */}
      {activeTab === 'fastapi' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>خادم Python FastAPI لمعالجة صور الأقمار وحساب المؤشرات الطيفية</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                حساب مؤشرات NDVI وNDWI لملفات الراستر GeoTIFF والتنبؤ المبكر ببؤر الجفاف
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(fastapiPythonCode, 'py')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
            >
              {copiedKey === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>نسخ كود الـ Python</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg font-mono text-xs text-sky-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {fastapiPythonCode}
          </pre>
        </div>
      )}

      {/* Tab 4: Docker Compose Self-Hosting */}
      {activeTab === 'docker' && (
        <div className="space-y-6">
          {/* Quick Terminal Guide Strip */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>خطوات التشغيل الميداني على خادمك أو حاسوبك (Deployment Commands)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400 block">1. تشغيل الخدمات دفعة واحدة</span>
                <p className="text-slate-400 text-[11px]">في موجه الأوامر نفذ الأمر لبدء كافة الحاويات في الخلفية:</p>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded font-mono text-emerald-300">
                  <span>docker-compose up -d</span>
                  <button onClick={() => copyToClipboard('docker-compose up -d', 'cmd1')} className="hover:text-white">
                    {copiedKey === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <span className="font-bold text-sky-400 block">2. التحقق من سلامة الحاويات</span>
                <p className="text-slate-400 text-[11px]">تأكد من أن (PostGIS, Redis, Backend, AI) تعمل جميعاً:</p>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded font-mono text-sky-300">
                  <span>docker ps</span>
                  <button onClick={() => copyToClipboard('docker ps', 'cmd2')} className="hover:text-white">
                    {copiedKey === 'cmd2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 block">3. تهيئة الجداول الجغرافية</span>
                <p className="text-slate-400 text-[11px]">يقوم ملف schema.sql تلقائياً بإنشاء جداول PostGIS وفهارس GIST عند أول إقلاع.</p>
                <div className="bg-slate-900 px-2.5 py-1.5 rounded font-mono text-[11px] text-amber-300">
                  <span>PostGIS Extensions Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* docker-compose.yml code block */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>ملف docker-compose.yml (البنية التحتية السيادية AtlasCloud Local)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  حاويات: atlas_cloud_postgis (5432) + atlas_cloud_redis (6379) + geo_african_backend (5000) + solvision_ai_engine (8000)
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(dockerComposeYaml, 'docker')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
              >
                {copiedKey === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ docker-compose.yml</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg font-mono text-xs text-amber-300 overflow-x-auto max-h-[420px] leading-relaxed">
              {dockerComposeYaml}
            </pre>
          </div>

          {/* Dockerfile code block */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-400" />
                  <span>ملف Dockerfile (الخاص بحاوية خادم Node.js API)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  بناء صورة خفيفة تعتمد على node:18-alpine وتثبيت الحزم وتشغيل الخادم
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(dockerfileText, 'dockerfile')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
              >
                {copiedKey === 'dockerfile' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ Dockerfile</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg font-mono text-xs text-sky-300 overflow-x-auto max-h-[220px] leading-relaxed">
              {dockerfileText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
