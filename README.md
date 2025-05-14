# MemePet - Virtual Pets on Sui Blockchain

MemePet is a decentralized application (dApp) on the Sui blockchain that transforms memecoins into virtual pets with AI-powered personalities. Users can create, train, interact with, and trade their MemePets in a gamified ecosystem.

![MemePet Banner](https://placeholder.com/banner.png)

## Features

### Core Features
- 🐕 **Create MemePets**: Transform your favorite memecoins into virtual pets
- 🎮 **Train & Play**: Interact with your pets through various activities
- 📈 **Leveling System**: Pets gain experience and level up with interactions
- 🎯 **Missions**: Send your pets on timed missions to earn rewards
- 💬 **AI Chat**: Chat with your pet's unique AI personality
- 💰 **Marketplace**: Buy, sell, and trade MemePets with other users

### Technical Features
- 🔐 **Sui Blockchain Integration**: Secure ownership and transparent transactions
- 👛 **Wallet Connection**: Seamless integration with Sui wallets
- 🎨 **NeoBrutalism Design**: Bold, playful aesthetics with sharp edges and vibrant colors

## Project Structure

### Smart Contracts (`/suimemecontract`)
- `memepet.move`: Core pet functionality including creation, attributes, and basic interactions
- `pet_actions.move`: Missions system and time-based rewards
- `pet_market.move`: Marketplace functionality for buying and selling pets

### Frontend (`/suimemeapp`)
- **Pages**
  - `index.tsx`: Landing page
  - `create-pet/index.tsx`: Pet creation interface
  - `pets/index.tsx`: Pet management dashboard
  - `marketplace/index.tsx`: Buy and sell pets
- **Components**
  - UI components with 8bitcn styling
  - Custom NeoBrutalism design system

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Sui CLI](https://docs.sui.io/build/install) for smart contract deployment
- A Sui wallet (like Sui Wallet browser extension)

### Frontend Setup
```bash
# Navigate to the frontend directory
cd suimemeapp

# Install dependencies
npm install
# or
yarn
# or
pnpm install

# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Smart Contract Setup
```bash
# Navigate to the contract directory
cd suimemecontract

# Build the smart contract
sui move build

# Publish the smart contract (replace with your own address)
sui client publish --gas-budget 10000000
```

## Development Roadmap

- ✅ **Phase 1**: Smart contract development
  - Core pet functionality
  - Pet actions and missions
  - Marketplace implementation

- ✅ **Phase 2**: Frontend development
  - User interface design
  - Wallet integration
  - Basic pet interactions

- 🔄 **Phase 3**: AI Integration
  - Pet personality generation
  - Chat functionality
  - Adaptive behavior

- 📅 **Phase 4**: Advanced Features
  - Pet evolution
  - Breeding system
  - Special limited edition pets

## Technologies Used

- **Blockchain**
  - Sui Move language
  - Sui SDK for blockchain interaction

- **Frontend**
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Framer Motion for animations
  - 8bitcn component library

- **Integration**
  - @mysten/dapp-kit for wallet connection
  - ShadCN UI components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/yourusername/memepet](https://github.com/yourusername/memepet)

---

Built with ❤️ by the MemePet Team

