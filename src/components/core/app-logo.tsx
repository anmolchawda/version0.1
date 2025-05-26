
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function AppLogo({ className, textClassName, iconClassName }: { className?: string; textClassName?: string; iconClassName?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-2xl font-bold text-primary", className)}>
      <div className={cn("relative h-8 w-8", iconClassName)}> {/* Container for the image */}
        <Image
          src="https://storage.cloud.google.com/imagesoffarmdocc/KrishiX/KrishiX%20PNG%20Logo.png"
          alt="KrishiX Logo"
          layout="fill" // Fills the container div
          objectFit="contain" // Ensures the whole logo is visible and maintains aspect ratio
        />
      </div>
      <span className={cn(textClassName)}>KrishiX</span>
    </Link>
  );
}
