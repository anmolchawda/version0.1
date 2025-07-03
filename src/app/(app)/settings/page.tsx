// src/app/(app)/settings/page.tsx
'use client'; // Add this to use hooks

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserCircle2,
  DollarSign,
  Globe,
  Smartphone,
  BarChart3,
  Bookmark,
  HelpCircle,
  ChevronRight,
  Settings as SettingsIcon
} from "lucide-react";
import Link from "next/link";
import { useTranslations, TranslationKey } from '@/hooks/useTranslations'; // Import the hook

export default function SettingsPage() {
  const { t } = useTranslations(); // Initialize the hook

  const settingsItems = [
    { labelKey: "settingsAccount", icon: UserCircle2, href: "/settings/account" },
    { labelKey: "settingsPayments", icon: DollarSign, href: "/settings/payments" },
    { labelKey: "settingsLanguage", icon: Globe, href: "/settings/language" },
    { labelKey: "settingsDevices", icon: Smartphone, href: "/settings/devices" },
    { labelKey: "settingsStats", icon: BarChart3, href: "/settings/stats" },
    { labelKey: "settingsFavorites", icon: Bookmark, href: "/settings/favorites" },
    { labelKey: "settingsHelp", icon: HelpCircle, href: "/settings/help" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center text-primary">
          <SettingsIcon className="mr-3 h-8 w-8" />
          {t('settings')}
        </h1>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t('settings')}</CardTitle> {/* Could be more specific e.g., "User Settings" */}
        </CardHeader>
        <CardContent className="space-y-0.5 p-0">
          {settingsItems.map((item, index) => (
            <Link
              key={item.labelKey}
              href={item.href}
              className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${index !== settingsItems.length - 1 ? 'border-b' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <item.icon className="h-6 w-6 text-primary" />
                <span className="text-base font-medium">{t(item.labelKey as TranslationKey)}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
