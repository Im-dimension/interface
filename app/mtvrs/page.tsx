"use client";

import { InfoCard } from "@/components/cards/info-card";

export default function MTVRsPage() {
  return (
    <div className="flex h-full justify-center items-center overflow-y-auto space-y-4 md:space-y-6">
      <InfoCard
        title="MTVRs"
        description="MTVR experiences are on the way. Stay tuned!"
      />
    </div>
  );
}
