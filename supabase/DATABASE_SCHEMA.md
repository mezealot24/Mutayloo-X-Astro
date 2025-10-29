# Database Schema Documentation - Astrology System

## Overview
ระบบฐานข้อมูลสำหรับหมอดู (Astrologers) และลูกดวง (Horoscope Clients) ที่รองรับการดูดวงหลายศาสตร์และการเปิดไพ่ทาโรต์

## Database Tables

### 1. `astrologers` (หมอดู)
เก็บข้อมูลหมอดูที่ให้บริการดูดวง

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| email | TEXT | อีเมล (unique, not null) |
| name | TEXT | ชื่อหมอดู (not null) |
| phone | TEXT | เบอร์โทร |
| specialties | TEXT[] | ความเชี่ยวชาญ (thai, chinese, vedic, western, tarot) |
| experience_years | INTEGER | จำนวนปีประสบการณ์ |
| bio | TEXT | ประวัติ/คำแนะนำตัว |
| profile_image_url | TEXT | URL รูปโปรไฟล์ |
| is_active | BOOLEAN | สถานะการใช้งาน (default: true) |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัปเดตล่าสุด |

**Indexes:**
- `idx_astrologers_email` on email
- `idx_astrologers_is_active` on is_active

---

### 2. `horoscope_clients` (ลูกดวง)
เก็บข้อมูลลูกดวง รวมถึงวันเกิด เวลา และสถานที่เกิด (สำคัญสำหรับการดูดวง)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| created_by | UUID | Foreign key → astrologers.id (หมอดูที่สร้าง) |
| first_name | TEXT | ชื่อจริง (not null) |
| last_name | TEXT | นามสกุล (not null) |
| nickname | TEXT | ชื่อเล่น |
| gender | TEXT | เพศ (male, female, other, prefer_not_to_say) |
| birth_date | DATE | วันเกิด (not null) |
| birth_time | TIME | เวลาเกิด (not null) |
| birth_place | TEXT | สถานที่เกิด (not null) |
| birth_latitude | DECIMAL(10,7) | ละติจูดสถานที่เกิด |
| birth_longitude | DECIMAL(10,7) | ลองจิจูดสถานที่เกิด |
| contact_phone | TEXT | เบอร์ติดต่อ |
| contact_email | TEXT | อีเมลติดต่อ |
| notes | TEXT | บันทึกเพิ่มเติม |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัปเดตล่าสุด |

**Indexes:**
- `idx_horoscope_clients_created_by` on created_by
- `idx_horoscope_clients_birth_date` on birth_date
- `idx_horoscope_clients_name` on (first_name, last_name)

---

### 3. `astrology_profiles` (โปรไฟล์ดวงแต่ละศาสตร์)
เก็บข้อมูลดวงแยกตามศาสตร์ต่าง ๆ (Thai/Chinese/Vedic/Western)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| client_id | UUID | Foreign key → horoscope_clients.id |
| astrology_type | TEXT | ประเภทศาสตร์ (thai, chinese, vedic, western) |
| chart_data | JSONB | ข้อมูลดวง (flexible JSON format) |
| interpretation | TEXT | คำทำนายและคำแนะนำ |
| created_by | UUID | Foreign key → astrologers.id (หมอดูที่สร้าง) |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัปเดตล่าสุด |

**Constraints:**
- UNIQUE (client_id, astrology_type) - ลูกดวง 1 คนมีได้เพียง 1 ดวงต่อ 1 ศาสตร์

**Indexes:**
- `idx_astrology_profiles_client_id` on client_id
- `idx_astrology_profiles_type` on astrology_type
- `idx_astrology_profiles_created_by` on created_by

**Chart Data Examples:**

**Thai Astrology:**
```json
{
  "ราศี": "พฤษภ",
  "นักษัตร": "โรหิณี",
  "จุลศักราช": 1352,
  "ปีนักษัตร": "ปีม้า",
  "เดือนเกิด": 7,
  "องค์ประธาน": "พระศุกร์"
}
```

