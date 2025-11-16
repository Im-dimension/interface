import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { mendoza } from "@arkiv-network/sdk/chains";
import { jsonToPayload, bytesToString, ExpirationTime } from "@arkiv-network/sdk/utils";

// Mendoza Network Configuration
const MENDOZA_RPC_URL = "https://mendoza.hoodi.arkiv.network/rpc";

// Create a public client for reading data from Arkiv
export const arkivPublicClient = createPublicClient({
  chain: mendoza,
  transport: http(MENDOZA_RPC_URL),
});

/**
 * Creates a wallet client for writing data to Arkiv
 * Note: This requires a private key. In production, you should use
 * the user's wallet provider instead of a hardcoded key.
 */
export function createArkivWalletClient(privateKey: string) {
  return createWalletClient({
    chain: mendoza,
    transport: http(MENDOZA_RPC_URL),
    account: privateKeyToAccount(privateKey as `0x${string}`),
  });
}

/**
 * Store metadata on Arkiv network
 * @param metadata - The metadata object to store
 * @param validityDays - Number of days the data should remain on Arkiv
 * @param privateKey - Private key for signing the transaction
 * @returns The entity key (used as identifier to retrieve data)
 */
export async function storeMetadataOnArkiv(
  metadata: Record<string, any>,
  validityDays: number,
  privateKey: string
): Promise<{ entityKey: string; txHash: string }> {
  try {
    // Create wallet client
    const walletClient = createArkivWalletClient(privateKey);

    // Create the entity on Arkiv
    const { entityKey, txHash } = await walletClient.createEntity({
      payload: jsonToPayload(metadata),
      contentType: "application/json",
      attributes: [
        { key: "type", value: "nft-metadata" },
        { key: "name", value: metadata.name || "Unknown" },
        { key: "category", value: metadata.attributes?.find((a: any) => a.trait_type === "Category")?.value || "unknown" },
      ],
      expiresIn: ExpirationTime.fromDays(validityDays),
    });

    console.log("Metadata stored on Arkiv:");
    console.log("  Entity Key:", entityKey);
    console.log("  Transaction Hash:", txHash);
    console.log("  Validity:", validityDays, "days");

    return { entityKey, txHash };
  } catch (error) {
    console.error("Error storing metadata on Arkiv:", error);
    throw new Error(`Failed to store metadata on Arkiv: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieve metadata from Arkiv network
 * @param entityKey - The entity key returned when storing data
 * @returns The metadata object
 */
export async function getMetadataFromArkiv(entityKey: string): Promise<Record<string, any>> {
  try {
    console.log("Fetching metadata from Arkiv for key:", entityKey);

    // Ensure entityKey has 0x prefix for proper type
    const formattedKey = entityKey.startsWith('0x') ? entityKey : `0x${entityKey}`;

    // Get the entity from Arkiv
    const entity = await arkivPublicClient.getEntity(formattedKey as `0x${string}`);

    // Decode the payload from bytes to string, then parse as JSON
    if (!entity.payload) {
      throw new Error("Entity has no payload");
    }
    
    const dataString = bytesToString(entity.payload);
    const metadata = JSON.parse(dataString);

    console.log("Metadata retrieved from Arkiv:", metadata);

    return metadata;
  } catch (error) {
    console.error("Error retrieving metadata from Arkiv:", error);
    throw new Error(`Failed to retrieve metadata from Arkiv: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper to convert an Arkiv entity key to a URI format
 * This can be stored as the tokenURI on-chain
 */
export function entityKeyToURI(entityKey: string): string {
  return `arkiv://${entityKey}`;
}

/**
 * Helper to extract entity key from URI format
 */
export function uriToEntityKey(uri: string): string {
  if (uri.startsWith("arkiv://")) {
    return uri.replace("arkiv://", "");
  }
  // Also support raw entity keys
  return uri;
}

/**
 * Check if a URI is an Arkiv URI
 */
export function isArkivURI(uri: string): boolean {
  return uri.startsWith("arkiv://") || uri.startsWith("0x");
}
