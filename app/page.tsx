"use client";

import { InfoCard } from "@/components/info-card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  // Redirect to wallet page on load
  useEffect(() => {
    router.push("/wallet");
  }, [router]);

  return (
    <div className="flex h-full justify-center items-center">
      <InfoCard
        title="Welcome"
        description="Redirecting to your wallet..."
      />
    </div>
  );
}
