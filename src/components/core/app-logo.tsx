import Image from 'next/image';
import { cn } from '@/lib/utils';
import React from 'react';

interface AppLogoProps {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

const AppLogoComponent = ({ className, textClassName, iconClassName }: AppLogoProps) => {
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/KrishiX%20logo%2FKrishiX%20PNG%20Logo.png?alt=media&token=f1b5520f-83f5-4665-81d8-45c8d2fb4d72";

  return (
    <div className={cn("flex items-center gap-2 text-2xl font-bold text-primary", className)}>
      <div className={cn("relative", iconClassName)}>
        <Image
          src={logoUrl}
          alt="KrishiX Logo"
          fill
          sizes="(max-width: 768px) 48px, (max-width: 1200px) 48px, 48px"
          style={{ objectFit: "contain" }}
          unoptimized={true}
        />
      </div>
      <span className={cn(textClassName)}>KrishiX</span>
    </div>
  );
}

export const AppLogo = React.memo(AppLogoComponent);
