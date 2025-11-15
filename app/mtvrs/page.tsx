"use client";

import { InfoCard } from "@/components/info-card";
import { Button } from "@/components/ui/button";

export default function MTVRsPage() {
  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6">
        <InfoCard
          title="MTVRs"
          description="MTVR experiences are on the way. Stay tuned!"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-4 sm:gap-8">
        <Button label="SCAN" />
        <InfoCard
          title="INFO"
          description="Latest updates will appear here as features roll out."
        />
      </div>
    </>
  );
}


