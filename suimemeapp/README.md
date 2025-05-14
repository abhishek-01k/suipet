# MemePet Frontend

This is the frontend application for the MemePet dApp, built using Next.js, TypeScript, and Tailwind CSS.

## Overview

MemePet transforms memecoins into virtual pets with AI-powered personalities. Users can create, train, interact with, and trade their MemePets in a gamified ecosystem.

## Features

- **Create MemePets**: Transform memecoins into virtual pets
- **Pet Management**: Feed, play with, and train your pets
- **Missions**: Send your pets on timed missions to earn rewards
- **Marketplace**: Buy, sell, and trade MemePets with other users
- **Wallet Integration**: Seamlessly connect your Sui wallet

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS with NeoBrutalism design
- **UI Components**: 8bitcn component library
- **Blockchain**: Sui blockchain via @mysten/dapp-kit
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18 or later
- Sui wallet extension (e.g., Sui Wallet)

### Installation

```bash
# Install dependencies
npm install
# or
yarn
# or
pnpm install
```

### Development

```bash
# Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Project Structure

- **pages/**: Next.js pages
  - `index.tsx`: Landing page
  - `create-pet/`: Pet creation
  - `pets/`: Pet management dashboard
  - `marketplace/`: Buy and sell pets
- **components/**: Reusable UI components
  - `ui/`: 8bitcn UI components
- **hooks/**: Custom React hooks
  - `useWallet.ts`: Wallet integration
- **lib/**: Utility functions
  - `contractInteraction.ts`: Smart contract interaction
- **public/**: Static assets
- **styles/**: Global styles

## Connecting to Smart Contracts

The frontend connects to the MemePet smart contracts on the Sui blockchain. The contract addresses are configured in `lib/contractInteraction.ts`.

For testing purposes, the app uses mock data when no contracts are available.

## Design System

The app follows a NeoBrutalism design aesthetic with:

- Bold colors
- Sharp edges and shadows
- Playful elements
- Clear visual hierarchy

## License

This project is licensed under the MIT License - see the main repository for details.
