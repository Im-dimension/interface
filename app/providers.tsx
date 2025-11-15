"use client";

import ThirdwebProviderWrapper from "@/components/providers/thirdweb-provider";
import PWARegister from "./pwa-register";
import MainLayout from "./main-layout";
import { WalletProvider } from "@/providers/useWalletProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThirdwebProviderWrapper>
      <PWARegister />
      <WalletProvider>
        <MainLayout>{children}</MainLayout>
      </WalletProvider>
    </ThirdwebProviderWrapper>
  );
};
