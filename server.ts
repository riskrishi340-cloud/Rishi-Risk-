import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Server-side Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    // Check if key is empty or standard default
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY environment variable is not configured. AI features will fallback to client simulation.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-Memory / filesystem database path for bulletproof full-stack persistence
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorPhoto: string;
  chapters: { id: string; title: string; content: string; published: boolean; createdAt: string }[];
  draft: boolean;
  isPremium: boolean;
  viewsCount: number;
  downloadsCount: number;
  ratingAverage: number;
  ratingCount: number;
  commentsCount: number;
  likesCount: number;
  price?: number;
  createdAt: string;
}

interface DB {
  stories: Story[];
  users: {
    [uid: string]: {
      uid: string;
      displayName: string;
      email: string;
      photoURL: string;
      bio: string;
      role: "user" | "admin";
      followersCount: number;
      followingCount: number;
      earnings: number;
      subscriptionActive: boolean;
      createdAt: string;
      socialLinks?: { twitter?: string; github?: string; instagram?: string };
    };
  };
  comments: {
    id: string;
    storyId: string;
    userId: string;
    userName: string;
    userPhoto: string;
    content: string;
    parentId?: string;
    createdAt: string;
  }[];
  likes: { userId: string; storyId: string }[];
  follows: { followerId: string; followingId: string }[];
  ratings: { userId: string; storyId: string; score: number }[];
  notifications: {
    id: string;
    userId: string;
    title: string;
    body: string;
    storyId?: string;
    read: boolean;
    createdAt: string;
  }[];
}

// Initialize filesystem db
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDB(): DB {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (e) {
      console.error("Error parsing Database JSON, resetting database.", e);
    }
  }

  // Seed default database
  const defaultDB: DB = {
    stories: [
      {
        id: "story-1",
        title: "The Code of the Antigravity Particle",
        description: "A young engineer uncovers a dark secret hidden deep inside Google Quantum Lab's cloud databases, threatening the laws of physics themselves.",
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60",
        category: "Sci-Fi",
        tags: ["Quantum", "Thriller", "Adventure", "AI"],
        authorId: "risk-rishi-author",
        authorName: "Rishi Risk",
        authorPhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
        chapters: [
          {
            id: "chapter-1",
            title: "The Anomaly at Sector 7",
            content: "It was exactly 18:23 UTC when the sensor rails at the Antigravity Core first picked up the deviation. Dr. Rishi stood before the giant obsidian console, watching the blue light flicker in a pattern that is mathematically impossible. 'This shouldn't be happening,' he muttered...",
            published: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: "chapter-2",
            title: "Decoding the Whisper",
            content: "After downloading the telemetry log as a raw raw-binary, he loaded it into the compiler. The compiler didn't crash; instead, it began translating the pulses into something resembling ancient Sanskrit...",
            published: true,
            createdAt: new Date().toISOString(),
          }
        ],
        draft: false,
        isPremium: false,
        viewsCount: 1540,
        downloadsCount: 382,
        ratingAverage: 4.8,
        ratingCount: 124,
        commentsCount: 2,
        likesCount: 94,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      {
        id: "story-2",
        title: "Empire of Silicon & Spice",
        description: "An alternate-history epic set in ancient India, where cybernetic enhancements meet royal power struggles and political subversion.",
        coverImage: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=600&auto=format&fit=crop&q=60",
        category: "Fantasy",
        tags: ["Cyberpunk", "India", "Empire", "Magic"],
        authorId: "rishi-cyber",
        authorName: "Vikram Dev",
        authorPhoto: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=60",
        chapters: [
          {
            id: "chapter-1",
            title: "The Copper Lotus",
            content: "The Emperor's guard didn't possess human eyes. They had copper-rimmed optical sensors spinning inside their skull cavities, sensing the thermal heat signatures of the street performers...",
            published: true,
            createdAt: new Date().toISOString(),
          }
        ],
        draft: false,
        isPremium: true,
        viewsCount: 2843,
        downloadsCount: 512,
        ratingAverage: 4.9,
        ratingCount: 184,
        commentsCount: 1,
        likesCount: 243,
        price: 9.99,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      }
    ],
    users: {
      "risk-rishi-author": {
        uid: "risk-rishi-author",
        displayName: "Rishi Risk",
        email: "riskrishi340@gmail.com",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
        bio: "Creator of Rishi Risk Story Platform. Developer & novelist explorer.",
        role: "admin",
        followersCount: 5200,
        followingCount: 120,
        earnings: 1250.75,
        subscriptionActive: true,
        createdAt: new Date().toISOString(),
        socialLinks: { twitter: "@riskrishi", facebook: "facebook.com/riskrishi" } as any,
      },
      "guest-user": {
        uid: "guest-user",
        displayName: "Novice Reader",
        email: "reader@rishirisk.com",
        photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
        bio: "Passionate reader of tech thrillers and historic fantasy novels.",
        role: "user",
        followersCount: 12,
        followingCount: 4,
        earnings: 0.0,
        subscriptionActive: false,
        createdAt: new Date().toISOString(),
      },
    },
    comments: [
      {
        id: "comment-1",
        storyId: "story-1",
        userId: "guest-user",
        userName: "Novice Reader",
        userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
        content: "This is hands-down the best tech thriller I have read in 2026! The antigravity mechanics actually make scientific sense.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: "comment-2",
        storyId: "story-1",
        userId: "risk-rishi-author",
        userName: "Rishi Risk",
        userPhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
        content: "Thank you! Keep reading - next chapter drops tomorrow with more details on constraints.",
        parentId: "comment-1",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      }
    ],
    likes: [
      { userId: "guest-user", storyId: "story-1" }
    ],
    follows: [
      { followerId: "guest-user", followingId: "risk-rishi-author" }
    ],
    ratings: [
      { userId: "guest-user", storyId: "story-1", score: 5 }
    ],
    notifications: [
      {
        id: "notif-1",
        userId: "guest-user",
        title: "New Chapter Alert!",
        body: "Rishi Risk added Chapter 2 to 'The Code of the Antigravity Particle'!",
        storyId: "story-1",
        read: false,
        createdAt: new Date().toISOString(),
      }
    ]
  };
  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(db: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving Database JSON", e);
  }
}

