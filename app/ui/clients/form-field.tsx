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
