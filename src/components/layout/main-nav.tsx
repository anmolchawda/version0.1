import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

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