// Global server state cache
const dbState = loadDB();

// API ROUTES:
// 1. Stories ENDPOINTS
app.get("/api/stories", (req, res) => {
  const { category, search, authorId } = req.query;
  let filtered = [...dbState.stories];

  if (category && category !== "All") {
    filtered = filtered.filter(s => s.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.authorName.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (authorId) {
    filtered = filtered.filter(s => s.authorId === authorId);
  }

  res.json(filtered);
});

app.get("/api/stories/:id", (req, res) => {
  const story = dbState.stories.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: "Story not found" });
  }

  // Auto-increment view counts for engagement
  story.viewsCount += 1;
  saveDB(dbState);

  res.json(story);
});

app.post("/api/stories", (req, res) => {
  const { title, description, coverImage, category, tags, authorId, authorName, authorPhoto, isPremium, price, draft } = req.body;

  if (!title || !category || !authorId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newStory: Story = {
    id: `story-${Date.now()}`,
    title,
    description: description || "",
    coverImage: coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60",
    category,
    tags: tags || [],
    authorId,
    authorName,
    authorPhoto: authorPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
    chapters: [],
    draft: !!draft,
    isPremium: !!isPremium,
    viewsCount: 0,
    downloadsCount: 0,
    ratingAverage: 0,
    ratingCount: 0,
    commentsCount: 0,
    likesCount: 0,
    price: price ? parseFloat(price) : undefined,
    createdAt: new Date().toISOString(),
  };

  dbState.stories.unshift(newStory);
  saveDB(dbState);

  // Trigger Notification to followers
  const followers = dbState.follows.filter(f => f.followingId === authorId);
  followers.forEach(follower => {
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-${Math.random()}`,
      userId: follower.followerId,
      title: "New Novel alert!",
      body: `${authorName} published a new story: ${title}`,
      storyId: newStory.id,
      read: false,
      createdAt: new Date().toISOString()
    });
  });
  saveDB(dbState);

  res.status(201).json(newStory);
});

// Update standard story
app.put("/api/stories/:id", (req, res) => {
  const storyIndex = dbState.stories.findIndex(s => s.id === req.params.id);
  if (storyIndex === -1) {
    return res.status(404).json({ error: "Story not found" });
  }

  const existingStory = dbState.stories[storyIndex];
  const { title, description, coverImage, category, tags, isPremium, price, draft, chapters } = req.body;

  dbState.stories[storyIndex] = {
    ...existingStory,
    title: title !== undefined ? title : existingStory.title,
    description: description !== undefined ? description : existingStory.description,
    coverImage: coverImage !== undefined ? coverImage : existingStory.coverImage,
    category: category !== undefined ? category : existingStory.category,
    tags: tags !== undefined ? tags : existingStory.tags,
    isPremium: isPremium !== undefined ? isPremium : existingStory.isPremium,
    price: price !== undefined ? price : existingStory.price,
    draft: draft !== undefined ? draft : existingStory.draft,
    chapters: chapters !== undefined ? chapters : existingStory.chapters,
  };

  saveDB(dbState);
  res.json(dbState.stories[storyIndex]);
});

app.delete("/api/stories/:id", (req, res) => {
  const filtered = dbState.stories.filter(s => s.id !== req.params.id);
  if (filtered.length === dbState.stories.length) {
    return res.status(404).json({ error: "Story not found" });
  }
  dbState.stories = filtered;
  saveDB(dbState);
  res.json({ success: true, message: "Story deleted successfully" });
});

// CHAPTERS MANIPULATION
app.post("/api/stories/:id/chapters", (req, res) => {
  const story = dbState.stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: "Story not found" });

  const { title, content, published } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Missing chapter title or content" });

  const newChapter = {
    id: `chapter-${Date.now()}`,
    title,
    content,
    published: published !== undefined ? published : true,
    createdAt: new Date().toISOString(),
  };

  story.chapters.push(newChapter);
  saveDB(dbState);

  // Send update notifications if published
  if (newChapter.published) {
    const followers = dbState.follows.filter(f => f.followingId === story.authorId);
    followers.forEach(follower => {
      dbState.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random()}`,
        userId: follower.followerId,
        title: "New Chapter Published!",
        body: `${story.authorName} released chapter '${title}' in '${story.title}'!`,
        storyId: story.id,
        read: false,
        createdAt: new Date().toISOString()
      });
    });
    saveDB(dbState);
  }

  res.json(story);
});

