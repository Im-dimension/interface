"use client";

import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/info-card";
import { NFTCard } from "@/components/cards/nft-card";

const mockNFTs = [
  {
    imageUrl: "/pink-cat-character-in-forest-setting-with-trees-an.jpg",
    imageAlt: "Chiri character in forest 1",
  },
  {
    imageUrl: "/pink-cat-character-in-forest-setting-with-trees-an.jpg",
    imageAlt: "Chiri character in forest 2",
  },
  {
    imageUrl: "/pink-cat-character-in-forest-setting-with-trees-an.jpg",
    imageAlt: "Chiri character in forest 3",
  },
];

export default function NFTsPage() {
  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6">
        {mockNFTs.map((nft) => (
          <NFTCard
            key={nft.imageAlt}
            imageUrl={nft.imageUrl}
            imageAlt={nft.imageAlt}
          />
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-4 sm:gap-8">
        <Button label="SCAN" />
        <InfoCard
          title="INFO"
          description="Find all your favorite Chiri merch at the Impossible Store"
        />
      </div>
    </>
  );
}
