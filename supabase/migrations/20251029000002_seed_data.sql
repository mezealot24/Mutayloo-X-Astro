-- Migration: Seed Data for Astrology System
-- Description: ข้อมูลทดสอบสำหรับระบบหมอดู
-- Date: 2025-10-29

-- =============================================================================
-- Seed Data: Astrologers (หมอดู)
-- =============================================================================
INSERT INTO astrologers (id, email, name, phone, specialties, experience_years, bio, is_active) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'ajarn.somchai@example.com', 'อาจารย์สมชาย ดวงดี', '081-234-5678',
     ARRAY['thai', 'chinese'], 25,
     'หมอดูชื่อดังด้านโหราศาสตร์ไทยและจีน มีประสบการณ์กว่า 25 ปี เชี่ยวชาญการดูดวงชะตาและฤกษ์ยาม',
     true),

    ('a2222222-2222-2222-2222-222222222222', 'master.dao@example.com', 'ปรมาจารย์ดาว เทวดา', '082-345-6789',
     ARRAY['vedic', 'western'], 30,
     'ผู้เชี่ยวชาญด้านโหราศาสตร์ตะวันตกและเวทยโหราศาสตร์อินเดีย ศึกษาจากอินเดียโดยตรง',
     true),

    ('a3333333-3333-3333-3333-333333333333', 'mae.malai@example.com', 'แม่มะลิ ทองดี', '083-456-7890',
     ARRAY['thai', 'tarot'], 15,
     'เชี่ยวชาญการดูดวงไทยและไพ่ทาโรต์ รับงานดูดวงเรื่องความรักและการงาน',
     true),

    ('a4444444-4444-4444-4444-444444444444', 'kru.boonmee@example.com', 'ครูบุญมี นาคทอง', '084-567-8901',
     ARRAY['chinese'], 20,
     'ผู้เชี่ยวชาญด้านโหราศาสตร์จีน ดูดวงตามปีเกิด ราศีเกิด และองค์ธาตุ',
     true),

    ('a5555555-5555-5555-5555-555555555555', 'ajarn.nok@example.com', 'อาจารย์นก วิมลรัตน์', '085-678-9012',
     ARRAY['western', 'tarot'], 10,
     'Certified Tarot Reader และ Western Astrologer จากสถาบันระหว่างประเทศ',
     true);

