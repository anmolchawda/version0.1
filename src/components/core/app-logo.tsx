
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function AppLogo({ className, textClassName, iconClassName }: { className?: string; textClassName?: string; iconClassName?: string }) {
  const logoUrl = "https://storage.cloud.google.com/imagesoffarmdocc/KrishiX/KrishiX%20PNG%20Logo.png";

  return (
    <Link href="/" className={cn("flex items-center gap-2 text-2xl font-bold text-primary", className)}>
      <div className={cn("relative h-8 w-8", iconClassName)}> {/* Container for the image */}
        <Image
          src={logoUrl}
          alt="KrishiX Logo"
          fill // Use fill prop for responsive sizing within the container
          sizes="(max-width: 768px) 32px, 32px" // Provide sizes prop when using fill
          style={{ objectFit: "contain" }} // Use style prop for objectFit with fill
          priority // Consider adding priority if it's LCP
        />
      </div>
      <span className={cn(textClassName)}>KrishiX</span>
    </Link>
  );
}
