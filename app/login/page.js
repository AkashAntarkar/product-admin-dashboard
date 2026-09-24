"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, isReady, login } = useAuth();
  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) router.replace("/products");
  }, [isReady, user, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    // Guards against a user mashing the Login button: once a request
    // is in flight, further clicks are ignored until it settles.
    if (isSubmitting) return;

    if (!username.trim() || !password.trim()) {
      setError("Enter both a username and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await login(username.trim(), password);
      router.replace("/products");
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl text-ink">Product Admin</h1>
          <p className="mt-2 text-sm text-ink/60">Sign in to manage the catalog.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-line bg-white p-6 shadow-panel"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-ink">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm focus-visible:border-brand-600"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm focus-visible:border-brand-600"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-rust">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Log in"}
          </button>

          <p className="mt-4 text-center text-xs text-ink/50">
            Demo credentials are pre-filled — username <code>emilys</code>, password{" "}
            <code>emilyspass</code>.
          </p>
        </form>
      </div>
    </div>
  );
}
