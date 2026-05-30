import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import AuthModal from "./components/AuthModal";
import StoryCard from "./components/StoryCard";
import StoryEditor from "./components/StoryEditor";
import ReadingView from "./components/ReadingView";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import { Story, User, Notification } from "./types";
import {
  Sparkles,
  BookOpen,
  Library,
  Compass,
  LayoutDashboard,
  ShieldAlert,
  Bell,
  Search,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronRight,
  TrendingUp,
  Award,
  Download,
  Flame,
  HelpCircle
} from "lucide-react";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Authentication user profile state (stored in localStorage for session durability)
  const [activeUser, setActiveUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("rishi_risk_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Stories database list
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  // Filter queries
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Router views: "home" | "read" | "edit-story" | "dashboard" | "admin"
  const [currentView, setCurrentView] = useState<"home" | "read" | "edit-story" | "dashboard" | "admin">("home");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Author dashboard follow lists state
  const [followingAuthorIds, setFollowingAuthorIds] = useState<string[]>([]);

  // Notifications bell triggers
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  // Featured stories rotate carousel index
  const [featuredIdx, setFeaturedIdx] = useState(0);

  // Load published stories & author notifications on render
  useEffect(() => {
    const fetchStoriesAndNotifs = async () => {
      setLoadingStories(true);
      try {
        const queryParams = new URLSearchParams();
        if (categoryFilter !== "All") queryParams.append("category", categoryFilter);
        if (searchQuery) queryParams.append("search", searchQuery);

        const sRes = await fetch(`/api/stories?${queryParams.toString()}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setStories(sData);
        }

        // Fetch notifications if user is logged in
        if (activeUser) {
          const nRes = await fetch(`/api/notifications/${activeUser.uid}`);
          if (nRes.ok) {
            const nData = await nRes.json();
            setNotifications(nData);
          }
        }
      } catch (e) {
        console.error("Database connection failure", e);
      } finally {
        setLoadingStories(false);
      }
    };

    fetchStoriesAndNotifs();
  }, [categoryFilter, searchQuery, activeUser, currentView]);

  // Rotate Featured banner slide every 10 seconds
  useEffect(() => {
    if (stories.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIdx((prev) => (prev + 1) % Math.min(3, stories.length));
    }, 10000);
    return () => clearInterval(interval);
  }, [stories]);

  const handleAuthSuccess = (u: User) => {
    setActiveUser(u);
    localStorage.setItem("rishi_risk_user", JSON.stringify(u));
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem("rishi_risk_user");
    setCurrentView("home");
    setSelectedStory(null);
  };

  const handleToggleFollowAuthor = async (authorId: string) => {
    if (!activeUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch("/api/follows/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: activeUser.uid, followingId: authorId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.following) {
          setFollowingAuthorIds([...followingAuthorIds, authorId]);
        } else {
          setFollowingAuthorIds(followingAuthorIds.filter(id => id !== authorId));
        }

        // Re-get user details to sync followersCount
        const userRes = await fetch(`/api/users/${activeUser.uid}`);
        if (userRes.ok) {
          const updatedUser = await userRes.json();
          setActiveUser(updatedUser);
          localStorage.setItem("rishi_risk_user", JSON.stringify(updatedUser));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReadStory = (story: Story) => {
    // Check if story is premium and user is subscribed
    if (story.isPremium && !activeUser?.subscriptionActive) {
      if (!activeUser) {
        setShowAuthModal(true);
        return;
      }
      const confirmSub = window.confirm(
        `'${story.title}' is a Premium Novel. Would you like to subscribe to the Rishi Risk Premium Arc ($4.99/mo simulated payout) to unlock unlimited chapters?`
      );
      if (confirmSub) {
        // Upgrade subscription status dynamically
        const updatedUser = { ...activeUser, subscriptionActive: true };
        setActiveUser(updatedUser);
        localStorage.setItem("rishi_risk_user", JSON.stringify(updatedUser));
        // Push backend update
        fetch(`/api/users/${activeUser.uid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionActive: true })
        });
        alert("✓ Subscription simulated successfully! Premium novels unlocked.");
      } else {
        return;
      }
    }

    setSelectedStory(story);
    setCurrentView("read");
  };

  const handleMarkAllNotificationsRead = () => {
    if (!activeUser) return;
    fetch("/api/notifications/read-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUser.uid })
    });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setShowNotifPopover(false);
  };

  const featuredStory = stories[featuredIdx] || stories[0];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-300">
      {/* 1. Cinematic Animated Splash Screen overlay */}
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <div className="min-h-screen flex flex-col">
          {/* Top Navbar Header */}
          <nav className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800/60 px-4 md:px-8 py-3 flex items-center justify-between">
            {/* Left brand logo */}
            <div
              onClick={() => {
                setCurrentView("home");
                setSelectedStory(null);
                setCategoryFilter("All");
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4.5 h-4.5 text-black" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-widest uppercase tech-font text-glow text-white leading-none">
                  Rishi Risk
                </h1>
                <span className="text-[8px] uppercase tracking-[0.3em] text-amber-500 font-mono">Novel Realm</span>
              </div>
            </div>

            {/* Middle Search bar */}
            <div className="flex-1 max-w-md mx-6 hidden md:block">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search novels, authors, or tag keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 transition-colors rounded-full py-1.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Home Link */}
              <button
                onClick={() => {
                  setCurrentView("home");
                  setSelectedStory(null);
                }}
                className={`p-2 rounded-lg transition-colors cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-900/50 ${
                  currentView === "home" ? "text-amber-500 font-semibold" : ""
                }`}
                title="Explore Novels"
              >
                <Compass className="w-4.5 h-4.5" />
              </button>

              {/* Author Dashboard (Requires User) */}
              {activeUser && (
                <button
                  onClick={() => {
                    setCurrentView("dashboard");
                    setSelectedStory(null);
                  }}
                  className={`p-2 rounded-lg transition-colors cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-900/50 ${
                    currentView === "dashboard" ? "text-amber-500 font-semibold" : ""
                  }`}
                  title="Author Console Dashboard"
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                </button>
              )}

              {/* Administrative Gateway Panel */}
              {activeUser?.role === "admin" && (
                <button
                  onClick={() => {
                    setCurrentView("admin");
                    setSelectedStory(null);
                  }}
                  className={`p-2 rounded-lg transition-colors cursor-pointer text-zinc-400 hover:text-amber-500 hover:bg-amber-950/15 ${
                    currentView === "admin" ? "bg-amber-950/20 text-amber-500 border border-amber-500/10" : ""
                  }`}
                  title="Admin Moderation Board"
                >
                  <ShieldAlert className="w-4.5 h-4.5" />
                </button>
              )}

              {/* Notification bell Popover toggle */}
              {activeUser && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifPopover(!showNotifPopover)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/50 cursor-pointer relative"
                    title="Chapter Alerts"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </button>

                  {/* Popover content */}
                  {showNotifPopover && (
                    <div className="absolute right-0 mt-2 w-72 bg-[#0e0e10] border border-zinc-800 rounded-xl shadow-2xl glass-panel p-4 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Chapter Alerts</span>
                        <button
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold uppercase"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <p className="text-[11px] text-zinc-500 text-center py-4">No recent chapter alerts.</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-2.5 rounded-lg text-xs leading-normal ${
                                n.read ? "bg-zinc-900/10 opacity-60" : "bg-amber-950/10 border-l-2 border-amber-500 text-zinc-200"
                              }`}
                            >
                              <h6 className="font-bold">{n.title}</h6>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{n.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Login profile status buttons */}
              {activeUser ? (
                <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                  <img
                    src={activeUser.photoURL}
                    alt={activeUser.displayName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-zinc-850"
                  />
                  <div className="hidden lg:block">
                    <span className="text-xs font-semibold text-zinc-350 block truncate max-w-[100px]">
                      {activeUser.displayName}
                    </span>
                    {activeUser.subscriptionActive && (
                      <span className="text-[8px] uppercase tracking-wider font-mono text-amber-500 block">
                        VIP Subscriber
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 px-1.5 rounded hover:bg-zinc-900 hover:text-white text-zinc-500 transition-colors"
                    title="Log Out Pen Name"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-lg shadow-md cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}
            </div>
          </nav>

          {/* Core Central Workspace */}
          <main className="flex-grow">
            {/* View ROUTER */}

            {/* VIEW: HOME / EXPLORE INDEX */}
            {currentView === "home" && (
              <>
                {/* 1. Cinematic Hero Featured Slider block */}
                {featuredStory && !categoryFilter && !searchQuery && (
                  <div className="relative w-full h-[320px] md:h-[400px] bg-zinc-950 overflow-hidden border-b border-zinc-900 group select-none">
                    {/* Blurred dynamic canvas back */}
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-15"
                      style={{ backgroundImage: `url(${featuredStory.coverImage})` }}
                    />

                    {/* Left overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

                    {/* Central Hero Info box */}
                    <div className="absolute inset-0 max-w-5xl mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 z-10">
                      <div className="max-w-xl space-y-4">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold">
                            Featured Novel Arc
                          </span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase font-sans">
                          {featuredStory.title}
                        </h2>

                        <p className="text-zinc-400 text-xs md:text-sm line-clamp-3 font-light leading-relaxed">
                          {featuredStory.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            onClick={() => handleReadStory(featuredStory)}
                            className="py-2.5 px-6 font-bold uppercase tracking-wider bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black text-xs rounded-full shadow-lg transition-transform transform active:scale-95 cursor-pointer block"
                          >
                            Explore Novel
                          </button>
                          <span className="text-xs text-zinc-500 font-mono">
                            Written by {featuredStory.authorName}
                          </span>
                        </div>
                      </div>

                      {/* Display featured book cover */}
                      <div className="w-36 md:w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-zinc-800 rotate-1 hidden sm:block shrink-0">
                        <img
                          src={featuredStory.coverImage}
                          alt={featuredStory.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. YouTube-Style Categories filter pills */}
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
                  {/* Category Pills Slider row */}
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {["All", "Sci-Fi", "Fantasy", "Thriller", "Horror", "Romance", "Realism"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-full py-1.5 px-4 text-xs font-semibold uppercase tracking-wider border cursor-pointer shrink-0 transition-colors ${
                          categoryFilter === cat
                            ? "bg-amber-500 border-amber-400 text-black font-bold"
                            : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="border-b border-zinc-900 my-6" />

                  {/* 3. Books listing catalog grid */}
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">
                        {categoryFilter === "All" ? "Exploration Feed" : `${categoryFilter} Novels`}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Discovered works ({stories.length})</p>
                    </div>
                  </div>

                  {loadingStories ? (
                    <div className="min-h-[250px] flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                        Synthesizing novels catalog...
                      </span>
                    </div>
                  ) : stories.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-950 rounded-2xl border border-zinc-900">
                      <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-zinc-300">No matching novels discovered</h4>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                        We couldn't locate stories matching your query. Explore other topics or publish yours!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          onClick={() => handleReadStory(story)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* VIEW: READING VIEW */}
            {currentView === "read" && selectedStory && (
              <ReadingView
                story={selectedStory}
                user={activeUser}
                onBack={() => {
                  setCurrentView("home");
                  setSelectedStory(null);
                }}
                onFollowAuthor={handleToggleFollowAuthor}
                isFollowingAuthor={followingAuthorIds.includes(selectedStory.authorId)}
                onUserAuthRequired={() => setShowAuthModal(true)}
              />
            )}

            {/* VIEW: NOVEL EDITOR STUDIO */}
            {currentView === "edit-story" && activeUser && (
              <StoryEditor
                user={activeUser}
                editingStory={selectedStory}
                onBack={() => {
                  setCurrentView("dashboard");
                  setSelectedStory(null);
                }}
                onSaveSuccess={(saved) => {
                  // Re-fetch stories to update state lists
                  setSelectedStory(null);
                }}
              />
            )}

            {/* VIEW: AUTHOR DASHBOARD */}
            {currentView === "dashboard" && activeUser && (
              <Dashboard
                user={activeUser}
                stories={stories}
                onWriteNewStory={() => {
                  setSelectedStory(null);
                  setCurrentView("edit-story");
                }}
                onEditStory={(story) => {
                  setSelectedStory(story);
                  setCurrentView("edit-story");
                }}
              />
            )}

            {/* VIEW: ADMIN PANEL */}
            {currentView === "admin" && activeUser?.role === "admin" && (
              <AdminPanel
                user={activeUser}
                stories={stories}
                onDeleteStory={(id) => {
                  setStories(stories.filter((s) => s.id !== id));
                }}
                onUpdateStoryListing={(updated) => {
                  setStories(stories.map((s) => (s.id === updated.id ? updated : s)));
                }}
              />
            )}
          </main>

          {/* Immersive Platform Footer */}
          <footer className="footer-panel bg-[#04060b] py-8 border-t border-zinc-950 mt-auto select-none">
            <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-600">
                  © 2026 RISHI RISK COSMIC STUDIOS INC.
                </span>
              </div>

              <div className="flex gap-4 text-[10px] font-mono tracking-widest uppercase">
                <span className="text-zinc-650">Quantum sector 7 verified and compiled</span>
              </div>
            </div>
          </footer>

          {/* Standard Authentication popups modal */}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        </div>
      )}
    </div>
  );
}