**Chinese Astrology:**
```json
{
  "ปีเกิด": "ปีหมู",
  "ธาตุ": "ไม้",
  "ราศี": "สิงห์",
  "ดาวมงคล": "ดาวเทียนอี้",
  "ดาวอกุศล": "ดาวแก่ซา"
}
```

**Western Astrology:**
```json
{
  "sun_sign": "Scorpio",
  "moon_sign": "Cancer",
  "rising_sign": "Libra",
  "venus": "Sagittarius",
  "mars": "Virgo",
  "mercury": "Scorpio"
}
```

---

### 4. `tarot_sessions` (Session การเปิดไพ่ทาโรต์)
เก็บข้อมูลการเปิดไพ่ทาโรต์แต่ละครั้ง

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| client_id | UUID | Foreign key → horoscope_clients.id (optional) |
| created_by | UUID | Foreign key → astrologers.id (หมอดูที่เปิดไพ่) |
| session_date | TIMESTAMPTZ | วันที่เปิดไพ่ (default: NOW()) |
| spread_type | TEXT | รูปแบบการวางไพ่ (3-card, celtic-cross, etc.) |
| question | TEXT | คำถามที่ลูกดวงถาม |
| cards_drawn | JSONB | ข้อมูลไพ่ที่จั่วได้ (array of card objects) |
| interpretation | TEXT | คำตีความ |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัปเดตล่าสุด |

**Indexes:**
- `idx_tarot_sessions_client_id` on client_id
- `idx_tarot_sessions_created_by` on created_by
- `idx_tarot_sessions_date` on session_date

**Cards Drawn Example:**
```json
[
  {
    "position": "past",
    "card": "Three of Pentacles",
    "orientation": "upright"
  },
  {
    "position": "present",
    "card": "The Chariot",
    "orientation": "upright"
  },
  {
    "position": "future",
    "card": "Ace of Wands",
    "orientation": "upright"
  }
]
```

---

### 5. `client_permissions` (สิทธิ์การเข้าถึงข้อมูลลูกดวง)
จัดการสิทธิ์ให้หมอดูคนอื่น ๆ เข้าถึงข้อมูลลูกดวงได้

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| client_id | UUID | Foreign key → horoscope_clients.id |
| astrologer_id | UUID | Foreign key → astrologers.id (หมอดูที่ได้รับสิทธิ์) |
| can_view | BOOLEAN | สิทธิ์การดู (default: true) |
| can_edit | BOOLEAN | สิทธิ์การแก้ไข (default: false) |
| granted_by | UUID | Foreign key → astrologers.id (หมอดูที่ให้สิทธิ์) |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัปเดตล่าสุด |

**Constraints:**
- UNIQUE (client_id, astrologer_id) - หมอดู 1 คนมีสิทธิ์กับลูกดวงได้เพียง 1 record

**Indexes:**
- `idx_client_permissions_client_id` on client_id
- `idx_client_permissions_astrologer_id` on astrologer_id

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│   astrologers   │
│                 │
│ • id (PK)       │
│ • email         │
│ • name          │
│ • specialties   │
│ • ...           │
└────────┬────────┘
         │
         │ created_by
         │
         ▼
┌──────────────────────┐
│ horoscope_clients    │
│                      │
│ • id (PK)            │
│ • created_by (FK)    │
│ • first_name         │
│ • last_name          │
│ • birth_date         │
│ • birth_time         │
│ • birth_place        │
│ • ...                │
└──────────┬───────────┘
           │
           ├──────────────────┬──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────┐ ┌─────────────────┐ ┌──────────────────────┐
