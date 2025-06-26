
// src/app/(app)/yojna/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText, Loader2, AlertTriangle } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Yojna } from '@/types';
import { useTranslations } from '@/hooks/useTranslations';

export default function YojnaPage() {
  const { t } = useTranslations();
  const [yojnas, setYojnas] = useState<Yojna[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYojnas = async () => {
      setIsLoading(true);
      setError(null);

      if (!db) {
        setError(t('databaseNotAvailableError'));
        setIsLoading(false);
        return;
      }

      try {
        const yojnasCollectionRef = collection(db, 'yojna'); // Use singular 'yojna'
        const q = query(yojnasCollectionRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);

        const fetchedYojnas: Yojna[] = [];
        querySnapshot.forEach((doc) => {
          fetchedYojnas.push({
            id: doc.id,
            ...doc.data() as Yojna
          });
        });

        setYojnas(fetchedYojnas);
      } catch (e) {
        console.error("Error fetching Yojnas:", e);
        setError(t('failedToLoadYojnasError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchYojnas();
  }, [t]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <ScrollText className="mr-3 h-7 w-7" />
            {t('yojnasTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && error && (
            <div className="text-center py-10 text-destructive">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          )}
          {!isLoading && !error && yojnas.length > 0 ? (
            <div className="space-y-4">
              {yojnas.map((yojna) => (
                <Card key={yojna.id} className="p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground">{yojna.name}</h3>
                  {yojna.department && <p className="text-sm text-muted-foreground mb-2">{yojna.department}</p>}
                  <p className="text-sm text-muted-foreground">{yojna.description}</p>
                  {yojna.link && (
                    <a href={yojna.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline block mt-2">
                      {t('learnMoreButton')}
                    </a>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            !isLoading && !error && (
              <div className="mt-8 p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
                <p className="text-lg font-semibold">{t('noYojnasFoundTitle')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('noYojnasFoundDescription')}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