// Download Increment route
app.post("/api/stories/:id/download", (req, res) => {
  const story = dbState.stories.find(s => s.id === req.params.id);
  if (!story) return res.status(404).json({ error: "Story not found" });
  story.downloadsCount += 1;
  saveDB(dbState);
  res.json({ success: true, downloadsCount: story.downloadsCount });
});

// Rating submissions
app.post("/api/stories/:id/rate", (req, res) => {
  const { userId, rating } = req.body;
  const story = dbState.stories.find(s => s.id === req.params.id);

  if (!story) return res.status(404).json({ error: "Story not found" });
  if (!userId || !rating) return res.status(400).json({ error: "Missing required fields" });

  const stars = Math.min(5, Math.max(1, rating));
  // Check if existing rating
  const existingIndex = dbState.ratings.findIndex(r => r.userId === userId && r.storyId === story.id);
  if (existingIndex !== -1) {
    dbState.ratings[existingIndex].score = stars;
  } else {
    dbState.ratings.push({ userId, storyId: story.id, score: stars });
  }

  // Re-calculate rating
  const storyRatings = dbState.ratings.filter(r => r.storyId === story.id);
  const total = storyRatings.reduce((sum, r) => sum + r.score, 0);
  story.ratingCount = storyRatings.length;
  story.ratingAverage = parseFloat((total / storyRatings.length).toFixed(1));

  saveDB(dbState);
  res.json({ success: true, ratingAverage: story.ratingAverage, ratingCount: story.ratingCount });
});

// Profile database fetching and updates
app.get("/api/users/:uid", (req, res) => {
  const profile = dbState.users[req.params.uid];
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  res.json(profile);
});

