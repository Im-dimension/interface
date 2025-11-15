import { NavigationTabs } from "@/components/navigation-tabs";
import { ActionButton } from "@/components/action-button";
import { InfoCard } from "@/components/info-card";
import { PWAInstaller } from "@/components/pwa-installer";
import { NFTCard } from "@/components/cards/nft-card";
import WalletGate from "@/components/auth/wallet-gate";
import { WalletConnectButton } from "@/components/wallet/connect-button";

const mockNFTs = [
  {
    imageUrl: "/pink-cat-character-in-forest-setting-with-trees-an.jpg",
    imageAlt: "Chiri character in forest",
  },
];

export default function ImpossibleStore() {
  return (
    <WalletGate>
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-purple-950 to-black">
        <div className="fixed top-4 right-4 z-50">
          <WalletConnectButton />
        </div>
        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-12">
          {/* Navigation */}
          <NavigationTabs
            tabs={[
              { label: "NFTs" },
              { label: "STORE", isActive: true },
              { label: "MTVRs" },
            ]}
          />

          {mockNFTs.map((nft) => (
            <NFTCard
              key={nft.imageUrl}
              imageUrl={nft.imageUrl}
              imageAlt={nft.imageAlt}
            />
          ))}

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-6 md:mt-8 max-w-2xl mx-auto">
            <ActionButton label="SCAN" />
            <InfoCard
              title="INFO"
              description="Find all your favorite Chiri merch at the Impossible Store"
            />
          </div>
        </div>

        <PWAInstaller />
      </div>
    </WalletGate>
  );
}
