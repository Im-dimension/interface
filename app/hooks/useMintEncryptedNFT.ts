"use client";

import { useState } from "react";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { PinataSDK } from "pinata";
import { keccak256, toBytes } from "thirdweb/utils";
import { 
  generateSecret, 
  encryptString, 
  bytesToHex 
} from "@/app/utils/encryption";

/**
 * Generate a human-readable secret string
 * Uses only alphabetic characters (lowercase) for easy copying/sharing
 * Limited to 8 characters as per requirement
 */
function generateReadableSecret(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(byte => chars[byte % chars.length])
    .join('');
}
import { 
  ImpossibleDimensionMarketABI, 
  ImpossibleDimensionMarketAddress 
} from "@/app/utils/contractRef";
import { defineChain, getContract } from "thirdweb";
import { thirdwebClient, polkadotHubTestnet } from "@/lib/thirdweb";

export interface NFTMetadata {
  name: string;
  description: string;
  rarity: string;
  category: string;
  thumbnail: string;
  image: string;
  data: {
    tags: string[];
    representations: Array<{
      mainFile: string;
    }>;
  };
}

export interface MintState {
  isUploading: boolean;
  isMinting: boolean;
  uploadProgress: string;
  error: string | null;
  success: boolean;
  tokenId: string | null;
  secret: string | null;
}

export function useMintEncryptedNFT() {
  const account = useActiveAccount();
  const [state, setState] = useState<MintState>({
    isUploading: false,
    isMinting: false,
    uploadProgress: "",
    error: null,
    success: false,
    tokenId: null,
    secret: null,
  });

  const uploadFileToPinata = async (file: File): Promise<string> => {
    try {
      console.log("Starting file upload:", file.name, file.size, "bytes");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pinata-url", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload failed with error data:", errorData);
        throw new Error(`Upload failed: ${errorData.message || errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log("Upload successful, CID:", result.cid);
      return result.cid;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw new Error("Failed to upload file to IPFS");
    }
  };

  const mintEncryptedNFT = async (
    metadata: NFTMetadata,
    thumbnailFile: File,
    imageFile: File,
    mainFile: File,
    price: string = "0"
  ) => {
    if (!account) {
      setState(prev => ({ ...prev, error: "Please connect your wallet first" }));
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isUploading: true, 
        error: null, 
        uploadProgress: "Uploading thumbnail..." 
      }));

      // Upload thumbnail to IPFS
      const thumbnailCID = await uploadFileToPinata(thumbnailFile);
      
      setState(prev => ({ ...prev, uploadProgress: "Uploading image..." }));
      
      // Upload image to IPFS
      const imageCID = await uploadFileToPinata(imageFile);
      
      setState(prev => ({ ...prev, uploadProgress: "Uploading main file..." }));
      
      // Upload main file to IPFS
      const mainFileCID = await uploadFileToPinata(mainFile);

      // Construct complete metadata
      const completeMetadata: NFTMetadata = {
        ...metadata,
        thumbnail: thumbnailCID,
        image: imageCID,
        data: {
          ...metadata.data,
          representations: [
            {
              mainFile: mainFileCID,
            },
          ],
        },
      };

      setState(prev => ({ 
        ...prev, 
        uploadProgress: "Encrypting metadata...",
        isUploading: false,
        isMinting: true 
      }));

      // Generate a human-readable secret (8 characters, lowercase letters only)
      // Similar to the working example: "mysecret"
      const secretString = generateReadableSecret(8);
      const secretBytes = new TextEncoder().encode(secretString);
      const secretHex = bytesToHex(secretBytes);

      // Convert metadata to JSON string
      const metadataJSON = JSON.stringify(completeMetadata);

      // Encrypt the metadata
      const encryptedMetadata = encryptString(metadataJSON, secretBytes);
      const encryptedHex = bytesToHex(encryptedMetadata);

      // Hash the secret using keccak256
      const secretHash = keccak256(toBytes(secretHex));

      setState(prev => ({ ...prev, uploadProgress: "Minting NFT..." }));

      // Get contract instance
      const contract = getContract({
        client: thirdwebClient,
        chain: polkadotHubTestnet,
        address: ImpossibleDimensionMarketAddress,
      });

      // Prepare the contract call
      const transaction = prepareContractCall({
        contract,
        method: "function mintEncryptedToken(bytes calldata encryptedURI, bytes32 secretHash, uint256 price) external returns (uint256)",
        params: [encryptedHex as `0x${string}`, secretHash, BigInt(price)],
      });

      // Send transaction
      const result = await sendTransaction({
        transaction,
        account,
      });

      // The result contains the transaction hash
      const transactionHash = result.transactionHash;
      
      // Parse events to get token ID
      // The EncryptedTokenMinted event should contain the tokenId
      const tokenId = "pending"; // You'll need to parse this from events

      setState(prev => ({
        ...prev,
        isMinting: false,
        success: true,
        tokenId,
        secret: secretString, // Return the readable secret string, not hex
        uploadProgress: "NFT minted successfully!",
      }));

      return {
        tokenId,
        secret: secretString, // Return the readable secret string for users
        secretHex, // Also return hex format if needed
        transactionHash,
      };
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      setState(prev => ({
        ...prev,
        isUploading: false,
        isMinting: false,
        error: error.message || "Failed to mint NFT",
      }));
      throw error;
    }
  };

  const reset = () => {
    setState({
      isUploading: false,
      isMinting: false,
      uploadProgress: "",
      error: null,
      success: false,
      tokenId: null,
      secret: null,
    });
  };

  return {
    ...state,
    mintEncryptedNFT,
    reset,
  };
}
