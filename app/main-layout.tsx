"use client";

import { NavigationTabs } from "@/components/navigation-tabs";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentRoute = usePathname();
  const isNFTsPage = currentRoute === "/";

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 relative">
      <div className="fixed inset-0 m-4 md:m-8 lg:m-12 rounded-4xl bg-[url(/purple-bg.png)] bg-cover bg-center bg-no-repeat overflow-hidden flex flex-col">
        <div className="absolute top-0 left-2 right-2">
          <NavigationTabs />
        </div>
        <main className="max-w-7xl mx-auto px-4 py-6 lg:py-12 flex flex-col flex-1 min-h-0 gap-4 md:gap-6 pt-16 md:pt-20">
          {children}
        </main>
      </div>
      {isNFTsPage && (
        <Button
          className="absolute bottom-20 left-4 bg-white text-black"
          label="SCAN"
          bgImage="/btn-scan.png"
        />
      )}
    </div>
  );
}
