import postgres from 'postgres';
import {
  HoroscopeClient,
  ClientWithAstrologer,
  ClientDetailView,
  PaginatedResult,
  ClientSearchParams,
} from './definitions-crm';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const ITEMS_PER_PAGE = 10;

// ===================================
// READ QUERIES - Horoscope Clients
// ===================================

/**
 * Fetch single client by ID
 */
export async function fetchClientById(id: string): Promise<HoroscopeClient | null> {
  try {
    const data = await sql<HoroscopeClient[]>`
      SELECT * FROM horoscope_clients
      WHERE id = ${id}
      LIMIT 1
    `;

    return data[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client.');
  }
}

/**
 * Fetch clients created by specific astrologer (My Clients)
 * With search and pagination
 */
export async function fetchClientsByAstrologer(
  astrologerId: string,
  searchParams: ClientSearchParams = {}
): Promise<PaginatedResult<ClientWithAstrologer>> {
  const {
    query = '',
    gender,
    page = 1,
    per_page = ITEMS_PER_PAGE,
  } = searchParams;

  const offset = (page - 1) * per_page;

  try {
    // Build WHERE conditions
    const conditions = [sql`hc.created_by = ${astrologerId}`];

    if (query) {
      conditions.push(sql`(
        hc.first_name ILIKE ${'%' + query + '%'} OR
        hc.last_name ILIKE ${'%' + query + '%'} OR
        hc.nickname ILIKE ${'%' + query + '%'} OR
        hc.birth_place ILIKE ${'%' + query + '%'}
      )`);
    }

    if (gender) {
      conditions.push(sql`hc.gender = ${gender}`);
    }

    // Fetch data with astrologer info and counts
    const data = await sql<ClientWithAstrologer[]>`
      SELECT
        hc.*,
        a.name AS astrologer_name,
        a.email AS astrologer_email,
        COUNT(DISTINCT ap.id)::int AS profile_count,
        COUNT(DISTINCT ts.id)::int AS tarot_session_count,
        MAX(ts.session_date) AS latest_session_date
      FROM horoscope_clients hc
      LEFT JOIN astrologers a ON a.id = hc.created_by
      LEFT JOIN astrology_profiles ap ON ap.client_id = hc.id
      LEFT JOIN tarot_sessions ts ON ts.client_id = hc.id
      WHERE ${sql(conditions, ' AND ')}
      GROUP BY hc.id, a.name, a.email
      ORDER BY hc.created_at DESC
      LIMIT ${per_page}
      OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql<[{ count: number }]>`
      SELECT COUNT(*)::int as count
      FROM horoscope_clients hc
      WHERE ${sql(conditions, ' AND ')}
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
    throw new Error('Failed to fetch clients.');
  }
}

/**
 * Fetch clients shared with specific astrologer
 */
export async function fetchSharedClients(
  astrologerId: string,
  searchParams: ClientSearchParams = {}
): Promise<PaginatedResult<ClientWithAstrologer>> {
  const {
    query = '',
    gender,
    page = 1,
    per_page = ITEMS_PER_PAGE,
  } = searchParams;

  const offset = (page - 1) * per_page;

  try {
    // Build WHERE conditions
    const conditions = [
      sql`cp.astrologer_id = ${astrologerId}`,
      sql`cp.can_view = true`,
    ];

    if (query) {
      conditions.push(sql`(
        hc.first_name ILIKE ${'%' + query + '%'} OR
        hc.last_name ILIKE ${'%' + query + '%'} OR
        hc.nickname ILIKE ${'%' + query + '%'}
      )`);
    }

    if (gender) {
      conditions.push(sql`hc.gender = ${gender}`);
    }

    // Fetch shared clients
    const data = await sql<ClientWithAstrologer[]>`
      SELECT
        hc.*,
        a.name AS astrologer_name,
        a.email AS astrologer_email,
        COUNT(DISTINCT ap.id)::int AS profile_count,
        COUNT(DISTINCT ts.id)::int AS tarot_session_count,
        MAX(ts.session_date) AS latest_session_date
      FROM horoscope_clients hc
      INNER JOIN client_permissions cp ON cp.client_id = hc.id
      LEFT JOIN astrologers a ON a.id = hc.created_by
      LEFT JOIN astrology_profiles ap ON ap.client_id = hc.id
      LEFT JOIN tarot_sessions ts ON ts.client_id = hc.id
      WHERE ${sql(conditions, ' AND ')}
      GROUP BY hc.id, a.name, a.email
      ORDER BY hc.created_at DESC
      LIMIT ${per_page}
      OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql<[{ count: number }]>`
      SELECT COUNT(DISTINCT hc.id)::int as count
      FROM horoscope_clients hc
      INNER JOIN client_permissions cp ON cp.client_id = hc.id
      WHERE ${sql(conditions, ' AND ')}
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
    throw new Error('Failed to fetch shared clients.');
  }
}

/**
 * Fetch client detail with all related data
 */
export async function fetchClientDetail(
  clientId: string,
  currentAstrologerId: string
): Promise<ClientDetailView | null> {
  try {
    // Fetch client
    const client = await fetchClientById(clientId);
    if (!client) return null;

    // Fetch astrologer info
    const astrologerData = await sql<Array<{ id: string; name: string; email: string }>>`
      SELECT id, name, email
      FROM astrologers
      WHERE id = ${client.created_by}
      LIMIT 1
    `;

    // Fetch profiles
    const profiles = await sql`
      SELECT *
      FROM astrology_profiles
      WHERE client_id = ${clientId}
      ORDER BY created_at DESC
    `;

    // Fetch tarot sessions
    const tarotSessions = await sql`
      SELECT *
      FROM tarot_sessions
      WHERE client_id = ${clientId}
      ORDER BY session_date DESC
    `;

    // Fetch permissions
    const permissions = await sql`
      SELECT *
      FROM client_permissions
      WHERE client_id = ${clientId}
    `;

    // Check if current user can edit
    const isOwner = client.created_by === currentAstrologerId;
    const permission = permissions.find(
      (p: any) => p.astrologer_id === currentAstrologerId
    );
    const canEdit = isOwner || permission?.can_edit || false;

    return {
      client,
      astrologer: astrologerData[0],
      profiles,
      tarot_sessions: tarotSessions,
      permissions,
      can_edit: canEdit,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client detail.');
  }
}

/**
 * Get total client count for astrologer
 */
export async function fetchClientCount(astrologerId: string): Promise<number> {
  try {
    const result = await sql<[{ count: number }]>`
      SELECT COUNT(*)::int as count
      FROM horoscope_clients
      WHERE created_by = ${astrologerId}
    `;

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client count.');
  }
}

/**
 * Get recent clients (for dashboard)
 */
export async function fetchRecentClients(
  astrologerId: string,
  limit: number = 5
) {
  try {
    const data = await sql<ClientWithAstrologer[]>`
      SELECT
        hc.*,
        a.name AS astrologer_name,
        a.email AS astrologer_email,
        COUNT(DISTINCT ap.id)::int AS profile_count,
        COUNT(DISTINCT ts.id)::int AS tarot_session_count,
        MAX(ts.session_date) AS latest_session_date
      FROM horoscope_clients hc
      LEFT JOIN astrologers a ON a.id = hc.created_by
      LEFT JOIN astrology_profiles ap ON ap.client_id = hc.id
      LEFT JOIN tarot_sessions ts ON ts.client_id = hc.id
      WHERE hc.created_by = ${astrologerId}
      GROUP BY hc.id, a.name, a.email
      ORDER BY hc.created_at DESC
      LIMIT ${limit}
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch recent clients.');
  }
}

/**
 * Search clients across all accessible (owned + shared)
 */
export async function searchAllAccessibleClients(
  astrologerId: string,
  query: string
) {
  try {
    const data = await sql<ClientWithAstrologer[]>`
      SELECT DISTINCT
        hc.*,
        a.name AS astrologer_name,
        a.email AS astrologer_email,
        COUNT(DISTINCT ap.id)::int AS profile_count,
        COUNT(DISTINCT ts.id)::int AS tarot_session_count,
        MAX(ts.session_date) AS latest_session_date
      FROM horoscope_clients hc
      LEFT JOIN astrologers a ON a.id = hc.created_by
      LEFT JOIN astrology_profiles ap ON ap.client_id = hc.id
      LEFT JOIN tarot_sessions ts ON ts.client_id = hc.id
      LEFT JOIN client_permissions cp ON cp.client_id = hc.id
      WHERE (
        hc.created_by = ${astrologerId}
        OR (cp.astrologer_id = ${astrologerId} AND cp.can_view = true)
      )
      AND (
        hc.first_name ILIKE ${'%' + query + '%'} OR
        hc.last_name ILIKE ${'%' + query + '%'} OR
        hc.nickname ILIKE ${'%' + query + '%'} OR
        hc.birth_place ILIKE ${'%' + query + '%'}
      )
      GROUP BY hc.id, a.name, a.email
      ORDER BY hc.created_at DESC
      LIMIT 10
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to search clients.');
  }
}
