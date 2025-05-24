import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { User } from '@/types';
import { MapPin, Leaf, UserPlus, MessageSquare, Settings } from 'lucide-react';
import Link from 'next/link';

interface ProfileDetailsProps {
  user: User;
  isCurrentUser?: boolean;
}

export function ProfileDetails({ user, isCurrentUser = false }: ProfileDetailsProps) {
  return (
    <Card className="w-full shadow-lg rounded-xl overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary via-green-400 to-accent" data-ai-hint="farm nature">
        {/* Optional: Cover Photo */}
      </div>
      <CardHeader className="flex flex-col items-center text-center -mt-16">
        <Avatar className="h-28 w-28 border-4 border-background shadow-md">
          <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${user.username.charAt(0)}`} alt={user.username} data-ai-hint="person farmer" />
          <AvatarFallback className="text-4xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold mt-4">{user.name || user.username}</h1>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </CardHeader>
      <CardContent className="text-center space-y-4 px-6 pb-6">
        {user.bio && <p className="text-foreground leading-relaxed">{user.bio}</p>}
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {user.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-primary" />
              {user.location}
            </div>
          )}
          {user.produce && user.produce.length > 0 && (
            <div className="flex items-center">
              <Leaf className="h-4 w-4 mr-1.5 text-primary" />
              Specializes in: {user.produce.join(', ')}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4 pt-2">
            <div className="text-center">
              <p className="font-bold text-lg">{user.postCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{user.followersCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{user.followingCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          {isCurrentUser ? (
            <Button asChild variant="outline">
              <Link href="/profile/edit">
                <Settings className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </Button>
          ) : (
            <>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <UserPlus className="mr-2 h-4 w-4" /> Follow
              </Button>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" /> Message
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
