import React, { useState, useEffect } from "react";
import { Shield, Users, BookOpen, AlertCircle, Trash2, ShieldCheck, TrendingUp, CheckCircle, EyeOff, Eye } from "lucide-react";
import { Story, User, AdminStats } from "../types";

interface AdminPanelProps {
  user: User;
  stories: Story[];
  onDeleteStory: (storyId: string) => void;
  onUpdateStoryListing: (story: Story) => void;
}

export default function AdminPanel({ user, stories, onDeleteStory, onUpdateStoryListing }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [overview, setOverview] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"stories" | "users">("stories");

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.ok) {
          const data = await res.json();
          setOverview(data);

          // Get simulated list of profiles
          const rawUsers = [
            {
              uid: "risk-rishi-author",
              displayName: "Rishi Risk",
              email: "riskrishi340@gmail.com",
              photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
              bio: "Creator of Rishi Risk Story Platform. Developer & novelist explorer.",
              role: "admin" as const,
              followersCount: 5200,
              followingCount: 120,
              earnings: 1250.75,
              subscriptionActive: true,
              createdAt: "2026-05-30"
            },
            {
              uid: "guest-user",
              displayName: "Novice Reader",
              email: "reader@rishirisk.com",
              photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
              bio: "Passionate reader of tech thrillers and historic fantasy novels.",
              role: "user" as const,
              followersCount: 12,
              followingCount: 4,
              earnings: 0.0,
              subscriptionActive: false,
              createdAt: "2026-05-20"
            },
            {
              uid: "user-9281",
              displayName: "Vikram Dev",
              email: "vikram@empire.in",
              photoURL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=60",
              bio: "Writer of Alternate Historics.",
              role: "user" as const,
              followersCount: 184,
              followingCount: 12,
              earnings: 450.00,
              subscriptionActive: true,
              createdAt: "2026-05-18"
            }
          ];
          setUsers(rawUsers);
        }
      } catch (e) {
        console.error("Admin fetching error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [stories]);

  const handleToggleAdminRole = (uid: string) => {
    setUsers(
      users.map((u) => {
        if (u.uid === uid) {
          const updatedRole = u.role === "admin" ? "user" : "admin";
          // Simulate backend profile update
          fetch(`/api/users/${uid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: updatedRole })
          });
          return { ...u, role: updatedRole };
        }
        return u;
      })
    );
  };

  const handleFlagAndHideStory = async (story: Story) => {
    const updatedStoryDraft = !story.draft;
    try {
      const res = await fetch(`/api/stories/${story.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: updatedStoryDraft })
      });
      if (res.ok) {
        const saved = await res.json();
        onUpdateStoryListing(saved);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInappropriateContent = async (id: string) => {
    if (!window.confirm("Confirm permanent removal of this content from Rishi Risk databases?")) return;
    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleteStory(id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header element */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/25">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 block font-semibold">
              Rishi Risk Administration Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              Governing Panel
            </h1>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Row */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 shadow">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Users</span>
            <h3 className="text-lg font-bold text-zinc-200 mt-1">{overview.totalUsers}</h3>
          </div>
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 shadow">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Published Works</span>
            <h3 className="text-lg font-bold text-zinc-200 mt-1">{overview.totalStories}</h3>
          </div>
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 shadow">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Aggregate Views</span>
            <h3 className="text-lg font-bold text-zinc-200 mt-1">{overview.totalViews}</h3>
          </div>
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 shadow">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Downloads Flagged</span>
            <h3 className="text-lg font-bold text-zinc-200 mt-1">{overview.totalDownloads}</h3>
          </div>
        </div>
      )}

      {/* Navigation Sub Tabs */}
      <div className="flex gap-4 border-b border-zinc-900 mb-6">
        <button
          onClick={() => setActiveSubTab("stories")}
          className={`pb-3 text-xs uppercase font-mono tracking-widest border-b-2 font-semibold transition-colors cursor-pointer ${
            activeSubTab === "stories" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-350"
          }`}
        >
          Catalog Moderation ({stories.length})
        </button>
        <button
          onClick={() => setActiveSubTab("users")}
          className={`pb-3 text-xs uppercase font-mono tracking-widest border-b-2 font-semibold transition-colors cursor-pointer ${
            activeSubTab === "users" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500 hover:text-zinc-350"
          }`}
        >
          User Permissions ({users.length})
        </button>
      </div>

      {/* Mod content listings */}
      {activeSubTab === "stories" ? (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-zinc-400">
              Admin governing rules: Flagged stories set to "draft" mode are automatically hidden from reader search catalogs.
            </span>
          </div>

          <div className="space-y-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex gap-4 items-center min-w-0">
                  <img src={story.coverImage} className="w-10 h-14 object-cover rounded" />
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-zinc-200 truncate">{story.title}</h5>
                    <p className="text-xs text-zinc-500 mt-1 truncate">By {story.authorName} • {story.viewsCount} views</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end shrink-0 w-full sm:w-auto">
                  {/* Flag as draft/hidden button */}
                  <button
                    onClick={() => handleFlagAndHideStory(story)}
                    className={`py-1 px-3 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer ${
                      story.draft
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {story.draft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {story.draft ? "Show Novel" : "Flag & Hide"}
                  </button>

                  <button
                    onClick={() => handleDeleteInappropriateContent(story.id)}
                    className="p-1 px-2.5 bg-red-600/15 text-red-400 hover:text-white hover:bg-red-600 rounded text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-6 space-y-4">
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.uid}
                className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 flex items-center justify-between gap-4"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <img src={u.photoURL} alt={u.displayName} className="w-9 h-9 rounded-full object-cover border border-zinc-800" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-zinc-200 truncate">{u.displayName}</h5>
                      <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                        u.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-zinc-800/20 text-zinc-400 border border-zinc-700/20"
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{u.email || "No email"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleAdminRole(u.uid)}
                    disabled={u.uid === "risk-rishi-author"} // Prevent self lockout
                    className="py-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded cursor-pointer disabled:opacity-40"
                  >
                    {u.role === "admin" ? "Demote user" : "Grant Admin privileges"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
