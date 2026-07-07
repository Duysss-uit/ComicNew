/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";
import { Story } from "../../types";
import { Star, Eye } from "lucide-react";
import { cn } from "../../lib/utils";

interface StoryCardProps {
  story: Story;
  isCompact?: boolean;
  showRank?: boolean;
  key?: React.Key;
  onClick?: () => void;
}

export default function StoryCard({ story, isCompact, showRank, onClick }: StoryCardProps) {
  const content = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-white/5 mb-4 border border-white/10 group-hover:border-accent/50 transition-colors">
        <img 
          src={story.coverUrl} 
          alt={story.title} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:grayscale-[0.5]"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay info for non-compact */}
        {!isCompact && (
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <div className="flex items-center gap-4 text-ghost text-[9px] font-black uppercase tracking-tighter">
              <span className="flex items-center gap-1.5"><Eye className="w-3 h-3 text-accent" /> {story.views}</span>
              <span className="flex items-center gap-1.5"><Star className="w-3 h-3 fill-accent text-accent" /> {story.rating}</span>
            </div>
          </div>
        )}

        {/* Story Type Tag */}
        <div className="absolute top-0 left-0 px-2 py-1 bg-accent text-[8px] font-black uppercase tracking-tighter text-obsidian">
          {story.type === 'comic' ? 'MANGA' : 'NOVEL'}
        </div>
      </div>

      <div>
        <h3 className={cn(
          "font-black italic uppercase tracking-tighter line-clamp-1 group-hover:text-accent transition-colors",
          isCompact ? "text-[10px]" : "text-xs"
        )}>
          {story.title}
        </h3>
        <p className="text-[8px] text-ghost/40 uppercase font-bold tracking-widest mt-1">
          BY {story.authorName}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative w-full text-left"
        id={`story-${story.id}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link 
      to={`/story/${story.id}`}
      className="group relative"
      id={`story-${story.id}`}
    >
      {content}
    </Link>
  );
}
