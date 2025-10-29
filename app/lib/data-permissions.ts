import postgres from 'postgres';
import {
  ClientPermission,
  AccessControl,
  Astrologer,
} from './definitions-crm';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ===================================
// READ QUERIES - Permissions
// ===================================

/**
 * Check if astrologer can access client
 * Returns access control details
 */
export async function checkClientAccess(
  astrologerId: string,
  clientId: string
): Promise<AccessControl> {
  try {
    // Check if owner
    const ownerCheck = await sql<[{ is_owner: boolean }]>`
      SELECT EXISTS(
        SELECT 1
        FROM horoscope_clients
        WHERE id = ${clientId}
          AND created_by = ${astrologerId}
      ) as is_owner
    `;

    const isOwner = ownerCheck[0]?.is_owner || false;

    if (isOwner) {
      return {
        can_view: true,
        can_edit: true,
        is_owner: true,
      };
    }

    // Check permissions
    const permissionData = await sql<ClientPermission[]>`
      SELECT *
      FROM client_permissions
      WHERE client_id = ${clientId}
        AND astrologer_id = ${astrologerId}
      LIMIT 1
    `;

    const permission = permissionData[0];

    if (permission) {
      return {
        can_view: permission.can_view,
        can_edit: permission.can_edit,
        is_owner: false,
        permission_id: permission.id,
      };
    }

    // No access
    return {
      can_view: false,
      can_edit: false,
      is_owner: false,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check client access.');
  }
}

/**
 * Fetch all permissions for a client
 */
export async function fetchClientPermissions(
  clientId: string
): Promise<ClientPermission[]> {
  try {
    const data = await sql<ClientPermission[]>`
      SELECT
        cp.*,
        a.name as astrologer_name,
        a.email as astrologer_email,
        gb.name as granted_by_name
      FROM client_permissions cp
      LEFT JOIN astrologers a ON a.id = cp.astrologer_id
      LEFT JOIN astrologers gb ON gb.id = cp.granted_by
      WHERE cp.client_id = ${clientId}
      ORDER BY cp.created_at DESC
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch client permissions.');
  }
}

/**
 * Fetch permission by ID
 */
export async function fetchPermissionById(
  permissionId: string
): Promise<ClientPermission | null> {
  try {
    const data = await sql<ClientPermission[]>`
      SELECT *
      FROM client_permissions
      WHERE id = ${permissionId}
      LIMIT 1
    `;

    return data[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch permission.');
  }
}

/**
 * Check if permission already exists
 */
export async function permissionExists(
  clientId: string,
  astrologerId: string
): Promise<boolean> {
  try {
    const result = await sql<[{ exists: boolean }]>`
      SELECT EXISTS(
        SELECT 1
        FROM client_permissions
        WHERE client_id = ${clientId}
          AND astrologer_id = ${astrologerId}
      ) as exists
    `;

    return result[0]?.exists || false;
  } catch (error) {
    console.error('Database Error:', error);
    return false;
  }
}

/**
 * Fetch astrologers who have access to a client
 */
export async function fetchAstrologersWithAccess(clientId: string) {
  try {
    const data = await sql<
      Array<
        Astrologer & {
          permission_id: string;
          can_view: boolean;
          can_edit: boolean;
        }
      >
    >`
      SELECT
        a.*,
        cp.id as permission_id,
        cp.can_view,
        cp.can_edit
      FROM astrologers a
      INNER JOIN client_permissions cp ON cp.astrologer_id = a.id
      WHERE cp.client_id = ${clientId}
      ORDER BY cp.created_at DESC
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch astrologers with access.');
  }
}

/**
 * Fetch all astrologers (for sharing dropdown)
 * Exclude current user and those who already have access
 */
export async function fetchAvailableAstrologers(
  clientId: string,
  currentAstrologerId: string
) {
  try {
    const data = await sql<Astrologer[]>`
      SELECT a.*
      FROM astrologers a
      WHERE a.id != ${currentAstrologerId}
        AND a.is_active = true
        AND NOT EXISTS (
          SELECT 1
          FROM client_permissions cp
          WHERE cp.client_id = ${clientId}
            AND cp.astrologer_id = a.id
        )
      ORDER BY a.name ASC
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch available astrologers.');
  }
}

/**
 * Count clients shared by astrologer
 */
export async function fetchSharedClientCount(astrologerId: string): Promise<number> {
  try {
    const result = await sql<[{ count: number }]>`
      SELECT COUNT(DISTINCT client_id)::int as count
      FROM client_permissions
      WHERE granted_by = ${astrologerId}
    `;

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch shared client count.');
  }
}