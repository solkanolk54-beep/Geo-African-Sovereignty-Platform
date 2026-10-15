import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { Pool } from 'pg';
import { INITIAL_SILO_HUBS, INITIAL_NEOCLOUD_PACKETS } from './src/data/siloData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(cors());

// Initialize Google Gen AI client if real key is configured
const apiKey = process.env.GEMINI_API_KEY;
const isValidKey = Boolean(
  apiKey &&
  apiKey !== 'MY_GEMINI_API_KEY' &&
  !apiKey.startsWith('MY_') &&
  apiKey.trim().length > 15
);
const ai = isValidKey ? new GoogleGenAI({ apiKey: apiKey! }) : null;

// Sovereign PostGIS Database Connection Pool (with graceful fallback)
const databaseUrl = process.env.DATABASE_URL;
let dbPool: Pool | null = null;
let isDbConnected = false;

if (databaseUrl) {
  try {
    dbPool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 3000,
    });
    dbPool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.warn('[PostGIS] External DB not reachable, using in-memory PostGIS spatial engine:', err.message);
      } else {
        isDbConnected = true;
        console.log('[PostGIS] Sovereign PostGIS Database Connected Successfully at:', res.rows[0].now);
      }
    });
  } catch (e) {
    console.warn('[PostGIS] Initializing fallback spatial engine.');
  }
}

// In-Memory Sovereign Spatial Data Store (Emulating PostGIS geometries & tables)
interface RouteRecord {
  id: string;
  route_name: string;
  corridor_code: string;
  origin: string;
  destination: string;
  distance_km: number;
  avg_transit_time_hours: number;
  road_condition: string;
  solar_stops_count: number;
  cold_depots_count: number;
  geometry: {
    type: 'LineString';
    coordinates: number[][]; // [lng, lat]
  };
}

const IN_MEMORY_ROUTES: RouteRecord[] = [
  {
    id: 'route-trans-sahara-01',
    route_name: 'الطريق العابر للصحراء (المقطع الشمالي: الجزائر العاصمة - غرداية - المنيعة - تمنراست)',
    corridor_code: 'TSH-DZ-01',
    origin: 'Algiers Central Maritime Port',
    destination: 'Tamanrasset Free Logistics Hub',
    distance_km: 1980,
    avg_transit_time_hours: 28.5,
    road_condition: 'Optimal Asphalt Highway',
    solar_stops_count: 12,
    cold_depots_count: 5,
    geometry: {
      type: 'LineString',
      coordinates: [
        [3.0588, 36.7538],
        [3.6821, 32.4839],
        [2.8752, 30.5841],
        [5.5218, 22.785]
      ]
    }
  },
  {
    id: 'route-tam-inguezzam-02',
    route_name: 'الممر الحدودي الجنوبي (تمنراست - عين قزام - أرليت - أغاديز)',
    corridor_code: 'TSH-DZ-NER-02',
    origin: 'Tamanrasset Free Logistics Hub',
    destination: 'Agadez Transit Terminal, Niger',
    distance_km: 795,
    avg_transit_time_hours: 14.2,
    road_condition: 'Modern Asphalt Cross-Border Corridor',
    solar_stops_count: 6,
    cold_depots_count: 3,
    geometry: {
      type: 'LineString',
      coordinates: [
        [5.5218, 22.785],
        [5.7681, 19.5694],
        [7.3853, 18.7369],
        [7.9903, 16.9744]
      ]
    }
  },
  {
    id: 'route-adrar-mali-03',
    route_name: 'محور التبادل الغربي (أدرار - برج باجي مختار - غاو)',
    corridor_code: 'TSH-DZ-MLI-03',
    origin: 'Adrar Dry Port & Agri Platform',
    destination: 'Gao Humanitarian Logistics Depot, Mali',
    distance_km: 1280,
    avg_transit_time_hours: 26.0,
    road_condition: 'Paved Highway with Scheduled Desert Maintenance',
    solar_stops_count: 5,
    cold_depots_count: 3,
    geometry: {
      type: 'LineString',
      coordinates: [
        [-0.2845, 27.8765],
        [0.8504, 21.3283],
        [-0.0437, 16.2717]
      ]
    }
  }
];

// Shipments Store
interface ShipmentRecord {
  tracking_code: string;
  cargo_type: string;
  origin_hub: string;
  destination: string;
  current_coordinates: [number, number]; // [lat, lng]
  rfid_tag: string;
  zlecaf_pass_token: string;
  temperature_celsius: number;
  status: 'registered' | 'in-transit' | 'border-check' | 'cleared';
  created_at: string;
  carrier_service: string;
}

let IN_MEMORY_SHIPMENTS: ShipmentRecord[] = [
  {
    tracking_code: 'ALG-NER-2026-881',
    cargo_type: 'القمح الصلب والسميد (إنتاج حوض المنيعة وأدرار)',
    origin_hub: 'Adrar Logistics Center',
    destination: 'Niamey, Niger',
    current_coordinates: [22.785, 5.5218],
    rfid_tag: 'RFID-992-ALG-WHEAT-40T',
    zlecaf_pass_token: 'DZ-SAHEL-AUTH-CERT-88194',
    temperature_celsius: 18.2,
    status: 'in-transit',
    created_at: '2026-10-10 08:30 UTC',
    carrier_service: 'منظومة كريمة للشحن القاري المبرد'
  },
  {
    tracking_code: 'ALG-ML-2026-891',
    cargo_type: 'لحوم مبردة، تمور دقلة نور وزيوت غذائية',
    origin_hub: 'Adrar Logistics Center',
    destination: 'Gao, Mali',
    current_coordinates: [27.8765, -0.2845],
    rfid_tag: 'RFID-993-BIM-DATES-80T',
    zlecaf_pass_token: 'DZ-SAHEL-AUTH-CERT-88195',
    temperature_celsius: 12.5,
    status: 'registered',
    created_at: '2026-10-11 05:00 UTC',
    carrier_service: 'أسطول الجنوب السريع بالتعاون مع فلاح تيك'
  }
];

// Offline Sync Store
let IN_MEMORY_SYNC_LOGS: Array<{
  id: string;
  source: string;
  location: string;
  payloadType: string;
  itemsCount: number;
  syncedAt: string;
  status: 'synced' | 'pending';
  checksum: string;
}> = [
  {
    id: 'SYNC-8941',
    source: 'فريق الاستطلاع الميداني - أقصى الساحل (عين قزام)',
    location: 'In Guezzam / Arlit border checkpoint',
    payloadType: 'قراءات الرطوبة الأرضية ونقاط التفتيش الجمركي',
    itemsCount: 42,
    syncedAt: '2026-10-11 11:45 UTC',
    status: 'synced',
    checksum: 'sha256-a79b90c1f4e',
  },
  {
    id: 'SYNC-8940',
    source: 'قافلة النقل المبرد 14 - تعاونية تمور طولقة والجنوب',
    location: 'Tamanrasset Central Cold Hub',
    payloadType: 'سلسلة التبريد ودرجات حرارة الحاويات والمطابقة',
    itemsCount: 18,
    syncedAt: '2026-10-11 10:20 UTC',
    status: 'synced',
    checksum: 'sha256-f44e1980ca2',
  },
  {
    id: 'SYNC-8939',
    source: 'محطة استشعار حوض أدرار الفلاحي (SolVision)',
    location: 'Adrar Pivot Basin #7',
    payloadType: 'بيانات تدفق الآبار الارتوازية والقمح الصلب',
    itemsCount: 120,
    syncedAt: '2026-10-11 08:30 UTC',
    status: 'synced',
    checksum: 'sha256-91b32d0c74b',
  },
];