-- =============================================================================
-- Seed Data: Horoscope Clients (ลูกดวง)
-- =============================================================================
INSERT INTO horoscope_clients (id, created_by, first_name, last_name, nickname, gender, birth_date, birth_time, birth_place, birth_latitude, birth_longitude, contact_phone, contact_email) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
     'สมศักดิ์', 'ใจดี', 'แดง', 'male',
     '1990-05-15', '08:30:00', 'โรงพยาบาลศิริราช กรุงเทพฯ', 13.7563, 100.5018,
     '091-111-2222', 'somsak.j@example.com'),

    ('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111',
     'วรรณา', 'สุขใจ', 'อ้อย', 'female',
     '1988-12-25', '14:15:00', 'โรงพยาบาลรามาธิบดี กรุงเทพฯ', 13.7563, 100.5018,
     '092-222-3333', 'wanna.s@example.com'),

    ('c3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222',
     'ประวิทย์', 'มั่งมี', 'เจมส์', 'male',
     '1995-08-20', '22:45:00', 'โรงพยาบาลจุฬาลงกรณ์ กรุงเทพฯ', 13.7563, 100.5018,
     '093-333-4444', 'prawit.m@example.com'),

    ('c4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333',
     'สุภาพร', 'รุ่งเรือง', 'แนน', 'female',
     '1992-03-10', '06:00:00', 'โรงพยาบาลเชียงใหม่ จ.เชียงใหม่', 18.7883, 98.9853,
     '094-444-5555', 'supaporn.r@example.com'),

    ('c5555555-5555-5555-5555-555555555555', 'a3333333-3333-3333-3333-333333333333',
     'นพดล', 'เจริญสุข', 'บอม', 'male',
     '1985-11-05', '16:20:00', 'โรงพยาบาลสงขลานครินทร์ จ.สงขลา', 7.1891, 100.5959,
     '095-555-6666', 'noppadon.c@example.com'),

    ('c6666666-6666-6666-6666-666666666666', 'a4444444-4444-4444-4444-444444444444',
     'พิมพ์ชนก', 'วงศ์ใหญ่', 'นิว', 'female',
     '2000-07-14', '10:30:00', 'โรงพยาบาลภูเก็ต จ.ภูเก็ต', 7.8804, 98.3923,
     '096-666-7777', 'pimchanok.w@example.com'),

    ('c7777777-7777-7777-7777-777777777777', 'a5555555-5555-5555-5555-555555555555',
     'ธนากร', 'ศรีทอง', 'ตูน', 'male',
     '1993-02-28', '18:45:00', 'โรงพยาบาลขอนแก่น จ.ขอนแก่น', 16.4419, 102.8359,
     '097-777-8888', 'thanakorn.s@example.com'),

    ('c8888888-8888-8888-8888-888888888888', 'a5555555-5555-5555-5555-555555555555',
     'รัชนี', 'แสงทอง', 'เหมียว', 'female',
     '1998-09-18', '12:00:00', 'โรงพยาบาลอุดรธานี จ.อุดรธานี', 17.4145, 102.7876,
     '098-888-9999', 'ratchanee.s@example.com');

-- =============================================================================
-- Seed Data: Astrology Profiles (ข้อมูลดวง)
-- =============================================================================

-- Thai Astrology Profiles
INSERT INTO astrology_profiles (client_id, astrology_type, chart_data, interpretation, created_by) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'thai',
     '{"ราศี": "พฤษภ", "นักษัตร": "โรหิณี", "จุลศักราช": 1352, "ปีนักษัตร": "ปีม้า", "เดือนเกิด": 7, "องค์ประธาน": "พระศุกร์"}',
     'เกิดราศีพฤษภ นักษัตรโรหิณี มีดวงชะตาดี มีโชคลาภด้านการเงิน แต่ควรระวังเรื่องสุขภาพในช่วงอายุ 40 ปีขึ้นไป',
     'a1111111-1111-1111-1111-111111111111'),

    ('c2222222-2222-2222-2222-222222222222', 'thai',
     '{"ราศี": "ธนู", "นักษัตร": "มูล", "จุลศักราช": 1350, "ปีนักษัตร": "ปีมังกร", "เดือนเกิด": 2, "องค์ประธาน": "พระพฤหัส"}',
     'เกิดราศีธนู นักษัตรมูล มีบุญญาบารมีสูง เหมาะกับงานด้านการสื่อสาร มีโชคด้านความรักในช่วงอายุ 35-45 ปี',
     'a1111111-1111-1111-1111-111111111111');

-- Chinese Astrology Profiles
INSERT INTO astrology_profiles (client_id, astrology_type, chart_data, interpretation, created_by) VALUES
    ('c3333333-3333-3333-3333-333333333333', 'chinese',
     '{"ปีเกิด": "ปีหมู", "ธาตุ": "ไม้", "ราศี": "สิงห์", "ดาวมงคล": "ดาวเทียนอี้", "ดาวอกุศล": "ดาวแก่ซา"}',
     'ปีหมูธาตุไม้ มีนิสัยดี ซื่อสัตย์ มีโชคด้านการเงินดี แต่ต้องระวังคนหลอกลวงในช่วงอายุ 30-35 ปี',
     'a2222222-2222-2222-2222-222222222222'),

    ('c4444444-4444-4444-4444-444444444444', 'chinese',
     '{"ปีเกิด": "ปีวอก", "ธาตุ": "น้ำ", "ราศี": "เมษ", "ดาวมงคล": "ดาวเทียนโหย่ว", "ดาวอกุศล": "ดาวเทียนกุน"}',
     'ปีวอกธาตุน้ำ มีความคิดสร้างสรรค์สูง เหมาะกับงานศิลปะและการออกแบบ โชคด้านครอบครัวดีเยี่ยม',
     'a4444444-4444-4444-4444-444444444444');

