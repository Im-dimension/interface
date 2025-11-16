"use client";

import { InfoCard } from "@/components/info-card";

export default function StorePage() {
  return (
    <div className="flex h-full justify-center items-center overflow-y-auto space-y-4 md:space-y-6">
      <InfoCard
        title="NFTs"
        description="Browse and collect NFTs. This section is coming soon."
      />
    </div>
  );
}
