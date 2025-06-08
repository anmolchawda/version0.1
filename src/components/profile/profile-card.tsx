
import React from 'react'; // Added React import
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/types';
import { MapPin, Leaf, UserPlus } from 'lucide-react';

interface ProfileCardProps {
  user: User;
}

const ProfileCardComponent = ({ user }: ProfileCardProps) => {
  return (
    <Card className="overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
      <CardHeader className="items-center text-center p-6">
        <Link href={`/profile/${user.id}`}>
          <Avatar className="h-20 w-20 mb-3 border-2 border-primary">
            <AvatarImage src={user.avatarUrl || `https://placehold.co/80x80.png?text=${user.username.charAt(0)}`} alt={user.username} data-ai-hint="person farmer" />
            <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <CardTitle className="text-lg">
          <Link href={`/profile/${user.id}`} className="hover:underline">
            {user.name || user.username}
          </Link>
        </CardTitle>
        <CardDescription>@{user.username}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-center px-4 space-y-2 min-h-[80px]">
        {user.bio && <p className="text-muted-foreground line-clamp-2">{user.bio}</p>}
        {user.location && (
          <div className="flex items-center justify-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1.5 text-primary" />
            {user.location}
          </div>
        )}
        {user.produce && user.produce.length > 0 && (
          <div className="flex items-center justify-center text-muted-foreground">
            <Leaf className="h-4 w-4 mr-1.5 text-primary" />
            <span className="line-clamp-1">Grows: {user.produce.join(', ')}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/profile/${user.id}`}>
            <UserPlus className="mr-2 h-4 w-4" /> View Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export const ProfileCard = React.memo(ProfileCardComponent);
