-- =========================================================================
-- Geo-African Sovereignty Platform - PostGIS DDL Schema (schema.sql)
-- Infrastructure: AtlasCloud Local & NeoCloud Datacenter
-- Compatible with: PostgreSQL 15+ / 16+ with PostGIS 3.3 / 3.4
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 1. جدول الممرات القارية وسلاسل الإمداد (Trans-Saharan Corridors)
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

-- 2. جدول الشحنات المبردة وشهادات المنشأ (Traceability & ZLECAf Pass)
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

-- 3. جدول الأحواض المائية والرقعة الزراعية (Agricultural Basins & Groundwater)
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

-- 4. جدول قراءات الاستشعار الفضائي (Remote Sensing Indices & Rasters)
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

-- 5. جدول سجل المزامنة الميدانية بدون إنترنت (Offline-First Sync Ledger)
CREATE TABLE IF NOT EXISTS offline_sync_records (
    id VARCHAR(64) PRIMARY KEY,
    source_device VARCHAR(128) NOT NULL,
    location_label VARCHAR(128),
    payload_type VARCHAR(128) NOT NULL,
    records_count INT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إدراج بيانات تجريبية أولية للممرات القارية (Initial Seed Data)
INSERT INTO supply_routes (id, route_name, corridor_code, origin_hub, destination_hub, distance_km, avg_transit_time_hours, road_condition, solar_stops_count, cold_depots_count, path_geom)
VALUES 
(
    'route-trans-sahara-01',
    'الطريق العابر للصحراء (المقطع الشمالي: الجزائر العاصمة - غرداية - المنيعة - تمنراست)',
    'TSH-DZ-01',
    'Algiers Central Maritime Port',
    'Tamanrasset Free Logistics Hub',
    1980.0,
    28.5,
    'Optimal Asphalt Highway',
    12,
    5,
    ST_GeomFromText('LINESTRING(3.0588 36.7538, 3.6821 32.4839, 2.8752 30.5841, 5.5218 22.7850)', 4326)
),
(
    'route-tam-inguezzam-02',
    'الممر الحدودي الجنوبي (تمنراست - عين قزام - أرليت - أغاديز)',
    'TSH-DZ-NER-02',
    'Tamanrasset Free Logistics Hub',
    'Agadez Transit Terminal, Niger',
    795.0,
    14.2,
    'Modern Asphalt Cross-Border Corridor',
    6,
    3,
    ST_GeomFromText('LINESTRING(5.5218 22.7850, 5.7681 19.5694, 7.3853 18.7369, 7.9903 16.9744)', 4326)
)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 6. المنظومة الوطنية للأمن الغذائي (fllah.dz & Mila Geospatial Hub)
-- PostGIS Live KPI Metrics: Storage, Grain Silos, Crops, Yield, and Inputs
-- =========================================================================

-- جدول الصوامع الكبرى ومراكز التخزين الجوارية (Storage & Logistics Infrastructure)
CREATE TABLE IF NOT EXISTS national_grain_silos (
    id VARCHAR(64) PRIMARY KEY,
    name_ar VARCHAR(128) NOT NULL,
    wilaya VARCHAR(64) NOT NULL,
    facility_type VARCHAR(32) CHECK (facility_type IN ('strategic_silo', 'proximity_center', 'concrete_silo_oaic')),
    capacity_metric_tons NUMERIC(10,2) NOT NULL,
    current_stored_tons NUMERIC(10,2) DEFAULT 0,
    railway_connected BOOLEAN DEFAULT FALSE,
    railway_operator VARCHAR(64) DEFAULT 'ANESRIF',
    land_area_hectares NUMERIC(8,2),
    decree_reference VARCHAR(64) DEFAULT 'Decree 24-251',
    geom GEOMETRY(Point, 4326),
    temperature_celsius NUMERIC(4,1) DEFAULT 14.5,
    status VARCHAR(32) DEFAULT 'operational' CHECK (status IN ('operational', 'construction', 'expansion', 'alert_shortage')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_national_silos_geom ON national_grain_silos USING GIST (geom);

-- جدول المساحات الزراعية المخططة والمحاصيل (Cereal Crop Targets & Southern Irrigation)
CREATE TABLE IF NOT EXISTS national_crop_targets (
    id VARCHAR(64) PRIMARY KEY,
    season_year VARCHAR(16) NOT NULL,
    commodity_type VARCHAR(64) NOT NULL,
    targeted_area_hectares NUMERIC(12,2) NOT NULL,
    actual_cultivated_hectares NUMERIC(12,2) DEFAULT 0,
    target_production_quintals NUMERIC(14,2) NOT NULL,
    actual_production_quintals NUMERIC(14,2) DEFAULT 0,
    reference_yield_q_ha NUMERIC(6,2) DEFAULT 35.0,
    irrigation_program_southern_ha NUMERIC(12,2) DEFAULT 0,
    ndvi_anomaly_score NUMERIC(5,3) DEFAULT 0.0,
    warning_flag VARCHAR(32) DEFAULT 'normal' CHECK (warning_flag IN ('normal', 'mild_deficit', 'severe_drought', 'pest_risk')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول مدخلات الإنتاج المدعومة وتوازن الاستهلاك والفوائض (Inputs & Supply Balance)
CREATE TABLE IF NOT EXISTS agricultural_inputs_and_balance (
    id VARCHAR(64) PRIMARY KEY,
    wilaya VARCHAR(64) NOT NULL,
    subsidized_seed_quota_tons NUMERIC(10,2) NOT NULL,
    distributed_seed_quota_tons NUMERIC(10,2) NOT NULL,
    subsidized_fertilizer_tons NUMERIC(10,2) NOT NULL,
    distributed_fertilizer_tons NUMERIC(10,2) NOT NULL,
    subsidy_rate_pct NUMERIC(5,2) DEFAULT 50.0,
    domestic_consumption_target_tons NUMERIC(12,2) NOT NULL,
    projected_harvest_tons NUMERIC(12,2) NOT NULL,
    exportable_sahel_surplus_tons NUMERIC(10,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- بذر البيانات الاستراتيجية الأولية (Initial KPI Seed Data)
INSERT INTO national_grain_silos (id, name_ar, wilaya, facility_type, capacity_metric_tons, current_stored_tons, railway_connected, railway_operator, land_area_hectares, decree_reference, geom, temperature_celsius, status)
VALUES 
('silo-mila-telaghma', 'صومعة ميلة الكبرى (التلاغمة)', 'ميلة', 'concrete_silo_oaic', 1000000, 780000, TRUE, 'ANESRIF', 86.0, 'المرسوم 24-251', ST_GeomFromText('POINT(6.3681 36.1132)', 4326), 13.8, 'operational'),
('silo-sidi-bel-abbes', 'صومعة سيدي بلعباس الخرسانية', 'سيدي بلعباس', 'concrete_silo_oaic', 500000, 390000, TRUE, 'ANESRIF', 24.0, 'المرسوم 24-251', ST_GeomFromText('POINT(-0.6308 35.1899)', 4326), 14.1, 'operational'),
('silo-oued-souf-hub', 'مجمع صوامع وادي سوف الصحراوي', 'الوادي', 'strategic_silo', 750000, 620000, FALSE, 'ANESRIF-Phase2', 45.0, 'مخصصات 214 هكتار', ST_GeomFromText('POINT(6.8674 33.3683)', 4326), 15.2, 'operational'),
('silo-adrar-meniaa', 'صوامع أقطاب الجنوب (المنيعة - أدرار)', 'أدرار', 'strategic_silo', 1200000, 940000, FALSE, 'ANESRIF-South', 55.0, 'مخصصات 214 هكتار', ST_GeomFromText('POINT(2.8752 30.5841)', 4326), 14.9, 'operational')
ON CONFLICT (id) DO NOTHING;

INSERT INTO national_crop_targets (id, season_year, commodity_type, targeted_area_hectares, actual_cultivated_hectares, target_production_quintals, actual_production_quintals, reference_yield_q_ha, irrigation_program_southern_ha, ndvi_anomaly_score, warning_flag)
VALUES
('target-durum-2025-26', '2025/2026', 'القمح الصلب (Durum Wheat)', 1600000, 1540000, 30000000, 28900000, 85.0, 520000, 0.042, 'normal'),
('target-barley-2025-26', '2025/2026', 'الشعير العلفي (Barley)', 1000000, 960000, 16000000, 15200000, 45.0, 280000, -0.015, 'normal'),
('target-softwheat-2025-26', '2025/2026', 'القمح اللين (Soft Wheat)', 469000, 445000, 7500000, 7100000, 38.0, 200000, 0.010, 'normal')
ON CONFLICT (id) DO NOTHING;

