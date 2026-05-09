/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Story, User, AuthState } from "../types";

const STORAGE_KEYS = {
  STORIES: "comicnew_stories",
  USERS: "comicnew_users",
  AUTH: "comicnew_auth",
};

const MOCK_STORIES: Story[] = [
  {
    id: "1",
    title: "Vinh Quang Kẻ Lạc Lối",
    authorId: "user1",
    authorName: "Phong Linh",
    type: "novel",
    coverUrl: "https://images.unsplash.com/photo-1543004629-142a7a5f1ee8?q=80&w=1974&auto=format&fit=crop",
    description: "Một câu chuyện về cuộc hành trình tìm lại bản thân trong một thế giới huyền bí.",
    tags: ["Action", "Fantasy", "Adventure"],
    chapters: [
      { id: "c1", title: "Chương 1: Khởi đầu", content: ["Nội dung chương 1...", "Tiếp tục nội dung..."], createdAt: new Date().toISOString() }
    ],
    views: 1200,
    rating: 4.8,
    status: "ongoing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Kiếm Ma Độc Tôn",
    authorId: "user2",
    authorName: "Minh Quân",
    type: "comic",
    coverUrl: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1974&auto=format&fit=crop",
    description: "Hành trình trở thành đệ nhất kiếm sĩ của một thiếu niên bị ruồng bỏ.",
    tags: ["Martial Arts", "Comedy", "Shounen"],
    chapters: [
      { id: "c2", title: "Hồi 1", content: ["https://images.unsplash.com/photo-1613323593608-abc90fec84ff?q=80&w=2070", "https://images.unsplash.com/photo-1614741487319-694d51617410?q=80&w=2070"], createdAt: new Date().toISOString() }
    ],
    views: 5000,
    rating: 4.9,
    status: "ongoing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const storage = {
  getStories: (): Story[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STORIES);
    return data ? JSON.parse(data) : MOCK_STORIES;
  },
  saveStories: (stories: Story[]) => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  },
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  getAuth: (): AuthState => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : { user: null, isAuthenticated: false };
  },
  saveAuth: (auth: AuthState) => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  },
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};
