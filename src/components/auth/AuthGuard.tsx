"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Compass } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Bypass GlobeTrotter AuthGuard for LabelGuard sub-application routes
  const isLabelGuard = pathname?.startsWith('/dashboard/LabelGuard');

  useEffect(() => {
    if (isLabelGuard) {
      setIsChecking(false);
      return;
    }
    const verify = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    verify();
  }, [checkAuth, isLabelGuard]);

  useEffect(() => {
    if (!isLabelGuard && !isChecking && !isAuthenticated) {
      router.push("/login");
    }
  }, [isChecking, isAuthenticated, router, isLabelGuard]);

  if (isLabelGuard) {
    return <>{children}</>;
  }

  if (isChecking || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg animate-bounce">
            <Compass className="w-9 h-9 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div className="space-y-1.5 text-center">
            <h3 className="font-display font-bold text-base text-text-main">Verifying your journey...</h3>
            <p className="text-xs text-text-muted">Securing connection to GlobeTrotter</p>
          </div>
          <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
