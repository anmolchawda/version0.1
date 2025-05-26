
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function AppLogo({ className, textClassName, iconClassName }: { className?: string; textClassName?: string; iconClassName?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-2xl font-bold text-primary", className)}>
      {/* 
        Please place your logo image (e.g., logo.png, logo.svg) 
        in the 'public' folder at the root of your project.
        If your image is named differently or has a different extension, 
        update the 'src' attribute below accordingly.
      */}
      <div className={cn("relative h-8 w-8", iconClassName)}> {/* Container for the image */}
        <Image
          src="/logo.png" // Assumes your logo is named logo.png and is in the /public folder
          alt="KrishiX Logo"
          layout="fill" // Fills the container div
          objectFit="contain" // Ensures the whole logo is visible and maintains aspect ratio
        />
      </div>
      <span className={cn(textClassName)}>KrishiX</span>
    </Link>
  );
}