app.post("/api/users", (req, res) => {
  const { uid, displayName, email, photoURL } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  if (!dbState.users[uid]) {
    dbState.users[uid] = {
      uid,
      displayName: displayName || "New Reader",
      email: email || "",
      photoURL: photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
      bio: "Joined Rishi Risk to read elite novels.",
      role: email === "riskrishi340@gmail.com" ? "admin" : "user",
      followersCount: 0,
      followingCount: 0,
      earnings: 0.0,
      subscriptionActive: false,
      createdAt: new Date().toISOString(),
    };
    saveDB(dbState);
  }

  res.json(dbState.users[uid]);
});

app.put("/api/users/:uid", (req, res) => {
  const user = dbState.users[req.params.uid];
  if (!user) return res.status(404).json({ error: "User not found" });

  const { displayName, bio, photoURL, socialLinks, subscriptionActive } = req.body;

  if (displayName) user.displayName = displayName;
  if (bio !== undefined) user.bio = bio;
  if (photoURL) user.photoURL = photoURL;
  if (socialLinks) user.socialLinks = socialLinks;
  if (subscriptionActive !== undefined) user.subscriptionActive = subscriptionActive;

  saveDB(dbState);
  res.json(user);
});

// 2. COMMENTS ENDPOINTS
app.get("/api/stories/:id/comments", (req, res) => {
  const storyComments = dbState.comments.filter(c => c.storyId === req.params.id);
  res.json(storyComments);
});

app.post("/api/comments", (req, res) => {
  const { storyId, userId, userName, userPhoto, content, parentId } = req.body;

  if (!storyId || !userId || !content) {
    return res.status(400).json({ error: "Missing required comment content" });
  }

  const newComment = {
    id: `comment-${Date.now()}`,
    storyId,
    userId,
    userName: userName || "Anonymous Writer",
    userPhoto: userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
    content,
    parentId,
    createdAt: new Date().toISOString(),
  };

  dbState.comments.push(newComment);

  // Increment comments count on story
  const story = dbState.stories.find(s => s.id === storyId);
  if (story) story.commentsCount += 1;

  saveDB(dbState);
  res.json(newComment);
});

app.delete("/api/comments/:id", (req, res) => {
  const comment = dbState.comments.find(c => c.id === req.params.id);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  dbState.comments = dbState.comments.filter(c => c.id !== req.params.id);

  const story = dbState.stories.find(s => s.id === comment.storyId);
  if (story && story.commentsCount > 0) story.commentsCount -= 1;

  saveDB(dbState);
  res.json({ success: true });
});

