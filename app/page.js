"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function Home() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    router.replace(user ? "/products" : "/login");
  }, [isReady, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader label="Loading..." />
    </div>
  );
}