-- Western Astrology Profiles
INSERT INTO astrology_profiles (client_id, astrology_type, chart_data, interpretation, created_by) VALUES
    ('c5555555-5555-5555-5555-555555555555', 'western',
     '{"sun_sign": "Scorpio", "moon_sign": "Cancer", "rising_sign": "Libra", "venus": "Sagittarius", "mars": "Virgo", "mercury": "Scorpio"}',
     'Sun in Scorpio with Moon in Cancer creates intense emotional depth. Rising Libra brings diplomatic charm. Strong potential in healing professions.',
     'a2222222-2222-2222-2222-222222222222'),

    ('c6666666-6666-6666-6666-666666666666', 'western',
     '{"sun_sign": "Cancer", "moon_sign": "Pisces", "rising_sign": "Aquarius", "venus": "Leo", "mars": "Gemini", "mercury": "Cancer"}',
     'Water Sun-Moon combination creates highly intuitive nature. Aquarius rising adds innovative thinking. Excellent for creative and caring professions.',
     'a5555555-5555-5555-5555-555555555555');

-- Vedic Astrology Profiles
INSERT INTO astrology_profiles (client_id, astrology_type, chart_data, interpretation, created_by) VALUES
    ('c7777777-7777-7777-7777-777777777777', 'vedic',
     '{"rashi": "Meena", "nakshatra": "Revati", "lagna": "Vrishabha", "dasha": "Jupiter-Saturn", "yoga": "Gaja Kesari", "dosha": "None"}',
     'Meena Rashi with Revati Nakshatra indicates spiritual inclination. Jupiter-Saturn dasha period brings material and spiritual balance. Gaja Kesari yoga promises success.',
     'a2222222-2222-2222-2222-222222222222');

-- =============================================================================
-- Seed Data: Tarot Sessions (Session การเปิดไพ่)
-- =============================================================================
INSERT INTO tarot_sessions (client_id, created_by, session_date, spread_type, question, cards_drawn, interpretation) VALUES
    ('c4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333',
     '2024-10-15 14:30:00+07', '3-card',
     'จะได้งานใหม่ไหม',
     '[
        {"position": "past", "card": "Three of Pentacles", "orientation": "upright"},
        {"position": "present", "card": "The Chariot", "orientation": "upright"},
        {"position": "future", "card": "Ace of Wands", "orientation": "upright"}
     ]',
     'อดีต: Three of Pentacles บ่งบอกถึงการทำงานหนักและความร่วมมือที่ดี | ปัจจุบัน: The Chariot แสดงให้เห็นถึงความมุ่งมั่นและการเคลื่อนไหวอย่างรวดเร็ว | อนาคต: Ace of Wands เป็นจุดเริ่มต้นใหม่ที่ดี มีโอกาสได้งานใหม่ที่ตรงกับความสามารถ'),

    ('c8888888-8888-8888-8888-888888888888', 'a5555555-5555-5555-5555-555555555555',
     '2024-10-20 16:00:00+07', 'celtic-cross',
     'ความรักจะไปต่อไหม',
     '[
        {"position": 1, "card": "The Lovers", "orientation": "upright"},
        {"position": 2, "card": "Two of Cups", "orientation": "reversed"},
        {"position": 3, "card": "Queen of Hearts", "orientation": "upright"},
        {"position": 4, "card": "Five of Swords", "orientation": "reversed"},
        {"position": 5, "card": "The Star", "orientation": "upright"},
        {"position": 6, "card": "Knight of Cups", "orientation": "upright"},
        {"position": 7, "card": "Seven of Pentacles", "orientation": "upright"},
        {"position": 8, "card": "The Empress", "orientation": "upright"},
        {"position": 9, "card": "Ace of Cups", "orientation": "upright"},
        {"position": 10, "card": "Ten of Cups", "orientation": "upright"}
     ]',
     'The Lovers บ่งบอกถึงความรักที่แท้จริง แม้จะมีอุปสรรคจาก Two of Cups reversed แต่ The Star และ Ten of Cups ในตำแหน่งท้ายแสดงถึงความหวังและความสมหวังในความรัก แนะนำให้อดทนและสื่อสารกันให้มากขึ้น'),

    ('c6666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333',
     '2024-10-25 10:00:00+07', 'past-present-future',
     'การงานปีหน้าเป็นอย่างไร',
     '[
        {"position": "past", "card": "Eight of Pentacles", "orientation": "upright"},
        {"position": "present", "card": "Wheel of Fortune", "orientation": "upright"},
        {"position": "future", "card": "The World", "orientation": "upright"}
     ]',
     'อดีตมีความขยันและพัฒนาทักษะอย่างต่อเนื่อง ปัจจุบันอยู่ในช่วงเปลี่ยนผ่านที่ดี อนาคตจะประสบความสำเร็จและบรรลุเป้าหมาย The World บ่งบอกถึงความสมบูรณ์และความสำเร็จที่รอคอยอยู่');

