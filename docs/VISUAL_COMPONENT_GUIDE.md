# 🎨 Visual Component Guide

> คู่มือภาพสำหรับ UI Components - เห็นภาพชัดเจนขึ้น!

---

## 📐 Component Hierarchy (ลำดับชั้น)

### Level 1: ฐาน - ShadCN Components (ไม่ต้องสร้างเอง)

```
┌─────────────────────────────────────────────────┐
│  ShadCN UI Components (Built-in)               │
├─────────────────────────────────────────────────┤
│  Button   Input   Label   Textarea   Select    │
│  Checkbox   Card   Avatar   Badge   Dialog     │
└─────────────────────────────────────────────────┘
                      ↑
                      │ ใช้เป็นพื้นฐาน
```

### Level 2: Wrapper - Form Components (สร้างเอง)

```
┌─────────────────────────────────────────────────┐
│  Custom Form Components                         │
├─────────────────────────────────────────────────┤
│  FormField (Input + Label + Error)             │
│  FormTextarea (Textarea + Label + Error)       │
│  ClientAvatar (Avatar + Logic)                 │
└─────────────────────────────────────────────────┘
                      ↑
                      │ ประกอบกัน
```

### Level 3: Sections - Form Sections (ส่วนใหญ่)

```
┌─────────────────────────────────────────────────┐
│  Form Sections                                  │
├─────────────────────────────────────────────────┤
│  GeneralInfoSection                             │
│    ├── FormField (name)                         │
│    ├── FormField (nickname)                     │
│    ├── Select (gender)                          │
│    ├── FormField (birth_date)                   │
│    └── FormTextarea (notes)                     │
│                                                  │
│  ContactInfoSection                             │
│    ├── FormField (phone)                        │
│    ├── FormField (email)                        │
│    └── Checkbox (is_public)                     │
└─────────────────────────────────────────────────┘
                      ↑
                      │ รวมกัน
```

### Level 4: Page - Complete Form (ทั้งหน้า)

```
┌─────────────────────────────────────────────────┐
│  ClientFormTutorial (Page)                      │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐        │
│  │ Success/Error Message (conditional) │        │
│  └─────────────────────────────────────┘        │
│                                                  │
│  ┌─────────────────────────────────────┐        │
│  │ GeneralInfoSection                  │        │
│  └─────────────────────────────────────┘        │
│                                                  │
│  ┌─────────────────────────────────────┐        │
│  │ ContactInfoSection                  │        │
│  └─────────────────────────────────────┘        │
│                                                  │
│  [Cancel]  [บันทึกข้อมูล]                      │
└─────────────────────────────────────────────────┘
```

---

## 🖼️ Visual Layout Preview

### Desktop View (> 768px)

```
┌───────────────────────────────────────────────────────────┐
│  เพิ่มลูกค้าใหม่                                          │
│  กรอกข้อมูลลูกค้าเพื่อสร้างโปรไฟล์                        │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────── ข้อมูลทั่วไป ─────────────────┐        │
│  │                                                 │        │
│  │  ชื่อ-นามสกุล *                                │        │
│  │  [_____________________________________]        │        │
│  │                                                 │        │
│  │  ชื่อเล่น                เพศ                   │        │
│  │  [____________]          [▼ เลือกเพศ]          │        │
│  │                                                 │        │
│  │  วันเกิด *               เวลาเกิด             │        │
│  │  [____________]          [__:__ __]            │        │
│  │                                                 │        │
│  │  สถานที่เกิด                                   │        │
│  │  [_____________________________________]        │        │
│  │                                                 │        │
│  │  หมายเหตุ                                      │        │
│  │  [_____________________________________]        │        │
│  │  [_____________________________________]        │        │
│  │  [_____________________________________]        │        │
│  │                                                 │        │
│  └─────────────────────────────────────────────────┘        │
│                                                            │
│  ┌────────────── ข้อมูลติดต่อ (ไม่บังคับ) ───────┐        │
│  │                                                 │        │
│  │  เบอร์โทร                อีเมล                 │        │
│  │  [____________]          [____________]        │        │
│  │                                                 │        │
│  │  ☐ ทำให้ข้อมูลนี้เป็น สาธารณะ                 │        │
│  │                                                 │        │
│  └─────────────────────────────────────────────────┘        │
│                                                            │
│                               [ยกเลิก]  [บันทึกข้อมูล]   │
└───────────────────────────────────────────────────────────┘
```

### Mobile View (< 768px)