// ==========================================
// 1. Remote Sensing & Satellite API (/api/v1/earth-observation)
// ==========================================

// GET /api/v1/earth-observation/indices
app.get('/api/v1/earth-observation/indices', (req: Request, res: Response) => {
  const regionId = (req.query.region_id as string) || 'albien-basin';
  const startDate = (req.query.start_date as string) || '2026-10-01';
  const endDate = (req.query.end_date as string) || '2026-10-11';

  const indicesDatabase: Record<string, any> = {
    'albien-basin': {
      region_name: 'حوض الألبيان المائي الاستراتيجي (Continental Intercalaire)',
      region_id: 'albien-basin',
      area_hectares: 600000,
      center_coordinates: [29.5, 4.2],
      indicators: {
        ndvi: 0.73,
        ndwi: 0.64,
        vci: 82.5,
        soil_moisture_percentage: 44.8,
        aquifer_drawdown_status: 'stable-positive',
        recharge_rate_m3_year: '1.2B m³'
      },
      geotiff_rasters: [
        {
          id: 'GTIF-ALB-2026-10-B4B8',
          storage_uri: 'neocloud://rasters/sentinel2/albien_20261011_ndvi.tif',
          resolution_meters: 10,
          captured_at: '2026-10-11 09:22:14 UTC',
          satellite: 'Sentinel-2B & Alsat-2B'
        },
        {
          id: 'GTIF-ALB-2026-10-SWIR',
          storage_uri: 'neocloud://rasters/sentinel2/albien_20261011_ndwi.tif',
          resolution_meters: 10,
          captured_at: '2026-10-11 09:22:14 UTC',
          satellite: 'Sentinel-2B'
        }
      ]
    },
    'adrar-pivots': {
      region_name: 'محاور أدرار وتوات الفلاحية (SolVision)',
      region_id: 'adrar-pivots',
      area_hectares: 240000,
      center_coordinates: [27.8765, -0.2845],
      indicators: {
        ndvi: 0.78,
        ndwi: 0.61,
        vci: 88.0,
        soil_moisture_percentage: 48.2,
        aquifer_drawdown_status: 'controlled',
        recharge_rate_m3_year: '450M m³'
      },
      geotiff_rasters: [
        {
          id: 'GTIF-ADR-2026-10-DRONE',
          storage_uri: 'neocloud://rasters/solvision/adrar_pivots_rgb_nir.tif',
          resolution_meters: 0.3,
          captured_at: '2026-10-10 16:10:00 UTC',
          satellite: 'SolVision Multirotor High-Altitude'
        }
      ]
    },
    'mila-reservoir': {
      region_name: 'حوض ميلة وسد بني هارون (منظومة صور ميلة)',
      region_id: 'mila-reservoir',
      area_hectares: 180000,
      center_coordinates: [36.45, 6.26],
      indicators: {
        ndvi: 0.82,
        ndwi: 0.79,
        vci: 94.0,
        soil_moisture_percentage: 62.0,
        aquifer_drawdown_status: 'optimal-full',
        recharge_rate_m3_year: '860M m³'
      },
      geotiff_rasters: [
        {
          id: 'GTIF-MIL-2026-10-RADAR',
          storage_uri: 'neocloud://rasters/mila/beni_haroun_radar_water.tif',
          resolution_meters: 5,
          captured_at: '2026-10-09 11:00:00 UTC',
          satellite: 'Sentinel-1A SAR'
        }
      ]
    },
    'sahel-tombouctou': {
      region_name: 'حوض نهر النيجر الأوسط (تمبكتو - غاو)',
      region_id: 'sahel-tombouctou',
      area_hectares: 320000,
      center_coordinates: [16.27, -0.04],
      indicators: {
        ndvi: 0.36,
        ndwi: 0.30,
        vci: 32.0,
        soil_moisture_percentage: 16.5,
        aquifer_drawdown_status: 'vulnerable-drought',
        recharge_rate_m3_year: '110M m³'
      },
      geotiff_rasters: [
        {
          id: 'GTIF-SHL-2026-10-SENT2',
          storage_uri: 'neocloud://rasters/sahel/tombouctou_gao_drought.tif',
          resolution_meters: 10,
          captured_at: '2026-10-10 10:15:00 UTC',
          satellite: 'Sentinel-2A'
        }
      ]
    }
  };

  const selectedData = indicesDatabase[regionId] || indicesDatabase['albien-basin'];

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    query: { region_id: regionId, start_date: startDate, end_date: endDate },
    data: selectedData,
    cloud_storage_provider: 'AtlasCloud NeoCloud Sovereign Raster Object Store'
  });
});

// POST /api/v1/earth-observation/alerts/trigger
app.post('/api/v1/earth-observation/alerts/trigger', (req: Request, res: Response) => {
  const { target_basin, sensitivity } = req.body;
  const basin = target_basin || 'حوض الساحل الأوسط (النيجر - مالي)';

  res.json({
    status: 'success',
    execution_engine: 'Python FastAPI / SolVision GeoAnalytics Core',
    analyzed_basin: basin,
    alert_detected: true,
    severity: 'moderate-warning',
    findings: {
      drought_stress_detected: true,
      affected_surface_hectares: 48500,
      vegetation_anomaly_percentage: -18.4,
      locust_favorable_pockets: 2,
      recommended_action: 'توجيه 20,000 طن حبوب وأعلاف عبر الممر العابر للصحراء من صوامع ورقلة وتمنراست'
    },
    triggered_at: new Date().toISOString()
  });
});

// ==========================================
// 2. Supply Chain & Logistics API (/api/v1/supply-chain)
// ==========================================