-- =============================================================================
-- Seed Data: Client Permissions (สิทธิ์การเข้าถึง)
-- =============================================================================

-- อาจารย์สมชายให้สิทธิ์แม่มะลิดูข้อมูลลูกดวงของตัวเอง
INSERT INTO client_permissions (client_id, astrologer_id, can_view, can_edit, granted_by) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333',
     true, false, 'a1111111-1111-1111-1111-111111111111'),

    ('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333',
     true, true, 'a1111111-1111-1111-1111-111111111111');

-- ปรมาจารย์ดาวให้สิทธิ์อาจารย์นกดูข้อมูลลูกดวง
INSERT INTO client_permissions (client_id, astrologer_id, can_view, can_edit, granted_by) VALUES
    ('c3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555',
     true, false, 'a2222222-2222-2222-2222-222222222222'),

    ('c5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555',
     true, true, 'a2222222-2222-2222-2222-222222222222');

-- แม่มะลิให้สิทธิ์ครูบุญมีดูข้อมูลลูกดวง
INSERT INTO client_permissions (client_id, astrologer_id, can_view, can_edit, granted_by) VALUES
    ('c4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444',
     true, false, 'a3333333-3333-3333-3333-333333333333');

-- =============================================================================
-- Verification Queries
-- =============================================================================

-- ตรวจสอบจำนวนข้อมูลที่เพิ่มเข้าไป
DO $$
DECLARE
    astrologers_count INTEGER;
    clients_count INTEGER;
    profiles_count INTEGER;
    sessions_count INTEGER;
    permissions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO astrologers_count FROM astrologers;
    SELECT COUNT(*) INTO clients_count FROM horoscope_clients;
    SELECT COUNT(*) INTO profiles_count FROM astrology_profiles;
    SELECT COUNT(*) INTO sessions_count FROM tarot_sessions;
    SELECT COUNT(*) INTO permissions_count FROM client_permissions;

    RAISE NOTICE '=== Seed Data Summary ===';
    RAISE NOTICE 'Astrologers: %', astrologers_count;
    RAISE NOTICE 'Horoscope Clients: %', clients_count;
    RAISE NOTICE 'Astrology Profiles: %', profiles_count;
    RAISE NOTICE 'Tarot Sessions: %', sessions_count;
    RAISE NOTICE 'Client Permissions: %', permissions_count;
    RAISE NOTICE '========================';
END $$;
