# MusicNFT

MusicNFT is a full-stack music streaming and NFT marketplace prototype built around one user flow: upload a track, mint editions, attach royalties, and sell them through a wallet-connected storefront.

Live page: [merup.me/musicnft](https://merup.me/musicnft/)

The app combines a music catalog experience with Web3 minting on Sepolia. Artists can upload tracks and cover art, pin metadata to IPFS, mint editions with royalty percentages, and list the resulting NFTs for sale. Collectors can browse tracks, connect MetaMask, view owned NFTs, and purchase listed editions from the marketplace.

## What It Includes

- Artist, track, and playlist views with a React client
- Track upload flow backed by Pinata/IPFS
- MetaMask wallet connection with Sepolia network handling
- Music NFT minting with quantity, price, and royalty controls
- Owned-NFT management and marketplace purchase flow
- Express API plus shared Drizzle schema for app data

## Stack

- React + Vite + TypeScript frontend
- Express server
- Drizzle ORM schema shared between client and server
- `ethers` for wallet and contract interactions
- Solidity contract scaffold in [`MusicNFT.sol`](./MusicNFT.sol)

## Local Development

```bash
npm install
npm run dev
```

The repo serves the app and API together in development. Before the NFT flows will work end-to-end, configure the wallet and storage pieces the client expects:

- a MetaMask wallet
- Sepolia testnet selected in the wallet
- a deployed NFT contract address exposed as `VITE_NFT_CONTRACT_ADDRESS`
- Pinata credentials for IPFS uploads

## Repository Layout

- [`client`](./client): React application, player, marketplace, wallet, and upload flows
- [`server`](./server): Express entry point and API routes
- [`shared`](./shared): Drizzle schema and shared types
- [`MusicNFT.sol`](./MusicNFT.sol): smart-contract source

## Current Product Shape

This project is best understood as a product prototype rather than a finished marketplace. The strongest part of the repo is the end-to-end concept: combine music discovery, file uploads, NFT minting, royalties, and marketplace flows inside one app shell.
