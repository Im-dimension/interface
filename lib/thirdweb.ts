import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";

export const thirdwebClient = createThirdwebClient({
  clientId,
});

export const walletConfigs = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("io.novawallet"),
  createWallet("walletConnect"),
  createWallet("me.rainbow"),
];

export const polkadotHubTestnet = defineChain({
  id: 420420422,
  name: "Passet Hub",
  rpc: "https://testnet-passet-hub-eth-rpc.polkadot.io",
  nativeCurrency: {
    name: "PAS",
    symbol: "PAS",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Blockscout",
      url: "https://blockscout-passet-hub.parity-testnet.parity.io/",
    },
  ],
  testnet: true,
});

export const supportedChains = [polkadotHubTestnet];


