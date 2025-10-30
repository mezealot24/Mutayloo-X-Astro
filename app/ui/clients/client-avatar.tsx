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
