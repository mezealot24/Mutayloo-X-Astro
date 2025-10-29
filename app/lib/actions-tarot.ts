'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { TarotFormState } from './definitions-crm';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ===================================
// Validation Schemas
// ===================================

const TarotSessionSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  session_date: z.string().optional(), // ISO date string
  spread_type: z.string().min(1, 'Spread type is required'),
  question: z.string().optional(),
  cards_drawn: z.array(z.any()).min(1, 'At least one card must be drawn'),
  interpretation: z.string().min(1, 'Interpretation is required'),
});

const CreateTarotSession = TarotSessionSchema.omit({ id: true });
const UpdateTarotSession = TarotSessionSchema;

// ===================================
// Server Actions - Tarot Sessions
// ===================================

/**
 * Create new tarot session
 */
export async function createTarotSession(
  readerId: string,
  prevState: TarotFormState,
  formData: FormData
): Promise<TarotFormState> {
  try {
    // Parse cards_drawn from JSON
    const cardsDrawnStr = formData.get('cards_drawn') as string;
    let cardsDrawn = [];

    try {
      cardsDrawn = cardsDrawnStr ? JSON.parse(cardsDrawnStr) : [];
    } catch (e) {
      return {
        errors: { cards_drawn: ['Invalid cards data format'] },
        message: 'Failed to parse cards data.',
        success: false,
      };
    }

    // Validate form data
    const validatedFields = CreateTarotSession.safeParse({
      client_id: formData.get('client_id'),
      session_date: formData.get('session_date') || new Date().toISOString(),
      spread_type: formData.get('spread_type'),
      question: formData.get('question') || null,
      cards_drawn: cardsDrawn,
      interpretation: formData.get('interpretation'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing or invalid fields.',
        success: false,
      };
    }

    const data = validatedFields.data;

    // Insert tarot session
    const result = await sql`
      INSERT INTO tarot_sessions (
        client_id,
        created_by,
        session_date,
        spread_type,
        question,
        cards_drawn,
        interpretation
      ) VALUES (
        ${data.client_id},
        ${readerId},
        ${data.session_date},
        ${data.spread_type},
        ${data.question},
        ${sql.json(data.cards_drawn)},
        ${data.interpretation}
      )
      RETURNING id
    `;

    const sessionId = result[0].id;

    revalidatePath(`/dashboard/clients/${data.client_id}`);
    revalidatePath('/dashboard/tarot');

    return {
      message: 'Tarot session created successfully.',
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to create tarot session.',
      success: false,
    };
  }
}

/**
 * Update tarot session
 */
export async function updateTarotSession(
  sessionId: string,
  readerId: string,
  prevState: TarotFormState,
  formData: FormData
): Promise<TarotFormState> {
  try {
    // Parse cards_drawn
    const cardsDrawnStr = formData.get('cards_drawn') as string;
    let cardsDrawn = [];

    try {
      cardsDrawn = cardsDrawnStr ? JSON.parse(cardsDrawnStr) : [];
    } catch (e) {
      return {
        errors: { cards_drawn: ['Invalid cards data format'] },
        message: 'Failed to parse cards data.',
        success: false,
      };
    }

    // Validate
    const validatedFields = UpdateTarotSession.safeParse({
      id: sessionId,
      client_id: formData.get('client_id'),
      session_date: formData.get('session_date'),
      spread_type: formData.get('spread_type'),
      question: formData.get('question') || null,
      cards_drawn: cardsDrawn,
      interpretation: formData.get('interpretation'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing or invalid fields.',
        success: false,
      };
    }

    const data = validatedFields.data;

    // Check permission (must be the creator or client owner)
    const accessCheck = await sql`
      SELECT
        ts.created_by as session_creator,
        hc.created_by as client_owner
      FROM tarot_sessions ts
      INNER JOIN horoscope_clients hc ON hc.id = ts.client_id
      WHERE ts.id = ${sessionId}
      LIMIT 1
    `;

    if (accessCheck.length === 0) {
      return {
        message: 'Session not found.',
        success: false,
      };
    }

    const { session_creator, client_owner } = accessCheck[0];

    if (session_creator !== readerId && client_owner !== readerId) {
      return {
        message: 'Unauthorized: You cannot edit this session.',
        success: false,
      };
    }

    // Update session
    await sql`
      UPDATE tarot_sessions
      SET
        session_date = ${data.session_date},
        spread_type = ${data.spread_type},
        question = ${data.question},
        cards_drawn = ${sql.json(data.cards_drawn)},
        interpretation = ${data.interpretation},
        updated_at = NOW()
      WHERE id = ${sessionId}
    `;

    revalidatePath(`/dashboard/clients/${data.client_id}`);
    revalidatePath('/dashboard/tarot');

    return {
      message: 'Tarot session updated successfully.',
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update session.',
      success: false,
    };
  }
}

/**
 * Delete tarot session
 */
export async function deleteTarotSession(
  sessionId: string,
  astrologerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check permission
    const accessCheck = await sql`
      SELECT
        ts.created_by as session_creator,
        ts.client_id,
        hc.created_by as client_owner
      FROM tarot_sessions ts
      INNER JOIN horoscope_clients hc ON hc.id = ts.client_id
      WHERE ts.id = ${sessionId}
      LIMIT 1
    `;

    if (accessCheck.length === 0) {
      return {
        success: false,
        message: 'Session not found.',
      };
    }

    const { session_creator, client_id, client_owner } = accessCheck[0];

    if (session_creator !== astrologerId && client_owner !== astrologerId) {
      return {
        success: false,
        message: 'Unauthorized: You cannot delete this session.',
      };
    }

    // Delete session
    await sql`
      DELETE FROM tarot_sessions
      WHERE id = ${sessionId}
    `;

    revalidatePath(`/dashboard/clients/${client_id}`);
    revalidatePath('/dashboard/tarot');

    return {
      success: true,
      message: 'Tarot session deleted successfully.',
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      success: false,
      message: 'Failed to delete session.',
    };
  }
}

/**
 * Quick update interpretation only
 */
export async function updateSessionInterpretation(
  sessionId: string,
  astrologerId: string,
  interpretation: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Check permission
    const accessCheck = await sql`
      SELECT
        ts.created_by as session_creator,
        ts.client_id,
        hc.created_by as client_owner
      FROM tarot_sessions ts
      INNER JOIN horoscope_clients hc ON hc.id = ts.client_id
      WHERE ts.id = ${sessionId}
      LIMIT 1
    `;

    if (accessCheck.length === 0) {
      return {
        success: false,
        message: 'Session not found.',
      };
    }

    const { session_creator, client_id, client_owner } = accessCheck[0];

    if (session_creator !== astrologerId && client_owner !== astrologerId) {
      return {
        success: false,
        message: 'Unauthorized.',
      };
    }

    await sql`
      UPDATE tarot_sessions
      SET interpretation = ${interpretation}, updated_at = NOW()
      WHERE id = ${sessionId}
    `;

    revalidatePath(`/dashboard/clients/${client_id}`);

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