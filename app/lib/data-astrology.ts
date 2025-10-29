import postgres from 'postgres';
import {
  AstrologyProfile,
  AstrologyType,
  ThaiChartData,
  ChineseChartData,
  VedicChartData,
  WesternChartData,
} from './definitions-crm';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ===================================
// READ QUERIES - Astrology Profiles
// ===================================

/**
 * Fetch all astrology profiles for a client
 */
export async function fetchClientProfiles(
  clientId: string
): Promise<AstrologyProfile[]> {
  try {
    const data = await sql<AstrologyProfile[]>`
      SELECT
        ap.*,
        a.name as created_by_name
      FROM astrology_profiles ap
      LEFT JOIN astrologers a ON a.id = ap.created_by
      WHERE ap.client_id = ${clientId}
      ORDER BY ap.created_at DESC
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch astrology profiles.');
  }
}

/**
 * Fetch specific profile by type
 */
export async function fetchProfileByType(
  clientId: string,
  astrologyType: AstrologyType
): Promise<AstrologyProfile | null> {
  try {
    const data = await sql<AstrologyProfile[]>`
      SELECT *
      FROM astrology_profiles
      WHERE client_id = ${clientId}
        AND astrology_type = ${astrologyType}
      LIMIT 1
    `;

    return data[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch profile.');
  }
}

/**
 * Fetch profile by ID
 */
export async function fetchProfileById(
  profileId: string
): Promise<AstrologyProfile | null> {
  try {
    const data = await sql<AstrologyProfile[]>`
      SELECT *
      FROM astrology_profiles
      WHERE id = ${profileId}
      LIMIT 1
    `;

    return data[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch profile.');
  }
}

/**
 * Get profile count by type for astrologer
 */
export async function fetchProfileStats(astrologerId: string) {
  try {
    const data = await sql<Array<{ astrology_type: string; count: number }>>`
      SELECT
        astrology_type,
        COUNT(*)::int as count
      FROM astrology_profiles
      WHERE created_by = ${astrologerId}
      GROUP BY astrology_type
      ORDER BY count DESC
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch profile statistics.');
  }
}

/**
 * Check if client has specific astrology type profile
 */
export async function hasProfileType(
  clientId: string,
  astrologyType: AstrologyType
): Promise<boolean> {
  try {
    const result = await sql<[{ exists: boolean }]>`
      SELECT EXISTS(
        SELECT 1
        FROM astrology_profiles
        WHERE client_id = ${clientId}
          AND astrology_type = ${astrologyType}
      ) as exists
    `;

    return result[0]?.exists || false;
  } catch (error) {
    console.error('Database Error:', error);
    return false;
  }
}

// ===================================
// Helper Functions - Type-specific data parsing
// ===================================

/**
 * Parse Thai chart data from JSONB
 */
export function parseThaiChartData(chartData: any): ThaiChartData {
  return {
    lagna: chartData.lagna,
    rasi: chartData.rasi,
    planets: chartData.planets,
    chart_image_url: chartData.chart_image_url,
    notes: chartData.notes,
  };
}

/**
 * Parse Chinese chart data from JSONB
 */
export function parseChineseChartData(chartData: any): ChineseChartData {
  return {
    zodiac_year: chartData.zodiac_year,
    element: chartData.element,
    yin_yang: chartData.yin_yang,
    four_pillars: chartData.four_pillars,
    lucky_numbers: chartData.lucky_numbers,
    lucky_colors: chartData.lucky_colors,
    chart_image_url: chartData.chart_image_url,
    notes: chartData.notes,
  };
}

/**
 * Parse Vedic chart data from JSONB
 */
export function parseVedicChartData(chartData: any): VedicChartData {
  return {
    ascendant: chartData.ascendant,
    sun_sign: chartData.sun_sign,
    moon_sign: chartData.moon_sign,
    nakshatra: chartData.nakshatra,
    dasha_period: chartData.dasha_period,
    planets: chartData.planets,
    chart_image_url: chartData.chart_image_url,
    notes: chartData.notes,
  };
}

/**
 * Parse Western chart data from JSONB
 */
export function parseWesternChartData(chartData: any): WesternChartData {
  return {
    sun_sign: chartData.sun_sign,
    moon_sign: chartData.moon_sign,
    ascendant: chartData.ascendant,
    mercury: chartData.mercury,
    venus: chartData.venus,
    mars: chartData.mars,
    jupiter: chartData.jupiter,
    saturn: chartData.saturn,
    chart_image_url: chartData.chart_image_url,
    notes: chartData.notes,
  };
}