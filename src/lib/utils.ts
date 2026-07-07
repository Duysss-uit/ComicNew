/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Chapter, Story } from "../types";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getStoryChapterByProgress(
  story: Story,
  progress: { chapterId?: string; chapterNumber?: number } | null | undefined,
): Chapter | null {
  if (!progress) {
    return null;
  }

  if (progress.chapterId) {
    const byId = story.chapters.find(chapter => chapter.id === progress.chapterId);
    if (byId) {
      return byId;
    }
  }

  if (typeof progress.chapterNumber === "number") {
    const byNumber = story.chapters.find(chapter => chapter.chapterNumber === progress.chapterNumber);
    if (byNumber) {
      return byNumber;
    }
  }

  return null;
}
