## Impossible Dimension

Encrypted NFT marketplace with NFC unlockables.

### Demo & Pitch
- Demo URL: [ADD LINK](https://interface-drwz.vercel.app)

## Tech Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- thirdweb (wallets, chains, contracts)
- Pinata (IPFS storage)

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
```

3) Run the app:
```bash
yarn dev
```
Open `http://localhost:3000`

## Scripts
- `yarn dev`: Start local dev server
- `yarn build`: Build for production
- `yarn start`: Start production server
- `yarn lint`: Run ESLint

## Notes
- The app targets the Polkadot Hub Testnet (via thirdweb). Ensure your wallet is on the correct network when interacting with contracts.
