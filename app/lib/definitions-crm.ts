// ===================================
// CRM Type Definitions for Fortune Teller System
// ===================================

// ----- Enums & Literal Types -----

export const ASTROLOGY_TYPES = ['thai', 'chinese', 'vedic', 'western'] as const;
export type AstrologyType = typeof ASTROLOGY_TYPES[number];

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export type Gender = typeof GENDERS[number];

export const TAROT_SPREAD_TYPES = [
  'three_card',
  'celtic_cross',
  'past_present_future',
  'relationship',
  'career',
  'yes_no',
  'custom',
] as const;
export type TarotSpreadType = typeof TAROT_SPREAD_TYPES[number];

// ----- Database Entity Types -----

/**
 * Astrologer (Fortune Teller)
 * Represents a fortune teller/astrologer user
 */
export interface Astrologer {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  specialties: string[]; // AstrologyType[]
  experience_years?: number | null;
  bio?: string | null;
  profile_image_url?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Horoscope Client
 * Client whose horoscope data is managed by astrologers
 */
export interface HoroscopeClient {
  id: string;
  created_by: string; // astrologer_id
  first_name: string;
  last_name: string;
  nickname?: string | null;
  gender?: Gender | null;
  birth_date: Date;
  birth_time: string; // time format "HH:MM:SS"
  birth_place: string;
  birth_latitude?: number | null;
  birth_longitude?: number | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Astrology Profile
 * Specific astrology chart data for a client
 * One client can have multiple profiles (Thai, Chinese, Vedic, Western)
 */
export interface AstrologyProfile {
  id: string;
  client_id: string;
  astrology_type: AstrologyType;
  chart_data: Record<string, any>; // JSONB - flexible structure per type
  interpretation?: string | null;
  created_by: string; // astrologer_id
  created_at: Date;
  updated_at: Date;
}

/**
 * Tarot Session
 * Records of tarot card reading sessions
 */
export interface TarotSession {
  id: string;
  client_id: string;
  created_by: string; // astrologer_id (reader)
  session_date: Date;
  spread_type: string;
  question?: string | null;
  cards_drawn: TarotCard[]; // JSONB array
  interpretation?: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Tarot Card (used within TarotSession.cards_drawn)
 */
export interface TarotCard {
  card_name: string;
  position: string; // e.g., "past", "present", "future", "challenge", etc.
  is_reversed: boolean;
  interpretation?: string;
}

/**
 * Client Permission
 * Controls access to client data between astrologers
 */
export interface ClientPermission {
  id: string;
  client_id: string;
  astrologer_id: string; // who can access
  can_view: boolean;
  can_edit: boolean;
  granted_by: string; // astrologer_id who granted permission
  created_at: Date;
  updated_at: Date;
}

// ----- Astrology Chart Data Structures -----

/**
 * Thai Astrology Chart Data
 */
export interface ThaiChartData {
  lagna?: string; // ลัคนา (Ascendant)
  rasi?: string; // ราศี (Moon sign)
  planets?: {
    sun?: string;
    moon?: string;
    mars?: string;
    mercury?: string;
    jupiter?: string;
    venus?: string;
    saturn?: string;
  };
  chart_image_url?: string;
  notes?: string;
}

/**
 * Chinese Astrology Chart Data
 */
export interface ChineseChartData {
  zodiac_year?: string; // e.g., "Dragon", "Tiger"
  element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  yin_yang?: 'yin' | 'yang';
  four_pillars?: string; // บาจื่อ
  lucky_numbers?: number[];
  lucky_colors?: string[];
  chart_image_url?: string;
  notes?: string;
}

/**
 * Vedic Astrology Chart Data
 */
export interface VedicChartData {
  ascendant?: string; // Lagna
  sun_sign?: string;
  moon_sign?: string;
  nakshatra?: string; // Moon constellation
  dasha_period?: string; // Current planetary period
  planets?: Record<string, string>;
  chart_image_url?: string;
  notes?: string;
}

/**
 * Western Astrology Chart Data
 */
export interface WesternChartData {
  sun_sign?: string;
  moon_sign?: string;
  ascendant?: string; // Rising sign
  mercury?: string;
  venus?: string;
  mars?: string;
  jupiter?: string;
  saturn?: string;
  chart_image_url?: string;
  notes?: string;
}

// ----- Display/Aggregate Types -----

/**
 * Client with Astrologer Info (for dashboard table)
 */
export interface ClientWithAstrologer extends HoroscopeClient {
  astrologer_name: string;
  astrologer_email: string;
  profile_count: number;
  tarot_session_count: number;
  latest_session_date?: Date | null;
}

/**
 * Client Detail View
 * Full client info with all related data
 */
export interface ClientDetailView {
  client: HoroscopeClient;
  astrologer: Pick<Astrologer, 'id' | 'name' | 'email'>;
  profiles: AstrologyProfile[];
  tarot_sessions: TarotSession[];
  permissions: ClientPermission[];
  can_edit: boolean; // Current user's permission
}

/**
 * Astrologer Stats
 */
export interface AstrologerStats {
  astrologer_id: string;
  total_clients: number;
  total_profiles: number;
  total_tarot_sessions: number;
  active_this_month: number;
}

// ----- Form State Types (for useActionState) -----

/**
 * Form errors structure
 */
export interface FormErrors {
  [field: string]: string[] | undefined;
}

/**
 * Client Form State
 */
export interface ClientFormState {
  errors?: {
    first_name?: string[];
    last_name?: string[];
    birth_date?: string[];
    birth_time?: string[];
    birth_place?: string[];
    gender?: string[];
  };
  message?: string;
  success?: boolean;
}

/**
 * Astrology Profile Form State
 */
export interface ProfileFormState {
  errors?: {
    astrology_type?: string[];
    chart_data?: string[];
  };
  message?: string;
  success?: boolean;
}

/**
 * Tarot Session Form State
 */
export interface TarotFormState {
  errors?: {
    client_id?: string[];
    spread_type?: string[];
    cards_drawn?: string[];
    interpretation?: string[];
  };
  message?: string;
  success?: boolean;
}

/**
 * Permission Form State
 */
export interface PermissionFormState {
  errors?: {
    astrologer_id?: string[];
    can_view?: string[];
    can_edit?: string[];
  };
  message?: string;
  success?: boolean;
}

// ----- Search/Filter Types -----

/**
 * Client Search/Filter Parameters
 */
export interface ClientSearchParams {
  query?: string; // Name, email, place
  astrology_type?: AstrologyType;
  gender?: Gender;
  created_by?: string; // Filter by astrologer
  has_permission?: boolean; // Show shared clients
  page?: number;
  per_page?: number;
}

/**
 * Tarot Session Search Parameters
 */
export interface TarotSearchParams {
  client_id?: string;
  reader_id?: string;
  spread_type?: TarotSpreadType;
  from_date?: Date;
  to_date?: Date;
  page?: number;
  per_page?: number;
}

// ----- Pagination Result -----

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ----- Permission Check Result -----

export interface AccessControl {
  can_view: boolean;
  can_edit: boolean;
  is_owner: boolean;
  permission_id?: string;
}
