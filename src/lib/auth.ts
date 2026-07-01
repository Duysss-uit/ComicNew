import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

import type { AuthState, User } from "../types";
import { storage } from "./storage";
import { apiJson } from "./api";

function getDisplayName(user: SupabaseUser) {
  const metadata = user.user_metadata ?? {};

  return (
    metadata.full_name ??
    metadata.name ??
    metadata.preferred_username ??
    user.email?.split("@")[0] ??
    "Google User"
  );
}

function getAvatarUrl(user: SupabaseUser) {
  const metadata = user.user_metadata ?? {};

  return metadata.avatar_url ?? metadata.picture ?? undefined;
}

function getClaimValue(claims: { Type: string; Value: string }[] | undefined, types: string[]): string | undefined {
  if (!claims) return undefined;
  for (const type of types) {
    const claim = claims.find(
      (c) => c.Type === type || c.Type.endsWith(`/${type}`) || c.Type.toLowerCase() === type.toLowerCase(),
    );
    if (claim) return claim.Value;
  }
  return undefined;
}

export interface BackendUser {
  UserId: string;
  Email: string | null;
  Role: string | null;
  Name: string | null;
  AvatarUrl: string | null;
  Claims: { Type: string; Value: string }[];
}

export function mapBackendUserToAppUser(backendUser: BackendUser): User {
  return {
    id: backendUser.UserId, 
    name: backendUser.Name ?? "",
    email: backendUser.Email ?? "",
    avatarUrl: backendUser.AvatarUrl ?? undefined,
    readingHistory: [],
    publishedStories: [],
  };
}

export async function verifySessionWithBackend(): Promise<AuthState> {
  const backendUser = await apiJson<BackendUser>("/api/auth/me");
  if (!backendUser || !backendUser.UserId) {
    throw new Error("Không nhận được thông tin người dùng từ máy chủ.");
  }
  return {
    user: mapBackendUserToAppUser(backendUser),
    isAuthenticated: true,
  };
}