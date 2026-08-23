"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    verify();
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isChecking, isAuthenticated, router]);

  if (isChecking || isAuthenticated) {
    return null; // Minimal flash prevention
  }

  return <>{children}</>;
}
