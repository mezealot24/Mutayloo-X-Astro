-- Migration: Create Astrology System Tables
-- Description: สร้างระบบตารางสำหรับหมอดู (Astrologers) และลูกดวง (Horoscope Clients)
-- Date: 2025-10-29

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Table: astrologers (หมอดู)
-- Description: เก็บข้อมูลหมอดูที่ให้บริการดูดวง
-- =============================================================================
CREATE TABLE astrologers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    specialties TEXT[] DEFAULT '{}', -- เช่น Thai, Chinese, Vedic, Western, Tarot
    experience_years INTEGER,
    bio TEXT,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Table: horoscope_clients (ลูกดวง)
-- Description: เก็บข้อมูลลูกดวง รวมถึงวันเกิด เวลา และสถานที่เกิด
-- =============================================================================
CREATE TABLE horoscope_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES astrologers(id) ON DELETE RESTRICT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),

    -- ข้อมูลการเกิด (สำคัญสำหรับการดูดวง)
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_place TEXT NOT NULL,
    birth_latitude DECIMAL(10, 7),
    birth_longitude DECIMAL(10, 7),

    -- ข้อมูลติดต่อ
    contact_phone TEXT,
    contact_email TEXT,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Table: astrology_profiles (โปรไฟล์ดวงแต่ละศาสตร์)
-- Description: เก็บข้อมูลดวงแยกตามศาสตร์ต่าง ๆ (Thai/Chinese/Vedic/Western)
-- =============================================================================
CREATE TABLE astrology_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES horoscope_clients(id) ON DELETE CASCADE,
    astrology_type TEXT NOT NULL CHECK (astrology_type IN ('thai', 'chinese', 'vedic', 'western')),

    -- เก็บข้อมูลดวงเป็น JSON เพื่อความยืดหยุ่น
    chart_data JSONB NOT NULL DEFAULT '{}',

    -- คำทำนายและคำแนะนำ
    interpretation TEXT,

    created_by UUID NOT NULL REFERENCES astrologers(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- ลูกดวง 1 คนมีได้เพียง 1 ดวงต่อ 1 ศาสตร์
    UNIQUE (client_id, astrology_type)
);

-- =============================================================================
-- Table: tarot_sessions (Session การเปิดไพ่ทาโรต์)
-- Description: เก็บข้อมูลการเปิดไพ่ทาโรต์แต่ละครั้ง
-- =============================================================================
CREATE TABLE tarot_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES horoscope_clients(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES astrologers(id) ON DELETE RESTRICT,

    session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    spread_type TEXT NOT NULL, -- เช่น '3-card', 'celtic-cross', 'past-present-future'
    question TEXT, -- คำถามที่ลูกดวงถาม

    -- เก็บข้อมูลไพ่ที่จั่วได้เป็น JSON
    -- Example: [{"position": 1, "card": "The Fool", "orientation": "upright"}, ...]
    cards_drawn JSONB NOT NULL DEFAULT '[]',

    -- คำตีความ
    interpretation TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Table: client_permissions (สิทธิ์การเข้าถึงข้อมูลลูกดวง)
-- Description: จัดการสิทธิ์ให้หมอดูคนอื่น ๆ เข้าถึงข้อมูลลูกดวงได้
-- =============================================================================
CREATE TABLE client_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES horoscope_clients(id) ON DELETE CASCADE,
    astrologer_id UUID NOT NULL REFERENCES astrologers(id) ON DELETE CASCADE,

    -- สิทธิ์การใช้งาน
    can_view BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,

    granted_by UUID NOT NULL REFERENCES astrologers(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- หมอดู 1 คนมีสิทธิ์กับลูกดวงได้เพียง 1 record
    UNIQUE (client_id, astrologer_id)
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- astrologers indexes
CREATE INDEX idx_astrologers_email ON astrologers(email);
CREATE INDEX idx_astrologers_is_active ON astrologers(is_active);

-- horoscope_clients indexes
CREATE INDEX idx_horoscope_clients_created_by ON horoscope_clients(created_by);
CREATE INDEX idx_horoscope_clients_birth_date ON horoscope_clients(birth_date);
CREATE INDEX idx_horoscope_clients_name ON horoscope_clients(first_name, last_name);

-- astrology_profiles indexes
CREATE INDEX idx_astrology_profiles_client_id ON astrology_profiles(client_id);
CREATE INDEX idx_astrology_profiles_type ON astrology_profiles(astrology_type);
CREATE INDEX idx_astrology_profiles_created_by ON astrology_profiles(created_by);

-- tarot_sessions indexes
CREATE INDEX idx_tarot_sessions_client_id ON tarot_sessions(client_id);
CREATE INDEX idx_tarot_sessions_created_by ON tarot_sessions(created_by);
CREATE INDEX idx_tarot_sessions_date ON tarot_sessions(session_date);

-- client_permissions indexes
CREATE INDEX idx_client_permissions_client_id ON client_permissions(client_id);
CREATE INDEX idx_client_permissions_astrologer_id ON client_permissions(astrologer_id);

-- =============================================================================
-- Functions: Auto-update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_astrologers_updated_at BEFORE UPDATE ON astrologers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horoscope_clients_updated_at BEFORE UPDATE ON horoscope_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_astrology_profiles_updated_at BEFORE UPDATE ON astrology_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarot_sessions_updated_at BEFORE UPDATE ON tarot_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_permissions_updated_at BEFORE UPDATE ON client_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE astrologers ENABLE ROW LEVEL SECURITY;
ALTER TABLE horoscope_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrology_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_permissions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (ให้แก้ไขตาม authentication system ที่ใช้)
-- Example: หมอดูเห็นเฉพาะข้อมูลที่ตัวเองสร้างหรือได้รับสิทธิ์

-- Policy: หมอดูดูข้อมูลตัวเองได้
CREATE POLICY "Astrologers can view their own data"
    ON astrologers FOR SELECT
    USING (auth.uid()::TEXT = id::TEXT);

-- Policy: หมอดูดูลูกดวงที่ตัวเองสร้างได้
CREATE POLICY "Astrologers can view clients they created"
    ON horoscope_clients FOR SELECT
    USING (created_by::TEXT = auth.uid()::TEXT);

-- Policy: หมอดูดูลูกดวงที่ได้รับสิทธิ์
CREATE POLICY "Astrologers can view clients with permission"
    ON horoscope_clients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_permissions
            WHERE client_id = horoscope_clients.id
            AND astrologer_id::TEXT = auth.uid()::TEXT
            AND can_view = true
        )
    );

COMMENT ON TABLE astrologers IS 'ตารางเก็บข้อมูลหมอดู';
COMMENT ON TABLE horoscope_clients IS 'ตารางเก็บข้อมูลลูกดวง รวมวันเกิด เวลา สถานที่';
COMMENT ON TABLE astrology_profiles IS 'ตารางเก็บข้อมูลดวงแยกตามศาสตร์ (Thai/Chinese/Vedic/Western)';
COMMENT ON TABLE tarot_sessions IS 'ตารางเก็บ session การเปิดไพ่ทาโรต์';
COMMENT ON TABLE client_permissions IS 'ตารางจัดการสิทธิ์การเข้าถึงข้อมูลลูกดวงระหว่างหมอดู';
