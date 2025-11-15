"use client";

import { InfoCard } from "@/components/info-card";
import { ScanButton } from "@/components/nfc/scan-button";

export default function StorePage() {
  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6">
        <InfoCard
          title="NFTs"
          description="Browse and collect NFTs. This section is coming soon."
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-4 sm:gap-8">
        <ScanButton />
        <InfoCard
          title="INFO"
          description="Connect your wallet to see personalized content."
        />
      </div>
    </>
  );
}
