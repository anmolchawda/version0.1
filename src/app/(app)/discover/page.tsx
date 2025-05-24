import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProfileCard } from '@/components/profile/profile-card';
import { placeholderUsers, placeholderPosts } from '@/lib/placeholders';
import { PostCard } from '@/components/feed/post-card'; // Re-using PostCard for discovered posts
import { Search, Users, Image as ImageIcon } from 'lucide-react'; // Renamed Image to ImageIcon
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function DiscoverPage() {
  // For demonstration, using all placeholder users and posts
  const suggestedUsers = placeholderUsers;
  const trendingPosts = placeholderPosts.slice(0,4); // Show a few trending posts

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search farmers, produce, or hashtags..."
          className="w-full pl-10 py-3 text-base rounded-lg shadow-sm"
        />
      </div>
      
      <Tabs defaultValue="farmers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-2 mb-6">
          <TabsTrigger value="farmers" className="py-2.5 text-sm md:text-base">
            <Users className="mr-2 h-5 w-5" /> Farmers
          </TabsTrigger>
          <TabsTrigger value="posts" className="py-2.5 text-sm md:text-base">
            <ImageIcon className="mr-2 h-5 w-5" /> Posts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="farmers">
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary">Suggested Farmers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedUsers.map((user) => (
                <ProfileCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        </TabsContent>
        <TabsContent value="posts">
           <section>
            <h2 className="text-2xl font-semibold mb-6 text-primary">Trending Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
