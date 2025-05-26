
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function AppLogo({ className, textClassName, iconClassName }: { className?: string; textClassName?: string; iconClassName?: string }) {
  const logoUrl = "https://storage.cloud.google.com/imagesoffarmdocc/KrishiX/KrishiX%20PNG%20Logo.png";

  return (
    <Link href="/" className={cn("flex items-center gap-2 text-2xl font-bold text-primary", className)}>
      <div className={cn("relative", iconClassName)}> {/* This div receives h-12 w-12 */}
        <Image
          src={logoUrl}
          alt="KrishiX Logo"
          fill
          sizes="(max-width: 768px) 48px, 48px" // For h-12 w-12
          style={{ objectFit: "contain" }}
          unoptimized={true} 
        />
      </div>
      <span className={cn(textClassName)}>KrishiX</span>
    </Link>
  );
}
