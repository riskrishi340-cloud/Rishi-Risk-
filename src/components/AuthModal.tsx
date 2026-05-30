import React, { useState } from "react";
import { X, Mail, Phone, Lock, User as UserIcon, Camera, Compass } from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup" | "forgot">("login");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  // Email form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60");

  // Phone form values
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleQuickLogin = async (preset: "admin" | "user") => {
    setLoading(true);
    setError("");
    const uid = preset === "admin" ? "risk-rishi-author" : "guest-user";
    const payload = preset === "admin" ? {
      uid,
      displayName: "Rishi Risk",
      email: "riskrishi340@gmail.com",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
    } : {
      uid,
      displayName: "Novice Reader",
      email: "reader@rishirisk.com",
      photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
    };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Could not log in");
      const user = await res.json();
      onAuthSuccess(user);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed preset sign-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (tab === "forgot") {
      setTimeout(() => {
        setMessage(`Password reset email has been sent to ${email}. Check your inbox!`);
        setLoading(false);
      }, 800);
      return;
    }

    if (authMethod === "phone" && !otpSent) {
      if (!phone) {
        setError("Please enter a valid phone number");
        setLoading(false);
        return;
      }
      setTimeout(() => {
        setOtpSent(true);
        setMessage("Verification code sent! Enter '123456' to confirm.");
        setLoading(false);
      }, 1000);
      return;
    }

    const payload = {
      uid: `user-${Date.now()}`,
      displayName: displayName || email.split("@")[0] || "Avid Reader",
      email: email || `${phone}@rishirisk.com`,
      photoURL: avatar,
      bio: bio || "Passionate about rich stories of Rishi Risk.",
    };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Authentication failed");
      const user = await res.json();
      onAuthSuccess(user);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed backend authentication.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#09090b] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden glass-panel">
        {/* Banner */}
        <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />

        {/* Header */}
        <div className="px-6 pt-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-wider font-sans text-white">
              {tab === "login" ? "Welcome Back" : tab === "signup" ? "Create Account" : "Reset Password"}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Unlock Rishi Risk story archives</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs rounded-lg">
              {message}
            </div>
          )}

          {/* Quick Preset Selector (Developer-Friendly) */}
          {tab !== "forgot" && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/10 border border-amber-500/10">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500 block mb-2 font-bold">
                ⚡ Interactive Fast-Pass Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin("admin")}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  Rishi Risk (Admin)
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin("user")}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-zinc-800/30 hover:bg-zinc-800/55 border border-zinc-700/30 text-zinc-300 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Novice Reader
                </button>
              </div>
            </div>
          )}

          {tab !== "forgot" && (
            <div className="flex gap-4 border-b border-zinc-900 mb-6 font-mono">
              <button
                onClick={() => setAuthMethod("email")}
                className={`pb-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
                  authMethod === "email" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-zinc-300"
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setAuthMethod("phone")}
                className={`pb-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
                  authMethod === "phone" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-zinc-300"
                }`}
              >
                Phone Number
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMethod === "email" && tab !== "forgot" && (
              <>
                {tab === "signup" && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                      Pen Name (Display Name)
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. J.R.R. Tolkien"
                        className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="writer@rishirisk.com"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {tab === "signup" && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                      Bio / Writer Philosophy
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the readers what moves you..."
                      className="w-full h-16 bg-[#121212] border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>
                )}

                {tab === "signup" && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                      Avatar URL
                    </label>
                    <div className="relative">
                      <Camera className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://images.unsplash..."
                        className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {authMethod === "phone" && tab !== "forgot" && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 px-3 text-sm text-white tracking-[0.5em] text-center font-bold focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                )}
              </>
            )}

            {tab === "forgot" && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="forgot@writer.com"
                    className="w-full bg-[#121212] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {tab === "login" && authMethod === "email" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setTab("forgot")}
                  className="text-xs text-amber-500 hover:text-amber-400 font-semibold transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold tracking-wider uppercase rounded-lg text-xs shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-55 cursor-pointer"
            >
              {loading
                ? "Connecting..."
                : tab === "login"
                ? authMethod === "phone" && !otpSent
                  ? "Send Verification Code"
                  : "Sign In Securely"
                : tab === "signup"
                ? "Begin Writing Journey"
                : "Reset Password"}
            </button>
          </form>

          {/* Social login divider */}
          {tab !== "forgot" && (
            <div className="mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-900" />
                <span className="flex-shrink mx-4 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  Or Join Rishi Risk Via
                </span>
                <div className="flex-grow border-t border-zinc-900" />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin("user")}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-350 text-xs font-semibold cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          )}

          {/* Bottom redirection */}
          <div className="mt-6 text-center text-xs">
            {tab === "login" ? (
              <p className="text-zinc-500">
                New to Rishi Risk?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="font-semibold text-amber-500 hover:text-amber-400 cursor-pointer"
                >
                  Create Pen Name
                </button>
              </p>
            ) : (
              <p className="text-zinc-500">
                Already have an identity?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="font-semibold text-amber-500 hover:text-amber-400 cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
