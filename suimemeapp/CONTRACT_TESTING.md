# Contract Testing Guide

## Deployed Contract Information

- **Package ID**: `0xd4ee2dfed544edb28216f7dd587416817afa7f69ca9e9683fdfc529871dff059`
- **Admin Cap ID**: `0x7925580cb274c7d5c89207d72e53fc2862b4830865b813bd95d1be62bbfb64f8`
- **Network**: Sui Testnet

## Testing Pet Creation

1. **Connect Wallet**: Make sure you have a Sui wallet with testnet SUI
2. **Navigate to Create Pet**: Go to `/create-pet` page
3. **Select Memecoin**: Choose from UNI, GLUB, or LOFI
4. **Configure Pet**: Enter a name and select pet type
5. **Create Pet**: Pay 0.1 SUI fee to create your pet

## Contract Functions Available

### Core Pet Functions
- `create_pet`: Create a new pet (costs 0.1 SUI)
- `feed_pet`: Feed your pet to increase health
- `interact_with_pet`: Play with your pet to increase happiness
- `train_pet`: Train your pet to gain experience

### Mission Functions
- `start_mission`: Send pet on a mission
- `complete_mission`: Complete a mission to earn rewards

### Marketplace Functions
- `create_listing`: List your pet for sale
- `buy_pet`: Purchase a pet from marketplace
- `cancel_listing`: Cancel your listing

## Troubleshooting

### Common Issues
1. **"Invalid params" error**: Usually means wrong parameter types
2. **"Insufficient funds" error**: Need at least 0.1 SUI for pet creation
3. **"Wallet not connected" error**: Connect your Sui wallet first

### Transaction Debugging
- Check browser console for detailed error messages
- Verify you're on Sui testnet
- Ensure sufficient SUI balance for gas fees

## Contract Addresses

The contract supports these memecoin addresses:
- UNI: `0xc905c9263609d6ea700ff6267978107336beab3df377d58a1c53f6e25b7630ee`
- GLUB: `0x33fb202f090f797eab5dc35e64cffbb051341dc4df6af4c3fba685390bf94df7`
- LOFI: `0xd6918afa64d432b84b48088d165b0dda0b7459463a7d66365f7ff890cae22d2d` 