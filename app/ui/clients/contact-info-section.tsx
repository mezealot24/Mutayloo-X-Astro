'use client';

import { FormField } from './form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ContactInfoSectionProps {
  errors?: {
    phone?: string[];
    email?: string[];
  };
}

export function ContactInfoSection({ errors }: ContactInfoSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          ข้อมูลติดต่อ
          <span className="text-sm text-gray-500 font-normal">(ไม่บังคับ)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="เบอร์โทร"
            name="phone"
            type="tel"
            placeholder="08X-XXX-XXXX"
            error={errors?.phone}
          />

          <FormField
            label="อีเมล"
            name="email"
            type="email"
            placeholder="example@email.com"
            error={errors?.email}
          />
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
          <Checkbox id="is_public" name="is_public" />
          <Label
            htmlFor="is_public"
            className="text-sm cursor-pointer"
          >
            ทำให้ข้อมูลนี้เป็น <strong>สาธารณะ</strong> (โหราจารย์คนอื่นมองเห็นได้)
          </Label>
        </div>

        <p className="text-xs text-gray-500">
          💡 ข้อมูลติดต่อจะแสดงเฉพาะเจ้าของเท่านั้น ยกเว้นจะแชร์สิทธิ์
        </p>
      </CardContent>
    </Card>
  );
}
