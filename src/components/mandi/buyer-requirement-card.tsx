
// src/components/mandi/buyer-requirement-card.tsx
'use client';

import type { DisplayBuyerRequirement } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CalendarDays, MessageSquare, Trash2, Tag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from '@/hooks/useTranslations';

interface BuyerRequirementCardProps {
  requirement: DisplayBuyerRequirement;
  currentUserId: string | null;
  onDeleteRequirement: (requirementId: string) => void;
}

export function BuyerRequirementCard({ requirement, currentUserId, onDeleteRequirement }: BuyerRequirementCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { t } = useTranslations();

  const isOwnRequirement = currentUserId === requirement.postedById;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteRequirement(requirement.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className="shadow-sm rounded-lg hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold text-primary">{requirement.itemName}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t('mandiAddRequirementCategoryLabel')}: <Badge variant="secondary" className="ml-1">{requirement.category}</Badge>
              </CardDescription>
            </div>
            {isOwnRequirement && (
              <Button variant="ghost" size="icon" onClick={handleDeleteClick} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t('mandiDeleteRequirementButton')}</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm pb-3">
          <div className="flex items-center gap-x-4">
            <p><strong className="text-foreground">{t('mandiAddRequirementQuantityLabel')}:</strong> {requirement.quantity}</p>
            {requirement.rate && <p><strong className="text-foreground">Rate:</strong> {requirement.rate}</p>}
          </div>
          {requirement.preferredLocation && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1.5 text-primary" /> {requirement.preferredLocation}
            </div>
          )}
          {requirement.specifications && (
            <p className="text-muted-foreground italic line-clamp-2" title={requirement.specifications}>
              <strong className="text-foreground not-italic">{t('mandiAddRequirementSpecsLabel')}:</strong> {requirement.specifications}
            </p>
          )}
          <div className="flex items-center text-xs text-muted-foreground pt-1">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {t('mandiRequirementPostedOn')}: {requirement.postedDate}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-2 pt-2">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 border">
              <AvatarImage src={requirement.postedBy.avatarUrl} alt={requirement.postedBy.name || requirement.postedBy.username} data-ai-hint="person user" />
              <AvatarFallback className="text-xs">{(requirement.postedBy.name || requirement.postedBy.username).charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Link href={`/profile/${requirement.postedBy.id}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
              {requirement.postedBy.name || `@${requirement.postedBy.username}`}
            </Link>
          </div>
          {!isOwnRequirement && (
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs w-full sm:w-auto" asChild>
              <Link href={`/messages/${requirement.postedBy.id}`}>
                <MessageSquare className="mr-1.5 h-4 w-4" /> {t('mandiContactBuyerButton')}
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('mandiDeleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
             {t('mandiDeleteConfirmDesc', { itemName: requirement.itemName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>{t('cancelButtonText')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('mandiDeleteButtonConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
