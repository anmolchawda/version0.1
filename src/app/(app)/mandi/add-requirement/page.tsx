
// src/app/(app)/mandi/add-requirement/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ListPlus, Send, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from "@/hooks/use-toast";
import React, { useState, type FormEvent } from 'react';
import { useSidebarContext } from "@/contexts/SidebarContext";
import { db, addDoc, collection, doc, getDoc, serverTimestamp } from "@/lib/firebase";
import type { User } from '@/types';

const itemCategories = [
  { value: 'crops', label: 'Crops' },
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizers', label: 'Fertilizers' },
  { value: 'tractors', label: 'Tractors' },
  { value: 'equipments', label: 'Equipments' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'fungicides', label: 'Fungicides' },
  { value: 'mulching', label: 'Mulching' },
  { value: 'other', label: 'Other Agricultural Products' },
];

export default function AddRequirementPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const { toast } = useToast();
  const { authUserId } = useSidebarContext();

  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!authUserId || !db) {
        toast({ title: 'Error', description: 'You must be logged in to post a requirement.', variant: 'destructive'});
        return;
    }

    if (!itemName || !selectedCategory || !quantity) {
      toast({
        title: t('mandiAddRequirementMissingInfoTitle'),
        description: t('mandiAddRequirementMissingInfoDesc'),
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    
    try {
      // 1. Get current user's profile for denormalization
      const userDocRef = doc(db, 'users', authUserId);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
          throw new Error("User profile not found. Please complete your profile setup.");
      }
      const userProfile = userDocSnap.data() as User;

      // 2. Prepare the data for Firestore
      const requirementData = {
        postedById: authUserId,
        postedBy: {
          id: userProfile.id,
          username: userProfile.username,
          name: userProfile.name,
          avatarUrl: userProfile.avatarUrl,
        },
        itemName,
        category: selectedCategory,
        quantity,
        rate,
        preferredLocation,
        specifications,
        createdAt: serverTimestamp(),
      };

      // 3. Add the document to the 'mandi_buyer_requests' collection
      await addDoc(collection(db, 'mandi_buyer_requests'), requirementData);

      toast({
        title: t('mandiAddRequirementSuccessTitle'),
        description: t('mandiAddRequirementSuccessDesc', { itemName }),
      });
      
      router.push('/mandi?view=requests'); // Redirect to buyer requests tab

    } catch (error) {
      console.error("Error posting requirement:", error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Could not post your requirement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 inline-flex items-center text-primary hover:text-primary/80">
          <ChevronLeft className="mr-2 h-5 w-5" /> {t('backToMandiButton')}
        </Button>
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="text-center">
          <ListPlus className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">{t('mandiAddRequirementTitle')}</CardTitle>
          <CardDescription>{t('mandiAddRequirementDescription')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="itemName" className="font-medium">{t('mandiAddRequirementItemNameLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder={t('mandiAddRequirementItemNamePlaceholder')} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="category" className="font-medium">{t('mandiAddRequirementCategoryLabel')} <span className="text-destructive">*</span></Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                            <SelectTrigger id="category">
                            <SelectValue placeholder={t('mandiAddRequirementCategoryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                            {itemCategories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="quantity" className="font-medium">{t('mandiAddRequirementQuantityLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t('mandiAddRequirementQuantityPlaceholder')} required/>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="rate" className="font-medium">Rate (Optional)</Label>
                        <Input id="rate" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g., ₹20/kg, ₹40,000/unit" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="preferredLocation" className="font-medium">{t('mandiAddRequirementLocationLabel')}</Label>
                    <Input id="preferredLocation" value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} placeholder={t('mandiAddRequirementLocationPlaceholder')} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="specifications" className="font-medium">{t('mandiAddRequirementSpecsLabel')}</Label>
                    <Textarea id="specifications" value={specifications} onChange={(e) => setSpecifications(e.target.value)} placeholder={t('mandiAddRequirementSpecsPlaceholder')} rows={3} />
                </div>
                
                <p className="text-xs text-muted-foreground pt-2">
                    {t('mandiAddRequirementNote')}
                </p>
            </CardContent>
            <CardFooter className="p-4 sm:p-6">
                <Button type="submit" className="w-full text-base py-3 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    {isSubmitting ? t('mandiAddRequirementSubmittingButton') : t('mandiAddRequirementSubmitButton')}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
