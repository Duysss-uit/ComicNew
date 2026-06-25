/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StoryType = 'comic' | 'novel';

export interface Chapter {
  id: string;
  title: string;
  content: string[]; // URLs for images or paragraphs for novels
  createdAt: string;
  chapterNumber?: number;
}

export interface Story {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  type: StoryType;
  coverUrl: string;
  description: string;
  tags: string[];
  chapters: Chapter[];
  views: number;
  rating: number;
  status: 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  readingHistory: {
    storyId: string;
    chapterId: string;
    lastReadAt: string;
    chapterNumber?: number;
  }[];
  publishedStories: string[]; // Story IDs
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
