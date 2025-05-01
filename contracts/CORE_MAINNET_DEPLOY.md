# Deploying Space Puzzle Game to Core Mainnet

This guide will walk you through the process of deploying the Space Puzzle Game smart contract to Core Mainnet.

## Prerequisites

1. Make sure you have Node.js and npm installed
2. Install project dependencies:
   ```bash
   cd contracts
   npm install
   ```
3. Set up your environment variables:
   - Create a `.env` file in the `contracts` directory if it doesn't exist
   - Add your private key and Core Explorer API key (if available):
     ```
     PRIVATE_KEY=your_private_key_here_without_0x_prefix
     CORE_EXPLORER_API_KEY=your_api_key_here_if_available
     ```

## Important Notes Before Deployment

1. **Ensure you have sufficient CORE tokens** in your wallet to cover deployment gas fees
2. **Back up your private key** and never share it with anyone
3. **Test thoroughly on testnet** before deploying to mainnet
4. Consider using a dedicated wallet for deployment rather than your primary wallet

## Deployment Steps

1. Compile the contract:

   ```bash
   npx hardhat compile
   ```

2. Deploy to Core Mainnet:

   ```bash
   npx hardhat run scripts/deploy.js --network core_mainnet
   ```

3. After successful deployment, you'll see a message like:

   ```
   Deploying contracts with the account: 0xYourAddress
   Account balance: YourBalance
   SpacePuzzleGame deployed to: 0xContractAddress
   ```

4. **Save the contract address** - you'll need it to update your frontend configuration

## Verifying the Contract (Optional)

If you have a Core Explorer API key, you can verify your contract:

```bash
npx hardhat verify --network core_mainnet 0xContractAddress
```

## Updating Frontend Configuration

After deployment, you need to update your frontend to use the mainnet contract:

1. Update the contract address in your environment variables:

   - Edit `.env.local` in the project root
   - Add or update:
     ```
     NEXT_PUBLIC_SPACE_PUZZLE_GAME_ADDRESS=0xYourContractAddress
     NEXT_PUBLIC_NETWORK_ID=1116
     ```

2. If you're using a contract address configuration file, update it with the mainnet address:
   - Look for `src/lib/contracts/index.ts` or similar
   - Update the `CONTRACT_ADDRESSES` object with your mainnet address

## Testing the Deployment

1. Make sure your MetaMask or wallet is connected to Core Mainnet:

   - Network Name: Core Blockchain Mainnet
   - RPC URL: https://rpc.coredao.org/
   - Chain ID: 1116 (0x45c)
   - Currency Symbol: CORE
   - Block Explorer URL: https://scan.coredao.org

2. Launch your application and test the contract interactions

## Troubleshooting

- If you encounter gas estimation errors, try setting a manual gas limit in the deployment script
- If the contract fails to deploy, check your account balance and network connection
- For verification issues, ensure your contract source code matches exactly what was deployed

## Security Considerations

- Consider implementing a timelock or admin controls for critical functions
- Monitor your contract for unusual activity after deployment
- Consider having your contract audited by a professional security firm

## Maintenance

- Keep track of your deployed contract address and transaction hash
- Document any issues or improvements for future updates
- Consider implementing upgrade patterns if you plan to update the contract in the future
