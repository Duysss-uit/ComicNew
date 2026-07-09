import { Story, Chapter, StoryType } from "../types";
import { getSupabaseClient } from "./supabase";

const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
const STORIES_CACHE_TTL_MS = 5 * 60 * 1000;

interface StoriesCacheEntry {
  data: Story[];
  fetchedAt: number;
  inFlight?: Promise<Story[]>;
}

const storiesCache = new Map<string, StoriesCacheEntry>();

function buildApiUrl(path: string) {
  if (!apiBaseUrl) {
    throw new Error("Backend chưa được cấu hình. Hãy thêm VITE_API_URL vào file .env.");
  }

  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

export async function getAccessToken() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!data.session?.access_token) {
    throw new Error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
  }

  return data.session.access_token;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  try {
    const token = await getAccessToken();
    headers.set("Authorization", `Bearer ${token}`);
  } catch {
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(buildApiUrl(path), {
    ...options,
    headers,
  });
}

export async function apiJson<T>(path: string, options: RequestInit = {}) {
  const response = await apiFetch(path, options);

  if (!response.ok) {
    let message = `Backend trả lỗi ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody.message ?? errorBody.error ?? message;
    } catch {
      const errorText = await response.text();
      message = errorText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export interface BackendStory {
  Id: string;
  Title: string;
  Description?: string;
  CoverUrl?: string;
  Tags?: Array<string | BackendTag>;
  Status?: string;
  Views?: number;
  Rating?: number;
  LastChapterAt?: string;
  Type?: string;
  AuthorId: string;
  Author?: {
    Id: string;
    FullName?: string;
    AvatarUrl?: string;
  };
}

export interface BackendTag {
  Id: string;
  Name: string;
  Slug?: string;
}

export interface BackendChapter {
  Id: string;
  Title: string;
  ChapterNumber: number;
  ImageUrls?: string[];
  Views?: number;
  PublishedAt?: string;
  StoryId: string;
  Content?: string | null;
}

export interface BackendReadingHistoryResponse {
  UserId: string;
  ChapterNumber: number;
  LastReadAt: string;
  Story: BackendStory;
}

export interface ReadingHistoryItem {
  story: Story;
  chapterNumber: number;
  lastReadAt: string;
}

export async function fetchTags(): Promise<BackendTag[]> {
  try {
    const tags = await apiJson<BackendTag[]>("/api/tags");
    return tags || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function mapBackendStoryToStory(bs: BackendStory, chapters: Chapter[] = []): Story {
  const tags = Array.isArray(bs.Tags)
    ? bs.Tags
        .map((tag) => (typeof tag === "string" ? tag : tag.Name))
        .filter((tag): tag is string => Boolean(tag))
    : [];

  return {
    id: bs.Id,
    title: bs.Title,
    authorId: bs.AuthorId || (bs as any).UserId || (bs as any).userId || (bs as any).authorId || (bs as any).author_id || (bs as any).user_id || bs.Author?.Id || "",
    authorName: bs.Author?.FullName || "Tác giả",
    type: (bs.Type?.toLowerCase() === "novel" ? "novel" : "comic") as StoryType,
    coverUrl: bs.CoverUrl || "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1976&auto=format&fit=crop",
    description: bs.Description || "",
    tags,
    chapters: chapters,
    views: bs.Views || 0,
    rating: bs.Rating || 0,
    status: bs.Status?.toLowerCase() === "completed" ? "completed" : "ongoing",
    createdAt: bs.LastChapterAt || new Date().toISOString(),
    updatedAt: bs.LastChapterAt || new Date().toISOString(),
  };
}

export function mapBackendChapterToChapter(bc: BackendChapter, storyType: StoryType): Chapter {
  const content = storyType === "novel"
    ? (bc.Content ? bc.Content.split(/\r?\n/).filter(line => line.trim()) : [])
    : (bc.ImageUrls || []);
  return {
    id: bc.Id,
    title: bc.Title,
    content: content,
    createdAt: bc.PublishedAt || new Date().toISOString(),
    chapterNumber: bc.ChapterNumber,
  };
}

export async function fetchStories(page = 1, pageSize = 50, forceRefresh = false): Promise<Story[]> {
  const cacheKey = `${page}:${pageSize}`;
  const cached = storiesCache.get(cacheKey);
  const now = Date.now();

  if (cached && !forceRefresh && now - cached.fetchedAt < STORIES_CACHE_TTL_MS) {
    return cached.data;
  }

  if (cached?.inFlight && !forceRefresh) {
    return cached.inFlight;
  }

  const request = (async () => {
    try {
      const backendStories = await apiJson<BackendStory[]>(`/api/stories?page=${page}&pageSize=${pageSize}`);
      const stories = backendStories ? backendStories.map(bs => mapBackendStoryToStory(bs)) : [];
      storiesCache.set(cacheKey, {
        data: stories,
        fetchedAt: Date.now(),
      });
      return stories;
    } catch (error) {
      console.error(error);
      return cached?.data ?? [];
    }
  })();

  request.finally(() => {
    const latest = storiesCache.get(cacheKey);
    if (latest?.inFlight === request) {
      storiesCache.set(cacheKey, {
        data: latest.data,
        fetchedAt: latest.fetchedAt,
      });
    }
  });

  storiesCache.set(cacheKey, {
    data: cached?.data ?? [],
    fetchedAt: cached?.fetchedAt ?? 0,
    inFlight: request,
  });

  return request;
}

export async function searchStories(query: string, matchCount: number = 20): Promise<Story[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const backendStories = await apiJson<BackendStory[]>(`/api/stories/search?query=${encodedQuery}&matchCount=${matchCount}`);
    if (!backendStories) return [];
    return backendStories.map(bs => mapBackendStoryToStory(bs));
  } catch (error) {
    console.error("Lỗi khi tìm kiếm:", error);
    return [];
  }
}

export async function fetchStory(id: string): Promise<Story | null> {
  try {
    const bs = await apiJson<BackendStory>(`/api/stories/${id}`);
    if (!bs) return null;
    const storyType = (bs.Type?.toLowerCase() === "novel" ? "novel" : "comic") as StoryType;
    let chapters: Chapter[] = [];
    try {
      const bcs = await apiJson<BackendChapter[]>(`/api/stories/${id}/chapters`);
      if (bcs) {
        chapters = bcs.map(bc => mapBackendChapterToChapter(bc, storyType));
      }
    } catch (err) {
      console.error(err);
    }
    return mapBackendStoryToStory(bs, chapters);
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function fetchStorybyAuthor(authorId: string): Promise<Story[]> {
  try {
    const backendStories = await apiJson<BackendStory[]>(`/api/stories/author/${authorId}`);
    if (!backendStories) return [];
    return backendStories.map(bs => mapBackendStoryToStory(bs));
  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function fetchUserReadingHistory(): Promise<ReadingHistoryItem[]> {
  try {
    const historyEntries = await apiJson<BackendReadingHistoryResponse[]>(`/api/user/reading-history`);
    if (!historyEntries) return [];

    return historyEntries.map(entry => ({
      story: mapBackendStoryToStory(entry.Story),
      chapterNumber: entry.ChapterNumber,
      lastReadAt: entry.LastReadAt,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
export interface AddReadingHistoryRequest {
  storyId: string;
  chapterId: string;
  chapterNumber?: number;
}

export async function addReadingHistory(payload: AddReadingHistoryRequest): Promise<boolean> {
  try {
    const response = await apiFetch("/api/user/reading-history", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function uploadStory(formData: FormData): Promise<Story> {
  const bs = await apiJson<BackendStory>("/api/stories", {
    method: "POST",
    body: formData,
  });
  return mapBackendStoryToStory(bs);
}

export async function uploadChapter(storyId: string, formData: FormData, storyType: StoryType): Promise<Chapter> {
  const bc = await apiJson<BackendChapter>(`/api/stories/${storyId}/chapters`, {
    method: "POST",
    body: formData,
  });
  return mapBackendChapterToChapter(bc, storyType);
}

export async function deleteChapter(storyId: string, chapterId: string): Promise<void> {
  await apiJson<void>(`/api/stories/${storyId}/chapters/${chapterId}`, {
    method: "DELETE",
  });
}
