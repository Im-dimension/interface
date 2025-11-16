"use client";

import { useState, useEffect, useMemo } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { thirdwebClient, polkadotHubTestnet } from "@/lib/thirdweb";
import { ImpossibleDimensionMarketAddress, ImpossibleDimensionMarketABI } from "@/app/utils/contractRef";
import { 
  getMetadataFromArkiv, 
  uriToEntityKey, 
  isArkivURI 
} from "@/app/utils/arkiv";

interface TokenInfo {
  tokenId: bigint;
  tokenURI: string;
}

interface NFTMetadata {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  tokenURI: string;
  animation_url?: string;
  video?: string;
}

export function useGetMyNFTs() {
  const account = useActiveAccount();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  console.log("=== useGetMyNFTs Hook Debug ===");
  console.log("1. Account address:", account?.address);
  console.log("2. Contract Address:", ImpossibleDimensionMarketAddress);
  console.log("3. Chain ID:", polkadotHubTestnet.id);
  console.log("4. Chain name:", polkadotHubTestnet.name);

  const contract = useMemo(() => {
    const contractInstance = getContract({
      client: thirdwebClient,
      chain: polkadotHubTestnet,
      address: ImpossibleDimensionMarketAddress,
      abi: ImpossibleDimensionMarketABI,
    });
    console.log("5. Contract instance created:", contractInstance.address);
    return contractInstance;
  }, []);

  // Read tokens owned by the user
  const { data: tokensOwned, isLoading, error, refetch } = useReadContract({
    contract,
    method: "getTokensOwnedBy",
    params: [account?.address || "0x0000000000000000000000000000000000000000"] as const,
    queryOptions: {
      enabled: !!account?.address,
    },
  });

  console.log("6. useReadContract state:");
  console.log("   - isLoading:", isLoading);
  console.log("   - error:", error);
  console.log("   - tokensOwned:", tokensOwned);
  console.log("   - tokensOwned type:", typeof tokensOwned);
  console.log("   - tokensOwned is array:", Array.isArray(tokensOwned));
  if (tokensOwned) {
    console.log("   - tokensOwned length:", (tokensOwned as any).length);
    console.log("   - tokensOwned content:", JSON.stringify(tokensOwned, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));
  }

  useEffect(() => {
    console.log("7. useEffect triggered - tokensOwned:", tokensOwned);
    
    if (!tokensOwned || tokensOwned.length === 0) {
      console.log("8. No tokens owned, clearing NFTs");
      setNfts([]);
      return;
    }

    console.log("9. Starting to fetch metadata for", tokensOwned.length, "tokens");

    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);

      try {
        // Fetch metadata for each token
        const nftPromises = tokensOwned.map(async (token: any, index: number) => {
          console.log(`10.${index}. Processing token:`, {
            tokenId: token.tokenId?.toString(),
            tokenURI: token.tokenURI,
          });
          try {
            // Default metadata
            let metadata: {
              name: string;
              description: string;
              image: string;
              animation_url?: string;
              video?: string;
            } = {
              name: `NFT #${token.tokenId.toString()}`,
              description: "Impossible Dimension NFT",
              image: "",
            };

            // Check if tokenURI is an Arkiv URI
            if (token.tokenURI && isArkivURI(token.tokenURI)) {
              console.log(`11.${index}. Detected Arkiv URI:`, token.tokenURI);
              const entityKey = uriToEntityKey(token.tokenURI);
              console.log(`11.${index}. Extracting entity key:`, entityKey);
              
              try {
                const arkivData = await getMetadataFromArkiv(entityKey);
                console.log(`12.${index}. Arkiv metadata:`, arkivData);
                // Update metadata with Arkiv data
                metadata = {
                  name: arkivData.name || metadata.name,
                  description: arkivData.description || metadata.description,
                  image: arkivData.image || metadata.image,
                  animation_url: arkivData.animation_url,
                  video: arkivData.video,
                };
              } catch (arkivErr) {
                console.error(`11.${index}. Failed to fetch from Arkiv:`, arkivErr);
                // Keep default metadata if Arkiv fetch fails
              }
            } else if (token.tokenURI && token.tokenURI.startsWith("ipfs://")) {
              // Try multiple IPFS gateways for better reliability
              const gateways = [
                "https://gateway.pinata.cloud/ipfs/",
                "https://ipfs.io/ipfs/",
                "https://cloudflare-ipfs.com/ipfs/",
              ];
              
              const cid = token.tokenURI.replace("ipfs://", "");
              console.log(`11.${index}. Fetching IPFS metadata for CID:`, cid);
              
              let fetchSuccess = false;
              for (const gateway of gateways) {
                try {
                  const ipfsUrl = gateway + cid;
                  console.log(`11.${index}. Trying gateway:`, ipfsUrl);
                  const response = await fetch(ipfsUrl, {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                    },
                  });
                  console.log(`12.${index}. IPFS fetch response:`, response.ok, response.status);
                  if (response.ok) {
                    metadata = await response.json();
                    console.log(`13.${index}. IPFS metadata:`, metadata);
                    fetchSuccess = true;
                    break;
                  }
                } catch (gatewayErr) {
                  console.log(`Gateway ${gateway} failed, trying next...`);
                  continue;
                }
              }
              
              if (!fetchSuccess) {
                console.log(`11.${index}. All IPFS gateways failed`);
              }
            } else if (token.tokenURI && token.tokenURI.startsWith("http")) {
              console.log(`11.${index}. Fetching HTTP metadata from:`, token.tokenURI);
              const response = await fetch(token.tokenURI);
              console.log(`12.${index}. HTTP fetch response:`, response.ok, response.status);
              if (response.ok) {
                metadata = await response.json();
                console.log(`13.${index}. HTTP metadata:`, metadata);
              }
            } else {
              console.log(`11.${index}. No valid tokenURI or unsupported protocol:`, token.tokenURI);
            }

            // Helper to convert IPFS URLs to HTTP gateway URLs
            const convertIpfsUrl = (url: string | undefined): string => {
              if (!url) return "";
              if (url.startsWith("ipfs://")) {
                return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
              }
              return url;
            };

            const nftData = {
              tokenId: token.tokenId.toString(),
              name: metadata.name,
              description: metadata.description,
              image: convertIpfsUrl(metadata.image),
              tokenURI: token.tokenURI,
              animation_url: convertIpfsUrl(metadata.animation_url),
              video: convertIpfsUrl(metadata.video),
            };
            console.log(`14.${index}. Final NFT data:`, nftData);
            return nftData;
          } catch (err) {
            console.error(`ERROR ${index}: Failed to fetch metadata for token ${token.tokenId}:`, err);
            console.error(`ERROR ${index}: Error details:`, {
              name: (err as Error).name,
              message: (err as Error).message,
              stack: (err as Error).stack,
            });
            return {
              tokenId: token.tokenId.toString(),
              name: `NFT #${token.tokenId.toString()}`,
              description: "Error loading metadata",
              image: "",
              tokenURI: token.tokenURI,
            };
          }
        });

        const nftData = await Promise.all(nftPromises);
        console.log("15. All metadata fetched, total NFTs:", nftData.length);
        console.log("16. Final NFT data array:", JSON.stringify(nftData, null, 2));
        setNfts(nftData);
        console.log("17. NFTs state updated");
      } catch (err) {
        console.error("ERROR: Failed to fetch metadata:", err);
        console.error("ERROR details:", {
          name: (err as Error).name,
          message: (err as Error).message,
          stack: (err as Error).stack,
        });
      } finally {
        setIsLoadingMetadata(false);
        console.log("18. Metadata loading complete");
      }
    };

    fetchMetadata();
  }, [tokensOwned]);

  console.log("19. Hook returning:", {
    nftsCount: nfts.length,
    isLoading: isLoading || isLoadingMetadata,
    hasError: !!error,
  });

  return { 
    nfts, 
    isLoading: isLoading || isLoadingMetadata, 
    error: error ? String(error) : null, 
    refetch 
  };
}
