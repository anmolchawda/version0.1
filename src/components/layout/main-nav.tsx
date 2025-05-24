
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavLink } from '@/types'; // Updated NavLink import

interface MainNavProps {
  links: NavLink[];
  currentPath: string;
  className?: string;
}

export function MainNav({ links, currentPath, className }: MainNavProps) {
  return (
    <nav className={cn("flex items-center space-x-6 lg:space-x-8", className)}> {/* Increased spacing */}
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            currentPath === link.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {/* Icons in MainNav are typically hidden on smaller md screens if labels are present, shown on lg */}
          {link.icon && <span className="mr-1.5 hidden lg:inline-block">{link.icon}</span>}
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
