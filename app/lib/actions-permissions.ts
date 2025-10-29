'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { PermissionFormState } from './definitions-crm';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ===================================
// Validation Schemas
// ===================================

const PermissionSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  astrologer_id: z.string().uuid(),
  can_view: z.boolean().default(true),
  can_edit: z.boolean().default(false),
});

const CreatePermission = PermissionSchema.omit({ id: true });
const UpdatePermission = PermissionSchema;

// ===================================
// Server Actions - Permissions
// ===================================

/**
 * Share client with another astrologer (grant permission)
 */
export async function shareClient(
  grantedBy: string,
  prevState: PermissionFormState,
  formData: FormData
): Promise<PermissionFormState> {
  try {
    // Validate form data
    const validatedFields = CreatePermission.safeParse({
      client_id: formData.get('client_id'),
      astrologer_id: formData.get('astrologer_id'),
      can_view: formData.get('can_view') === 'true',
      can_edit: formData.get('can_edit') === 'true',
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing or invalid fields.',
        success: false,
      };
    }

    const data = validatedFields.data;

    // Verify that grantedBy is the owner of the client
    const ownerCheck = await sql`
      SELECT created_by FROM horoscope_clients
      WHERE id = ${data.client_id}
      LIMIT 1
    `;

    if (ownerCheck.length === 0) {
      return {
        message: 'Client not found.',
        success: false,
      };
    }

    if (ownerCheck[0].created_by !== grantedBy) {
      return {
        message: 'Unauthorized: Only the client owner can share access.',
        success: false,
      };
    }

    // Check if permission already exists
    const existingPermission = await sql`
      SELECT id FROM client_permissions
      WHERE client_id = ${data.client_id}
        AND astrologer_id = ${data.astrologer_id}
      LIMIT 1
    `;

    if (existingPermission.length > 0) {
      return {
        message: 'Permission already exists for this astrologer.',
        success: false,
      };
    }

    // Insert permission
    await sql`
      INSERT INTO client_permissions (
        client_id,
        astrologer_id,
        can_view,
        can_edit,
        granted_by
      ) VALUES (
        ${data.client_id},
        ${data.astrologer_id},
        ${data.can_view},
        ${data.can_edit},
        ${grantedBy}
      )
    `;

    revalidatePath(`/dashboard/clients/${data.client_id}`);
    revalidatePath('/dashboard/clients');

    return {
      message: 'Client shared successfully.',
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to share client.',
      success: false,
    };
  }
}

/**
 * Update permission levels
 */
export async function updatePermission(
  permissionId: string,
  ownerId: string,
  prevState: PermissionFormState,
  formData: FormData
): Promise<PermissionFormState> {
  try {
    // Validate
    const validatedFields = UpdatePermission.safeParse({
      id: permissionId,
      client_id: formData.get('client_id'),
      astrologer_id: formData.get('astrologer_id'),
      can_view: formData.get('can_view') === 'true',
      can_edit: formData.get('can_edit') === 'true',
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid fields.',
        success: false,
      };
    }

    const data = validatedFields.data;

    // Verify ownership
    const ownerCheck = await sql`
      SELECT hc.created_by
      FROM client_permissions cp
      INNER JOIN horoscope_clients hc ON hc.id = cp.client_id
      WHERE cp.id = ${permissionId}
      LIMIT 1
    `;

    if (ownerCheck.length === 0) {
      return {
        message: 'Permission not found.',
        success: false,
      };
    }

    if (ownerCheck[0].created_by !== ownerId) {
      return {
        message: 'Unauthorized: Only the client owner can modify permissions.',
        success: false,
      };
    }

    // Update permission
    await sql`
      UPDATE client_permissions
      SET
        can_view = ${data.can_view},
        can_edit = ${data.can_edit},
        updated_at = NOW()
      WHERE id = ${permissionId}
    `;

    revalidatePath(`/dashboard/clients/${data.client_id}`);

    return {
      message: 'Permission updated successfully.',
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update permission.',
      success: false,
    };
  }
}

/**
 * Revoke access (delete permission)
 */
export async function revokeAccess(
  permissionId: string,
  ownerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Verify ownership
    const ownerCheck = await sql`
      SELECT hc.created_by, cp.client_id
      FROM client_permissions cp
      INNER JOIN horoscope_clients hc ON hc.id = cp.client_id
      WHERE cp.id = ${permissionId}
      LIMIT 1
    `;

    if (ownerCheck.length === 0) {
      return {
        success: false,
        message: 'Permission not found.',
      };
    }

    const { created_by, client_id } = ownerCheck[0];

    if (created_by !== ownerId) {
      return {
        success: false,
        message: 'Unauthorized: Only the client owner can revoke access.',
      };
    }

    // Delete permission
    await sql`
      DELETE FROM client_permissions
      WHERE id = ${permissionId}
    `;

    revalidatePath(`/dashboard/clients/${client_id}`);
    revalidatePath('/dashboard/clients');

    return {
      success: true,
      message: 'Access revoked successfully.',
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      success: false,
      message: 'Failed to revoke access.',
    };
  }
}

/**
 * Toggle edit permission (quick action)
 */
export async function toggleEditPermission(
  permissionId: string,
  ownerId: string,
  currentValue: boolean
): Promise<{ success: boolean; message?: string }> {
  try {
    // Verify ownership
    const ownerCheck = await sql`
      SELECT hc.created_by, cp.client_id
      FROM client_permissions cp
      INNER JOIN horoscope_clients hc ON hc.id = cp.client_id
      WHERE cp.id = ${permissionId}
      LIMIT 1
    `;

    if (ownerCheck.length === 0) {
      return {
        success: false,
        message: 'Permission not found.',
      };
    }

    if (ownerCheck[0].created_by !== ownerId) {
      return {
        success: false,
        message: 'Unauthorized.',
      };
    }

    const newValue = !currentValue;

    await sql`
      UPDATE client_permissions
      SET can_edit = ${newValue}, updated_at = NOW()
      WHERE id = ${permissionId}
    `;

    revalidatePath(`/dashboard/clients/${ownerCheck[0].client_id}`);

    return {
      success: true,
      message: `Edit permission ${newValue ? 'granted' : 'revoked'}.`,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      success: false,
      message: 'Failed to update permission.',
    };
  }
}