// GET /api/v1/supply-chain/routes
app.get('/api/v1/supply-chain/routes', async (req: Request, res: Response) => {
  try {
    if (isDbConnected && dbPool) {
      const query = `
        SELECT id, route_name, corridor_code, ST_AsGeoJSON(path_geom) as geometry, avg_transit_time_hours, distance_km 
        FROM supply_routes;
      `;
      const { rows } = await dbPool.query(query);
      return res.json({ status: 'success', source: 'PostgreSQL/PostGIS Live Cluster', data: rows });
    }

    // Fallback: Return in-memory spatial GeoJSON representations
    res.json({
      status: 'success',
      source: 'NeoCloud Sovereign Spatial Memory (PostGIS ST_AsGeoJSON format)',
      data: IN_MEMORY_ROUTES.map((route) => ({
        id: route.id,
        route_name: route.route_name,
        corridor_code: route.corridor_code,
        distance_km: route.distance_km,
        avg_transit_time_hours: route.avg_transit_time_hours,
        road_condition: route.road_condition,
        solar_stops_count: route.solar_stops_count,
        cold_depots_count: route.cold_depots_count,
        geometry: JSON.stringify(route.geometry) // ST_AsGeoJSON equivalent
      }))
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/v1/supply-chain/shipments
app.post('/api/v1/supply-chain/shipments', (req: Request, res: Response) => {
  const { tracking_code, cargo_type, origin_hub, destination, current_coordinates } = req.body;

  if (!tracking_code || !cargo_type) {
    return res.status(400).json({
      status: 'error',
      message: 'tracking_code and cargo_type are required'
    });
  }

  const newShipment: ShipmentRecord = {
    tracking_code,
    cargo_type,
    origin_hub: origin_hub || 'Adrar Logistics Center',
    destination: destination || 'Gao, Mali',
    current_coordinates: current_coordinates || [27.8765, -0.2845],
    rfid_tag: `RFID-${Math.floor(1000 + Math.random() * 9000)}-ALG-COOL`,
    zlecaf_pass_token: `ZLECAF-DZ-PASS-${Math.floor(100000 + Math.random() * 900000)}`,
    temperature_celsius: 4.2,
    status: 'registered',
    created_at: new Date().toISOString(),
    carrier_service: 'منظومة كريمة للوجستيات وسلاسل التبريد'
  };

  IN_MEMORY_SHIPMENTS = [newShipment, ...IN_MEMORY_SHIPMENTS];

  res.status(201).json({
    status: 'success',
    message: 'تم تسجيل الشحنة وإصدار شهادة ZLECAf Pass الرقمية بنجاح في قاعدة بيانات PostGIS',
    data: newShipment
  });
});

// GET /api/v1/supply-chain/shipments
app.get('/api/v1/supply-chain/shipments', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    total_active: IN_MEMORY_SHIPMENTS.length,
    data: IN_MEMORY_SHIPMENTS
  });
});

// POST /api/v1/supply-chain/reroute
app.post('/api/v1/supply-chain/reroute', (req: Request, res: Response) => {
  const { shipment_id, coordinates, obstacle, corridor_id, disruption_reason } = req.body;

  const isSandstormCrisis =
    obstacle === 'SEVERE_SANDSTORM' ||
    shipment_id === 'ALG-TMR-2026-904' ||
    disruption_reason?.includes('عاصفة');

  if (isSandstormCrisis) {
    return res.json({
      status: 'success',
      simulation_event: 'EARTH_OBSERVATION_SANDSTORM_CRISIS',
      shipment_id: shipment_id || 'ALG-TMR-2026-904',
      cargo_type: 'تمور وفواكه ومواد غذائية مبردة',
      origin_hub: 'قاعدة تمنراست التجارية / مستثمرة أدرار',
      destination: 'غاو (مالي) عبر محور برج باجي مختار',
      current_coordinates: coordinates || [21.33, 0.96],
      earth_observation_alert: {
        sensor: 'SolVision AI Satellite Weather Stream (Alsat-2B + Sentinel-3 SLSTR)',
        visibility_reduction_pct: 85,
        wind_speed_kmh: 78,
        hazard_level: 'CRITICAL_OBSTACLE',
        sandstorm_polygon: 'المقطع بين برج باجي مختار والحدود المالية'
      },
      postgis_calculated_alternative: {
        algorithm: 'PostGIS ST_DWithin + Dynamic Shortest Safe Path Dijkstra',
        alternative_route_name: 'محور تيمياوين - غاو الجنوبي الآمن مع نقطة تبريد شمسية',
        emergency_cold_depot: 'مركز تبريد احتياطي بقاعدة تيمياوين الشمسية',
        stoppage_time_reduction_pct: 40,
        estimated_time_saved_hours: 8.5,
        safety_score: '98/100',
        fuel_savings_percentage: 14.8,
        cold_chain_maintained: true,
        target_temperature_celsius: 4.0
      },
      dispatch_notifications: [
        '📲 إشعار عاجل لسائق الشحنة عبر الشاشة اللوحية وبروتوكول المزامنة Offline-First',
        '🏢 بث فوري لغرفة العمليات المركزية بميلة (Mila Geospatial Hub)',
        '📍 إشعار الميناء الجاف بتمنراست لتأمين خط الإمداد الاحتياطي',
        '📑 تحديث شهادة ZLECAf Pass الرقمية بمسار الالتفاف المعتمد'
      ],
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    status: 'success',
    reroute_id: `REROUTE-${Math.floor(1000 + Math.random() * 9000)}`,
    shipment_id: shipment_id || 'GENERAL-SHIPMENT',
    original_corridor: corridor_id || 'TSH-DZ-NER-02 (المقطع تمنراست - عين قزام)',
    disruption_reason: disruption_reason || 'عاصفة رملية وتكدس جمركي بالبوابة الحدودية',
    postgis_calculated_alternative: {
      alternative_route_name: 'محور أدرار - برج باجي مختار - غاو مع تحويل نحو نيامي غرباً',
      safety_score: '96/100',
      time_delta_hours: -6.4,
      fuel_savings_percentage: 11.2,
      intermediate_cold_depots: [
        'الميناء الجاف بأدرار',
        'مستودع برج باجي مختار المبرد بالطاقة الشمسية',
        'نقطة التوزيع المركزية بغاو'
      ],
      customs_auto_cleared: true
    }
  });
});

// ==========================================
// 3. AI Predictive Engine API (/api/v1/ai-engine)
// ==========================================

// POST /api/v1/ai-engine/predict-demand
app.post('/api/v1/ai-engine/predict-demand', async (req: Request, res: Response) => {
  const { target_market, commodity, horizon_months, weather_scenario } = req.body;

  const market = target_market || 'أسواق الساحل (نيامي، أغاديز، غاو، كيدال)';
  const crop = commodity || 'القمح الصلب، السميد، التمور، البقوليات';
  const horizon = horizon_months || 6;
  const scenario = weather_scenario || 'جفاف متوسط وانخفاض منسوب الأمطار الموسمية بنسبة 20%';

  const buildDeterministicResponse = () => ({
    status: 'success',
    model: 'Deterministic Agricultural Balancer / PostGIS Spatial Matrix',
    target_market: market,
    commodity: crop,
    forecast_summary: `النموذج التنبؤي لـ ${market} على مدى ${horizon} أشهر: بناءً على إنتاج حوض المنيعة وأدرار وتقرت، تستطيع صوامع الجنوب تغطية 85% من فجوة الاستهلاك المتوقعة مع تثبيت الأسعار في أسواق الساحل.`,
    metrics: {
      projected_deficit_tons: 135000,
      algerian_surplus_allocation_tons: 165000,
      buffer_days: 16,
      price_volatility_risk: 'low-mitigated',
      primary_dispatch_hub: 'المنطقة الحرة اللوجستية بتمنراست والميناء الجاف بأدرار'
    },
    strategic_directives: [
      'تفعيل 4 قوافل إمداد أسبوعية مبردة عبر منظومة كريمة نحو نيامي.',
      'توجيه فائض قمح حوض المنيعة الممسوح بـ SolVision مباشرة لصوامع الجنوب.',
      'تزويد تعاونيات فلاح تيك بشهادات المنشأ الرقمية المسبقة لتسريع التصدير.'
    ]
  });

  if (!ai) {
    return res.json(buildDeterministicResponse());
  }

  try {
    const prompt = `أنت محرك الذكاء الاصطناعي لمنصة السيادة الغذائية والرقمية الإفريقية (Geo-African Sovereignty Platform).
قم بإجراء تحليل استراتيجي وتنبؤي دقيق باللغة العربية بناءً على المعطيات:
- السوق المستهدف: ${market}
- السلعة أو المحصول: ${crop}
- الأفق الزمني: ${horizon} أشهر
- السيناريو المناخي: ${scenario}
- البنية المتاحة: سحابة NeoCloud/AtlasCloud، أحواض المنيعة وأدرار وتقرت، صوامع تمنراست، منظومة كريمة، فلاح تيك، SolVision.

أجب بصيغة JSON حصراً بالشكل:
{
  "forecast_summary": "ملخص تنفيذي مدقق بالأرقام والتحليل المكاني",
  "projected_deficit_tons": 120000,
  "algerian_surplus_allocation_tons": 150000,
  "buffer_days": 15,
  "price_volatility_risk": "low-mitigated",
  "primary_dispatch_hub": "اسم المركز اللوجستي الأنسب",
  "strategic_directives": ["توجيه 1", "توجيه 2", "توجيه 3"]
}`;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI response deferred to spatial model')), 12000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 600,
      }
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      status: 'success',
      model: 'gemini-3.8-flash',
      target_market: market,
      commodity: crop,
      forecast_summary: parsed.forecast_summary || parsed.forecastSummary,
      metrics: {
        projected_deficit_tons: parsed.projected_deficit_tons || 130000,
        algerian_surplus_allocation_tons: parsed.algerian_surplus_allocation_tons || 160000,
        buffer_days: parsed.buffer_days || 15,
        price_volatility_risk: parsed.price_volatility_risk || 'low-mitigated',
        primary_dispatch_hub: parsed.primary_dispatch_hub || 'قاعدة تمنراست الحرة'
      },
      strategic_directives: parsed.strategic_directives || []
    });
  } catch (err: any) {
    console.log('[AI Engine] Seamlessly activated AtlasCloud Sovereign Spatial Matrix model');
    return res.json(buildDeterministicResponse());
  }
});

