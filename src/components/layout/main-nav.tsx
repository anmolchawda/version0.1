// This component is no longer used for main navigation after implementing BottomNavBar.
// It can be kept for potential future use or removed.
// For now, I will leave its content as is but it won't be rendered by AppHeader.
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavLink } from '@/lib/navigation';

interface MainNavProps {
  links: NavLink[];
  currentPath: string;
  className?: string;
}

export function MainNav({ links, currentPath, className }: MainNavProps) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            currentPath === link.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {link.icon && <span className="mr-2 md:hidden lg:inline-block">{link.icon}</span>}
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
