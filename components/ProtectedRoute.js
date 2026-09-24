"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

// Only logged-in users can see the children of this component. We
// check localStorage (via AuthContext) on mount; until that check
// finishes we show a loader instead of flashing protected content.
export default function ProtectedRoute({ children }) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/login");
    }
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Checking your session..." />
      </div>
    );
  }

  return children;
}
