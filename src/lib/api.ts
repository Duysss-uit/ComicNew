import { Story, Chapter, StoryType } from "../types";
import { getSupabaseClient } from "./supabase";

const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;

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
  Tags?: string[];
  Status?: string;
  Views?: number;
  Rating?: number;
  LastChapterAt?: string;
  Type?: string;
  AuthorId: string;
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

export function mapBackendStoryToStory(bs: BackendStory, chapters: Chapter[] = []): Story {
  return {
    id: bs.Id,
    title: bs.Title,
    authorId: bs.AuthorId,
    authorName: "Tác giả",
    type: (bs.Type?.toLowerCase() === "novel" ? "novel" : "comic") as StoryType,
    coverUrl: bs.CoverUrl || "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1976&auto=format&fit=crop",
    description: bs.Description || "",
    tags: bs.Tags || [],
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

export async function fetchStories(page = 1, pageSize = 50): Promise<Story[]> {
  try {
    const backendStories = await apiJson<BackendStory[]>(`/api/stories?page=${page}&pageSize=${pageSize}`);
    if (!backendStories) return [];
    return backendStories.map(bs => mapBackendStoryToStory(bs));
  } catch (error) {
    console.error(error);
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
