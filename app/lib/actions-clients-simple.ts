'use server';

import { z } from 'zod';

// Schema สำหรับ validate
const ClientSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  nickname: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  birth_date: z.string().min(1, 'กรุณาเลือกวันเกิด'),
  birth_time: z.string().optional(),
  birth_place: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
});

export type State = {
  errors?: {
    name?: string[];
    birth_date?: string[];
    email?: string[];
    [key: string]: string[] | undefined;
  };
  message?: string;
};

/**
 * สร้างลูกค้าใหม่ (เวอร์ชันง่ายสำหรับ Tutorial)
 *
 * TODO: แก้ไขให้บันทึกลง Database จริง
 */
export async function createClient(prevState: State, formData: FormData): Promise<State> {
  // 1. Validate
  const validatedFields = ClientSchema.safeParse({
    name: formData.get('name'),
    nickname: formData.get('nickname'),
    gender: formData.get('gender'),
    birth_date: formData.get('birth_date'),
    birth_time: formData.get('birth_time'),
    birth_place: formData.get('birth_place'),
    phone: formData.get('phone'),
    email: formData.get('email'),
  });

  // 2. Return errors ถ้า validate ไม่ผ่าน
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'กรอกข้อมูลไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง',
    };
  }

  // 3. TODO: Insert to database (ทำในขั้นต่อไป)
  // const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  // await sql`INSERT INTO horoscope_clients (...) VALUES (...)`;

  console.log('✅ Validated data:', validatedFields.data);

  // 4. Return success (ชั่วคราว)
  await new Promise(resolve => setTimeout(resolve, 1000)); // จำลอง delay

  return {
    message: '✅ บันทึกข้อมูลสำเร็จ! (ชั่วคราว - ยังไม่ได้บันทึกจริง)',
    errors: {},
  };
}
