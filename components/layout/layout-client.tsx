"use client";

import dynamic from "next/dynamic";

const WalletConnectButton = dynamic(
  () =>
    import("@/components/wallet/connect-button").then(
      (m) => m.WalletConnectButton
    ),
  { ssr: false }
);

export function LayoutClient() {
  return (
    <div className="flex justify-center mt-10">
      <WalletConnectButton />
    </div>
  );
}
