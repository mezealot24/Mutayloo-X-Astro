'use client';

import { useActionState } from 'react';
import { GeneralInfoSection } from './general-info-section';
import { ContactInfoSection } from './contact-info-section';
import { Button } from '@/components/ui/button';
import { createClient } from '@/app/lib/actions-clients';
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
