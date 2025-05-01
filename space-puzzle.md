# Space Puzzle Game

A strategic puzzle game where you navigate through space, collect keys, and use teleporters to reach your goal while managing limited resources.

## How to Play

### Controls

- **Desktop:**

  - Arrow keys (←↑↓→) to move the spaceship
  - P to pause/unpause
  - R to restart
  - ESC to quit

- **Mobile:**
  - Swipe in any direction to move
  - On-screen control pad with arrow buttons
  - P button to pause/unpause
  - R button to restart
  - Swipe down or tap ESC to quit

### Game Elements

#### 🚀 Spaceship

- Your character, always starts from the left side
- Can move one grid space at a time
- Cannot move through asteroids

#### 🔑 Keys (Alien Bullets)

- Collect these to unlock barriers and portals
- Each key has a unique color
- Keys are scarce resources - use them wisely
- Total keys are displayed at the top of the screen

#### 🚧 Barriers (Alien4)

- Match the color of a key
- Requires one key to remove
- Strategic placement - usually blocking important paths
- Running out of keys while blocked by barriers leads to game over

#### ☄️ Asteroids (Alien1)

- Immovable obstacles
- Cannot pass through them
- Hitting an asteroid plays error sound
- Used to create maze-like paths

#### 🌀 Teleporters

- Come in pairs with matching colors
- Instantly transport you between paired locations
- Strategic tool for avoiding obstacles
- No key required to use

#### 🌟 Portal (Alien3)

- Level completion point
- Requires at least one key to activate
- Located on the right side of the grid
- Position alternates between levels

### Scoring System

- Score increases based on level completion
- Higher levels give more points
- Score multiplier increases with level difficulty
- High score is preserved between sessions

### Strategy Guide

1. **Resource Management**

   - Don't collect keys unless necessary
   - Plan your route before moving
   - Save keys for barriers blocking the portal
   - Consider if removing a barrier is necessary

2. **Level Navigation**

   - Scout the entire level before moving
   - Look for teleporter pairs
   - Identify the most efficient path to keys
   - Watch for asteroid patterns

3. **Advanced Techniques**
   - Use teleporters to bypass barriers
   - Collect keys in order of necessity
   - Leave optional barriers if you have enough keys
   - Remember portal position alternates each level

### Level Progression

1. **Early Levels (1-3)**

   - Fewer obstacles
   - 2-3 keys available
   - Simple barrier placements
   - Limited teleporters

2. **Mid Levels (4-6)**

   - More complex layouts
   - Strategic teleporter placement
   - Increased number of barriers
   - Requires careful key management

3. **Advanced Levels (7+)**
   - Maximum challenge
   - Limited keys (max 4)
   - Complex asteroid patterns
   - Strategic use of teleporters essential

### Tips for Success

1. **Key Management**

   - Always maintain at least one key
   - Prioritize collecting keys near the start
   - Don't waste keys on optional paths

2. **Navigation**

   - Use teleporters to save time
   - Avoid getting trapped by asteroids
   - Plan escape routes before moving

3. **Score Maximization**
   - Complete levels quickly
   - Progress to higher levels
   - Maintain key efficiency
   - Avoid game over to keep score

### Design Decisions

1. **Progressive Difficulty**

   - Gradual increase in complexity
   - Scaled number of obstacles
   - Balanced key-to-barrier ratio
   - Increasing strategic depth

2. **Resource Scarcity**

   - Limited keys create tension
   - Forces strategic decisions
   - Rewards careful planning
   - Prevents brute-force solutions

3. **Mobile Optimization**

   - Responsive canvas sizing
   - Touch controls with visual feedback
   - Clear visual indicators
   - Accessible button placement

4. **Visual Clarity**
   - Color-coded elements
   - Clear object relationships
   - Distinct game elements
   - Status information positioning

### Common Pitfalls to Avoid

1. Using keys too early without planning ahead
2. Getting trapped between asteroids and barriers
3. Not checking teleporter destinations
4. Forgetting to save a key for the portal
5. Ignoring the alternating portal position

Remember: The key to success is careful planning and resource management. Take your time, analyze the level, and make every move count!

## Web3 Integration

The game includes blockchain integration for achievement badges using the SpacePuzzleGame smart contract.

### Smart Contract Features

- **NFT Achievement Badges**: Earn unique badges as you progress through the game
- **On-chain Progress Tracking**: Your game achievements are stored on the blockchain
- **Daily Points**: Claim daily points to boost your in-game resources
- **Badge Types**:
  - Bronze Explorer: Reach a score of 50 or higher
  - Silver Navigator: Reach a score of 200 or higher
  - Gold Commander: Reach a score of 900 or higher

### Setting Up Web3 Integration

1. **Configure Contract Address**:

   - Update the `.env.local` file with your deployed contract address:

   ```
   NEXT_PUBLIC_SPACE_PUZZLE_GAME_ADDRESS=your_contract_address_here
   ```

2. **Connect Your Wallet**:

   - Use the Web3Connect component to connect your Ethereum wallet
   - Supports MetaMask and other Web3 providers

3. **View Your Stats and Badges**:
   - Once connected, you can view your points, high score, and next claim time
   - Badges are displayed based on your high score achievements
   - Claim daily points when available

### Contract ABI

The contract ABI is stored in `src/lib/contracts/SpacePuzzleGame.json` and is automatically loaded by the application.

### Development Notes

- The contract interaction is handled through the `useSpacePuzzleContract` hook in `src/hooks/useSpacePuzzleContract.ts`
- Score updates trigger badge minting based on predefined thresholds
- The Web3Connect component provides a user interface for interacting with the contract

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

cd into the src folder, create a dashboard for most of the user functionalities from the smart contract. Properly handle client and server side requests. From the smart contract there are different things/functionalities however, lets focus on the