// 3. LIKES ROUTE
app.post("/api/likes/toggle", (req, res) => {
  const { userId, storyId } = req.body;
  if (!userId || !storyId) return res.status(400).json({ error: "Missing parameters" });

  const story = dbState.stories.find(s => s.id === storyId);
  if (!story) return res.status(404).json({ error: "Story not found" });

  const existingIndex = dbState.likes.findIndex(l => l.userId === userId && l.storyId === storyId);
  let liked = false;

  if (existingIndex !== -1) {
    dbState.likes.splice(existingIndex, 1);
    story.likesCount = Math.max(0, story.likesCount - 1);
  } else {
    dbState.likes.push({ userId, storyId });
    story.likesCount += 1;
    liked = true;

    // Send notifications to story writer
    if (userId !== story.authorId) {
      dbState.notifications.push({
        id: `notif-${Date.now()}`,
        userId: story.authorId,
        title: "New Like!",
        body: `${dbState.users[userId]?.displayName || "Someone"} liked your story '${story.title}'!`,
        storyId: story.id,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  saveDB(dbState);
  res.json({ liked, likesCount: story.likesCount });
});

// 4. FOLLOW ROUTE
app.post("/api/follows/toggle", (req, res) => {
  const { followerId, followingId } = req.body;
  if (!followerId || !followingId) return res.status(400).json({ error: "Missing followerId or followingId" });

  const follower = dbState.users[followerId];
  const following = dbState.users[followingId];

  if (!follower || !following) return res.status(404).json({ error: "User profile not found" });

  const idx = dbState.follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
  let followingState = false;

  if (idx !== -1) {
    dbState.follows.splice(idx, 1);
    following.followersCount = Math.max(0, following.followersCount - 1);
    follower.followingCount = Math.max(0, follower.followingCount - 1);
  } else {
    dbState.follows.push({ followerId, followingId });
    following.followersCount += 1;
    follower.followingCount += 1;
    followingState = true;

    // Create follow notification
    dbState.notifications.push({
      id: `notif-${Date.now()}`,
      userId: followingId,
      title: "New Follower!",
      body: `${follower.displayName} has started following you!`,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDB(dbState);
  res.json({ following: followingState, followersCount: following.followersCount });
});

// Notifications fetcher
app.get("/api/notifications/:userId", (req, res) => {
  const notifs = dbState.notifications.filter(n => n.userId === req.params.userId);
  res.json(notifs);
});

app.post("/api/notifications/read-all", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  dbState.notifications.forEach(n => {
    if (n.userId === userId) n.read = true;
  });

  saveDB(dbState);
  res.json({ success: true });
});

// Server-side administrative endpoints
app.get("/api/admin/overview", (req, res) => {
  const totalStories = dbState.stories.length;
  const totalUsers = Object.keys(dbState.users).length;
  const totalViews = dbState.stories.reduce((acc, s) => acc + s.viewsCount, 0);
  const totalDownloads = dbState.stories.reduce((acc, s) => acc + s.downloadsCount, 0);

  res.json({
    totalStories,
    totalUsers,
    totalViews,
    totalDownloads,
    recentUsers: Object.values(dbState.users).slice(-5),
    recentStories: dbState.stories.slice(0, 5),
  });
});

// 5. SERVER-SIDE GEMINI ENHANCER (utilizing @google/genai as requested, with graceful offline falls)
app.post("/api/gemini/assist", async (req, res) => {
  const { prompt, content, action } = req.body;

  if (!prompt && !content) {
    return res.status(400).json({ error: "Missing text, contents, or prompt inputs." });
  }

  try {
    const ai = getGeminiClient();
    let queryPrompt = "";

    if (action === "improve") {
      queryPrompt = `Act as an expert book editor. Enhance the flow, emotional resonance, vocabulary, and grammar of this story chapter text. Maintain the story's voice. Respond ONLY with the revised chapter, with no introductory, wrap-up or self-contained chat commentary. Keep the formatting beautiful. Here is the chapter:\n\n${content}`;
    } else if (action === "summary") {
      queryPrompt = `Generate a captivating 2-sentence synopsis for a book with this initial chapter. It must hook readers and highlight the stakes. Chapter:\n\n${content}`;
    } else if (action === "tags") {
      queryPrompt = `Analyze this story content and generate exactly 4 ideal tag keywords (e.g., Sci-Fi, Dark, Mystery, Thriller). Respond strictly with a comma-separated list of 4 tags. Story context:\n\n${content || prompt}`;
    } else if (action === "translate") {
      queryPrompt = `Translate this story chapter to English if it is in Hindi, or into beautiful Hindi if it is in English. Keep the artistic prose alive. Respond ONLY with the translated text without extra text. Text:\n\n${content}`;
    } else {
      queryPrompt = prompt || `${content}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: queryPrompt,
    });

    const aiText = response.text || "No response generated.";
    res.json({ result: aiText.trim() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Graceful offline simulated fallback for safe workspace preview
    let mockedResult = "";
    if (action === "improve") {
      mockedResult = `${content}\n\n*(AI Note: The editor finds this piece magnificent. To enable native live enhancements, add a valid Gemini API key in Settings > Secrets)*`;
    } else if (action === "summary") {
      mockedResult = "An incredible epic starting with high tension, secrets, and a race against destiny.";
    } else if (action === "tags") {
      mockedResult = "Thriller, Mystery, Drama, Epic";
    } else if (action === "translate") {
      mockedResult = `[Translated Version] ${content}\n\n(AI Native translation is currently simulated. Please connect your real Gemini API key)`;
    } else {
      mockedResult = "This story represents brilliant horizons! Add an API key for dynamic generation.";
    }

    res.json({ result: mockedResult, simulated: true });
  }
});

// Core Server Startup with Vite Middleware integration for seamless rendering
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Vite handles client routes after APIs
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rishi Risk Server successfully bound and running on http://localhost:${PORT}`);
  });
}

startServer();
