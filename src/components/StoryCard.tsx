import React from "react";
import { Star, Eye, Download, MessageSquare, ShieldCheck, Heart } from "lucide-react";
import { Story } from "../types";

interface StoryCardProps {
  key?: string;
  story: Story;
  onClick: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  // Safe helper to render category specific badges
  const getCategoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "sci-fi":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "fantasy":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "romance":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "thriller":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-[#0a0a0c] rounded-xl border border-zinc-800/80 overflow-hidden hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/2 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Cover Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={story.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"}
          alt={story.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Premium badge */}
        {story.isPremium && (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
            Premium
          </div>
        )}

        {/* Views overlay */}
        <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide text-zinc-300 flex items-center gap-1">
          <Eye className="w-3 h-3 text-zinc-400" />
          {story.viewsCount?.toLocaleString() || 0}
        </div>

        {/* Category Pill */}
        <div className="absolute top-2.5 right-2 aistudio-ignore">
          <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${getCategoryColor(story.category)}`}>
            {story.category}
          </span>
        </div>
      </div>

      {/* Narrative Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Author Avatar & Title */}
        <div className="flex gap-3">
          <img
            src={story.authorPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60"}
            alt={story.authorName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border border-zinc-800 object-cover mt-0.5 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-zinc-100 group-hover:text-amber-500 transition-colors line-clamp-2 leading-tight">
              {story.title}
            </h3>
            <span className="text-zinc-400 text-xs mt-1 hover:text-white transition-colors block leading-tight truncate">
              {story.authorName}
            </span>
          </div>
        </div>

        {/* Short Synopsis */}
        <p className="text-zinc-500 text-xs mt-2.5 line-clamp-2 font-light">
          {story.description}
        </p>

        {/* Tag Keywords */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {story.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[9px] font-mono tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow mt-3" />

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-900/60 text-[10px] uppercase font-mono text-zinc-400">
          <div className="flex items-center gap-1 font-semibold text-zinc-200">
            <Star className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500" />
            <span>{story.ratingAverage || 0}</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <Download className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{story.downloadsCount || 0}</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Heart className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500/10" />
            <span>{story.likesCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
