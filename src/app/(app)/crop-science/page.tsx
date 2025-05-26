// src/app/(app)/crop-science/page.tsx
'use client'; // Make it a client component

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

interface CropInfo {
  name: string;
  imageUrl: string;
  aiHint: string;
}

const commonCrops: CropInfo[] = [
  // Vegetables
  { name: 'Tomato', imageUrl: 'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHx0b21hdG98ZW58MHx8fHwxNzQ4MjM5MDMzfDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'tomato white-background' },
  { name: 'Potato', imageUrl: 'https://images.unsplash.com/photo-1578594640334-b71fbed2a406?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8cG90YXRvfGVufDB8fHx8MTc0ODIzOTAwNnww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'potato vegetable' },
  { name: 'Onion', imageUrl: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxvbmlvbnxlbnwwfHx8fDE3NDgyMzkzMzV8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'onion vegetable' },
  { name: 'Carrot', imageUrl: 'https://images.unsplash.com/photo-1576181256399-834e3b3a49bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYXJyb3R8ZW58MHx8fHwxNzQ4MjM5Mzc2fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'carrot vegetable' },
  { name: 'Broccoli', imageUrl: 'https://images.unsplash.com/photo-1615485291234-9d694218aeb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8YnJvY29sbGl8ZW58MHx8fHwxNzQ4MjM5NTU0fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'broccoli vegetable' },
  { name: 'Spinach', imageUrl: 'https://images.unsplash.com/photo-1580910365203-91ea9115a319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzcGluYWNoJTIwbGVhdmVzfGVufDB8fHx8MTc0ODIzODcyOXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'spinach leaves' },
  { name: 'Bell Pepper', imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxiZWxsJTIwcGVwcGVyfGVufDB8fHx8MTc0ODIzOTY4OHww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'bell pepper' },
  { name: 'Cucumber', imageUrl: 'https://images.unsplash.com/photo-1587411768638-ec71f8e33b78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjdWN1bWJlcnxlbnwwfHx8fDE3NDgyMzk4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'cucumber vegetable' },
  { name: 'Lettuce', imageUrl: 'https://images.unsplash.com/photo-1622943495354-f49d2964094c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNHx8bGV0dHVjZXxlbnwwfHx8fDE3NDgyMzk5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'lettuce leaves' },
  { name: 'Eggplant', imageUrl: 'https://images.unsplash.com/photo-1615484477201-9f4953340fab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxlZ2dwbGFudHxlbnwwfHx8fDE3NDgyNDAwNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'eggplant vegetable' },
  // Fruits
  { name: 'Apple', imageUrl: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxhcHBsZSUyMGZydWl0fGVufDB8fHx8MTc0ODIzODcyOHww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'apple fruit' },
  { name: 'Banana', imageUrl: 'https://images.unsplash.com/photo-1587334206596-c0f9f7dccbe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxN3x8YmFuYW5hfGVufDB8fHx8MTc0ODI0MDM3Nnww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'banana fruit' },
  { name: 'Orange', imageUrl: 'https://images.unsplash.com/photo-1609424572698-04d9d2e04954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNnx8b3JhbmdlfGVufDB8fHx8MTc0ODI0NDY5OHww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'orange fruit' },
  { name: 'Mango', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW5nb3xlbnwwfHx8fDE3NDgyNDc2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'mango fruit' },
  { name: 'Grapes', imageUrl: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxncmFwZXN8ZW58MHx8fHwxNzQ4MjQ0NzE2fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'grapes fruit' },
  { name: 'Strawberry', imageUrl: 'https://images.unsplash.com/photo-1568966299181-bb7282cc84f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxzdHJhd2JlcnJ5fGVufDB8fHx8MTc0ODI0NDc0Mnww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'strawberry fruit' },
  { name: 'Pineapple', imageUrl: 'https://images.unsplash.com/photo-1492831379069-0fe9d118b7c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8cGluZWFwcGxlJTIwZnJ1aXR8ZW58MHx8fHwxNzQ4MjM4NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'pineapple fruit' },
  { name: 'Watermelon', imageUrl: 'https://images.unsplash.com/photo-1453179592584-e2587867cfff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHx3YXRlcm1lbG9uJTIwZnJ1aXR8ZW58MHx8fHwxNzQ4MjM4NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'watermelon fruit' },
  { name: 'Pomegranate', imageUrl: 'https://images.unsplash.com/photo-1580157508103-2a4e9fe8ed29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwb21lZ3JhbmF0ZSUyMGZydWl0fGVufDB8fHx8MTc0ODIzODcyOXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'pomegranate fruit' },
  { name: 'Kiwi', imageUrl: 'https://images.unsplash.com/photo-1572539280469-9c738c59964d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8a2l3aSUyMGZydWl0fGVufDB8fHx8MTc0ODIzODcyOXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'kiwi fruit' },
];

export default function CropSciencePage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <FlaskConical className="mr-3 h-7 w-7 text-primary" />
            Crop Science Hub
          </CardTitle>
          <CardDescription>
            Explore information about various common vegetable and fruit crops.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commonCrops.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {commonCrops.map((crop) => (
                <Card key={crop.name} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
                  <div className="aspect-square bg-card flex items-center justify-center p-2">
                    <Image
                      src={crop.imageUrl}
                      alt={crop.name}
                      width={150}
                      height={150}
                      className="object-contain rounded-md"
                      data-ai-hint={crop.aiHint}
                    />
                  </div>
                  <div className="p-3 text-center bg-muted/30">
                    <p className="font-semibold text-sm text-foreground truncate">{crop.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No crop information available at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
