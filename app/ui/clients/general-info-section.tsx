'use client'; // ต้องใส่เพราะจะใช้ state ใน parent form

import { FormField } from './form-field';
import { FormTextarea } from './form-textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 1. Props Interface
interface GeneralInfoSectionProps {
  errors?: {
    name?: string[];
    nickname?: string[];
    gender?: string[];
    birth_date?: string[];
    birth_time?: string[];
    birth_place?: string[];
    phone?: string[];
    email?: string[];
  };
}

// 2. Component
export function GeneralInfoSection({ errors }: GeneralInfoSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">ข้อมูลทั่วไป</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ชื่อ-นามสกุล */}
        <FormField
          label="ชื่อ-นามสกุล"
          name="name"
          placeholder="เช่น: นาย สมชาย ใจดี"
          required
          error={errors?.name}
        />

        {/* แถว 1: ชื่อเล่น + เพศ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="ชื่อเล่น"
            name="nickname"
            placeholder="เช่น: บอย"
            error={errors?.nickname}
          />

          {/* เพศ (Select) */}
          <div className="mb-4">
            <Label htmlFor="gender" className="text-sm font-medium">
              เพศ
            </Label>
            <Select name="gender">
              <SelectTrigger id="gender">
                <SelectValue placeholder="เลือกเพศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ชาย</SelectItem>
                <SelectItem value="female">หญิง</SelectItem>
                <SelectItem value="other">อื่นๆ</SelectItem>
                <SelectItem value="prefer_not_to_say">ไม่ระบุ</SelectItem>
              </SelectContent>
            </Select>
            {errors?.gender && (
              <p className="text-red-500 text-sm mt-1">⚠️ {errors.gender[0]}</p>
            )}
          </div>
        </div>

        {/* แถว 2: วันเกิด + เวลาเกิด */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="วันเกิด"
            name="birth_date"
            type="date"
            required
            description="ใช้สำหรับคำนวณดวงชะตา"
            error={errors?.birth_date}
          />

          <FormField
            label="เวลาเกิด"
            name="birth_time"
            type="time"
            description="ถ้าไม่ทราบ สามารถเว้นว่างได้"
            error={errors?.birth_time}
          />
        </div>

        {/* สถานที่เกิด */}
        <FormField
          label="สถานที่เกิด"
          name="birth_place"
          placeholder="เช่น: โรงพยาบาลรามาธิบดี กรุงเทพฯ"
          error={errors?.birth_place}
        />

        {/* หมายเหตุ */}
        <FormTextarea
          label="หมายเหตุ"
          name="notes"
          rows={3}
          placeholder="บันทึกข้อมูลเพิ่มเติม เช่น ข้อมูลพิเศษ, ประวัติที่สำคัญ"
        />
      </CardContent>
    </Card>
  );
}
