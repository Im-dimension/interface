"use client";

import { ConnectButton } from "thirdweb/react";
import {
  thirdwebClient,
  walletConfigs,
  supportedChains,
  polkadotHubTestnet,
  impossibleDimensionTheme,
} from "@/lib/thirdweb";

export function LoginView() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center px-4">
      <ConnectButton
        client={thirdwebClient}
        theme={impossibleDimensionTheme}
        wallets={walletConfigs}
        chains={supportedChains}
        chain={polkadotHubTestnet}
        connectModal={{
          showThirdwebBranding: false,
          title: 'Connect your wallet',
          welcomeScreen: {
            title: 'Welcome to Impossible Dimension!',
            subtitle: 'Magic and pixie dust on Impossible Dimension',
            img: {
              src: 'impossible-dimension-symbol.svg',
              width: 300,
              height: 200,
            },
          },
        }}
        connectButton={{
          label: 'Connect Wallet',
          style: {
            borderRadius: '25px',
            background: '#f4d03f',
            color: '#4a2a1f',
            border: 'none',
            padding: '12px 20px',
          },
        }}
        switchButton={{
          style: {
            border: 'none',
          },
        }}
      />
    </div>
  );
}
