export interface Chapter {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorPhoto: string;
  chapters: Chapter[];
  draft: boolean;
  isPremium: boolean;
  viewsCount: number;
  downloadsCount: number;
  ratingAverage: number;
  ratingCount: number;
  commentsCount: number;
  likesCount: number;
  price?: number;
  createdAt: string;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  role: "user" | "admin";
  followersCount: number;
  followingCount: number;
  earnings: number;
  subscriptionActive: boolean;
  createdAt: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    telegram?: string;
    instagram?: string;
  };
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  parentId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  storyId?: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalStories: number;
  totalUsers: number;
  totalViews: number;
  totalDownloads: number;
  recentUsers: User[];
  recentStories: Story[];
}
