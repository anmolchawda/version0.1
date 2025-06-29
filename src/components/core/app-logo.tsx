import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import React from 'react'; // Added React

interface AppLogoProps { // Added interface for props
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

const AppLogoComponent = ({ className, textClassName, iconClassName }: AppLogoProps) => { // Changed to named component
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/fieldverse-m99ip.firebasestorage.app/o/KrishiX%20logo%2FKrishiX%20PNG%20Logo.png?alt=media&token=f1b5520f-83f5-4665-81d8-45c8d2fb4d72";

  return (
    <Link href="/feed" className={cn("flex items-center gap-2 text-2xl font-bold text-primary", className)}>
      <div className={cn("relative", iconClassName)}> {/* This div receives h-12 w-12 etc. */}
        <Image
          src={logoUrl}
          alt="KrishiX Logo"
          fill
          sizes="(max-width: 768px) 48px, (max-width: 1200px) 48px, 48px" // Adjust sizes as needed based on iconClassName
          style={{ objectFit: "contain" }}
          unoptimized={true} // Keep unoptimized for GCS/Firebase URLs if optimization causes issues
        />
      </div>
      <span className={cn(textClassName)}>KrishiX</span>
    </Link>
  );
}

export const AppLogo = React.memo(AppLogoComponent); // Memoize
