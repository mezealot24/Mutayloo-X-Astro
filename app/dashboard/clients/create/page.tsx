import { ClientFormTutorial } from '@/app/ui/clients/client-form-tutorial';

export default function CreateClientPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">เพิ่มลูกค้าใหม่</h1>
        <p className="text-gray-600 mt-2">กรอกข้อมูลลูกค้าเพื่อสร้างโปรไฟล์</p>
        <p className="text-amber-600 text-sm mt-1">
          📝 Tutorial Mode: ฟอร์มนี้ยังไม่ได้เชื่อมต่อ Database จริง
        </p>
      </div>

      <ClientFormTutorial />
    </div>
  );
}
