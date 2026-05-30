import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Moon, Sun, Type, Download, Share2, Clipboard, MessageSquare, Star, Heart, Check, Users, ShieldCheck, Bookmark } from "lucide-react";
import { Story, Chapter, Comment, User } from "../types";
import { jsPDF } from "jspdf";

interface ReadingViewProps {
  story: Story;
  user: User | null;
  onBack: () => void;
  onFollowAuthor: (authorId: string) => void;
  isFollowingAuthor: boolean;
  onUserAuthRequired: () => void;
}

export default function ReadingView({
  story,
  user,
  onBack,
  onFollowAuthor,
  isFollowingAuthor,
  onUserAuthRequired,
}: ReadingViewProps) {
  // Navigation & Display Chapter Index
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);

  // Styling customizer
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [isLightMode, setIsLightMode] = useState(false);

  // Engagement states
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(story.likesCount || 0);
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(story.ratingAverage || 0);
  const [ratingCount, setRatingCount] = useState(story.ratingCount || 0);

  // Sharing states
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Comments states
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyInputs, setReplyInputs] = useState<{ [commentId: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // PDF Generator variables
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Referrence tracking for scroll bookmarking
  const textContainerRef = useRef<HTMLDivElement>(null);

  const activeChapter = story.chapters[activeChapterIdx];

  // Load comments, check likes & restore previous bookmarks on render
  useEffect(() => {
    // 1. Fetch Comments
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/stories/${story.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (e) {
        console.error("Comments error", e);
      }
    };
    fetchComments();

    // 2. Fetch User bookmark position
    const savedBookmark = localStorage.getItem(`bookmark_story_${story.id}`);
    if (savedBookmark) {
      try {
        const { chapterIdx, scrollOffset } = JSON.parse(savedBookmark);
        if (chapterIdx < story.chapters.length) {
          setActiveChapterIdx(chapterIdx);
          // Wait briefly, then scroll to position (approx)
          setTimeout(() => {
            if (textContainerRef.current) {
              textContainerRef.current.scrollTop = scrollOffset;
            }
          }, 400);
        }
      } catch (e) {
        console.error("Error reading bookmarked scroll", e);
      }
    }
  }, [story]);

  // Log user scroll position dynamically for Bookmark features
  const handleScroll = () => {
    if (textContainerRef.current) {
      const scrollOffset = textContainerRef.current.scrollTop;
      localStorage.setItem(
        `bookmark_story_${story.id}`,
        JSON.stringify({ chapterIdx: activeChapterIdx, scrollOffset })
      );
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      onUserAuthRequired();
      return;
    }

    try {
      const res = await fetch("/api/likes/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, storyId: story.id })
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRateStory = async (score: number) => {
    if (!user) {
      onUserAuthRequired();
      return;
    }
    setRating(score);

    try {
      const res = await fetch(`/api/stories/${story.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, rating: score })
      });
      if (res.ok) {
        const data = await res.json();
        setAvgRating(data.ratingAverage);
        setRatingCount(data.ratingCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!user) {
      onUserAuthRequired();
      return;
    }

    const contentStr = parentId ? replyInputs[parentId] : commentInput;
    if (!contentStr?.trim()) return;

    const payload = {
      storyId: story.id,
      userId: user.uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      content: contentStr,
      parentId,
    };

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newC = await res.json();
        setComments([...comments, newC]);
        if (parentId) {
          setReplyInputs({ ...replyInputs, [parentId]: "" });
          setActiveReplyId(null);
        } else {
          setCommentInput("");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Copy shareable link triggers callback
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Offine Premium Novel PDF Compliation
  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // 1. Cover Page styling
      doc.setFillColor(15, 23, 42); // Navy black
      doc.rect(0, 0, 210, 297, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.text(story.title, 105, 100, { align: "center" });

      doc.setFont("times", "italic");
      doc.setFontSize(16);
      doc.setTextColor(156, 163, 175);
      doc.text(`Written by ${story.authorName}`, 105, 120, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("times", "normal");
      doc.text("Exclusive Rishi Risk Publishing", 105, 270, { align: "center" });

      // 2. Add chapters pages
      story.chapters.forEach((ch, idx) => {
        doc.addPage();
        // Plain light clean page for printing
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, "F");

        doc.setTextColor(17, 24, 39); // deep charcoal charcoal
        doc.setFont("times", "bold");
        doc.setFontSize(20);
        doc.text(`Chapter ${idx + 1}: ${ch.title}`, 20, 30);

        // Splitting paragraphs to wrap correctly in PDF standard limits
        const contentProse = ch.content || "Empty content";
        doc.setFont("times", "normal");
        doc.setFontSize(12);

        const lines = doc.splitTextToSize(contentProse, 170);
        doc.text(lines, 20, 50);
      });

      // Save PDF output file
      doc.save(`${story.title.replace(/\s+/g, "_")}.pdf`);

      // Trigger server-side view download counting increment
      await fetch(`/api/stories/${story.id}/download`, { method: "POST" });
    } catch (e) {
      console.error("PDF Fail", e);
    } finally {
      setPdfGenerating(false);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm":
        return "text-sm";
      case "base":
        return "text-base";
      case "lg":
        return "text-lg md:text-xl";
      case "xl":
        return "text-xl md:text-2xl";
    }
  };

  return (
    <div className={`min-h-screen ${isLightMode ? "bg-[#f8fafc] text-[#0f172a]" : "bg-[#050505] text-[#e0e0e0]"} transition-colors duration-300 pb-20`}>
      {/* Top action header bar */}
      <header className="sticky top-0 z-30 px-4 md:px-8 py-3 flex items-center justify-between border-b border-zinc-900 glass-panel">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 max-w-xs md:max-w-md hidden sm:block">
            <h4 className="text-xs text-zinc-400 font-mono text-glow uppercase tracking-widest truncate">{story.title}</h4>
            <span className="text-[10px] text-zinc-500 truncate block">By {story.authorName}</span>
          </div>
        </div>

        {/* Adjusters: Font slider and Dark toggle */}
        <div className="flex items-center gap-3">
          {/* Typography configuration buttons */}
          <div className="flex items-center gap-1 bg-zinc-900/50 rounded-lg p-0.5 border border-zinc-800">
            {["sm", "base", "lg", "xl"].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size as any)}
                className={`py-1 px-2.5 rounded text-xs font-semibold uppercase tracking-widest cursor-pointer transition-colors ${
                  fontSize === size ? "bg-amber-500/20 text-amber-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle contrast mode"
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Offline PDF downloads button */}
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer disabled:opacity-55"
            title="Download full volume as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            {pdfGenerating ? "Baking..." : "PDF"}
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Screen layout splits */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 gap-12">
        {/* Book Header info */}
        <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-zinc-900/50">
          <img
            src={story.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"}
            alt={story.title}
            referrerPolicy="no-referrer"
            className="w-32 md:w-40 aspect-[3/4] object-cover rounded-xl shadow-lg border border-zinc-800 shadow-amber-500/2"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-widest bg-amber-950/20 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded font-bold">
                {story.category}
              </span>
              {story.isPremium && (
                <span className="text-[10px] uppercase tracking-widest bg-amber-500/15 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                  Premium Novel
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-glow">{story.title}</h1>

            {/* Author Profile Card info */}
            <div className="flex items-center gap-3 mt-4">
              <img
                src={story.authorPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60"}
                alt={story.authorName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-zinc-800"
              />
              <div>
                <h5 className="text-sm font-bold text-zinc-300">{story.authorName}</h5>
                <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">Creator Publisher</span>
              </div>

              {/* Follow button logic */}
              <button
                onClick={() => onFollowAuthor(story.authorId)}
                className={`ml-4 flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs uppercase font-bold tracking-widest transition-all cursor-pointer ${
                  isFollowingAuthor
                    ? "bg-[#181e2e]/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                    : "bg-amber-500 text-black hover:bg-amber-400 border-amber-300/10"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                {isFollowingAuthor ? "Unfollow" : "Follow"}
              </button>
            </div>

            {/* Read progress bookmarks indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950/25 p-3 rounded-xl border border-zinc-900/30">
              <Bookmark className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Chapter {activeChapterIdx + 1} of {story.chapters.length} loaded. Reading progress saved.</span>
            </div>
          </div>
        </div>

        {/* Prose reading box */}
        {!activeChapter ? (
          <div className="text-center py-20 bg-zinc-950 rounded-2xl border border-zinc-900">
            <h3 className="text-lg font-bold text-zinc-400">Chapters are locked or unpublished</h3>
            <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto">
              The author is currently preparing new content. Bookmarks and notifications will let you know once released!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Chapter Selection Header */}
            <div className="flex items-center justify-between bg-zinc-950/30 p-4 rounded-xl border border-zinc-900">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-semibold mb-1 block">
                  Active Chapter
                </span>
                <h3 className="text-base font-bold text-zinc-100 truncate">
                  {activeChapter.title}
                </h3>
              </div>

              <select
                value={activeChapterIdx}
                onChange={(e) => {
                  setActiveChapterIdx(parseInt(e.target.value));
                  if (textContainerRef.current) textContainerRef.current.scrollTop = 0;
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-zinc-300 font-medium focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
              >
                {story.chapters.map((ch, idx) => (
                  <option key={idx} value={idx}>
                    Ch {idx + 1}: {ch.title?.slice(0, 20)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Render formatted chapters text blocks */}
            <div
              ref={textContainerRef}
              onScroll={handleScroll}
              style={{ contentVisibility: "auto" }}
              className={`novel-font py-4 pr-1 max-h-[85vh] overflow-y-auto leading-relaxed tracking-wide text-zinc-300 space-y-6 select-text active:text-white ${getFontSizeClass()}`}
            >
              {activeChapter.content?.split("\n").map((para, i) => (
                <p key={i} className="text-justify indent-8 tracking-wide">
                  {para.trim()}
                </p>
              ))}
            </div>

            {/* Chapter slider navigator buttons */}
            <div className="flex items-center justify-between border-t border-b border-zinc-900/60 py-6">
              <button
                disabled={activeChapterIdx === 0}
                onClick={() => {
                  setActiveChapterIdx(activeChapterIdx - 1);
                  if (textContainerRef.current) textContainerRef.current.scrollTop = 0;
                }}
                className="py-2 px-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-amber-500 transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Previous Chapter
              </button>

              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Page {activeChapterIdx + 1} of {story.chapters.length}
              </span>

              <button
                disabled={activeChapterIdx === story.chapters.length - 1}
                onClick={() => {
                  setActiveChapterIdx(activeChapterIdx + 1);
                  if (textContainerRef.current) textContainerRef.current.scrollTop = 0;
                }}
                className="py-2 px-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-amber-500 transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                Next Chapter →
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Engagement Buttons (Likes, Stars) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                liked
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-amber-500" : ""}`} />
              <span>{likesCount} Like{likesCount !== 1 ? "s" : ""}</span>
            </button>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-semibold mb-1">
              Rate Story: {avgRating} ★ ({ratingCount} Votes)
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-900/55 p-1.5 rounded-lg border border-zinc-800">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRateStory(star)}
                  className="p-1 text-zinc-500 hover:text-amber-400 hover:scale-110 transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (rating || Math.round(avgRating)) ? "text-amber-500 fill-amber-500" : "text-zinc-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Composes threaded commenting system */}
        <div className="space-y-6 pt-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-base font-bold tracking-wider text-zinc-200">
              Reader Discussion ({comments.length})
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Share feedback with the author or reply to other critical theories</p>
          </div>

          {/* Comment compose editor bar */}
          <form onSubmit={handleAddComment} className="flex gap-4 items-start">
            <img
              src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60"}
              alt="You avatar"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
            />
            <div className="flex-1 space-y-3">
              <textarea
                required
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={user ? "Analyze this chapter, speculate, or applaud..." : "Please log in to write critical reviews."}
                disabled={!user}
                className="w-full h-20 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-sm py-2 px-3 focus:outline-none focus:border-amber-500 text-zinc-300 rounded-lg cursor-text resize-none"
              />
              {user && (
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow cursor-pointer"
                >
                  Post Review
                </button>
              )}
            </div>
          </form>

          {/* Comments listings list */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 pt-4">
            {comments.slice().reverse().map((c) => (
              <div key={c.id} className="p-4 bg-zinc-950/20 Rounded-xl border border-zinc-900 space-y-3 rounded-xl hover:border-zinc-850 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={c.userPhoto} alt={c.userName} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <h6 className="text-xs font-bold text-zinc-300">{c.userName}</h6>
                      <span className="text-[9px] text-zinc-600 font-mono">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {user?.uid === c.userId && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-[10px] text-zinc-500 hover:text-red-400 font-semibold"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed pl-9">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm border border-zinc-800 rounded-xl p-6 bg-[#0e0e11] space-y-4 relative">
            <h4 className="font-extrabold tracking-wider text-sm uppercase text-zinc-350">Share Story Archives</h4>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-zinc-900 border border-zinc-800 select-all rounded-lg p-2 text-xs font-mono text-zinc-400"
              />
              <button
                onClick={handleCopyLink}
                className="py-1 px-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                {copiedLink ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this incredible story: "${story.title}" on Rishi Risk! ${window.location.href}`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 border border-zinc-800 bg-[#075e54]/10 text-[#25d366] text-xs font-bold uppercase rounded-lg text-center hover:bg-[#075e54]/20"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`A brilliant masterpiece on Rishi Risk: "${story.title}"! `)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 border border-zinc-800 bg-sky-950/20 text-sky-400 text-xs font-bold uppercase rounded-lg text-center hover:bg-sky-900/25"
              >
                Twitter
              </a>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-2 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-500 uppercase rounded-lg border border-zinc-800 hover:text-zinc-300"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
