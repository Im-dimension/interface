"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { thirdwebClient, walletConfigs, supportedChains, polkadotHubTestnet } from "@/lib/thirdweb";

export default function LoginPage() {
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    if (account) {
      router.replace("/");
    }
  }, [account, router]);

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

        <ConnectEmbed
          client={thirdwebClient}
          wallets={walletConfigs}
          chains={supportedChains}
          chain={polkadotHubTestnet}
        />
      </div>
    </div>
  );
}