```
┌──────────────────────────┐
│ เพิ่มลูกค้าใหม่          │
│ กรอกข้อมูลลูกค้า...      │
├──────────────────────────┤
│                          │
│ ┌─ ข้อมูลทั่วไป ──────┐ │
│ │                       │ │
│ │ ชื่อ-นามสกุล *        │ │
│ │ [______________]      │ │
│ │                       │ │
│ │ ชื่อเล่น              │ │
│ │ [______________]      │ │
│ │                       │ │
│ │ เพศ                   │ │
│ │ [▼ เลือกเพศ]          │ │
│ │                       │ │
│ │ วันเกิด *             │ │
│ │ [______________]      │ │
│ │                       │ │
│ │ เวลาเกิด              │ │
│ │ [__:__ __]            │ │
│ │                       │ │
│ └───────────────────────┘ │
│                          │
│ ┌─ ข้อมูลติดต่อ ────── │ │
│ │                       │ │
│ │ เบอร์โทร              │ │
│ │ [______________]      │ │
│ │                       │ │
│ │ อีเมล                 │ │
│ │ [______________]      │ │
│ │                       │ │
│ └───────────────────────┘ │
│                          │
│ [ยกเลิก]  [บันทึก]      │
└──────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Form Submission Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User fills form and clicks "บันทึกข้อมูล"           │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│  2. Browser submits FormData to Server Action           │
│     formData.get('name')                                 │
│     formData.get('birth_date')                          │
│     formData.get('email')                               │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│  3. Server Action: createClient()                        │
│     (runs on server, not browser!)                      │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│  4. Zod Validation                                       │
│     ClientSchema.safeParse(data)                        │
└────────────┬────────────────────────────────────────────┘
             ↓
         ┌───┴────┐
         │ Valid? │
         └───┬────┘
             │
      ┌──────┴───────┐
      │              │
     NO             YES
      │              │
      ↓              ↓
┌──────────┐    ┌────────────────┐
│  Return  │    │  Insert to DB  │
│  Errors  │    │  (future step) │
└────┬─────┘    └────────┬───────┘
     │                   │
     │                   ↓
     │          ┌────────────────┐
     │          │ Return Success │
     │          └────────┬───────┘
     │                   │
     └─────────┬─────────┘
               ↓
┌─────────────────────────────────────────────────────────┐
│  5. Browser receives State                               │
│     { message: "...", errors: {...} }                   │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│  6. Component Re-renders                                 │
│     - Show success message (green)                      │
│     OR                                                   │
│     - Show error messages (red) under each field        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Interaction Map

### How Components Talk to Each Other

```
┌─────────────────────────────────────────────────────────┐
│  Page: /dashboard/clients/create                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ClientFormTutorial                                 │  │
│  │                                                     │  │
│  │  STATE: [state, formAction] = useActionState(...)  │  │
│  │         ↓                 ↓                         │  │
│  │      Holds Data      Handles Submit                │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ GeneralInfoSection                          │  │  │
│  │  │                                              │  │  │
│  │  │  RECEIVES: errors = state.errors             │  │  │
│  │  │  PASSES DOWN ↓                               │  │  │
│  │  │                                              │  │  │
│  │  │  ┌───────────────────┐                      │  │  │
│  │  │  │ FormField (name)  │ ← error={errors.name}│  │  │
│  │  │  └───────────────────┘                      │  │  │
│  │  │  ┌───────────────────┐                      │  │  │
│  │  │  │ FormField (email) │ ← error={errors.email}│  │  │
│  │  │  └───────────────────┘                      │  │  │
│  │  │                                              │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ ContactInfoSection                          │  │  │
│  │  │  (same pattern...)                          │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  [Button type="submit"] ──triggers──→ formAction   │  │
│  │                                           ↓         │  │
│  │                                    Server Action   │  │
│  │                                           ↓         │  │
│  │                                      Returns State │  │
│  │                                           ↓         │  │
│  │  STATE updates ──────────────────────→ Re-render   │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 File Import Chain

### What Imports What?

```
page.tsx
  │
  ├─→ import { ClientFormTutorial } from '@/app/ui/clients/client-form-tutorial'
  │
  └─→ ClientFormTutorial.tsx
        │
        ├─→ import { useActionState } from 'react'
        ├─→ import { createClient } from '@/app/lib/actions-clients-simple'
        ├─→ import { GeneralInfoSection } from './general-info-section'
        ├─→ import { ContactInfoSection } from './contact-info-section'
        ├─→ import { Button } from '@/components/ui/button'
        │
        ├─→ GeneralInfoSection.tsx
        │     │
        │     ├─→ import { FormField } from './form-field'
        │     ├─→ import { FormTextarea } from './form-textarea'
        │     ├─→ import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
        │     ├─→ import { Label } from '@/components/ui/label'
        │     ├─→ import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
        │     │
        │     ├─→ FormField.tsx
        │     │     │
        │     │     ├─→ import { Input } from '@/components/ui/input'
        │     │     └─→ import { Label } from '@/components/ui/label'
        │     │
        │     └─→ FormTextarea.tsx
        │           │
        │           ├─→ import { Textarea } from '@/components/ui/textarea'
        │           └─→ import { Label } from '@/components/ui/label'
        │
        └─→ ContactInfoSection.tsx
              │
              ├─→ import { FormField } from './form-field'
              ├─→ import { Card } from '@/components/ui/card'
              ├─→ import { Checkbox } from '@/components/ui/checkbox'
              └─→ import { Label } from '@/components/ui/label'
```

---

