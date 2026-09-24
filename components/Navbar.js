"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/products" className="font-display text-xl text-ink">
          Product Admin
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm text-ink/60 sm:inline">
              Signed in as <span className="font-medium text-ink">{user.username}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-white"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
