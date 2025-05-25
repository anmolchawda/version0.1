
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserCircle2,
  DollarSign,
  Globe,
  Smartphone,
  CloudUpload,
  BarChart3,
  Bookmark, // Changed from Heart
  HelpCircle,
  ChevronRight,
  Settings as SettingsIcon // For page title
} from "lucide-react";
import Link from "next/link";

const settingsItems = [
  { label: "Account", icon: UserCircle2, href: "/settings/account" },
  { label: "Payments", icon: DollarSign, href: "/settings/payments" },
  { label: "Language", icon: Globe, href: "/settings/language" },
  { label: "Devices", icon: Smartphone, href: "/settings/devices" },
  { label: "Uploads", icon: CloudUpload, href: "/settings/uploads" },
  { label: "Stats", icon: BarChart3, href: "/settings/stats" },
  { label: "Favorites", icon: Bookmark, href: "/settings/favorites" }, // Changed from Heart
  { label: "Help", icon: HelpCircle, href: "/settings/help" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center text-primary">
          <SettingsIcon className="mr-3 h-8 w-8" />
          Settings
        </h1>
        {/* Optional: Back button or other actions here */}
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0.5 p-0">
          {settingsItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${index !== settingsItems.length - 1 ? 'border-b' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <item.icon className="h-6 w-6 text-primary" />
                <span className="text-base font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* You can add other settings categories here if needed, e.g., App Settings */}
      {/* 
      <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">App Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0.5 p-0">
          // Add app-specific settings here
        </CardContent>
      </Card>
      */}
    </div>
  );
}
