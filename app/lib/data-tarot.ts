import postgres from 'postgres';
import {
  TarotSession,
  TarotSearchParams,
  PaginatedResult,
} from './definitions-crm';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const ITEMS_PER_PAGE = 10;

// ===================================
// READ QUERIES - Tarot Sessions
// ===================================

/**
 * Fetch tarot session by ID
 */
export async function fetchTarotSessionById(
  sessionId: string
): Promise<TarotSession | null> {
  try {
    const data = await sql<TarotSession[]>`
      SELECT
        ts.*,
        hc.first_name || ' ' || hc.last_name as client_name,
        a.name as reader_name
      FROM tarot_sessions ts
      LEFT JOIN horoscope_clients hc ON hc.id = ts.client_id
      LEFT JOIN astrologers a ON a.id = ts.created_by
      WHERE ts.id = ${sessionId}
      LIMIT 1
    `;

    return data[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tarot session.');
  }
}

/**
 * Fetch all tarot sessions for a client
 */
export async function fetchClientTarotSessions(
  clientId: string
): Promise<TarotSession[]> {
  try {
    const data = await sql<TarotSession[]>`
      SELECT
        ts.*,
        a.name as reader_name
      FROM tarot_sessions ts
      LEFT JOIN astrologers a ON a.id = ts.created_by
      WHERE ts.client_id = ${clientId}
      ORDER BY ts.session_date DESC
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tarot sessions.');
  }
}

/**
 * Fetch recent tarot sessions by reader (astrologer)
 */
export async function fetchRecentTarotSessions(
  readerId: string,
  limit: number = 5
): Promise<TarotSession[]> {
  try {
    const data = await sql<TarotSession[]>`
      SELECT
        ts.*,
        hc.first_name || ' ' || hc.last_name as client_name
      FROM tarot_sessions ts
      LEFT JOIN horoscope_clients hc ON hc.id = ts.client_id
      WHERE ts.created_by = ${readerId}
      ORDER BY ts.session_date DESC
      LIMIT ${limit}
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch recent tarot sessions.');
  }
}

/**
 * Search/filter tarot sessions with pagination
 */
export async function fetchTarotSessions(
  searchParams: TarotSearchParams = {}
): Promise<PaginatedResult<TarotSession>> {
  const {
    client_id,
    reader_id,
    spread_type,
    from_date,
    to_date,
    page = 1,
    per_page = ITEMS_PER_PAGE,
  } = searchParams;

  const offset = (page - 1) * per_page;

  try {
    // Build WHERE conditions
    const conditions = [];

    if (client_id) {
      conditions.push(sql`ts.client_id = ${client_id}`);
    }

    if (reader_id) {
      conditions.push(sql`ts.created_by = ${reader_id}`);
    }

    if (spread_type) {
      conditions.push(sql`ts.spread_type = ${spread_type}`);
    }

    if (from_date) {
      conditions.push(sql`ts.session_date >= ${from_date}`);
    }

    if (to_date) {
      conditions.push(sql`ts.session_date <= ${to_date}`);
    }

    const whereClause =
      conditions.length > 0 ? sql`WHERE ${sql(conditions, ' AND ')}` : sql``;

    // Fetch data
    const data = await sql<TarotSession[]>`
      SELECT
        ts.*,
        hc.first_name || ' ' || hc.last_name as client_name,
        a.name as reader_name
      FROM tarot_sessions ts
      LEFT JOIN horoscope_clients hc ON hc.id = ts.client_id
      LEFT JOIN astrologers a ON a.id = ts.created_by
      ${whereClause}
      ORDER BY ts.session_date DESC
      LIMIT ${per_page}
      OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql<[{ count: number }]>`
      SELECT COUNT(*)::int as count
      FROM tarot_sessions ts
      ${whereClause}
    `;

    const total = countResult[0]?.count || 0;

    return {
      data,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tarot sessions.');
  }
}

/**
 * Get tarot session count for reader
 */
export async function fetchTarotSessionCount(readerId: string): Promise<number> {
  try {
    const result = await sql<[{ count: number }]>`
      SELECT COUNT(*)::int as count
      FROM tarot_sessions
      WHERE created_by = ${readerId}
    `;

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tarot session count.');
  }
}

/**
 * Get spread type statistics for reader
 */
export async function fetchSpreadTypeStats(readerId: string) {
  try {
    const data = await sql<Array<{ spread_type: string; count: number }>>`
      SELECT
        spread_type,
        COUNT(*)::int as count
      FROM tarot_sessions
      WHERE created_by = ${readerId}
      GROUP BY spread_type
      ORDER BY count DESC
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch spread type statistics.');
  }
}

/**
 * Get latest session date for a client
 */
export async function fetchLatestSessionDate(
  clientId: string
): Promise<Date | null> {
  try {
    const result = await sql<[{ latest_date: Date | null }]>`
      SELECT MAX(session_date) as latest_date
      FROM tarot_sessions
      WHERE client_id = ${clientId}
    `;

    return result[0]?.latest_date || null;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}