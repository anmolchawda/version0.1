import { ProfileDetails } from '@/components/profile/profile-details';
import { UserPostGrid } from '@/components/profile/user-post-grid';
import { getPlaceholderUser, getPlaceholderPostsForUser } from '@/lib/placeholders';
import { notFound } from 'next/navigation';

// Mock current user ID for demonstration
const CURRENT_MOCK_USER_ID = '1'; 

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const user = getPlaceholderUser(params.userId);
  
  if (!user) {
    notFound();
  }

  const userPosts = getPlaceholderPostsForUser(params.userId);
  const isCurrentUser = params.userId === CURRENT_MOCK_USER_ID;

  return (
    <div className="space-y-8">
      <ProfileDetails user={user} isCurrentUser={isCurrentUser} />
      <UserPostGrid posts={userPosts} />
    </div>
  );
}
