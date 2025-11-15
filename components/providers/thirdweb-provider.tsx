"use client";

import { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";

type ThirdwebProviderWrapperProps = {
  children: ReactNode;
};

export default function ThirdwebProviderWrapper({
  children,
}: ThirdwebProviderWrapperProps) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}


