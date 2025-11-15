"use client";

import { ActionButton } from "@/components/action-button";
import { InfoCard } from "@/components/info-card";
import { NFTCard } from "@/components/cards/nft-card";
// import { StorageWidget } from "@/components/contract/storage-widget";

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
  // const storageAddress = process.env.NEXT_PUBLIC_STORAGE_CONTRACT as
  //   | string
  //   | undefined;

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

      {/* {storageAddress ? <StorageWidget address={storageAddress} /> : null} */}

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-4 sm:gap-8">
        <ActionButton label="SCAN" />
        <InfoCard
          title="INFO"
          description="Find all your favorite Chiri merch at the Impossible Store"
        />
      </div>
    </>
  );
}


