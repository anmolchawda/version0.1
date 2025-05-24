import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-2xl font-bold text-primary ${className}`}>
      <Leaf className="h-8 w-8" />
      <span>FieldVerse</span>
    </Link>
  );
}
