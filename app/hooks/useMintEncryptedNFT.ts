"use client";

import { useState } from "react";
import { prepareContractCall, sendTransaction } from "thirdweb";
import { useActiveAccount, useSwitchActiveWalletChain } from "thirdweb/react";
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
  const switchChain = useSwitchActiveWalletChain();
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
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`Starting file upload: ${file.name} (${fileSizeMB} MB)`);
      
      // Check file size limit (500MB)
      if (file.size > 500 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large (${fileSizeMB} MB). Maximum size is 500 MB.`);
      }
      
      // Get Pinata JWT from environment variable
      const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
      if (!pinataJWT) {
        throw new Error("Pinata JWT not configured. Please set NEXT_PUBLIC_PINATA_JWT in environment variables.");
      }

      // Upload directly to Pinata API from client
      const formData = new FormData();
      formData.append("file", file);
      
      // Optional: Add metadata
      const metadata = JSON.stringify({
        name: file.name,
      });
      formData.append("pinataMetadata", metadata);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
        },
        body: formData,
      });

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error(`File ${file.name} is too large for upload. Try compressing or reducing file size.`);
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
        }
        
        console.error("Upload failed with error data:", errorData);
        throw new Error(`Upload failed: ${errorData.error?.details || errorData.error?.reason || response.statusText}`);
      }

      const result = await response.json();
      console.log(`Upload successful: ${file.name} → ${result.IpfsHash}`);
      return result.IpfsHash; // Pinata returns IpfsHash instead of cid
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      if (error instanceof Error) {
        throw error;
      }
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

      setState(prev => ({ ...prev, uploadProgress: "Creating metadata..." }));

      // Construct complete metadata with proper IPFS gateway URLs
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "https://chocolate-tricky-leopon-55.mypinata.cloud/";
      
      const completeMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: `${gatewayUrl}ipfs/${imageCID}`,
        animation_url: `${gatewayUrl}ipfs/${mainFileCID}`,
        external_url: `${gatewayUrl}ipfs/${mainFileCID}`,
        attributes: [
          {
            trait_type: "Rarity",
            value: metadata.rarity
          },
          {
            trait_type: "Category",
            value: metadata.category
          },
          ...metadata.data.tags.map(tag => ({
            trait_type: "Tag",
            value: tag
          }))
        ],
        properties: {
          thumbnail: `${gatewayUrl}ipfs/${thumbnailCID}`,
          files: [
            {
              uri: `${gatewayUrl}ipfs/${imageCID}`,
              type: imageFile.type
            },
            {
              uri: `${gatewayUrl}ipfs/${mainFileCID}`,
              type: mainFile.type
            }
          ]
        }
      };

      setState(prev => ({ ...prev, uploadProgress: "Uploading metadata to IPFS..." }));

      // Upload the complete metadata JSON to IPFS
      const metadataBlob = new Blob([JSON.stringify(completeMetadata, null, 2)], { 
        type: 'application/json' 
      });
      const metadataFile = new File([metadataBlob], 'metadata.json', { 
        type: 'application/json' 
      });
      const metadataCID = await uploadFileToPinata(metadataFile);
      
      // Create the standard IPFS URI
      const tokenURI = `ipfs://${metadataCID}`;
      console.log("Metadata uploaded to IPFS:", tokenURI);

      setState(prev => ({ 
        ...prev, 
        uploadProgress: "Encrypting token URI...",
        isUploading: false,
        isMinting: true 
      }));

      // Generate a human-readable secret (8 characters, lowercase letters only)
      const secretString = generateReadableSecret(8);
      const secretBytes = new TextEncoder().encode(secretString);
      const secretHex = bytesToHex(secretBytes);

      // Encrypt the IPFS URI (not the entire metadata)
      const encryptedURI = encryptString(tokenURI, secretBytes);
      const encryptedHex = bytesToHex(encryptedURI);

      // Hash the secret using keccak256
      const secretHash = keccak256(toBytes(secretHex));

      console.log("Token URI:", tokenURI);
      console.log("Encrypted URI:", encryptedHex);
      console.log("Secret:", secretString);
      console.log("Secret Hash:", secretHash);

      setState(prev => ({ ...prev, uploadProgress: "Switching to correct network..." }));

      // Switch to the correct chain first
      try {
        await switchChain(polkadotHubTestnet);
        console.log("Switched to Polkadot Hub Testnet");
      } catch (switchError) {
        console.error("Chain switch error:", switchError);
        throw new Error("Please switch your wallet to Polkadot Hub Testnet (Chain ID: 420420422)");
      }

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
      
      console.log("Transaction hash:", transactionHash);
      
      // Wait for the transaction receipt to get the events
      setState(prev => ({ ...prev, uploadProgress: "Confirming transaction..." }));
      
      // Import receipt function
      const { waitForReceipt } = await import("thirdweb");
      const receipt = await waitForReceipt({
        client: thirdwebClient,
        chain: polkadotHubTestnet,
        transactionHash,
      });

      console.log("Transaction receipt:", receipt);

      // Parse the EncryptedTokenMinted event to get the token ID
      let tokenId = "0";
      
      if (receipt.logs && receipt.logs.length > 0) {
        // Find the EncryptedTokenMinted event
        // The event signature is: EncryptedTokenMinted(uint256 indexed tokenId, address indexed minter, bytes32 secretHash, uint256 price)
        // The tokenId is the first indexed parameter (topic[1])
        const encryptedTokenMintedTopic = "0x" + keccak256(toBytes("EncryptedTokenMinted(uint256,address,bytes32,uint256)")).slice(2);
        
        const mintEvent = receipt.logs.find(log => log.topics && log.topics[0] === encryptedTokenMintedTopic);
        
        if (mintEvent && mintEvent.topics && mintEvent.topics.length > 1 && mintEvent.topics[1]) {
          // Token ID is in topics[1] (first indexed parameter)
          tokenId = BigInt(mintEvent.topics[1]).toString();
          console.log("Extracted token ID from event:", tokenId);
        }
      }

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
