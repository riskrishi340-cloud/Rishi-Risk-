import React, { useState } from "react";
import { BookOpen, Eye, Award, Wallet, Plus, TrendingUp, Sparkles, DollarSign, Download, ArrowUpRight, HelpCircle } from "lucide-react";
import { Story, User } from "../types";

interface DashboardProps {
  user: User;
  stories: Story[];
  onWriteNewStory: () => void;
  onEditStory: (story: Story) => void;
}

export default function Dashboard({ user, stories, onWriteNewStory, onEditStory }: DashboardProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState("");

  const authorStories = stories.filter((s) => s.authorId === user.uid);

  // Derive aggregates
  const totalStories = authorStories.length;
  const totalViews = authorStories.reduce((acc, s) => acc + (s.viewsCount || 0), 0);
  const totalDownloads = authorStories.reduce((acc, s) => acc + (s.downloadsCount || 0), 0);

  // Simulated premium earnings algorithm
  const totalEarnings = authorStories.reduce((acc, s) => {
    const premiumFactor = s.isPremium ? (s.viewsCount * 0.05) + (s.downloadsCount * 0.25) : 0;
    return acc + premiumFactor;
  }, 120.50); // base simulated royalty bonus for Rishi Risk writers

  const handleClaimEarnings = () => {
    if (totalEarnings <= 0) return;
    setClaiming(true);
    setClaimStatus("");

    setTimeout(() => {
      setClaiming(false);
      setClaimStatus("✓ Royalties transferred securely to your linked deposit account!");
    }, 1200);
  };

  // Mock analytics dataset for charts
  const analyticsData = [
    { label: "Mon", views: 240, downloads: 40 },
    { label: "Tue", views: 320, downloads: 65 },
    { label: "Wed", views: 410, downloads: 80 },
    { label: "Thu", views: 560, downloads: 110 },
    { label: "Fri", views: 780, downloads: 195 },
    { label: "Sat", views: 980, downloads: 240 },
    { label: "Sun", views: 1200, downloads: 350 },
  ];

  const maxViews = Math.max(...analyticsData.map(d => d.views));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header element */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-semibold mb-1 block">
            Creative Analytics Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Author Console
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Written works profile of {user.displayName}</p>
        </div>

        <button
          onClick={onWriteNewStory}
          className="flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-lg shadow-lg transition-transform transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Co-Write New Story
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card: Written books */}
        <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Volumes Published</span>
            <h3 className="text-xl font-extrabold text-zinc-100 mt-1">{totalStories}</h3>
          </div>
        </div>

        {/* Card: Views cumulative */}
        <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Total Views</span>
            <h3 className="text-xl font-extrabold text-zinc-100 mt-1">{totalViews.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card: PDF downloads cumulative */}
        <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">PDF Downloads</span>
            <h3 className="text-xl font-extrabold text-zinc-100 mt-1">{totalDownloads.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card: Author income wallet */}
        <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Earnings Balance</span>
            <h3 className="text-xl font-extrabold text-zinc-100 mt-1">${totalEarnings.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Grid splits: Chart & Wallet Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart Column (Pure responsive HTML render) */}
        <div className="lg:col-span-2 p-6 bg-zinc-950 rounded-2xl border border-zinc-900 flex flex-col justify-between shadow-xl">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Weekly Reader Growth</h4>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Aggregated views & downloads across current novel volumes</p>
          </div>

          {/* Graphical representation list */}
          <div className="flex items-end justify-between gap-2 h-44 mt-6 border-b border-zinc-900 pb-2">
            {analyticsData.map((d, index) => {
              const hPercent = (d.views / maxViews) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                  {/* Tooltip */}
                  <span className="text-[9px] font-mono font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.views}
                  </span>

                  {/* Graphical bar split */}
                  <div className="w-full bg-[#121212] border border-zinc-900 hover:bg-zinc-900 rounded-lg overflow-hidden h-[130px] flex flex-col justify-end">
                    <div
                      style={{ height: `${hPercent}%` }}
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-500 relative rounded-t"
                    >
                      {/* Secondary inside bar representing downloads */}
                      <div
                        style={{ height: `${(d.downloads / d.views) * 100}%` }}
                        className="w-full bg-zinc-700 absolute bottom-0 left-0 right-0 rounded-t-sm"
                        title="Downloads count"
                      />
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">{d.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 text-[10px] uppercase font-mono text-zinc-400 pt-2 border-t border-zinc-900/40">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-sm" /> Digital Reads (Views)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-zinc-700 rounded-sm" /> Offline Downloads (PDF)
            </span>
          </div>
        </div>

        {/* Claim Wallet simulator panel */}
        <div className="lg:col-span-1 p-6 bg-zinc-950 rounded-2xl border border-zinc-900 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Sphere decorative background vector */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/5 rounded-full filter blur-[50px] pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Premium Royalty Claims</h4>
            </div>
            <p className="text-xs text-zinc-500">
              Rishi Risk compensates writers of Premium Novels based on aggregate chapter purchases and views. Complete claim requirements below.
            </p>
          </div>

          <div className="my-6 space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/10 flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">Total Dividends Pending</span>
              <span className="text-3xl font-extrabold text-amber-300 mt-1">${totalEarnings.toFixed(2)}</span>
            </div>

            <div className="text-[10px] space-y-1.5 font-mono uppercase text-zinc-400">
              <div className="flex justify-between">
                <span>Direct payout split:</span>
                <span>80% Writer / 20% Net Platform</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum withdraw:</span>
                <span className="text-emerald-400">Met ($10.0)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClaimEarnings}
            disabled={claiming || totalEarnings <= 0}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold tracking-widest text-[10px] uppercase rounded-lg shadow-md hover:shadow-xl hover:shadow-amber-500/5 transition-all transform active:scale-95 disabled:opacity-35 cursor-pointer"
          >
            {claiming ? "Transferring funds..." : "Claim Payout Securely"}
          </button>

          {claimStatus && (
            <div className="mt-3 text-[11px] font-medium text-emerald-400 text-center uppercase tracking-wide">
              {claimStatus}
            </div>
          )}
        </div>
      </div>

      {/* Author's Books list table */}
      <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl">
        <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-6 pb-2 border-b border-zinc-900">
          Published Stories Catalog ({totalStories})
        </h4>

        {authorStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-zinc-500">You haven't added any stories yet. Launch the studio to start!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {authorStories.map((story) => (
              <div
                key={story.id}
                className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900/60 hover:border-zinc-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-16 object-cover rounded-md border border-zinc-850 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-zinc-200 truncate">{story.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                        {story.category}
                      </span>
                      <span className="text-zinc-650">•</span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {story.chapters?.length || 0} Chapter{story.chapters?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                    story.draft ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {story.draft ? "Draft" : "Published"}
                  </span>

                  <button
                    onClick={() => onEditStory(story)}
                    className="py-1 px-3 bg-zinc-900 border border-zinc-800 rounded text-xs font-semibold hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
                  >
                    Edit Story
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
