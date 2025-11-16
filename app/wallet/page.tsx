"use client";

import { useGetMyNFTs } from "@/app/hooks/useGetMyNFTs";
import { NFTCard } from "@/components/cards/nft-card";
import { InfoCard } from "@/components/cards/info-card";
import { useActiveAccount } from "thirdweb/react";
import { mockNFTs } from "@/lib/constants";
import { NFTDetails } from "@/components/cards/nft-details";

export default function WalletPage() {
  const account = useActiveAccount();
  const { nfts, isLoading, error } = useGetMyNFTs();

  console.log("=== WalletPage Render ===");
  console.log("A. Account:", account?.address);
  console.log("B. isLoading:", isLoading);
  console.log("C. error:", error);
  console.log("D. nfts count:", nfts.length);
  console.log("E. nfts data:", nfts);

  if (!account) {
    console.log(">>> Rendering: No account connected");
    return (
      <div className="flex h-full justify-center items-center">
        <InfoCard
          title="Connect Wallet"
          description="Please connect your wallet to view your NFTs"
        />
      </div>
    );
  }

  if (isLoading) {
    console.log(">>> Rendering: Loading state");
    return (
      <div className="flex h-full justify-center items-center">
        <InfoCard
          title="Loading..."
          description="Fetching your NFTs from the blockchain"
        />
      </div>
    );
  }

  if (error) {
    console.log(">>> Rendering: Error state");
    console.error("Full error:", error);
    return (
      <div className="flex h-full justify-center items-center">
        <div className="space-y-4 max-w-2xl">
          <InfoCard
            title="Error"
            description={`Failed to load NFTs: ${error}`}
          />
          <details className="bg-red-50 p-4 rounded-lg">
            <summary className="cursor-pointer font-semibold text-red-800">
              Error Details (Click to expand)
            </summary>
            <pre className="mt-2 text-xs overflow-auto text-red-600">
              {error}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // if (nfts.length === 0) {
  //   console.log(">>> Rendering: No NFTs found");
  //   return (
  //     <div className="flex h-full justify-center items-center">
  //       <InfoCard
  //         title="No NFTs Yet"
  //         description="You don't own any NFTs yet. Visit the store to collect some!"
  //       />
  //     </div>
  //   );
  // }

  console.log(">>> Rendering: NFT display");
  console.log("Number of NFTs to display:", nfts.length);

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6">
        {mockNFTs.map((nft, index) => {
          console.log(`Rendering NFT ${index}:`, nft);
          return (
            <div key={nft.tokenId}>
              <NFTCard
                imageUrl={nft.image}
                imageAlt={nft.name}
                name={nft.name}
                description={nft.description}
                tokenId={nft.tokenId}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="flex justify-end sm:items-end gap-4 sm:gap-8">
        <NFTDetails
          name={`${nfts.length} NFT${nfts.length === 1 ? "" : "s"}`}
          description="Your Impossible Dimension collection"
        />
      </div>
    </>
  );
}
