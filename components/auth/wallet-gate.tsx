"use client";

import { ReactNode, useEffect } from "react";
import { ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { thirdwebClient, walletConfigs } from "@/lib/thirdweb";

type WalletGateProps = {
  children: ReactNode;
  redirectTo?: string;
};

export default function WalletGate({
  children,
  redirectTo = "/login",
}: WalletGateProps) {
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    if (!account) {
      router.replace(redirectTo);
    }
  }, [account, router, redirectTo]);

  console.log("account", account);

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-900 via-purple-950 to-black px-4">
        <div className="w-full max-w-md rounded-xl bg-white/5 backdrop-blur border border-white/10 p-4 sm:p-6">
          <div className="text-center mb-4">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Connect your wallet
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Please connect to continue.
            </p>
          </div>
          <ConnectEmbed client={thirdwebClient} wallets={walletConfigs} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
