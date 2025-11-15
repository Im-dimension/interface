import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { lightTheme } from "thirdweb/react";

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

const palePink = "#FFE4EC";
const accentPink = "#F472B6";
const accentPinkHover = "#EC4899";
const borderPink = "#F9A8D4";

export const impossibleDimensionTheme = lightTheme({
  colors: {
    modalBg: "#FFF0F6",
    modalOverlayBg: "rgba(255, 209, 220, 0.6)",
    accentButtonBg: accentPink,
    accentButtonText: "#FFFFFF",
    primaryButtonBg: accentPink,
    primaryButtonText: "#FFFFFF",
    connectedButtonBg: accentPink,
    connectedButtonBgHover: accentPinkHover,
    secondaryButtonBg: palePink,
    secondaryButtonHoverBg: "#FFD1DC",
    secondaryButtonText: "#1F2937",
    primaryText: "#1F2937",
    secondaryText: "#4B5563",
    accentText: accentPinkHover,
    borderColor: borderPink,
    separatorLine: "#E5E7EB",
    tertiaryBg: "#FFF7FA",
    selectedTextBg: borderPink,
    selectedTextColor: "#1F2937",
    success: "#10B981",
    danger: "#EF4444",
    secondaryIconColor: "#9CA3AF",
    secondaryIconHoverColor: "#1F2937",
    secondaryIconHoverBg: borderPink,
    tooltipBg: "#FFD1DC",
    tooltipText: "#1F2937",
    inputAutofillBg: palePink,
    scrollbarBg: "#F3F4F6",
    skeletonBg: "#FCE7F3",
  },
  fontFamily: "Quicksand, sans-serif",
});

export const supportedChains = [polkadotHubTestnet];
