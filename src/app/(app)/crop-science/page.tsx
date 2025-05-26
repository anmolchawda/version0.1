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
  { name: 'Tomato', imageUrl: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzQ4MjYwNTU0fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'tomato white-background' },
  { name: 'Potato', imageUrl: 'https://images.unsplash.com/photo-1505576633757-0ac1084af824?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxwb3RhdG8lMjB2ZWdldGFibGV8ZW58MHx8fHwxNzQ4MjM4NzI4fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'potato vegetable' },
  { name: 'Onion', imageUrl: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8b25pb24lMjB2ZWdldGFibGV8ZW58MHx8fHwxNzQ4MjM4NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'onion vegetable' },
  { name: 'Carrot', imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjYXJyb3QlMjB2ZWdldGFibGV8ZW58MHx8fHwxNzQ4MjM4NzI4fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'carrot vegetable' },
  { name: 'Broccoli', imageUrl: 'https://images.unsplash.com/photo-1511410188607-eca3f2f341bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxicm9jY29saSUyMHZlZ2V0YWJsZXxlbnwwfHx8fDE3NDgyMzg3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'broccoli vegetable' },
  { name: 'Spinach', imageUrl: 'https://images.unsplash.com/photo-1580910365203-91ea9115a319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzcGluYWNoJTIwbGVhdmVzfGVufDB8fHx8MTc0ODIzODcyOXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'spinach leaves' },
  { name: 'Bell Pepper', imageUrl: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxiZWxsJTIwcGVwcGVyfGVufDB8fHx8MTc0ODIzODcyOXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'bell pepper' },
  { name: 'Cucumber', imageUrl: 'https://images.unsplash.com/photo-1693933858151-2d01597907e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxjdWN1bWJlciUyMHZlZ2V0YWJsZXxlbnwwfHx8fDE3NDgyMzg3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'cucumber vegetable' },
  { name: 'Lettuce', imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxsZXR0dWNlJTIwbGVhdmVzfGVufDB8fHx8MTc0ODIzODcyOXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'lettuce leaves' },
  { name: 'Eggplant', imageUrl: 'https://images.unsplash.com/photo-1526049332082-27f8e41d5e8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxlZ2dwbGFudCUyMHZlZ2V0YWJsZXxlbnwwfHx8fDE3NDgyMzg3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'eggplant vegetable' },
  // Fruits
  { name: 'Apple', imageUrl: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxhcHBsZSUyMGZydWl0fGVufDB8fHx8MTc0ODIzODcyOHww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'apple fruit' },
  { name: 'Banana', imageUrl: 'https://images.unsplash.com/photo-1666287536047-fe01c391671a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxiYW5hbmElMjBmcnVpdHxlbnwwfHx8fDE3NDgyMzg3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'banana fruit' },
  { name: 'Orange', imageUrl: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxvcmFuZ2UlMjBmcnVpdHxlbnwwfHx8fDE3NDgyMzg3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'orange fruit' },
  { name: 'Mango', imageUrl: 'https://images.unsplash.com/photo-1580928986783-bd8256003f29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxtYW5nbyUyMGZydWl0fGVufDB8fHx8MTc0ODIzODcyOXww&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'mango fruit' },
  { name: 'Grapes', imageUrl: 'https://images.unsplash.com/photo-1695304285211-8734c7f418e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxncmFwZXMlMjBmcnVpdHxlbnwwfHx8fDE3NDgyMzg3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'grapes fruit' },
  { name: 'Strawberry', imageUrl: 'https://images.unsplash.com/photo-1668888500730-19727996caee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwZnJ1aXR8ZW58MHx8fHwxNzQ4MjM4NzI4fDA&ixlib=rb-4.1.0&q=80&w=1080', aiHint: 'strawberry fruit' },
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
