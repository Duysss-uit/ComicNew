import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

import type { AuthState, User } from "../types";
import { storage } from "./storage";

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
    (user) => user.id === supabaseUser.id || (normalizedEmail && user.email.toLowerCase() === normalizedEmail),
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