│ astrology_profiles  │ │ tarot_sessions  │ │ client_permissions   │
│                     │ │                 │ │                      │
│ • id (PK)           │ │ • id (PK)       │ │ • id (PK)            │
│ • client_id (FK)    │ │ • client_id(FK) │ │ • client_id (FK)     │
│ • astrology_type    │ │ • created_by    │ │ • astrologer_id (FK) │
│ • chart_data (JSON) │ │ • spread_type   │ │ • can_view           │
│ • interpretation    │ │ • cards_drawn   │ │ • can_edit           │
│ • ...               │ │ • ...           │ │ • granted_by (FK)    │
└─────────────────────┘ └─────────────────┘ └──────────────────────┘
```

---

## Row Level Security (RLS) Policies

ตารางทั้งหมดมี RLS enabled แล้ว โดยมี basic policies ดังนี้:

### astrologers
- หมอดูสามารถดูข้อมูลตัวเองได้

### horoscope_clients
- หมอดูสามารถดูลูกดวงที่ตัวเองสร้างได้
- หมอดูสามารถดูลูกดวงที่ได้รับสิทธิ์ผ่าน `client_permissions`

**Note:** ควรปรับแต่ง RLS policies ตาม authentication system ที่ใช้งานจริง

---

## Seed Data Summary

Migration ได้เพิ่มข้อมูลทดสอบดังนี้:

- **5 หมอดู** (อาจารย์สมชาย, ปรมาจารย์ดาว, แม่มะลิ, ครูบุญมี, อาจารย์นก)
- **8 ลูกดวง** (สมศักดิ์, วรรณา, ประวิทย์, สุภาพร, นพดล, พิมพ์ชนก, ธนากร, รัชนี)
- **7 Astrology Profiles** (Thai, Chinese, Western, Vedic)
- **3 Tarot Sessions** (3-card, Celtic Cross, Past-Present-Future spreads)
- **5 Client Permissions** (ตัวอย่างการแชร์สิทธิ์ระหว่างหมอดู)

---

## Usage Examples

### Query: ดูข้อมูลลูกดวงพร้อมดวงทั้งหมด
```sql
SELECT
  c.first_name,
  c.last_name,
  c.birth_date,
  c.birth_time,
  c.birth_place,
  ap.astrology_type,
  ap.interpretation
FROM horoscope_clients c
LEFT JOIN astrology_profiles ap ON c.id = ap.client_id
WHERE c.id = 'client-uuid-here';
```

### Query: ดู Tarot sessions ของลูกดวง
```sql
SELECT
  ts.session_date,
  ts.spread_type,
  ts.question,
  ts.cards_drawn,
  ts.interpretation,
  a.name as astrologer_name
FROM tarot_sessions ts
JOIN astrologers a ON ts.created_by = a.id
WHERE ts.client_id = 'client-uuid-here'
ORDER BY ts.session_date DESC;
```

### Query: ดูหมอดูที่มีสิทธิ์เข้าถึงลูกดวง
```sql
SELECT
  a.name as astrologer_name,
  a.email,
  cp.can_view,
  cp.can_edit,
  ga.name as granted_by_name
FROM client_permissions cp
JOIN astrologers a ON cp.astrologer_id = a.id
JOIN astrologers ga ON cp.granted_by = ga.id
WHERE cp.client_id = 'client-uuid-here';
```

---

## Migration Files

1. **20251029000001_create_astrology_system.sql**
   - สร้างตารางทั้ง 5 ตาราง
   - สร้าง indexes
   - สร้าง triggers สำหรับ auto-update timestamp
   - Enable RLS และสร้าง basic policies

2. **20251029000002_seed_data.sql**
   - เพิ่มข้อมูลทดสอบ
   - แสดง summary ข้อมูลที่เพิ่มเข้าไป

---

## Running Migrations

### Method 1: Using Node.js Script (แนะนำ)
```bash
node scripts/run-migrations.mjs
```

### Method 2: Using Supabase CLI
```bash
npx supabase db push
```

### Method 3: Using Supabase Dashboard
1. เปิด Supabase Dashboard
2. ไปที่ SQL Editor
3. Copy-paste เนื้อหาจาก migration files
4. Execute

---

## Next Steps

1. **Authentication Integration**: เชื่อมต่อกับ NextAuth หรือ Supabase Auth
2. **API Development**: สร้าง API endpoints สำหรับ CRUD operations
3. **UI Development**: สร้าง frontend components
4. **Advanced RLS**: ปรับแต่ง RLS policies ให้เหมาะกับ use cases จริง
5. **File Upload**: เพิ่มการอัปโหลดรูปโปรไฟล์หมอดูและลูกดวง
6. **Backup Strategy**: วางแผนการสำรองข้อมูล

---

## Support & Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Created:** 2025-10-29
**Last Updated:** 2025-10-29
**Version:** 1.0.0