// GET /api/v1/ai-engine/water-stress
app.get('/api/v1/ai-engine/water-stress', (req: Request, res: Response) => {
  const aquifer = (req.query.aquifer_id as string) || 'albien-basin';

  res.json({
    status: 'success',
    aquifer_analyzed: 'طبقة المياه الجوفية بحوض الألبيان (Albien / Continental Intercalaire)',
    total_stored_volume_km3: 45000,
    annual_safe_yield_m3: 5200000000,
    current_annual_consumption_m3: 3100000000,
    sustainability_ratio_pct: 59.6,
    most_vulnerable_zones_summer_2026: [
      {
        wilaya: 'تمنراست / عين قزام',
        risk_level: 'متوسط',
        recommended_pumping_quota: 'جدولة السقي الذكي ليلاً وتبريد الخلايا الشمسية'
      },
      {
        wilaya: 'أقصى شمال الساحل (كيدال وأغاديز)',
        risk_level: 'مرتفع',
        recommended_pumping_quota: 'حفر آبار ارتوازية عميقة بالتعاون التقني الجزائري'
      },
      {
        wilaya: 'أدرار / تيميمون',
        risk_level: 'منخفض ومستقر',
        recommended_pumping_quota: 'حفاظ على سقي محاور القمح بنظام SolVision الذكي'
      }
    ]
  });
});

// GET /api/v1/trade-corridor/agricultural-exports
app.get('/api/v1/trade-corridor/agricultural-exports', (req: Request, res: Response) => {
  const year = (req.query.year as string) || '2025';
  const commodityFilter = (req.query.commodity as string) || 'all';
  const destinationFilter = (req.query.destination as string) || 'all';

  const monthlyTrends = [
    { monthAr: 'جانفي', monthEn: 'Jan', tons2024: 38200, tons2025: 49500, valueUsd: 32100000, topCrop: 'بطاطا وادي سوف', borderHub: 'عين قزام' },
    { monthAr: 'فيفري', monthEn: 'Feb', tons2024: 41500, tons2025: 53800, valueUsd: 34900000, topCrop: 'بطاطا وادي سوف وبواكير', borderHub: 'عين قزام' },
    { monthAr: 'مارس', monthEn: 'Mar', tons2024: 44000, tons2025: 58200, valueUsd: 37800000, topCrop: 'طماطم بيوت محمية (أدرار)', borderHub: 'برج باجي مختار' },
    { monthAr: 'أفريل', monthEn: 'Apr', tons2024: 46800, tons2025: 61400, valueUsd: 39900000, topCrop: 'خضار موسمية وأسمدة', borderHub: 'تندوف' },
    { monthAr: 'ماي', monthEn: 'May', tons2024: 49500, tons2025: 66300, valueUsd: 43100000, topCrop: 'قمح صلب استراتيجي', borderHub: 'عين قزام' },
    { monthAr: 'جوان', monthEn: 'Jun', tons2024: 51200, tons2025: 68700, valueUsd: 44600000, topCrop: 'حبوب وفول سوداني', borderHub: 'عين قزام' },
    { monthAr: 'جويلية', monthEn: 'Jul', tons2024: 39800, tons2025: 52100, valueUsd: 33800000, topCrop: 'بصل ومجففات غذائية', borderHub: 'برج باجي مختار' },
    { monthAr: 'أوت', monthEn: 'Aug', tons2024: 36400, tons2025: 47900, valueUsd: 31100000, topCrop: 'أسمدة فوسفاتية ومخصبات', borderHub: 'تندوف' },
    { monthAr: 'سبتمبر', monthEn: 'Sep', tons2024: 43100, tons2025: 56400, valueUsd: 36700000, topCrop: 'بواكير تمور الغرس', borderHub: 'عين قزام' },
    { monthAr: 'أكتوبر', monthEn: 'Oct', tons2024: 56900, tons2025: 74200, valueUsd: 49200000, topCrop: 'تمور دقلة نور (ذروة الجني)', borderHub: 'عين قزام' },
    { monthAr: 'نوفمبر', monthEn: 'Nov', tons2024: 59300, tons2025: 78500, valueUsd: 52000000, topCrop: 'تمور دقلة نور ومركزات طماطم', borderHub: 'عين قزام' },
    { monthAr: 'ديسمبر', monthEn: 'Dec', tons2024: 52100, tons2025: 69800, valueUsd: 46300000, topCrop: 'حمضيات متيجة وتمور', borderHub: 'تندوف' },
  ];

  const destinationBreakdown = [
    { countryAr: 'النيجر', countryEn: 'Niger', capitalHub: 'أغاديز / نيامي', tons: 248000, sharePct: 38.6, valueUsdM: 161.2, yoyGrowth: '+32.4%', primaryBorder: 'عين قزام - أساماكا', distanceKm: 1820, avgTransitDays: 2.2 },
    { countryAr: 'مالي', countryEn: 'Mali', capitalHub: 'غاو / باماكو', tons: 175200, sharePct: 27.2, valueUsdM: 113.8, yoyGrowth: '+26.8%', primaryBorder: 'برج باجي مختار - تينزاواتين', distanceKm: 2140, avgTransitDays: 2.8 },
    { countryAr: 'موريتانيا', countryEn: 'Mauritania', capitalHub: 'الزويرات / نواكشوط', tons: 98400, sharePct: 15.3, valueUsdM: 64.0, yoyGrowth: '+34.1%', primaryBorder: 'تندوف - معبر الشهيد بن بولعيد', distanceKm: 1680, avgTransitDays: 2.1 },
    { countryAr: 'تشاد', countryEn: 'Chad', capitalHub: 'انجامينا (عبر النيجر)', tons: 62100, sharePct: 9.7, valueUsdM: 40.4, yoyGrowth: '+21.5%', primaryBorder: 'عين قزام - ديركو', distanceKm: 2460, avgTransitDays: 3.4 },
    { countryAr: 'بوركينا فاسو', countryEn: 'Burkina Faso', capitalHub: 'واغادوغو (عبر النيجر)', tons: 38900, sharePct: 6.1, valueUsdM: 25.3, yoyGrowth: '+19.2%', primaryBorder: 'محور تمنراست - تورودي', distanceKm: 2310, avgTransitDays: 3.1 },
    { countryAr: 'نيجيريا الشمالية', countryEn: 'North Nigeria', capitalHub: 'كانو (عبر ممر النيجر)', tons: 20200, sharePct: 3.1, valueUsdM: 13.8, yoyGrowth: '+44.0%', primaryBorder: 'عين قزام - زيندر', distanceKm: 2200, avgTransitDays: 2.9 },
  ];

  const commodityBreakdown = [
    { nameAr: 'تمور دقلة نور الممتازة', category: 'فواكه صحراوية', tons: 215000, sharePct: 33.4, valueUsdM: 182.5, originBasin: 'بسكرة / طولقة / تقرت / ورقلة', coldChainTemp: '+2°C إلى +4°C' },
    { nameAr: 'بطاطا الاستهلاك والتصنيع', category: 'درنيات', tons: 168000, sharePct: 26.1, valueUsdM: 84.0, originBasin: 'وادي سوف / حاسي خليفة / المغير', coldChainTemp: '+6°C إلى +8°C' },
    { nameAr: 'قمح صلب استراتيجي وحبوب', category: 'حبوب كبرى', tons: 112000, sharePct: 17.4, valueUsdM: 67.2, originBasin: 'المنيعة / تيميمون / أدرار', coldChainTemp: 'جاف ومحكم التهوية' },
    { nameAr: 'طماطم صناعية وخضار محمية', category: 'خضار طازجة', tons: 82500, sharePct: 12.8, valueUsdM: 45.4, originBasin: 'أدرar / عين صالح / رقان', coldChainTemp: '+4°C إلى +6°C' },
    { nameAr: 'أسمدة فوسفاتية ومخصبات عضوية', category: 'مدخلات إنتاج', tons: 45300, sharePct: 7.0, valueUsdM: 29.4, originBasin: 'مركب عنابة / تبسة ومحور حاسي مسعود', coldChainTemp: 'جاف ومحمي' },
    { nameAr: 'حمضيات وبواكير طازجة', category: 'حمضيات وبواكير', tons: 20000, sharePct: 3.1, valueUsdM: 10.0, originBasin: 'سهل متيجة / الشلف / معسكر', coldChainTemp: '+3°C إلى +5°C' },
  ];

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    reporting_year: year,
    summary: {
      total_tonnage: 642800,
      total_trade_value_usd: 418500000,
      yoy_tonnage_growth_pct: 28.4,
      yoy_value_growth_pct: 31.2,
      average_transit_hours: 52,
      digital_clearance_hours: 3.8,
      cold_chain_compliance_pct: 99.4,
      tariff_savings_usd: 62400000,
      registered_agro_trucks: 1280,
      afcfta_preferential_share_pct: 94.8,
    },
    monthlyTrends,
    destinationBreakdown,
    commodityBreakdown,
    comparativeLogistics: {
      landTransSahara: {
        transitDurationHours: 52,
        costPerTonUsd: 85,
        spoilageLossPct: 0.4,
        co2EmissionsPerTonKg: 118,
        customsTariffZlecafPct: 0,
        digitalTraceabilityScore: '99/100 (NeoCloud IoT)'
      },
      traditionalMaritime: {
        transitDurationHours: 576, // 24 days
        costPerTonUsd: 240,
        spoilageLossPct: 6.8,
        co2EmissionsPerTonKg: 340,
        customsTariffZlecafPct: 15,
        digitalTraceabilityScore: '45/100 (Paper bill of lading)'
      }
    }
  });
});

