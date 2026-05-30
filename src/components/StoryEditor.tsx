import React, { useState } from "react";
import { ArrowLeft, Plus, Sparkles, Languages, Check, Tags, Wand2, Shield, Save, Eye, Trash2, Edit3, EyeOff } from "lucide-react";
import { Story, Chapter, User } from "../types";

interface StoryEditorProps {
  user: User;
  onBack: () => void;
  onSaveSuccess: (updatedStory: Story) => void;
  editingStory?: Story | null;
}

export default function StoryEditor({ user, onBack, onSaveSuccess, editingStory }: StoryEditorProps) {
  // Story details
  const [title, setTitle] = useState(editingStory?.title || "");
  const [description, setDescription] = useState(editingStory?.description || "");
  const [coverImage, setCoverImage] = useState(editingStory?.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60");
  const [category, setCategory] = useState(editingStory?.category || "Sci-Fi");
  const [tagsInput, setTagsInput] = useState(editingStory?.tags?.join(", ") || "");
  const [isPremium, setIsPremium] = useState(editingStory?.isPremium || false);
  const [price, setPrice] = useState(editingStory?.price?.toString() || "");

  // Chapters list
  const [chapters, setChapters] = useState<Chapter[]>(editingStory?.chapters || []);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  // Editor states
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");

  // AI assistant status
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Save/Publish the entire story metadata
  const handleSaveStoryMeta = async (draftValue: boolean = false) => {
    if (!title || !category) {
      setError("Please add a title and category to proceed.");
      return;
    }

    setSaving(true);
    setError("");

    const tagsArray = tagsInput.split(",").map(t => t.trim()).filter(t => t.length > 0);

    const payload = {
      title,
      description,
      coverImage,
      category,
      tags: tagsArray,
      isPremium,
      price: isPremium ? parseFloat(price) || 4.99 : undefined,
      draft: draftValue,
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      chapters: chapters,
    };

    try {
      const url = editingStory ? `/api/stories/${editingStory.id}` : "/api/stories";
      const method = editingStory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Could not preserve story.");
      const saved = await res.json();
      onSaveSuccess(saved);
      onBack();
    } catch (e: any) {
      setError(e.message || "Failed to catalog story.");
    } finally {
      setSaving(false);
    }
  };

  // Begin creating a new chapter
  const handleNewChapter = () => {
    setCurrentChapter({
      id: `new-${Date.now()}`,
      title: `Chapter ${chapters.length + 1}: `,
      content: "",
      published: true,
      createdAt: new Date().toISOString(),
    });
    setEditorTitle(`Chapter ${chapters.length + 1}: `);
    setEditorContent("");
    setAiResponse("");
  };

  // Select chapter to edit
  const handleEditChapter = (ch: Chapter) => {
    setCurrentChapter(ch);
    setEditorTitle(ch.title);
    setEditorContent(ch.content);
    setAiResponse("");
  };

  // Save single chapter
  const handleSaveChapter = () => {
    if (!editorTitle || !editorContent) {
      setError("Chapter absolute core parts (title or contents) are blank.");
      return;
    }

    if (!currentChapter) return;

    const isNew = currentChapter.id.startsWith("new-");
    const formattedCh: Chapter = {
      ...currentChapter,
      id: isNew ? `chapter-${Date.now()}` : currentChapter.id,
      title: editorTitle,
      content: editorContent,
    };

    if (isNew) {
      setChapters([...chapters, formattedCh]);
    } else {
      setChapters(chapters.map(c => c.id === currentChapter.id ? formattedCh : c));
    }

    setCurrentChapter(null);
    setEditorTitle("");
    setEditorContent("");
  };

  // Delete chapter
  const handleDeleteChapter = (chId: string) => {
    setChapters(chapters.filter(c => c.id !== chId));
    if (currentChapter?.id === chId) {
      setCurrentChapter(null);
    }
  };

  // Server-Side Gemini API integration calls
  const handleAiAction = async (action: "improve" | "summary" | "tags" | "translate") => {
    setAiLoading(true);
    setAiResponse("");

    const contentForAi = editorContent || description || title;

    try {
      const res = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: contentForAi,
        })
      });

      if (!res.ok) throw new Error("Gemini is thinking. Try again.");
      const data = await res.json();
      setAiResponse(data.result);

      if (action === "tags") {
        setTagsInput(data.result);
      }
    } catch (e: any) {
      setAiResponse(`Error talking to Gemini: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestedText = () => {
    if (!aiResponse) return;
    setEditorContent(aiResponse);
    setAiResponse("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-semibold mb-1 block">
              Writing Dashboard & Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              {editingStory ? "Edit Novel Core" : "Co-Write New Masterpiece"}
            </h1>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => handleSaveStoryMeta(true)}
            disabled={saving}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <EyeOff className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Save Draft</span>
          </button>
          <button
            onClick={() => handleSaveStoryMeta(false)}
            disabled={saving}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold shadow-lg transition-all transform active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">{editingStory ? "Update Story" : "Publish Story"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Main Form Split */}
      {!currentChapter ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metadata Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl space-y-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-3">
                Novel Artifacts
              </h3>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Story Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Quantum Antigravity"
                  className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Genre Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                >
                  <option value="Sci-Fi">Sci-Fi (Science Fiction-Tech)</option>
                  <option value="Fantasy">Fantasy & Mythic Lore</option>
                  <option value="Romance">Romance & Relationships</option>
                  <option value="Thriller">Psychological Thriller</option>
                  <option value="Horror">Cosmic Horror</option>
                  <option value="Realism">Drama & Social Realism</option>
                </select>
              </div>

              {/* Cover image input */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Cover Image URL
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com..."
                    className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  />
                  {coverImage && (
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive tag list */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Tags (Comma-Separated)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Quantum, Thriller, Rishi, Alien"
                    className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleAiAction("tags")}
                    className="absolute right-2 top-1.5 p-1 rounded bg-amber-900/40 text-amber-500 hover:text-white transition-colors cursor-pointer"
                    title="Let Gemini generate tags"
                  >
                    <Wand2 className="w-4 h-4 animate-pulse" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5 font-light">
                  Tip: Click the magic wand to let Gemini auto-generate tags!
                </p>
              </div>

              {/* Monetization details */}
              <div className="border-t border-zinc-900 pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer">
                    💎 Premium Novel (Subscribers Only)
                  </label>
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="w-4 h-4 text-amber-500 bg-[#121212] border-zinc-800 rounded"
                  />
                </div>
                {isPremium && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">
                      Unlock Price (Individual Chapters Purchase)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="4.99"
                        className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chapters Management Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                    Novel Chapters ({chapters.length})
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Add, edit, or remove paragraphs and sub-stories</p>
                </div>
                <button
                  onClick={handleNewChapter}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-amber-550/10 hover:bg-amber-550/20 text-amber-500 font-bold border border-amber-500/20 text-xs rounded-lg uppercase cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Chapter
                </button>
              </div>

              {chapters.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-900 rounded-xl">
                  <Edit3 className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-zinc-400">Chapters are currently empty</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    A novel is nothing without pages! Add your first chapter using the writer studio.
                  </p>
                  <button
                    onClick={handleNewChapter}
                    className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    Create Chapter 1
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-500">
                            #{idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-100 truncate">
                            {ch.title}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 truncate max-w-lg">
                          {ch.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditChapter(ch)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit text"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(ch.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Delete chapter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Synopsis overview */}
            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                  Novel Summary / Description
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Gets displayed on story discovery details</p>
              </div>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="The story details of an amazing secret unfolding..."
                  className="w-full h-32 bg-[#121212] border border-zinc-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors resize-none"
                />
                <button
                  type="button"
                  onClick={() => handleAiAction("summary")}
                  className="absolute right-3 bottom-3 py-1.5 px-3 bg-amber-950/20 text-amber-500 hover:text-amber-300 border border-amber-500/20 text-xs rounded-md shadow-md flex items-center gap-1 cursor-pointer font-bold"
                  title="Generate synopsis"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Auto Summarize
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Focused Chapter Writer Panel */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main workspace */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                  Interactive Chapter Canvas
                </span>
                <span className="text-xs text-zinc-500">Word count: {editorContent ? editorContent.split(/\s+/).filter(Boolean).length : 0}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Chapter Label
                </label>
                <input
                  type="text"
                  required
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="e.g. Chapter 1: The Dark Forest"
                  className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2.5 px-3 font-semibold text-lg text-white focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Story Content Prose
                </label>
                <textarea
                  required
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="Start penning down the epic story here..."
                  className="w-full h-96 bg-[#121212] border border-zinc-800 rounded-lg p-4 text-sm text-zinc-100 font-serif leading-relaxed tracking-wide focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors resize-y shadow-inner"
                />
              </div>

              {/* Back & Forward elements */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setCurrentChapter(null)}
                  className="py-2 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={handleSaveChapter}
                  className="py-2 px-5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-wider text-xs uppercase cursor-pointer"
                >
                  Back to Story Setup
                </button>
              </div>
            </div>
          </div>

          {/* AI Writer Sidebar Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-amber-550/10 rounded-lg border border-amber-500/20">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">
                    Gemini AI Assistant
                  </h4>
                  <span className="text-[9px] uppercase font-mono text-zinc-500">
                    Server-Side @google/genai
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-4 leading-normal">
                Let Rishi Risk's server-side Gemini assist optimize your story. Make edits, then apply them.
              </p>

              {/* Action grid button stack */}
              <div className="space-y-2 mb-6">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAiAction("improve")}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Wand2 className="w-3.5 h-3.5 text-amber-500" /> Improve Grammar & Flow
                  </span>
                </button>

                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAiAction("translate")}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Languages className="w-3.5 h-3.5 text-amber-500" /> Translate Hindi-English
                  </span>
                </button>
              </div>

              {/* AI suggestion view section */}
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-2">
                  Gemini Generation Output
                </span>

                <div className="flex-grow min-h-[220px] max-h-[300px] bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs overflow-y-auto text-zinc-300 font-sans leading-normal select-text">
                  {aiLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-mono">
                        Querying Sector 7 AI...
                      </span>
                    </div>
                  ) : aiResponse ? (
                    <div className="whitespace-pre-wrap">{aiResponse}</div>
                  ) : (
                    <span className="text-zinc-650 italic">
                      AI suggestions will generate here. Highlight or edit content to try!
                    </span>
                  )}
                </div>

                {aiResponse && !aiLoading && (
                  <button
                    type="button"
                    onClick={applyAiSuggestedText}
                    className="mt-3 w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider text-[10px] uppercase flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Apply to Chapter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