## 🎨 Color & Style Guide

### Color Palette Used

```
Success Messages:
┌────────────────────────────────┐
│ ✅ บันทึกข้อมูลสำเร็จ!          │  bg-green-50
│                                 │  text-green-700
└────────────────────────────────┘  border-green-200

Error Messages:
┌────────────────────────────────┐
│ ❌ กรอกข้อมูลไม่ครบ             │  bg-red-50
│ ⚠️ รูปแบบอีเมลไม่ถูกต้อง        │  text-red-700
└────────────────────────────────┘  border-red-200

Info/Warning:
┌────────────────────────────────┐
│ 💡 ข้อมูลติดต่อจะแสดงเฉพาะ...  │  bg-amber-50
└────────────────────────────────┘  text-amber-700

Card Sections:
┌─ ข้อมูลทั่วไป ────────────────┐
│                                 │  bg-white
│  Input fields here...           │  border-gray-200
│                                 │  rounded-lg
└─────────────────────────────────┘
```

### Typography Scale

```
Page Title:         text-3xl font-bold
Section Title:      text-xl (in CardTitle)
Field Label:        text-sm font-medium
Input Text:         text-base (default)
Description:        text-sm text-gray-500
Error Text:         text-sm text-red-500
```

---

## 🧪 State Lifecycle

### useActionState Flow

```
INITIAL STATE
┌─────────────────────┐
│ {                   │
│   message: '',      │
│   errors: {}        │
│ }                   │
└─────────┬───────────┘
          │
          │ User submits form
          ↓
PENDING STATE (automatic)
┌─────────────────────┐
│ Form is submitting  │
│ Button disabled     │
└─────────┬───────────┘
          │
          │ Server processes...
          ↓
     ┌────┴─────┐
     │ Success? │
     └────┬─────┘
          │
    ┌─────┴──────┐
    │            │
   NO           YES
    │            │
    ↓            ↓
ERROR STATE    SUCCESS STATE
┌─────────┐    ┌─────────┐
│ {       │    │ {       │
│  msg:   │    │  msg:   │
│  "❌",  │    │  "✅",  │
│  errors │    │  errors │
│  {...}  │    │  {}     │
│ }       │    │ }       │
└─────────┘    └─────────┘
    │            │
    └─────┬──────┘
          │
          ↓
    Re-render UI
    Show messages
```

---

## 📱 Responsive Breakpoints

```
Mobile First Approach:

BASE (< 768px):
├─ Stack fields vertically
├─ Full width inputs
└─ Buttons full width

┌──────────────┐
│ Field 1      │
│ [_________]  │
│              │
│ Field 2      │
│ [_________]  │
│              │
│ [Cancel]     │
│ [Submit]     │
└──────────────┘

TABLET+ (≥ 768px - md: breakpoint):
├─ 2 columns grid
├─ Side-by-side fields
└─ Buttons right-aligned

┌───────────────────────────┐
│ Field 1      Field 2      │
│ [_____]      [_____]      │
│                           │
│           [Cancel][Submit]│
└───────────────────────────┘

Code example:
grid grid-cols-1 md:grid-cols-2 gap-4
```

---

## 🔍 Debugging Checklist

### Visual Debugging

```
If Component doesn't show:
  ├─ Check import path ('@/...')
  ├─ Check export statement
  ├─ Check Browser Console for errors
  └─ Verify parent component renders

If Styling looks wrong:
  ├─ Check className syntax
  ├─ Verify Tailwind config
  ├─ Inspect element in DevTools
  └─ Check responsive classes (md:, lg:)

If Error messages don't appear:
  ├─ Check state.errors object
  ├─ Verify prop name matches
  ├─ console.log(state) in component
  └─ Check error array structure

If Form doesn't submit:
  ├─ Check 'use client' directive
  ├─ Verify formAction connection
  ├─ Check Network tab for requests
  └─ Look for Server Action errors
```

---

## 🎯 Quick Reference: Component Props

### FormField

```typescript
<FormField
  label="ชื่อ"           // Required: Label text
  name="name"           // Required: Form field name
  error={errors?.name}  // Optional: Error messages array
  description="..."     // Optional: Helper text
  required              // Optional: Show * mark
  type="text"           // Optional: Input type
  placeholder="..."     // Optional: Placeholder text
  className="..."       // Optional: Extra classes
/>
```

### GeneralInfoSection

```typescript
<GeneralInfoSection
  errors={state.errors}  // Optional: All errors object
/>
```

### ClientAvatar

```typescript
<ClientAvatar
  name="John Doe"        // Required: Client name
  imageUrl="https://..."  // Optional: Avatar image
  size="md"              // Optional: 'sm' | 'md' | 'lg'
/>
```

---

**สร้างโดย**: Tukta AI 🤖
**สำหรับ**: Q <siliconwarin@gmail.com>
**วันที่**: 2025-01-29

**Tip**: พิมพ์หน้านี้ออกมาแปะข้างจอ จะช่วยให้เห็นภาพรวมตลอดเวลา! 📌
