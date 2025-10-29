'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ClientFormState } from './definitions-crm';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ===================================
// Validation Schemas
// ===================================

const ClientSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  nickname: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  birth_date: z.string().min(1, 'Birth date is required'),
  birth_time: z.string().min(1, 'Birth time is required'),
  birth_place: z.string().min(1, 'Birth place is required'),
  birth_latitude: z.coerce.number().optional(),
  birth_longitude: z.coerce.number().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
});

const CreateClient = ClientSchema.omit({ id: true });
const UpdateClient = ClientSchema;

// ===================================
// Server Actions - Client CRUD
// ===================================

/**
 * Create new horoscope client
 */
export async function createClient(
  astrologerId: string,
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  // Validate form data
  const validatedFields = CreateClient.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    nickname: formData.get('nickname') || null,
    gender: formData.get('gender') || null,
    birth_date: formData.get('birth_date'),
    birth_time: formData.get('birth_time'),
    birth_place: formData.get('birth_place'),
    birth_latitude: formData.get('birth_latitude') || null,
    birth_longitude: formData.get('birth_longitude') || null,
    contact_phone: formData.get('contact_phone') || null,
    contact_email: formData.get('contact_email') || null,
    notes: formData.get('notes') || null,
  });

  // Return errors if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to create client.',
      success: false,
    };
  }

  const data = validatedFields.data;

  // Insert into database
  try {
    const result = await sql`
      INSERT INTO horoscope_clients (
        created_by,
        first_name,
        last_name,
        nickname,
        gender,
        birth_date,
        birth_time,
        birth_place,
        birth_latitude,
        birth_longitude,
        contact_phone,
        contact_email,
        notes
      ) VALUES (
        ${astrologerId},
        ${data.first_name},
        ${data.last_name},
        ${data.nickname},
        ${data.gender},
        ${data.birth_date},
        ${data.birth_time},
        ${data.birth_place},
        ${data.birth_latitude},
        ${data.birth_longitude},
        ${data.contact_phone},
        ${data.contact_email},
        ${data.notes}
      )
      RETURNING id
    `;

    const clientId = result[0].id;

    // Revalidate and redirect
    revalidatePath('/dashboard/clients');
    redirect(`/dashboard/clients/${clientId}`);
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to create client.',
      success: false,
    };
  }
}

/**
 * Update existing client
 */
export async function updateClient(
  clientId: string,
  astrologerId: string,
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  // Validate form data
  const validatedFields = UpdateClient.safeParse({
    id: clientId,
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    nickname: formData.get('nickname') || null,
    gender: formData.get('gender') || null,
    birth_date: formData.get('birth_date'),
    birth_time: formData.get('birth_time'),
    birth_place: formData.get('birth_place'),
    birth_latitude: formData.get('birth_latitude') || null,
    birth_longitude: formData.get('birth_longitude') || null,
    contact_phone: formData.get('contact_phone') || null,
    contact_email: formData.get('contact_email') || null,
    notes: formData.get('notes') || null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to update client.',
      success: false,
    };
  }

  const data = validatedFields.data;

  // Check permission before update
  try {
    // Verify ownership or edit permission
    const accessCheck = await sql`
      SELECT EXISTS(
        SELECT 1 FROM horoscope_clients
        WHERE id = ${clientId} AND created_by = ${astrologerId}
      ) as is_owner,
      EXISTS(
        SELECT 1 FROM client_permissions
        WHERE client_id = ${clientId}
          AND astrologer_id = ${astrologerId}
          AND can_edit = true
      ) as has_permission
    `;

    const { is_owner, has_permission } = accessCheck[0];

    if (!is_owner && !has_permission) {
      return {
        message: 'Unauthorized: You do not have permission to edit this client.',
        success: false,
      };
    }

    // Update client
    await sql`
      UPDATE horoscope_clients
      SET
        first_name = ${data.first_name},
        last_name = ${data.last_name},
        nickname = ${data.nickname},
        gender = ${data.gender},
        birth_date = ${data.birth_date},
        birth_time = ${data.birth_time},
        birth_place = ${data.birth_place},
        birth_latitude = ${data.birth_latitude},
        birth_longitude = ${data.birth_longitude},
        contact_phone = ${data.contact_phone},
        contact_email = ${data.contact_email},
        notes = ${data.notes},
        updated_at = NOW()
      WHERE id = ${clientId}
    `;

    // Revalidate and redirect
    revalidatePath('/dashboard/clients');
    revalidatePath(`/dashboard/clients/${clientId}`);
    redirect(`/dashboard/clients/${clientId}`);
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update client.',
      success: false,
    };
  }
}

/**
 * Delete client (only owner can delete)
 */
export async function deleteClient(
  clientId: string,
  astrologerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Verify ownership
    const ownerCheck = await sql`
      SELECT created_by FROM horoscope_clients
      WHERE id = ${clientId}
      LIMIT 1
    `;

    if (ownerCheck.length === 0) {
      return {
        success: false,
        message: 'Client not found.',
      };
    }

    if (ownerCheck[0].created_by !== astrologerId) {
      return {
        success: false,
        message: 'Unauthorized: Only the owner can delete this client.',
      };
    }

    // Delete client (cascade will delete profiles, sessions, permissions)
    await sql`
      DELETE FROM horoscope_clients
      WHERE id = ${clientId}
    `;

    revalidatePath('/dashboard/clients');

    return {
      success: true,
      message: 'Client deleted successfully.',
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      success: false,
      message: 'Database Error: Failed to delete client.',
    };
  }
}

/**
 * Update client notes only (quick action)
 */
export async function updateClientNotes(
  clientId: string,
  astrologerId: string,
  notes: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check permission
    const accessCheck = await sql`
      SELECT EXISTS(
        SELECT 1 FROM horoscope_clients
        WHERE id = ${clientId} AND created_by = ${astrologerId}
      ) as is_owner,
      EXISTS(
        SELECT 1 FROM client_permissions
        WHERE client_id = ${clientId}
          AND astrologer_id = ${astrologerId}
          AND can_edit = true
      ) as has_permission
    `;

    const { is_owner, has_permission } = accessCheck[0];

    if (!is_owner && !has_permission) {
      return {
        success: false,
        message: 'Unauthorized: You cannot edit this client.',
      };
    }

    await sql`
      UPDATE horoscope_clients
      SET notes = ${notes}, updated_at = NOW()
      WHERE id = ${clientId}
    `;

    revalidatePath(`/dashboard/clients/${clientId}`);

    return {
      success: true,
      message: 'Notes updated successfully.',
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      success: false,
      message: 'Failed to update notes.',
    };
  }
}