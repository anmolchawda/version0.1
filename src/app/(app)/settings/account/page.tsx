// src/app/(app)/settings/account/page.tsx
'use client'; // Make it a client component to use hooks

import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations'; // Import the hook

export default function AccountSettingsPage() {
  const { t } = useTranslations(); // Initialize the hook

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <UserCircle2 className="mr-3 h-7 w-7" />
            {t('accountSettingsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileEditForm />
        </CardContent>
      </Card>
    </div>
  );
}
