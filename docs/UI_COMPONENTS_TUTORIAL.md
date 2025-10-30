# 🎨 UI Components Tutorial สำหรับ Fortune Teller CRM

> **เป้าหมาย**: สอนการสร้าง UI Components แบบ step-by-step สำหรับระบบ CRM ดูดวง
> **สำหรับ**: Q (Junior Developer)
> **Tech Stack**: Next.js 16 + TypeScript + ShadCN UI + Tailwind CSS
> **ระยะเวลา**: 2-3 ชั่วโมง (ทำทีละ Exercise)

---

## 📚 สารบัญ

1. [เข้าใจโครงสร้างโฟลเดอร์](#1-เข้าใจโครงสร้างโฟลเดอร์)
2. [Component Architecture Patterns](#2-component-architecture-patterns)
3. [Code Patterns & Best Practices](#3-code-patterns--best-practices)
4. [Exercise 1: สร้าง Component ง่ายๆ](#4-exercise-1-สร้าง-component-ง่ายๆ)
5. [Exercise 2: สร้าง Form Input Component](#5-exercise-2-สร้าง-form-input-component)
6. [Exercise 3: สร้าง General Info Section](#6-exercise-3-สร้าง-general-info-section)
7. [File Organization Checklist](#7-file-organization-checklist)
8. [Next Steps](#8-next-steps)

---

## 1. เข้าใจโครงสร้างโฟลเดอร์

### 🤔 ทำไมต้องจัดโฟลเดอร์แบบนี้?

เราจัด UI components ตาม **feature** (คุณสมบัติ) เพราะว่า:
- ✅ หาไฟล์เจอง่าย (ทุกอย่างที่เกี่ยวกับ clients อยู่ที่เดียวกัน)
- ✅ แก้ไขง่าย (ไม่ต้องกระโดดไฟล์ไกลๆ)
- ✅ Re-use ได้ง่าย (แยกส่วนที่ใช้ร่วมกันออกมา)
- ✅ Scale ได้ (โปรเจกต์โตก็ไม่งง)

### 📁 โครงสร้างโฟลเดอร์สำหรับ CRM

```
c:\Projects\nextjs-dashboard\
├── app/
│   ├── dashboard/
│   │   └── clients/              # 📍 Route สำหรับหน้า CRM
│   │       ├── page.tsx          # หน้าแสดงรายการลูกค้า (List)
│   │       ├── create/
│   │       │   └── page.tsx      # หน้าสร้างลูกค้าใหม่ (Create Form)
│   │       └── [id]/
│   │           ├── page.tsx      # หน้ารายละเอียดลูกค้า (Detail)
│   │           └── edit/
│   │               └── page.tsx  # หน้าแก้ไขข้อมูล (Edit Form)
│   │
│   ├── lib/
│   │   ├── definitions.ts        # Types สำหรับทั้งโปรเจกต์
│   │   ├── definitions-crm.ts    # Types สำหรับ CRM
│   │   ├── actions-clients.ts    # Server Actions สำหรับ clients
│   │   ├── data-clients.ts       # Data fetching functions
│   │   └── utils.ts              # Helper functions
│   │
│   └── ui/
│       ├── clients/              # 📍 UI Components สำหรับ clients
│       │   ├── client-form.tsx          # Form หลักสำหรับสร้าง/แก้ไข
│       │   ├── general-info-section.tsx # ส่วนข้อมูลทั่วไป
│       │   ├── client-avatar.tsx        # แสดงรูปลูกค้า
│       │   ├── form-field.tsx           # Input field พร้อม error
│       │   ├── astrology-type-selector.tsx
│       │   ├── clients-table.tsx        # ตารางแสดงรายการ
│       │   ├── client-search.tsx        # ช่องค้นหา
│       │   └── panels/                  # Panels สำหรับแต่ละโหราศาสตร์
│       │       ├── thai-astrology-panel.tsx
│       │       ├── chinese-astrology-panel.tsx
│       │       ├── vedic-western-panel.tsx
│       │       └── tarot-session-panel.tsx
│       │
│       └── shared/               # 📍 Components ที่ใช้ร่วมกันทั้งโปรเจกต์
│           ├── loading-spinner.tsx
│           ├── error-message.tsx
│           └── permission-badge.tsx
│
└── components/                   # 📍 ShadCN UI Components
    └── ui/                       # (Auto-generated จาก ShadCN)
        ├── button.tsx
        ├── input.tsx
        ├── card.tsx
        └── ...
```

### 📝 Naming Convention

| สิ่งที่ตั้งชื่อ | รูปแบบ | ตัวอย่าง |
|----------------|--------|----------|
| **ชื่อไฟล์** | `kebab-case.tsx` | `client-form.tsx`, `general-info-section.tsx` |
| **Component Name** | `PascalCase` | `ClientForm`, `GeneralInfoSection` |
| **Function/Variable** | `camelCase` | `createClient`, `clientData` |
| **Type/Interface** | `PascalCase` | `HoroscopeClient`, `ClientFormState` |

💡 **Tip**: ชื่อไฟล์ต้องตรงกับชื่อ Component หลักในไฟล์นั้นๆ เช่น `client-form.tsx` ข้างในต้องมี `export default function ClientForm()`

---

## 2. Component Architecture Patterns

### 🧩 Server Components vs Client Components

Next.js 16 ใช้ **Server Components** เป็นค่าเริ่มต้น (ทำงานที่เซิร์ฟเวอร์)

#### เมื่อไหร่ใช้ Server Components (ค่าเริ่มต้น)
- ✅ แค่แสดงผลข้อมูล (ไม่ต้องมี interaction)
- ✅ Fetch ข้อมูลจาก Database
- ✅ Layout, Static content

```tsx
// ไม่ต้องใส่ "use client" = Server Component
export default function ClientDetailHeader({ client }: { client: HoroscopeClient }) {
  return (
    <div>
      <h1>{client.name}</h1>
      <p>เกิดวันที่: {client.birth_date}</p>
    </div>
  );
}
```

#### เมื่อไหร่ใช้ Client Components (ต้องใส่ "use client")
- ✅ มี State (useState, useReducer)
- ✅ มี Event Handlers (onClick, onChange)
- ✅ มี Hooks (useEffect, useActionState)
- ✅ มี Browser APIs (localStorage, window)

```tsx
'use client'; // 👈 ต้องใส่บรรทัดแรกสุด!

import { useState } from 'react';

export default function AstrologyTypeSelector() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  return (
    <div>
      {/* Interactive checkbox */}
    </div>
  );
}
```

⚠️ **Common Mistake**: ลืมใส่ `'use client'` แล้วโค้ดเออเรอร์ `useState is not defined`

---

### 🏗️ Composition Pattern (ประกอบส่วนเล็กเป็นใหญ่)

แนวคิด: **สร้าง Component เล็กๆ หลายตัว แล้วนำมาประกอบกันเป็น Component ใหญ่**

#### ❌ ไม่ดี: Component ใหญ่ก้อนเดียว (Hard to maintain)
```tsx
export default function ClientForm() {
  return (
    <form>
      {/* 500 บรรทัด โค้ดยาวมากกกก */}
      <input name="name" />
      <input name="nickname" />
      <input name="birth_date" />
      {/* ... อีก 400 บรรทัด */}
    </form>
  );
}
```

#### ✅ ดี: แยกเป็นส่วนเล็กๆ (Easy to maintain)
```tsx
export default function ClientForm() {
  return (
    <form>
      <GeneralInfoSection />        {/* 50 บรรทัด */}
      <AstrologyTypeSelector />     {/* 30 บรรทัด */}
      <ThaiAstrologyPanel />        {/* 60 บรรทัด */}
      <ChineseAstrologyPanel />     {/* 60 บรรทัด */}
      <FormButtons />               {/* 20 บรรทัด */}
    </form>
  );
}
```

💡 **Tip**: ถ้า Component ยาวเกิน 100 บรรทัด ลองคิดว่าแยกออกมาได้ไหม

---

### 📝 Form Components with Server Actions

Pattern สำหรับ Form ใน Next.js 16:

```tsx
'use client';

import { useActionState } from 'react';
import { createClient } from '@/app/lib/actions-clients'; // Server Action

export default function ClientForm() {
  // 1. Define initial state
  const initialState = { message: '', errors: {} };

  // 2. Connect to Server Action
  const [state, formAction] = useActionState(createClient, initialState);

  return (
    <form action={formAction}>
      {/* 3. Input fields */}
      <input name="name" />

      {/* 4. Show errors */}
      {state.errors?.name && (
        <p className="text-red-500">{state.errors.name[0]}</p>
      )}

      {/* 5. Submit button */}
      <button type="submit">Create</button>
    </form>
  );
}
```

**Server Action** (ทำงานที่เซิร์ฟเวอร์):
```tsx
'use server'; // 👈 บอกว่าเป็น Server-side code

import { z } from 'zod';
import { sql } from '@/app/lib/db';

export async function createClient(prevState: any, formData: FormData) {
  // 1. Validate ด้วย Zod
  const schema = z.object({
    name: z.string().min(1, 'ต้องใส่ชื่อ'),
  });

  const validated = schema.safeParse({
    name: formData.get('name'),
  });

  // 2. Return errors ถ้า validate ไม่ผ่าน
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'กรอกข้อมูลไม่ครบ'
    };
  }

  // 3. Insert to database
  await sql`INSERT INTO clients (name) VALUES (${validated.data.name})`;

  // 4. Redirect หรือ return success
  return { message: 'สร้างลูกค้าสำเร็จ!', errors: {} };
}
```

---

## 3. Code Patterns & Best Practices

### 🎯 การใช้ ShadCN Components อย่างถูกต้อง

#### ✅ Pattern 1: Import แบบนี้
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

#### ✅ Pattern 2: ใช้พร้อม Tailwind classes
```tsx
<Button variant="default" size="lg" className="w-full">
  บันทึก
</Button>

<Input
  placeholder="กรอกชื่อ"
  className="max-w-md"
/>
```

#### ✅ Pattern 3: Wrap ใน Component ของเรา (Recommended!)
```tsx
// ✨ สร้าง wrapper ของเราเอง = ใช้ซ้ำได้ + customize ง่าย
export function FormInput({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <Input {...props} />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// ใช้งาน:
<FormInput
  label="ชื่อ"
  name="name"
  error={state.errors?.name?.[0]}
/>
```

---

### 📦 TypeScript Props Pattern

#### Pattern 1: Props แบบ Object
```tsx
interface ClientAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ClientAvatar({ name, imageUrl, size = 'md' }: ClientAvatarProps) {
  // ...
}
```

#### Pattern 2: Extend HTML Props (สำหรับ wrapper components)
```tsx
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, ...props }: FormInputProps) {
  return (
    <div>
      <label>{label}</label>
      <input {...props} /> {/* รับ props ทั้งหมดของ input element */}
    </div>
  );
}
```

#### Pattern 3: Children Props
```tsx
interface CardSectionProps {
  title: string;
  children: React.ReactNode;
}

export function CardSection({ title, children }: CardSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

---

### 🔄 Form State Management Pattern

```tsx
'use client';

import { useActionState } from 'react';

export default function MyForm() {
  // State จะ update ทุกครั้งที่ Server Action return
  const [state, formAction] = useActionState(myServerAction, {
    message: '',
    errors: {}
  });

  return (
    <form action={formAction}>
      {/* แสดง message ถ้ามี */}
      {state.message && (
        <div className="bg-green-100 p-3 rounded">
          {state.message}
        </div>
      )}

      {/* Input with error */}
      <input name="email" />
      {state.errors?.email && (
        <p className="text-red-500">{state.errors.email[0]}</p>
      )}

      <button type="submit">ส่ง</button>
    </form>
  );
}
```

---

### 🚨 Error Handling Pattern

```tsx
export function FormField({
  label,
  name,
  error
}: {
  label: string;
  name: string;
  error?: string[];
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium mb-2">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        aria-describedby={`${name}-error`}
        className={error ? 'border-red-500' : ''}
      />
      <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
        {error && error.map((err) => (
          <p key={err} className="text-red-500 text-sm mt-1">
            {err}
          </p>
        ))}
      </div>
    </div>
  );
}
```

---

### ⏳ Loading States Pattern

```tsx
'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus(); // Hook พิเศษของ Next.js

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'กำลังบันทึก...' : children}
    </Button>
  );
}

// ใช้ใน Form:
<form action={formAction}>
  <input name="name" />
  <SubmitButton>บันทึก</SubmitButton>
</form>
```

---

## 4. Exercise 1: สร้าง Component ง่ายๆ

### 🎯 เป้าหมาย
สร้าง `ClientAvatar` component สำหรับแสดงรูปหรือชื่อย่อของลูกค้า

### 📋 ขั้นตอน

#### Step 1: สร้างไฟล์
```bash
# สร้างไฟล์ที่ตำแหน่งนี้:
c:\Projects\nextjs-dashboard\app\ui\clients\client-avatar.tsx
```

#### Step 2: เขียนโค้ด

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// 1. กำหนด Props ที่ Component นี้จะรับ
interface ClientAvatarProps {
  name: string;           // ชื่อลูกค้า (required)
  imageUrl?: string;      // URL รูป (optional)
  size?: 'sm' | 'md' | 'lg'; // ขนาด (optional, default = 'md')
}

// 2. สร้าง Component
export function ClientAvatar({ name, imageUrl, size = 'md' }: ClientAvatarProps) {

  // 3. คำนวณขนาดตาม size prop
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  // 4. สร้างชื่อย่อ (Initial) จาก 2 ตัวอักษรแรก
  const initials = name
    .split(' ')                    // แยกคำด้วย space
    .map(word => word[0])          // เอาตัวแรกของแต่ละคำ
    .join('')                      // รวมกัน
    .toUpperCase()                 // ทำเป็นตัวพิมพ์ใหญ่
    .slice(0, 2);                  // เอาแค่ 2 ตัว

  // 5. Render UI
  return (
    <Avatar className={sizeClasses[size]}>
      {/* แสดงรูป ถ้ามี imageUrl */}
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}

      {/* แสดงชื่อย่อ ถ้าไม่มีรูป */}
      <AvatarFallback className="bg-indigo-100 text-indigo-700">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
```

#### Step 3: ทดสอบใช้งาน

สร้างไฟล์ทดสอบชั่วคราว: `app/dashboard/clients/test-avatar.tsx`

```tsx
import { ClientAvatar } from '@/app/ui/clients/client-avatar';

export default function TestAvatarPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">ทดสอบ ClientAvatar</h1>

      {/* ทดสอบขนาดต่างๆ */}
      <div className="flex items-center gap-4">
        <ClientAvatar name="นาย ทดสอบ" size="sm" />
        <ClientAvatar name="นาย ทดสอบ" size="md" />
        <ClientAvatar name="นาย ทดสอบ" size="lg" />
      </div>

      {/* ทดสอบกับรูปภาพ */}
      <ClientAvatar
        name="จอห์น โด"
        imageUrl="https://i.pravatar.cc/150?img=1"
        size="lg"
      />
    </div>
  );
}
```

#### Step 4: ดูผลลัพธ์
1. รัน dev server: `npm run dev` (ถ้ายังไม่รัน)
2. เปิดเบราว์เซอร์: `http://localhost:3000/dashboard/clients/test-avatar`
3. ควรเห็น Avatar 3 ขนาดและ Avatar ที่มีรูป

---

### ✅ เช็คลิสต์ความสำเร็จ
- [ ] ไฟล์อยู่ที่ `app/ui/clients/client-avatar.tsx`
- [ ] Component แสดงชื่อย่อได้ถูกต้อง
- [ ] แสดงรูปได้ ถ้ามี imageUrl
- [ ] มีขนาด 3 แบบ (sm, md, lg)
- [ ] TypeScript ไม่มี error

💡 **เข้าใจยัง?**: Component นี้เป็น **Server Component** เพราะไม่มี state หรือ event handler (ไม่ต้องใส่ `'use client'`)

---

## 5. Exercise 2: สร้าง Form Input Component

### 🎯 เป้าหมาย
สร้าง `FormField` component ที่ wrap ShadCN Input พร้อม label และแสดง error

### 📋 ขั้นตอน

#### Step 1: สร้างไฟล์
```bash
c:\Projects\nextjs-dashboard\app\ui\clients\form-field.tsx
```

#### Step 2: เขียนโค้ด

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 1. Props Interface
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;              // ข้อความ Label
  name: string;               // ชื่อ field (จะใช้ใน FormData)
  error?: string[];           // Array ของ error messages
  description?: string;       // คำอธิบายเพิ่มเติม (optional)
}

// 2. Component
export function FormField({
  label,
  name,
  error,
  description,
  className,
  ...props // รับ props ที่เหลือทั้งหมด (type, placeholder, etc.)
}: FormFieldProps) {
  return (
    <div className="mb-4">
      {/* 3. Label */}
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* 4. Description (ถ้ามี) */}
      {description && (
        <p className="text-sm text-gray-500 mt-1 mb-2">{description}</p>
      )}

      {/* 5. Input Field */}
      <Input
        id={name}
        name={name}
        aria-describedby={`${name}-error`}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      />

      {/* 6. Error Messages */}
      <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
        {error && error.map((err, index) => (
          <p key={index} className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <span>⚠️</span>
            <span>{err}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
```

#### Step 3: สร้าง Textarea version (เพิ่มเติม)

สร้างไฟล์: `app/ui/clients/form-textarea.tsx`

```tsx
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string[];
  description?: string;
}

export function FormTextarea({
  label,
  name,
  error,
  description,
  className,
  ...props
}: FormTextareaProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {description && (
        <p className="text-sm text-gray-500 mt-1 mb-2">{description}</p>
      )}

      <Textarea
        id={name}
        name={name}
        aria-describedby={`${name}-error`}
        className={`${error ? 'border-red-500' : ''} ${className || ''}`}
        {...props}
      />

      <div id={`${name}-error`} aria-live="polite">
        {error?.map((err, i) => (
          <p key={i} className="text-red-500 text-sm mt-1">⚠️ {err}</p>
        ))}
      </div>
    </div>
  );
}
```

#### Step 4: ทดสอบใช้งาน

สร้างไฟล์: `app/dashboard/clients/test-form-fields.tsx`

```tsx
'use client';

import { FormField } from '@/app/ui/clients/form-field';
import { FormTextarea } from '@/app/ui/clients/form-textarea';
import { Button } from '@/components/ui/button';

export default function TestFormFieldsPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">ทดสอบ Form Fields</h1>

      <form className="space-y-4">
        {/* Input ปกติ */}
        <FormField
          label="ชื่อ-นามสกุล"
          name="name"
          placeholder="กรอกชื่อ-นามสกุล"
          required
        />

        {/* Input พร้อม Description */}
        <FormField
          label="ชื่อเล่น"
          name="nickname"
          description="ชื่อที่เรียกกันเป็นกันเอง"
          placeholder="เช่น: บอย, ปุ๊ก, แป้ง"
        />

        {/* Input พร้อม Error */}
        <FormField
          label="อีเมล"
          name="email"
          type="email"
          error={['รูปแบบอีเมลไม่ถูกต้อง']}
        />

        {/* Input พร้อม Description และ Error */}
        <FormField
          label="วันเกิด"
          name="birth_date"
          type="date"
          description="ใช้สำหรับคำนวณดวงชะตา"
          error={['กรุณาเลือกวันเกิด', 'วันเกิดต้องอยู่ในอดีต']}
          required
        />

        {/* Textarea */}
        <FormTextarea
          label="หมายเหตุ"
          name="notes"
          rows={4}
          placeholder="บันทึกข้อมูลเพิ่มเติม..."
        />

        <Button type="submit">บันทึก</Button>
      </form>
    </div>
  );
}
```

#### Step 5: ดูผลลัพธ์
1. เปิดเบราว์เซอร์: `http://localhost:3000/dashboard/clients/test-form-fields`
2. ทดสอบดูแต่ละ input field
3. สังเกตว่า error แสดงผลถูกต้อง

---

### ✅ เช็คลิสต์ความสำเร็จ
- [ ] สร้าง `form-field.tsx` สำเร็จ
- [ ] แสดง label ได้
- [ ] แสดง description ได้
- [ ] แสดง error messages ได้
- [ ] รองรับ `required` attribute
- [ ] Extend input props ได้ (type, placeholder, etc.)
- [ ] TypeScript ไม่มี error

💡 **จำได้ไหม?**: ใช้ `...props` เพื่อส่ง props ที่เหลือทั้งหมดไปให้ `<Input>` component

---

## 6. Exercise 3: สร้าง General Info Section

### 🎯 เป้าหมาย
สร้างส่วน "ข้อมูลทั่วไป" สำหรับ Client Form โดยใช้ Components ที่สร้างไว้

### 📋 ขั้นตอน

#### Step 1: สร้างไฟล์
```bash
c:\Projects\nextjs-dashboard\app\ui\clients\general-info-section.tsx
```

#### Step 2: เขียนโค้ด

```tsx
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
```

#### Step 3: สร้าง Contact Info Section (เพิ่มเติม)

สร้างไฟล์: `app/ui/clients/contact-info-section.tsx`

```tsx
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
```

#### Step 4: ประกอบทั้งหมดใน Client Form

สร้างไฟล์: `app/ui/clients/client-form.tsx`

```tsx
'use client';

import { useActionState } from 'react';
import { GeneralInfoSection } from './general-info-section';
import { ContactInfoSection } from './contact-info-section';
import { Button } from '@/components/ui/button';
import { createClient } from '@/app/lib/actions-clients'; // จะสร้างในขั้นต่อไป
import Link from 'next/link';

export function ClientForm() {
  // 1. Setup form state
  const initialState = { message: '', errors: {} };
  const [state, formAction] = useActionState(createClient, initialState);

  return (
    <form action={formAction} className="max-w-4xl mx-auto">
      {/* แสดง Success/Error Message */}
      {state.message && (
        <div className={`
          p-4 rounded-lg mb-6
          ${state.errors && Object.keys(state.errors).length > 0
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'}
        `}>
          {state.message}
        </div>
      )}

      {/* Sections */}
      <GeneralInfoSection errors={state.errors} />
      <ContactInfoSection errors={state.errors} />

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <Link href="/dashboard/clients">
          <Button variant="outline" type="button">
            ยกเลิก
          </Button>
        </Link>
        <Button type="submit">
          บันทึกข้อมูล
        </Button>
      </div>
    </form>
  );
}
```

#### Step 5: สร้าง Page สำหรับ Create Client

สร้างไฟล์: `app/dashboard/clients/create/page.tsx`

```tsx
import { ClientForm } from '@/app/ui/clients/client-form';

export default function CreateClientPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">เพิ่มลูกค้าใหม่</h1>
        <p className="text-gray-600 mt-2">กรอกข้อมูลลูกค้าเพื่อสร้างโปรไฟล์</p>
      </div>

      <ClientForm />
    </div>
  );
}
```

#### Step 6: สร้าง Dummy Server Action (ชั่วคราว)

สร้างไฟล์: `app/lib/actions-clients.ts`

```tsx
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
  console.log('✅ Validated data:', validatedFields.data);

  // 4. Return success (ชั่วคราว)
  await new Promise(resolve => setTimeout(resolve, 1000)); // จำลอง delay

  return {
    message: '✅ บันทึกข้อมูลสำเร็จ! (ชั่วคราว - ยังไม่ได้บันทึกจริง)',
    errors: {},
  };
}
```

#### Step 7: ทดสอบ
1. เปิด `http://localhost:3000/dashboard/clients/create`
2. ลองกรอกข้อมูล
3. ลองกดบันทึกโดยไม่กรอกชื่อ (ควรเห็น error)
4. กรอกข้อมูลครบ แล้วกดบันทึก (ควรเห็น success message)

---

### ✅ เช็คลิสต์ความสำเร็จ
- [ ] สร้าง `general-info-section.tsx` สำเร็จ
- [ ] สร้าง `contact-info-section.tsx` สำเร็จ
- [ ] สร้าง `client-form.tsx` สำเร็จ
- [ ] สร้าง Server Action (`actions-clients.ts`)
- [ ] Validation ทำงานได้
- [ ] แสดง error messages ได้
- [ ] Form submit ได้
- [ ] TypeScript ไม่มี error

🎉 **ยินดีด้วย!** ตอนนี้คุณสามารถสร้าง Form ที่ซับซ้อนได้แล้ว!

---

## 7. File Organization Checklist

### 📂 เมื่อไหร่ควรใส่ไฟล์ที่ไหน?

#### ✅ `app/ui/clients/` - Components เฉพาะสำหรับ Clients feature
- `client-form.tsx` - Form components
- `general-info-section.tsx` - Form sections
- `client-avatar.tsx` - Client-specific display components
- `clients-table.tsx` - Table for listing
- `form-field.tsx` - Reusable form inputs

#### ✅ `app/ui/shared/` - Components ที่ใช้ได้หลาย features
- `loading-spinner.tsx` - Loading states
- `error-message.tsx` - Error displays
- `empty-state.tsx` - When no data
- `permission-badge.tsx` - ใช้ได้ทั้ง clients และ tarot

#### ✅ `app/lib/` - Logic, Data, Actions
- `definitions.ts` - Types (general)
- `definitions-crm.ts` - Types (CRM-specific)
- `actions-clients.ts` - Server actions for clients
- `data-clients.ts` - Data fetching
- `utils.ts` - Helper functions

#### ✅ `app/dashboard/clients/` - Pages (Routes)
- `page.tsx` - List page
- `create/page.tsx` - Create form page
- `[id]/page.tsx` - Detail page

---

### 🚫 Common Mistakes (ผิดพลาดบ่อย)

#### Mistake 1: ใส่ Component ในโฟลเดอร์ผิด
```
❌ app/ui/form-field.tsx          (เฉพาะเจาะจงเกินไป)
✅ app/ui/clients/form-field.tsx  (ชัดเจนว่าเป็นของ clients)

❌ app/ui/clients/loading-spinner.tsx  (ใช้ได้หลาย feature)
✅ app/ui/shared/loading-spinner.tsx   (ถูกต้อง)
```

#### Mistake 2: Import path ผิด
```tsx
❌ import { Button } from '../components/ui/button';
✅ import { Button } from '@/components/ui/button';

❌ import { FormField } from '../../ui/clients/form-field';
✅ import { FormField } from '@/app/ui/clients/form-field';
```

#### Mistake 3: ตั้งชื่อไฟล์ไม่ตรงกับ Component
```tsx
❌ ไฟล์: client-info.tsx → Component: export default function GeneralInfo()
✅ ไฟล์: general-info.tsx → Component: export default function GeneralInfo()
```

---

## 8. Next Steps

### 🎯 สิ่งที่ควรทำต่อไป (เรียงตามลำดับ)

#### 1. เพิ่ม Astrology Type Selector (10-15 นาที)
- [ ] สร้าง `astrology-type-selector.tsx`
- [ ] ใช้ Checkbox group สำหรับเลือก Thai/Chinese/Vedic/Western/Tarot
- [ ] เก็บ state ของ types ที่เลือก

#### 2. สร้าง Dynamic Panels (30-45 นาที แต่ละ panel)
- [ ] `thai-astrology-panel.tsx`
- [ ] `chinese-astrology-panel.tsx`
- [ ] `vedic-western-panel.tsx`
- [ ] `tarot-session-panel.tsx`
- [ ] แต่ละ panel แสดงก็ต่อเมื่อเลือก type นั้นๆ

#### 3. เชื่อมต่อ Database จริง (1-2 ชั่วโมง)
- [ ] แก้ไข `actions-clients.ts` ให้ INSERT ข้อมูลจริง
- [ ] ใช้ `@vercel/postgres` หรือ Supabase client
- [ ] ทดสอบบันทึกข้อมูลจริง

#### 4. สร้าง Clients List Page (1-2 ชั่วโมง)
- [ ] สร้าง `app/dashboard/clients/page.tsx`
- [ ] สร้าง `clients-table.tsx`
- [ ] สร้าง `client-search.tsx`
- [ ] เพิ่ม Pagination

#### 5. สร้าง Client Detail Page (2-3 ชั่วโมง)
- [ ] สร้าง `app/dashboard/clients/[id]/page.tsx`
- [ ] แสดงข้อมูลทั้งหมด
- [ ] สร้าง Tab navigation
- [ ] แสดง Astrology Profiles แต่ละประเภท

---

### 📚 เอกสารอ้างอิง

#### Next.js 16
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [useActionState Hook](https://react.dev/reference/react/useActionState)
- [Forms and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

#### ShadCN UI
- [Documentation](https://ui.shadcn.com/)
- [Components Gallery](https://ui.shadcn.com/docs/components/button)
- [Form Example](https://ui.shadcn.com/docs/components/form)

#### TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

### 💡 เคล็ดลับสำหรับ Q

#### เมื่อติดปัญหา:
1. **อ่าน Error Message ให้ดี** - มักจะบอกว่าปัญหาอยู่ตรงไหน
2. **ตรวจสอบ Import Paths** - ใช้ `@/` prefix เสมอ
3. **ลองแยกปัญหาออกมา** - สร้าง test page ทดสอบเฉพาะส่วนที่สงสัย
4. **ใช้ Console.log** - ดูว่า data มีค่าอะไร
5. **ดู Network Tab** - ดูว่า API/Action ส่งอะไรไป-กลับ

#### Workflow ที่ดี:
1. **เขียน Types ก่อน** (ใน `definitions.ts`)
2. **สร้าง Component เล็กๆ** (เช่น `FormField`)
3. **ประกอบเป็น Component ใหญ่** (เช่น `GeneralInfoSection`)
4. **Test แต่ละขั้น** (อย่ารอจนเขียนเสร็จหมดค่อย test)
5. **Commit บ่อยๆ** (เมื่อทำอะไรสำเร็จ)

---

## 🎉 สรุป

คุณได้เรียนรู้:
- ✅ โครงสร้างโฟลเดอร์แบบ feature-based
- ✅ Server Components vs Client Components
- ✅ Composition Pattern (สร้างเล็ก ประกอบเป็นใหญ่)
- ✅ Form handling ด้วย useActionState
- ✅ การใช้ ShadCN UI Components
- ✅ TypeScript Props patterns
- ✅ Error handling และ Loading states

**ตอนนี้คุณพร้อมที่จะสร้าง Full CRM Form แล้ว!** 🚀

---

**สร้างโดย**: Tukta AI 🤖
**สำหรับ**: Q <siliconwarin@gmail.com>
**วันที่**: 2025-01-29
**Version**: 1.0
