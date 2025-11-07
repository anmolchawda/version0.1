// src/components/layout/bottom-nav-bar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Home, Cpu, PlusSquare, Store, User as UserIconLucide } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavLink as NavLinkType } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';

const getBottomNavLinks = (t: (key: any) => string): NavLinkType[] => [
    { href: '/feed', label: t('feed'), icon: <Home className="h-5 w-5" /> },
    { href: '/ai-features', label: t('aiFeatures'), icon: <Cpu className="h-5 w-5" /> },
    { href: '/post/create', label: t('create'), icon: <PlusSquare className="h-5 w-5" /> },
    { href: '/mandi', label: t('mandi'), icon: <Store className="h-5 w-5" /> },
    { href: `/my-profile`, label: t('profile'), icon: <UserIconLucide className="h-5 w-5" /> },
];

interface BottomNavLinkItemProps {
    link: NavLinkType;
    isActive: boolean;
}

const BottomNavLinkItemComponent: React.FC<BottomNavLinkItemProps> = ({ link, isActive }) => {
    return (
        <Link
            key={link.href}
            href={link.href}
            className={cn(
                'flex flex-col items-center justify-center text-xs font-medium h-full px-1 min-w-[60px]',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
        >
            {link.icon}
            <span className="mt-0.5 truncate">{link.label}</span>
        </Link>
    );
};

const BottomNavLinkItem = React.memo(BottomNavLinkItemComponent);

function BottomNavBarComponent() {
    const pathname = usePathname();
    const { t, isLoadingTranslations } = useTranslations();
    const [links, setLinks] = useState(() => getBottomNavLinks(t));

    useEffect(() => {
        if (!isLoadingTranslations) setLinks(getBottomNavLinks(t));
    }, [t, isLoadingTranslations]);

    return (
        // This nav is fixed to the bottom and is HIDDEN on medium screens and up (md:hidden)
        <nav className={cn(
            "safe-area-bottom", // Adds padding for the phone's home bar
            "fixed bottom-0 left-0 right-0 z-40", // ALWAYS fixed to the bottom
            "h-auto bg-card border-t",
            "md:hidden" // This is the crucial line that hides it on desktop
        )}>
            <div className="flex h-16 items-center justify-around">
                {links.map((link) => {
                    const isActive = link.href === '/feed'
                        ? pathname === '/feed' || pathname === '/'
                        : pathname.startsWith(link.href);
                    return <BottomNavLinkItem key={link.href} link={link} isActive={isActive} />;
                })}
            </div>
        </nav>
    );
}

export const BottomNavBar = React.memo(BottomNavBarComponent);
