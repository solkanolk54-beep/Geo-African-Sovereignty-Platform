/**
 * Geo-African Sovereignty Platform - Type Definitions
 */

export interface LogisticsHub {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  region: 'Algeria-North' | 'Algeria-South' | 'Sahel';
  country: string;
  coordinates: { lat: number; lng: number; x: number; y: number };
  type: 'Central Dry Port' | 'Strategic Storage Hub' | 'Cold-Chain Depot' | 'Border Gate';
  capacityTons: number;
  currentStockTons: number;
  temperatureControlled: boolean;
  solarPowered: boolean;
  connectedCorridors: string[];
  status: 'nominal' | 'high-traffic' | 'congested';
}

export interface TradeCorridor {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  origin: string;
  destination: string;
  distanceKm: number;
  averageTransitDays: number;
  condition: 'Optimal Asphalt' | 'Paved with Maintenance' | 'Arduous Desert Track' | 'Pipeline Infrastructure';
  riskScore: number; // 0 - 100
  coldStorageStops: number;
  solarFuelStations: number;
  coordinatesPath: Array<{ x: number; y: number }>;
  corridorType?: 'highway' | 'pipeline-gas' | 'pipeline-water';
  flowCapacity?: string;
  currentThroughput?: string;
}

export interface ShipmentCargo {
  id: string;
  rfidCode: string;
  qrToken: string;
  originHub: string;
  destinationHub: string;
  commodityAr: string;
  commodityFr: string;
  tonnage: number;
  currentLocation: { x: number; y: number; label: string };
  tempCelsius: number;
  targetTempCelsius: number;
  tempStatus: 'nominal' | 'warning' | 'critical';
  departureTime: string;
  estimatedArrival: string;
  carrier: string;
  customsStatus: 'cleared-digital' | 'in-transit' | 'border-check';
}

export interface AgriculturalZone {
  id: string;
  nameAr: string;
  nameFr: string;
  region: string;
  primaryCrops: string[];
  pivotsCount: number;
  groundwaterSource: string;
  aquiferReserveLevelPct: number;
  ndviCurrent: number; // Normalized Difference Vegetation Index 0 - 1
  ndwiWaterIndex: number;
  droughtRisk: 'low' | 'moderate' | 'high';
  annualOutputTons: number;
  coordinates: { x: number; y: number };
}

export interface SupplyDemandBalance {
  zoneId: string;
  zoneNameAr: string;
  country: string;
  crop: string;
  status: 'surplus' | 'deficit' | 'balanced';
  volumeTons: number;
  urgencyScore: number; // 1-10
  suggestedSourceHub?: string;
  coordinates: { x: number; y: number };
}

export interface OfflineReport {
  id: string;
  source: string;
  location: string;
  payloadType: string;
  itemsCount: number;
  syncedAt: string;
  status: 'synced' | 'pending';
}

export interface CloudSystemInfo {
  id: string;
  name: string;
  nameAr: string;
  domainAr: string;
  status: 'active' | 'degraded' | 'syncing';
  metricLabel: string;
  metricValue: string;
  details: string;
}

export interface SiloUnit {
  unitId: string;
  name: string;
  commodity: string;
  capacityTons: number;
  storedTons: number;
  fillPct: number;
  status: 'optimal' | 'warning-high' | 'critical-high' | 'under-stocked' | 'aeration-active';
  temperatureC: number;
  moisturePct: number;
  co2LevelPpm: number;
  inflowRateTph: number;
  outflowRateTph: number;
  radarLevelMeters: number;
  maxHeightMeters: number;
  aerationFanActive: boolean;
  pestInspectionDate: string;
}

export interface SiloHub {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  region: 'Algeria-North' | 'Sahara-Central' | 'Sahara-South' | 'Sahel-Corridor';
  country: string;
  locationAr: string;
  geoCoords: { lat: number; lng: number };
  totalCapacityTons: number;
  currentStockTons: number;
  utilizationRate: number;
  silosCount: number;
  siloUnits: SiloUnit[];
  storageTypesAr: string[];
  securityBufferDays: number;
  solarChilling: boolean;
  neocloudNodeId: string;
  neocloudStatus: 'live-streaming' | 'edge-buffered' | 'syncing';
  lastTelemetryAt: string;
  dailyIntakeTons: number;
  dailyDispatchTons: number;
  connectedCorridors: string[];
  alertNotice?: string;
}

export interface NeoCloudTelemetryPacket {
  packetId: string;
  timestamp: string;
  nodeId: string;
  hubId: string;
  hubNameAr: string;
  siloUnitId: string;
  eventType: 'intake' | 'dispatch' | 'temp-shift' | 'radar-level' | 'aeration-cycle' | 'rebalance';
  detailAr: string;
  deltaTons?: number;
  tempCelsius: number;
  moisturePct: number;
  sha256Sig: string;
}
