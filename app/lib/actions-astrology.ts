'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { ProfileFormState, AstrologyType } from './definitions-crm';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ===================================
// Validation Schemas
// ===================================

const AstrologyProfileSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  astrology_type: z.enum(['thai', 'chinese', 'vedic', 'western']),
  chart_data: z.record(z.any()), // Flexible JSONB
  interpretation: z.string().optional(),
});

const CreateProfile = AstrologyProfileSchema.omit({ id: true });
const UpdateProfile = AstrologyProfileSchema;

// ===================================
// Server Actions - Astrology Profiles
// ===================================

/**
 * Create astrology profile for a client
 */
export async function createAstrologyProfile(
  astrologerId: string,
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    // Parse chart data from form (assuming it's sent as JSON string)
    const chartDataStr = formData.get('chart_data') as string;
    let chartData = {};

    try {
      chartData = chartDataStr ? JSON.parse(chartDataStr) : {};
    } catch (e) {
      return {
        errors: { chart_data: ['Invalid chart data format'] },
        message: 'Failed to parse chart data.',
        success: false,
      };
    }

    // Validate form data
    const validatedFields = CreateProfile.safeParse({
      client_id: formData.get('client_id'),
      astrology_type: formData.get('astrology_type'),
      chart_data: chartData,
      interpretation: formData.get('interpretation') || null,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing or invalid fields.',
        success: false,
      };
    }

    const data = validatedFields.data;

    // Check if profile of this type already exists
    const existingProfile = await sql`
      SELECT id FROM astrology_profiles
      WHERE client_id = ${data.client_id}
        AND astrology_type = ${data.astrology_type}
      LIMIT 1
    `;

    if (existingProfile.length > 0) {
      return {
        message: `A ${data.astrology_type} profile already exists for this client.`,
        success: false,
      };
    }

    // Insert profile
    await sql`
      INSERT INTO astrology_profiles (
        client_id,
        astrology_type,
        chart_data,
        interpretation,
        created_by
      ) VALUES (
        ${data.client_id},
        ${data.astrology_type},
        ${sql.json(data.chart_data)},
        ${data.interpretation},
        ${astrologerId}
      )
    `;

    revalidatePath(`/dashboard/clients/${data.client_id}`);

    return {
      message: `${data.astrology_type} profile created successfully.`,
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to create profile.',
      success: false,
    };
  }
}

/**
 * Update astrology profile
 */
export async function updateAstrologyProfile(
  profileId: string,
  astrologerId: string,
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    // Parse chart data
    const chartDataStr = formData.get('chart_data') as string;
    let chartData = {};

    try {
      chartData = chartDataStr ? JSON.parse(chartDataStr) : {};
    } catch (e) {
      return {
        errors: { chart_data: ['Invalid chart data format'] },
        message: 'Failed to parse chart data.',
        success: false,
      };
    }

    // Validate
    const validatedFields = UpdateProfile.safeParse({
      id: profileId,
      client_id: formData.get('client_id'),
      astrology_type: formData.get('astrology_type'),
      chart_data: chartData,
      interpretation: formData.get('interpretation') || null,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing or invalid fields.',
        success: false,
      };
    }

    const data = validatedFields.data;

    // Check permission (must be owner of client or have edit permission)
    const accessCheck = await sql`
      SELECT EXISTS(
        SELECT 1 FROM horoscope_clients hc
        WHERE hc.id = ${data.client_id} AND hc.created_by = ${astrologerId}
      ) as is_owner,
      EXISTS(
        SELECT 1 FROM client_permissions cp
        WHERE cp.client_id = ${data.client_id}
          AND cp.astrologer_id = ${astrologerId}
          AND cp.can_edit = true
      ) as has_permission
    `;

    const { is_owner, has_permission } = accessCheck[0];

    if (!is_owner && !has_permission) {
      return {
        message: 'Unauthorized: You cannot edit this profile.',
        success: false,
      };
    }

    // Update profile
    await sql`
      UPDATE astrology_profiles
      SET
        chart_data = ${sql.json(data.chart_data)},
        interpretation = ${data.interpretation},
        updated_at = NOW()
      WHERE id = ${profileId}
    `;

    revalidatePath(`/dashboard/clients/${data.client_id}`);

    return {
      message: 'Profile updated successfully.',
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update profile.',
      success: false,
    };
  }
}

/**
 * Delete astrology profile
 */
export async function deleteAstrologyProfile(
  profileId: string,
  clientId: string,
  astrologerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check permission
    const accessCheck = await sql`
      SELECT EXISTS(
        SELECT 1 FROM horoscope_clients
        WHERE id = ${clientId} AND created_by = ${astrologerId}
      ) as is_owner
    `;

    const { is_owner } = accessCheck[0];

    if (!is_owner) {
      return {
        success: false,
        message: 'Unauthorized: Only the client owner can delete profiles.',
      };
    }

    // Delete profile
    await sql`
      DELETE FROM astrology_profiles
      WHERE id = ${profileId}
    `;

    revalidatePath(`/dashboard/clients/${clientId}`);

    return {
      success: true,
      message: 'Profile deleted successfully.',
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      success: false,
      message: 'Failed to delete profile.',
    };
  }
}

/**
 * Quick update for chart interpretation only
 */
export async function updateProfileInterpretation(
  profileId: string,
  clientId: string,
  astrologerId: string,
  interpretation: string
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
        message: 'Unauthorized.',
      };
    }

    await sql`
      UPDATE astrology_profiles
      SET interpretation = ${interpretation}, updated_at = NOW()
      WHERE id = ${profileId}
    `;

    revalidatePath(`/dashboard/clients/${clientId}`);

    return {
      success: true,
      message: 'Interpretation updated.',
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      success: false,
      message: 'Failed to update interpretation.',
    };
  }
}