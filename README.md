## Impossible Dimension

Encrypted NFT marketplace with NFC unlockables.

### Demo & Pitch
- Demo URL: [ADD LINK](https://interface-drwz.vercel.app)

## Tech Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- thirdweb (wallets, chains, contracts)
- **Arkiv Network** (on-chain metadata storage with expiration)
- Pinata (IPFS storage for media files)

## Prerequisites
- Node.js v18+ (v20 recommended)
- Yarn 4 via Corepack

Enable Corepack (once per machine):

```bash
corepack enable
```

## Setup
1) Install dependencies:
```bash
yarn install
```

2) Create `.env.local` in the repo root:
```bash

# ThirdWeb SDK Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=YOUR_THIRDWEB_CLIENT_ID
THIRDWEB_SECRET_KEY=

// Contracts
NEXT_PUBLIC_STORAGE_CONTRACT=

// Pinata Configuration
PINATA_JWT=
NEXT_PUBLIC_PINATA_JWT=YOUR_PINATA_JWT
NEXT_PUBLIC_GATEWAY_URL=https://your-pinata-gateway-domain/   # e.g. https://<subdomain>.mypinata.cloud/

// Arkiv Network Configuration (for time-based NFT metadata)
NEXT_PUBLIC_ARKIV_PRIVATE_KEY=0x...   # Mendoza testnet wallet with funds
```

**Get Arkiv Testnet Funds**: https://mendoza.hoodi.arkiv.network/faucet/

3) Run the app:
```bash
yarn dev
```
Open `http://localhost:3000`

## 🕐 Arkiv Network Integration - Time-Based NFTs

This project leverages **Arkiv Network** (Mendoza testnet) for on-chain metadata storage with built-in expiration, enabling **time-limited and event-based NFTs**.

### Technical Architecture

**Storage Strategy:**
- **Media files** (images, 3D models, videos) → IPFS via Pinata (permanent, large files)
- **NFT metadata JSON** → Arkiv blockchain (temporary, on-chain, small data)

**Why Arkiv for Metadata?**

Traditional NFTs use permanent IPFS storage, which is ideal for long-term collectibles but not suitable for:
- Event-specific NFTs (e.g., "Christmas 2025 Limited Edition")
- Time-limited campaigns
- Seasonal promotions
- Proof-of-attendance tokens (POAPs) with expiration
- Real-world event tickets

Arkiv solves this by storing metadata directly on-chain with configurable expiration (`expiresIn`).

### Use Case: Christmas 2025 NFT

```typescript
// Example: Mint a Christmas 2025 NFT that expires on January 1st, 2026
const christmasMetadata = {
  name: "Christmas 2025 Limited Edition",
  description: "Exclusive holiday NFT - Valid until New Year!",
  image: "ipfs://Qm.../christmas-tree.png", // Still on IPFS
  attributes: [
    { trait_type: "Event", value: "Christmas 2025" },
    { trait_type: "Valid Until", value: "2026-01-01" }
  ]
};

// Store on Arkiv with 45-day validity (Dec 16 → Jan 30)
const { entityKey } = await storeMetadataOnArkiv(
  christmasMetadata,
  45, // expiresIn: 45 days
  privateKey
);

// TokenURI: arkiv://0x1e1269c04c... (blockchain-stored, self-destructing)
```

### Technical Benefits

1. **On-Chain Expiration**: Metadata automatically becomes inaccessible after expiration
2. **Blockchain Verification**: All metadata changes auditable on Mendoza chain
3. **Cost Efficiency**: Pay only for temporary storage duration (1-365 days)
4. **Searchable Attributes**: Query NFTs by event type, date, category on-chain
5. **No Centralized Dependencies**: Unlike IPFS gateways, Arkiv is fully decentralized L3



```

**Minting Flow:**
1. Admin sets "Validity Days" (e.g., 45 for Christmas → New Year)
2. Files uploaded to IPFS (permanent URLs)
3. Metadata JSON created with IPFS references
4. Metadata stored on Arkiv with `expiresIn: 45 days`
5. Entity key returned: `0x1e1269...`
6. TokenURI encrypted: `arkiv://0x1e1269...`
7. NFT minted on Polkadot Hub with Arkiv URI


### Network Configuration

**Arkiv Mendoza Testnet:**
- Chain ID: `60138453056`
- RPC: `https://mendoza.hoodi.arkiv.network/rpc`
- Block Time: ~2 seconds
- Storage Cost: Negligible (testnet)

## Scripts
- `yarn dev`: Start local dev server
- `yarn build`: Build for production
- `yarn start`: Start production server
- `yarn lint`: Run ESLint

## Notes
- The app targets the Polkadot Hub Testnet (via thirdweb). Ensure your wallet is on the correct network when interacting with contracts.
