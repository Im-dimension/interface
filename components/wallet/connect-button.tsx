"use client";

import { ConnectButton } from "thirdweb/react";
import { thirdwebClient, walletConfigs, supportedChains, polkadotHubTestnet } from "@/lib/thirdweb";

export function WalletConnectButton() {
  return (
    <ConnectButton
      client={thirdwebClient}
      wallets={walletConfigs}
      chains={supportedChains}
      chain={polkadotHubTestnet}
      theme="dark"
    />
  );
}