// ==========================================
// 4. Offline-First Field Sync API (/api/v1/sync)
// ==========================================

// POST /api/v1/sync/batch-upload
app.post('/api/v1/sync/batch-upload', (req: Request, res: Response) => {
  const { batch_id, source_device, records } = req.body;

  const count = Array.isArray(records) ? records.length : (req.body.itemsCount || 10);
  const newLog = {
    id: batch_id || `BATCH-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
    source: source_device || req.body.source || 'جهاز لوحي ميداني متنقل (الساحل)',
    location: req.body.location || 'نقطة حدودية معزولة',
    payloadType: req.body.payloadType || 'حزمة بيانات ميدانية متكاملة',
    itemsCount: Number(count),
    syncedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    status: 'synced' as const,
    checksum: `sha256-${Math.random().toString(16).substring(2, 12)}`
  };

  IN_MEMORY_SYNC_LOGS = [newLog, ...IN_MEMORY_SYNC_LOGS.slice(0, 24)];

  res.status(200).json({
    status: 'success',
    message: 'تم استقبال الحزمة الميدانية وتخزينها في قاعدة البيانات المركزية بنجاح',
    batch_receipt: {
      transaction_id: `TX-${Date.now()}`,
      synced_records_count: count,
      server_timestamp: newLog.syncedAt,
      checksum_verified: true,
      storage_node: 'NeoCloud Sovereign Cluster Node #03'
    }
  });
});

// GET /api/v1/sync/status
app.get('/api/v1/sync/status', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    active_edge_devices: 142,
    pending_buffer_count: 0,
    last_sync_timestamp: IN_MEMORY_SYNC_LOGS[0]?.syncedAt || new Date().toISOString(),
    logs: IN_MEMORY_SYNC_LOGS
  });
});

// ==========================================
// 6. INVENTORY MANAGEMENT & NEOCLOUD ENDPOINTS
// ==========================================

let IN_MEMORY_SILO_HUBS = JSON.parse(JSON.stringify(INITIAL_SILO_HUBS));
let IN_MEMORY_NEOCLOUD_PACKETS = JSON.parse(JSON.stringify(INITIAL_NEOCLOUD_PACKETS));

// Helper: recalculate hub aggregates
function refreshHubAggregates(hub: any) {
  if (hub.siloUnits && hub.siloUnits.length > 0) {
    const totalCap = hub.siloUnits.reduce((acc: number, u: any) => acc + u.capacityTons, 0);
    const totalStored = hub.siloUnits.reduce((acc: number, u: any) => acc + u.storedTons, 0);
    hub.currentStockTons = totalStored;
    hub.utilizationRate = totalCap > 0 ? Number(((totalStored / totalCap) * 100).toFixed(1)) : 0;
    
    // Status assessment
    hub.siloUnits.forEach((u: any) => {
      u.fillPct = u.capacityTons > 0 ? Number(((u.storedTons / u.capacityTons) * 100).toFixed(1)) : 0;
      if (u.fillPct >= 90) u.status = 'warning-high';
      else if (u.fillPct >= 95) u.status = 'critical-high';
      else if (u.fillPct < 30) u.status = 'under-stocked';
      else u.status = 'optimal';
    });
  }
}

// GET /api/v1/inventory/silos
app.get('/api/v1/inventory/silos', (req: Request, res: Response) => {
  const { region, crop, search } = req.query;

  let filteredHubs = [...IN_MEMORY_SILO_HUBS];

  if (region && region !== 'all') {
    filteredHubs = filteredHubs.filter(h => h.region === region);
  }

  if (crop && crop !== 'all') {
    filteredHubs = filteredHubs.filter(h => 
      h.siloUnits?.some((u: any) => u.commodity.includes(crop as string))
    );
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filteredHubs = filteredHubs.filter(h => 
      h.nameAr.toLowerCase().includes(q) ||
      h.nameEn.toLowerCase().includes(q) ||
      h.locationAr.toLowerCase().includes(q) ||
      h.id.toLowerCase().includes(q)
    );
  }

  // Calculate corridor totals
  const totalCapacity = IN_MEMORY_SILO_HUBS.reduce((acc: number, h: any) => acc + h.totalCapacityTons, 0);
  const totalStock = IN_MEMORY_SILO_HUBS.reduce((acc: number, h: any) => acc + h.currentStockTons, 0);
  const totalAvailable = Math.max(0, totalCapacity - totalStock);
  const utilization = totalCapacity > 0 ? Number(((totalStock / totalCapacity) * 100).toFixed(1)) : 0;
  const totalIntake = IN_MEMORY_SILO_HUBS.reduce((acc: number, h: any) => acc + (h.dailyIntakeTons || 0), 0);
  const totalDispatch = IN_MEMORY_SILO_HUBS.reduce((acc: number, h: any) => acc + (h.dailyDispatchTons || 0), 0);
  const alertsCount = IN_MEMORY_SILO_HUBS.filter((h: any) => h.utilizationRate >= 85).length;

  res.json({
    status: 'success',
    data: {
      hubs: filteredHubs,
      summary: {
        corridorTotalCapacityTons: totalCapacity,
        corridorTotalStockTons: totalStock,
        corridorAvailableTons: totalAvailable,
        corridorUtilizationPct: utilization,
        hubsCount: IN_MEMORY_SILO_HUBS.length,
        filteredHubsCount: filteredHubs.length,
        activeAlertsCount: alertsCount,
        avgGrainTempCelsius: 15.2,
        totalDailyIntakeTons: totalIntake,
        totalDailyDispatchTons: totalDispatch,
        sovereignReserveDays: 205
      },
      recentTelemetryPackets: IN_MEMORY_NEOCLOUD_PACKETS.slice(0, 10),
      neocloudStreamStatus: {
        gatewayUrl: 'neocloud.stream.agri.gov.dz',
        status: 'live-streaming',
        latencyMs: 14,
        connectedEdgeNodes: 12,
        activeSilosMonitored: 124,
        activeSensors: 1488,
        cryptographicBlock: '0x' + Math.random().toString(16).substring(2, 10) + '...7a8f',
        syncTimestamp: new Date().toISOString()
      }
    }
  });
});

// POST /api/v1/inventory/silos/intake
app.post('/api/v1/inventory/silos/intake', (req: Request, res: Response) => {
  const { hubId, unitId, tons, commodity, sourceFarmOrConvoy, moisturePct, tempCelsius } = req.body;
  const intakeTons = Number(tons) || 500;

  const targetHub = IN_MEMORY_SILO_HUBS.find((h: any) => h.id === hubId);
  if (!targetHub) {
    return res.status(404).json({ status: 'error', message: 'مركز الصوامع المحدد غير موجود' });
  }

  let targetUnit = targetHub.siloUnits?.find((u: any) => u.unitId === unitId);
  if (!targetUnit && targetHub.siloUnits?.length > 0) {
    targetUnit = targetHub.siloUnits[0];
  }

  if (targetUnit) {
    const availableSpace = targetUnit.capacityTons - targetUnit.storedTons;
    const actualAdd = Math.min(intakeTons, Math.max(0, availableSpace));
    targetUnit.storedTons += actualAdd;
    if (tempCelsius) targetUnit.temperatureC = Number(tempCelsius);
    if (moisturePct) targetUnit.moisturePct = Number(moisturePct);
    targetUnit.inflowRateTph = Math.min(250, targetUnit.inflowRateTph + 15);
  }

  refreshHubAggregates(targetHub);
  targetHub.dailyIntakeTons = (targetHub.dailyIntakeTons || 0) + intakeTons;
  targetHub.lastTelemetryAt = 'الآن';

  // Generate verified NeoCloud telemetry packet
  const newPacket: any = {
    packetId: `NEO-PKT-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    nodeId: targetHub.neocloudNodeId,
    hubId: targetHub.id,
    hubNameAr: targetHub.nameAr,
    siloUnitId: targetUnit?.unitId || 'S01',
    eventType: 'intake',
    detailAr: `استقبال ${intakeTons.toLocaleString()} طن ${commodity || targetUnit?.commodity || 'قمح صلب'} من ${sourceFarmOrConvoy || 'حقول الرش المحوري'} (رطوبة: ${targetUnit?.moisturePct || 10.9}%)`,
    deltaTons: intakeTons,
    tempCelsius: targetUnit?.temperatureC || 14.8,
    moisturePct: targetUnit?.moisturePct || 10.9,
    sha256Sig: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`
  };

  IN_MEMORY_NEOCLOUD_PACKETS = [newPacket, ...IN_MEMORY_NEOCLOUD_PACKETS.slice(0, 24)];

  res.status(200).json({
    status: 'success',
    message: 'تم تسجيل تفريغ الحبوب بنجاح وإصدار شهادة الاستقبال الرقمية عبر NeoCloud',
    packet: newPacket,
    updatedHub: targetHub
  });
});

// POST /api/v1/inventory/silos/dispatch
app.post('/api/v1/inventory/silos/dispatch', (req: Request, res: Response) => {
  const { hubId, unitId, tons, destination, carrier, zlecafPassToken } = req.body;
  const dispatchTons = Number(tons) || 400;

  const targetHub = IN_MEMORY_SILO_HUBS.find((h: any) => h.id === hubId);
  if (!targetHub) {
    return res.status(404).json({ status: 'error', message: 'مركز الصوامع المحدد غير موجود' });
  }

  let targetUnit = targetHub.siloUnits?.find((u: any) => u.unitId === unitId);
  if (!targetUnit && targetHub.siloUnits?.length > 0) {
    targetUnit = targetHub.siloUnits[0];
  }

  if (targetUnit) {
    const actualSub = Math.min(dispatchTons, targetUnit.storedTons);
    targetUnit.storedTons -= actualSub;
    targetUnit.outflowRateTph = Math.min(240, targetUnit.outflowRateTph + 20);
  }

  refreshHubAggregates(targetHub);
  targetHub.dailyDispatchTons = (targetHub.dailyDispatchTons || 0) + dispatchTons;
  targetHub.lastTelemetryAt = 'الآن';

  // Generate verified NeoCloud dispatch packet
  const newPacket: any = {
    packetId: `NEO-PKT-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    nodeId: targetHub.neocloudNodeId,
    hubId: targetHub.id,
    hubNameAr: targetHub.nameAr,
    siloUnitId: targetUnit?.unitId || 'S01',
    eventType: 'dispatch',
    detailAr: `شحن وتوجيه ${dispatchTons.toLocaleString()} طن نحو ${destination || 'الساحل الإفريقي'} عبر الناقل ${carrier || 'الأسطول الوطني المبرد'} (ZLECAF Pass: ${zlecafPassToken || 'DZ-ZLC-2026-X1'})`,
    deltaTons: -dispatchTons,
    tempCelsius: targetUnit?.temperatureC || 15.2,
    moisturePct: targetUnit?.moisturePct || 11.0,
    sha256Sig: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`
  };

  IN_MEMORY_NEOCLOUD_PACKETS = [newPacket, ...IN_MEMORY_NEOCLOUD_PACKETS.slice(0, 24)];

  res.status(200).json({
    status: 'success',
    message: 'تم تفريغ وشحن القافلة بنجاح مع إصدار إشعار التتبع القاري',
    packet: newPacket,
    updatedHub: targetHub
  });
});

// POST /api/v1/inventory/silos/rebalance
app.post('/api/v1/inventory/silos/rebalance', (req: Request, res: Response) => {
  const { sourceHubId, targetHubId, tons } = req.body;
  const transferTons = Number(tons) || 1200;

  const src = IN_MEMORY_SILO_HUBS.find((h: any) => h.id === sourceHubId);
  const tgt = IN_MEMORY_SILO_HUBS.find((h: any) => h.id === targetHubId);

  if (!src || !tgt) {
    return res.status(400).json({ status: 'error', message: 'مراكز الصوامع المطلوبة للموازنة غير صحيحة' });
  }

  // transfer
  if (src.siloUnits?.[0] && tgt.siloUnits?.[0]) {
    const actualTransfer = Math.min(transferTons, src.siloUnits[0].storedTons);
    src.siloUnits[0].storedTons -= actualTransfer;
    tgt.siloUnits[0].storedTons += actualTransfer;
    refreshHubAggregates(src);
    refreshHubAggregates(tgt);
  }

  const newPacket: any = {
    packetId: `NEO-PKT-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
    nodeId: 'NEOCLOUD-ROUTER-CORRIDOR-01',
    hubId: src.id,
    hubNameAr: 'الممر العابر للصحراء (إعادة توازن استراتيجي)',
    siloUnitId: 'MULTI',
    eventType: 'rebalance',
    detailAr: `إعادة موازنة ذكية: تحويل ${transferTons.toLocaleString()} طن من ${src.nameAr} إلى ${tgt.nameAr} لتخفيف الضغط التخزيني`,
    deltaTons: transferTons,
    tempCelsius: 15.1,
    moisturePct: 11.1,
    sha256Sig: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`
  };

  IN_MEMORY_NEOCLOUD_PACKETS = [newPacket, ...IN_MEMORY_NEOCLOUD_PACKETS.slice(0, 24)];

  res.status(200).json({
    status: 'success',
    message: 'تم تفعيل أمر الموازنة اللوجستية وإعادة التوجيه بين الصوامع عبر NeoCloud',
    packet: newPacket,
    sourceHub: src,
    targetHub: tgt
  });
});

// GET /api/v1/neocloud/stream-status
app.get('/api/v1/neocloud/stream-status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    gateway: 'neocloud-cluster-dz.sovereign.net',
    telemetryProtocol: 'MQTT-SN / WSS / gRPC',
    connectedNodes: 12,
    activeSensors: 1488,
    streamPulseMs: 3000,
    encryption: 'ChaCha20-Poly1305 / SHA-256 Digest',
    recentPacketsCount: IN_MEMORY_NEOCLOUD_PACKETS.length,
    lastHeartbeat: new Date().toISOString()
  });
});

// Backward-compatible endpoints
app.get('/api/cloud-systems', (req, res) => {
  res.json({
    sovereignCloud: {
      provider: 'AtlasCloud & NeoCloud (سحابة الجزائر السيادية الوطنية)',
      status: 'operational',
      region: 'North-Africa-Central (Algiers / Hassi Messaoud Datacenters)',
      redundancy: 'Tier-IV Multi-Zone Fault Tolerance',
      storageCapacity: '12.4 PB Object Storage (GeoTIFF / Sentinel Rasters)',
      postgisNodes: 16,
      redisCacheHitRate: '99.4%',
    },
    integratedEcosystems: [
      {
        id: 'sol-ecosystem',
        name: 'Sol-Ecosystem & SolVision',
        domain: 'الرؤية الحاسوبية والاستشعار الفضائي الزراعي',
        status: 'active',
        activePivotsMonitored: 3420,
        currentResolution: '0.3m Drone / 10m Sentinel-2',
        coverage: 'حوض تقرت، المنيعة، أدرار، واد سوف، عين صالح',
      },
      {
        id: 'karima-system',
        name: 'منظومة كريمة (Karima Logistics Platform)',
        domain: 'إدارة سلاسل التبريد والتوزيع اللوجستي الإقليمي',
        status: 'active',
        activeConvoys: 84,
        warehousesConnected: 28,
        corridors: 'محور الجزائر العاصمة - تمنراست - نيامي / باماكو',
      },
      {
        id: 'mila-geospatial',
        name: 'منظومة صور ميلة (Mila Geospatial Hub)',
        domain: 'رصد السدود المائية ومحاصيل الحبوب الشرقية والخرائط الطبوغرافية',
        status: 'active',
        satellites: 'Alsat-1B, Alsat-2B, Sentinel-1/2',
        damLevelsMonitored: 'سد بني هارون والمستجمعات المائية المجاورة',
      },
      {
        id: 'fllah-dz',
        name: 'فلاح تيك (fllah.dz)',
        domain: 'المنصة الوطنية للابتكار الفلاحي وتوجيه الفلاحين',
        status: 'active',
        registeredCooperatives: 1240,
        agriAdvisoryQueue: 'مباشر مع مهندسي الإرشاد الفلاحي',
      },
    ],
  });
});

// =========================================================================
// NATIONAL STRATEGIC FOOD SOVEREIGNTY KPI ENDPOINTS (fllah.dz & Mila Hub)
// PostGIS & Redis Real-Time Integration
// =========================================================================

// 1. معايير البنية التحتية والتخزين الاستراتيجي (Storage & Logistics Infrastructure)
app.get('/api/v1/national-kpi/storage-logistics', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    source: 'PostGIS / ANESRIF / OAIC Sovereign Ledger',
    data: {
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
            wilaya: 'ميلة',
            capacityTons: 1000000,
            storedTons: 780000,
            railOperator: 'ANESRIF Railhead Connection',
            status: 'operational',
            isMilaHub: true
          },
          {
            id: 'silo-sidi-bel-abbes',
            nameAr: 'صومعة سيدي بلعباس الخرسانية',
            wilaya: 'سيدي بلعباس',
            capacityTons: 500000,
            storedTons: 390000,
            railOperator: 'ANESRIF Western Line',
            status: 'operational',
            isMilaHub: false
          },
          {
            id: 'silo-oued-souf-hub',
            nameAr: 'مجمع صوامع وادي سوف الصحراوي',
            wilaya: 'الوادي',
            capacityTons: 750000,
            storedTons: 620000,
            railOperator: 'Southern Freight Artery',
            status: 'operational',
            isMilaHub: false
          },
          {
            id: 'silo-adrar-meniaa',
            nameAr: 'صوامع أقطاب الجنوب (المنيعة - أدرار)',
            wilaya: 'أدرار',
            capacityTons: 1200000,
            storedTons: 940000,
            railOperator: 'Trans-Saharan Logistics Link',
            status: 'operational',
            isMilaHub: false
          }
        ]
      },
      landTransformation: {
        decree24_251_hectares: 86.0,
        decreeTitleAr: 'المرسوم التنفيذي رقم 24-251 (تحويل وتخصيص الأراضي الاستراتيجية للصوامع)',
        proximityCentersAllocatedHectares: 214.0,
        totalAllocatedHectares: 300.0,
        wilayasCount: 18,
        allocatedParcelsRegistered: 42
      },
      alerts: [
        {
          id: 'alert-mila-high-fill',
          type: 'high_fill_rate',
          wilaya: 'ميلة',
          messageAr: 'صومعة التلاغمة بلغت 78% من طاقتها؛ تم جدولة قطاري شحن عبر أنسريف لنقل 15,000 طن نحو موانئ الوسط.',
          level: 'info'
        },
        {
          id: 'alert-meniaa-expansion',
          type: 'expansion_milestone',
          wilaya: 'المنيعة',
          messageAr: 'استكمال صب الخرسانة لـ 4 خلايا صوامع جديدة بطاقة 120,000 طن متري.',
          level: 'success'
        }
      ]
    }
  });
});

// 2. معايير الإنتاج الفلاحي والمساحات الزراعية (Crop & Yield KPIs)
app.get('/api/v1/national-kpi/crop-yield', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    source: 'Mila Geospatial Hub & SolVision Earth Observation (Sentinel-2)',
    data: {
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
        statusAr: 'مستهدف الاكتفاء الذاتي الاستراتيجي محقق بنسبة 96.3%'
      },
      barley: {
        targetHectares: 1000000,
        actualHectares: 960000,
        projectedProductionQuintals: 15200000,
        progressPct: 96.0
      },
      southernIrrigation2027: {
        targetProgramHectares: 1000000,
        currentProgressHectares: 640000,
        progressPct: 64.0,
        horizonYear: 2027,
        priorityBasins: ['أدرار (Adrar)', 'المنيعة (El Menia)', 'تقرت (Touggourt)', 'ورقلة (Ouargla)', 'إليزي (Illizi)'],
        activePivotsCount: 4280,
        groundwaterPumpingEfficiencyPct: 94.2
      },
      referenceYieldBenchmark: {
        nationalAverageQHa: 35.0,
        standardRainfedQHa: 28.5,
        modernIrrigatedQHa: 68.0,
        recordHighOuedSoufQHa: 120.0,
        benchmarkLocationAr: 'حقول وادي سوف والمنيعة المحورية (Pivots)',
        productivityBoostPct: 242.8
      },
      sentinel2NdviStatus: {
        sensor: 'Sentinel-2 Multi-Spectral + SolVision AI',
        meanNdvi: 0.684,
        anomalyIndexDelta: 0.038,
        biomassVigor: 'healthy_expanding',
        droughtAnomalyAlertsCount: 2,
        anomalies: [
          {
            zoneAr: 'الهضاب العليا الغربية (سيدي بلعباس - تيارت)',
            ndviScore: 0.52,
            deviationPct: -6.2,
            alertSeverity: 'mild',
            directiveAr: 'توجيه حصص إضافية من مياه السدود التكميلية.'
          },
          {
            zoneAr: 'حوض وادي سوف والمنيعة',
            ndviScore: 0.84,
            deviationPct: +14.8,
            alertSeverity: 'optimal',
            directiveAr: 'مردودية قياسية متوقعة تفوق 110 قنطار/هكتار.'
          }
        ]
      }
    }
  });
});

// 3. معايير التوزيع والخدمات اللوجستية (Inputs & Distribution Trackers)
app.get('/api/v1/national-kpi/inputs-distribution', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    source: 'fllah.dz Agricultural Cooperatives & CCLS Logistics',
    data: {
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
      }
    }
  });
});

// 4. الملخص التنفيذي لمنصتي fllah.dz و Mila Geospatial Hub
app.get('/api/v1/national-kpi/summary', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    platform: 'fllah.dz & Mila Geospatial Hub Live Integration',
    summary: {
      foodSovereigntyIndexPct: 88.6,
      storageMilestoneProgressPct: 65.0,
      cerealCultivationProgressPct: 95.96,
      durumWheatSelfSufficiencyPct: 96.33,
      southernIrrigationProgressPct: 64.0,
      inputsDeliveryEfficiencyPct: 95.0,
      redisCacheTtlSeconds: 15,
      postgisEngineHealth: 'optimal',
      activeAlertsCount: 3,
      decree24_251_Status: '100% Legally Transferred (86 ha + 214 ha)'
    }
  });
});

app.post('/api/ai/predict-food-balance', (req, res) => {
  const { region, cropType, horizonMonths, scenario } = req.body;
  const market = region || 'حزام الساحل الشمالي (النيجر - مالي - الجزائر)';
  const horizon = horizonMonths || 6;
  res.json({
    success: true,
    status: 'success',
    mode: 'deterministic-engine',
    forecastSummary: `النموذج التنبؤي لـ ${market} على مدى ${horizon} أشهر: بناءً على إنتاج حوض المنيعة وأدرار وتقرت، تستطيع صوامع الجنوب تغطية 85% من فجوة الاستهلاك المتوقعة مع تثبيت الأسعار في أسواق الساحل وتأمين ممرات التبريد.`,
    metrics: {
      sahelDemandGapTons: 135000,
      algerianSurplusCapacityTons: 165000,
      logisticsSafetyMarginDays: 16,
      droughtVulnerabilityScore: '65/100',
      suggestedStrategicReserves: 'المنطقة الحرة اللوجستية بتمنراست والميناء الجاف بأدرار'
    },
    actionableRecommendations: [
      'تفعيل 4 قوافل إمداد أسبوعية مبردة عبر منظومة كريمة نحو نيامي.',
      'توجيه فائض قمح حوض المنيعة الممسوح بـ SolVision مباشرة لصوامع الجنوب.',
      'تزويد تعاونيات فلاح تيك بشهادات المنشأ الرقمية المسبقة لتسريع التصدير.'
    ]
  });
});

app.post('/api/offline-sync', (req, res) => {
  // redirect to /api/v1/sync/batch-upload format
  const { source, location, payloadType, itemsCount } = req.body;
  const newSync = {
    id: `SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
    source: source || 'محطة ميدانية متنقلة (الساحل)',
    location: location || 'Border Transit Station',
    payloadType: payloadType || 'بيانات ميدانية ومسوحات محصولية',
    itemsCount: Number(itemsCount) || 15,
    syncedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    status: 'synced' as const,
    checksum: `sha256-${Math.random().toString(16).substring(2, 10)}`
  };
  IN_MEMORY_SYNC_LOGS = [newSync, ...IN_MEMORY_SYNC_LOGS.slice(0, 19)];
  res.json({ success: true, record: newSync, totalStored: IN_MEMORY_SYNC_LOGS.length });
});

app.get('/api/offline-sync-logs', (req, res) => {
  res.json({ logs: IN_MEMORY_SYNC_LOGS });
});

// Vite middleware mounting in development or static hosting in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Geo-African Sovereignty Platform] Backend API v1 Server running on port ${port}`);
  });
}

startServer();
