"use client";

import { NavigationTabs } from "@/components/navigation-tabs";
import { ScanButton } from "@/components/nfc/scan-button";
import { NFCAutoUnlock } from "@/components/nfc/nfc-auto-unlock";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentRoute = usePathname();
  const isNFTsPage = currentRoute === "/wallet";

  const isAdminPage = currentRoute === "/admin";

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 relative">
      {/* Global NFC Auto-Unlock handler */}
      <NFCAutoUnlock />
      
      {!isAdminPage ? (
        <div className="fixed inset-0 m-4 md:m-8 lg:m-12 rounded-4xl bg-[url(/purple-bg.png)] bg-cover bg-no-repeat overflow-hidden flex flex-col">
          <div className="absolute top-0 left-2 right-2">
            <NavigationTabs />
          </div>
          <main className="max-w-7xl mx-auto px-4 py-6 lg:py-12 flex flex-col flex-1 min-h-0 gap-4 md:gap-6 pt-16 md:pt-20">
            {children}
          </main>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-6 lg:py-12 flex flex-col flex-1 min-h-0 gap-4 md:gap-6 pt-16 md:pt-20">
          {children}
        </main>
      )}
      {isNFTsPage && (
        <div className="absolute bottom-8 left-6">
          <ScanButton />
        </div>
      )}
    </div>
  );
}
