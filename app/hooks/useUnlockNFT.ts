"use client";

import { useState } from "react";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { useActiveAccount, useSwitchActiveWalletChain } from "thirdweb/react";
import { getContract } from "thirdweb";
import { thirdwebClient, polkadotHubTestnet } from "@/lib/thirdweb";
import { 
  ImpossibleDimensionMarketABI, 
  ImpossibleDimensionMarketAddress 
} from "@/app/utils/contractRef";
import { bytesToHex } from "@/app/utils/encryption";

export interface UnlockState {
  isUnlocking: boolean;
  error: string | null;
  success: boolean;
  transactionHash: string | null;
}

export function useUnlockNFT() {
  const account = useActiveAccount();
  const switchChain = useSwitchActiveWalletChain();
  const [state, setState] = useState<UnlockState>({
    isUnlocking: false,
    error: null,
    success: false,
    transactionHash: null,
  });

  const unlockAndClaim = async (tokenId: string, secret: string) => {
    if (!account) {
      setState(prev => ({ ...prev, error: "Please connect your wallet first" }));
      throw new Error("Please connect your wallet first");
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isUnlocking: true, 
        error: null,
        success: false,
      }));

      console.log("Unlocking NFT:", { tokenId, secret });

      // Switch to the correct chain first
      try {
        await switchChain(polkadotHubTestnet);
        console.log("Switched to Polkadot Hub Testnet");
      } catch (switchError) {
        console.error("Chain switch error:", switchError);
        throw new Error("Please switch your wallet to Polkadot Hub Testnet (Chain ID: 420420422)");
      }

      // Convert secret string to bytes (hex format)
      const secretBytes = new TextEncoder().encode(secret);
      const secretHex = bytesToHex(secretBytes) as `0x${string}`;
      
      // Get contract instance
      const contract = getContract({
        client: thirdwebClient,
        chain: polkadotHubTestnet,
        address: ImpossibleDimensionMarketAddress,
      });

      // Prepare the contract call
      const transaction = prepareContractCall({
        contract,
        method: "function unlockAndClaim(uint256 tokenId, bytes secret) external",
        params: [BigInt(tokenId), secretHex],
      });

      // Send transaction
      const result = await sendTransaction({
        transaction,
        account,
      });

      const transactionHash = result.transactionHash;
      console.log("NFT unlocked successfully:", transactionHash);

      setState(prev => ({
        ...prev,
        isUnlocking: false,
        success: true,
        transactionHash,
      }));

      return {
        success: true,
        transactionHash,
      };
    } catch (error: any) {
      console.error("Error unlocking NFT:", error);
      const errorMessage = error.message || "Failed to unlock NFT";
      
      setState(prev => ({
        ...prev,
        isUnlocking: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  };

  const reset = () => {
    setState({
      isUnlocking: false,
      error: null,
      success: false,
      transactionHash: null,
    });
  };

  return {
    ...state,
    unlockAndClaim,
    reset,
  };
}
