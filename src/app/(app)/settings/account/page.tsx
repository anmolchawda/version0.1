// src/app/(app)/settings/account/page.tsx
'use client'; 

import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle2, ChevronLeft } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations'; 
import Link from 'next/link';

export default function AccountSettingsPage() {
  const { t } = useTranslations(); 

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="mb-2 inline-flex items-center text-primary hover:text-primary/80">
        <Link href="/settings">
          <ChevronLeft className="mr-2 h-5 w-5" /> {t('backToSettingsButton')}
        </Link>
      </Button>
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

