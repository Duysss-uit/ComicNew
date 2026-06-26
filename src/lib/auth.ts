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

export function mapSupabaseUserToAppUser(supabaseUser: SupabaseUser): User {
  const users = storage.getUsers();
  const normalizedEmail = supabaseUser.email?.toLowerCase() ?? "";
  const existingUser = users.find(
    (user) => user.id === supabaseUser.id || (normalizedEmail && (user.email || "").toLowerCase() === normalizedEmail),
  );

  const mappedUser: User = {
    id: existingUser?.id ?? supabaseUser.id,
    name: existingUser?.name ?? getDisplayName(supabaseUser),
    email: supabaseUser.email ?? existingUser?.email ?? "",
    avatarUrl: getAvatarUrl(supabaseUser) ?? existingUser?.avatarUrl,
    readingHistory: existingUser?.readingHistory ?? [],
    publishedStories: existingUser?.publishedStories ?? [],
  };

  const nextUsers = existingUser
    ? users.map((user) => (user.id === existingUser.id ? mappedUser : user))
    : [mappedUser, ...users];

  storage.saveUsers(nextUsers);

  return mappedUser;
}

export function syncAuthFromSession(session: Session | null): AuthState {
  if (!session?.user) {
    return { user: null, isAuthenticated: false };
  }

  return {
    user: mapSupabaseUserToAppUser(session.user),
    isAuthenticated: true,
  };
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
  Claims: { Type: string; Value: string }[];
}

export function mapBackendUserToAppUser(backendUser: BackendUser): User {
  const users = storage.getUsers();
  const normalizedEmail = (backendUser.Email ?? "").toLowerCase();
  const existingUser = users.find(
    (user) => user.id === backendUser.UserId || (normalizedEmail && (user.email || "").toLowerCase() === normalizedEmail),
  );

  const name =
    getClaimValue(backendUser.Claims, ["full_name", "name"]) ??
    normalizedEmail.split("@")[0] ??
    "User";
  const avatarUrl =
    getClaimValue(backendUser.Claims, ["avatar_url", "picture"]) ??
    existingUser?.avatarUrl;

  const mappedUser: User = {
    id: existingUser?.id ?? backendUser.UserId,
    name: existingUser?.name ?? name,
    email: backendUser.Email ?? existingUser?.email ?? "",
    avatarUrl,
    readingHistory: existingUser?.readingHistory ?? [],
    publishedStories: existingUser?.publishedStories ?? [],
  };

  const nextUsers = existingUser
    ? users.map((user) => (user.id === existingUser.id ? mappedUser : user))
    : [mappedUser, ...users];

  storage.saveUsers(nextUsers);

  return mappedUser;
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