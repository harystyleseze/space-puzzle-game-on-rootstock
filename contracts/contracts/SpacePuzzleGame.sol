// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SpacePuzzleGame is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Struct to store player data
    struct Player {
        uint256 points;         // Total points accumulated
        uint256 keys;           // Number of keys owned
        uint256 lastClaimTime;  // Last time points were claimed
        uint256 highScore;      // Highest score achieved
        uint256 currentScore;   // Current game score
        uint256 currentLevel;   // Current game level
        uint256 highestLevel;   // Highest level achieved
        mapping(uint256 => bool) badges; // Badges owned by type (1=Bronze, 2=Silver, 3=Gold)
    }

    // Constants
    uint256 public constant DAILY_POINTS = 1;     // Number of points claimable daily
    uint256 public constant CLAIM_COOLDOWN = 5 minutes; // 1 days actually
    uint256 public constant KEYS_PER_POINT_CONVERSION = 50;  // Keys needed for 10 points
    uint256 public constant POINTS_PER_CONVERSION = 10;      // Points awarded per 50 keys

    // Badge score thresholds
    uint256 public constant BRONZE_THRESHOLD = 50;
    uint256 public constant SILVER_THRESHOLD = 200;
    uint256 public constant GOLD_THRESHOLD = 900;

    // Mapping to store player data
    mapping(address => Player) private players;
    
    // Array to store top 10 scores
    struct HighScore {
        address player;
        uint256 score;
    }
    HighScore[10] public topScores;

    // Events
    event BadgeMinted(address indexed player, uint256 tokenId, uint256 badgeType);
    event PointsClaimed(address indexed player, uint256 amount);
    event KeysConverted(address indexed player, uint256 keysUsed, uint256 pointsGained);
    event KeysAdded(address indexed player, uint256 amount);
    event KeysRemoved(address indexed player, uint256 amount);
    event ScoreUpdated(address indexed player, uint256 newScore);
    event LevelUpdated(address indexed player, uint256 newLevel);

    constructor() ERC721("SpacePuzzle Badge", "SPB") {
        // Initialize top scores with empty values
        for (uint256 i = 0; i < 10; i++) {
            topScores[i] = HighScore(address(0), 0);
        }
    }

    // Claim daily points
    function claimDailyPoints() external {
        require(
            block.timestamp >= players[msg.sender].lastClaimTime + CLAIM_COOLDOWN,
            "Wait for cooldown"
        );
        
        players[msg.sender].points += DAILY_POINTS;
        players[msg.sender].lastClaimTime = block.timestamp;
        
        emit PointsClaimed(msg.sender, DAILY_POINTS);
        
        // Check if player qualifies for new badges after claiming points
        _checkAndMintBadges(msg.sender, players[msg.sender].points);
    }

    // Convert keys to points (50 keys = 10 points)
    function convertKeysToPoints(uint256 keyAmount) external {
        require(keyAmount >= KEYS_PER_POINT_CONVERSION, "Not enough keys to convert");
        require(keyAmount % KEYS_PER_POINT_CONVERSION == 0, "Key amount must be a multiple of 50");
        
        uint256 keysToUse = keyAmount;
        require(players[msg.sender].keys >= keysToUse, "Not enough keys");
        
        uint256 pointsToAdd = (keysToUse / KEYS_PER_POINT_CONVERSION) * POINTS_PER_CONVERSION;
        
        players[msg.sender].keys -= keysToUse;
        players[msg.sender].points += pointsToAdd;
        
        emit KeysConverted(msg.sender, keysToUse, pointsToAdd);
        
        // Check if player qualifies for new badges after converting
        _checkAndMintBadges(msg.sender, players[msg.sender].points);
    }

    // Add keys to player
    function addKeys(uint256 amount) external {
        players[msg.sender].keys += amount;
        emit KeysAdded(msg.sender, amount);
    }

    // Remove keys from player
    function removeKeys(uint256 amount) external {
        require(players[msg.sender].keys >= amount, "Not enough keys");
        players[msg.sender].keys -= amount;
        emit KeysRemoved(msg.sender, amount);
    }

    // Update player's high score and potentially mint badge
    function updateHighScore(uint256 newScore) external {
        require(newScore > players[msg.sender].highScore, "Score not higher than current high score");
        
        players[msg.sender].highScore = newScore;
        _updateTopScores(msg.sender, newScore);
        
        emit ScoreUpdated(msg.sender, newScore);
    }

    // Update player's current score
    function updateCurrentScore(uint256 newScore) external {
        players[msg.sender].currentScore = newScore;
        
        // If current score is higher than high score, update high score too
        if (newScore > players[msg.sender].highScore) {
            players[msg.sender].highScore = newScore;
            _updateTopScores(msg.sender, newScore);
        }
        
        emit ScoreUpdated(msg.sender, newScore);
    }

    // Update player's current level
    function updateCurrentLevel(uint256 newLevel) external {
        players[msg.sender].currentLevel = newLevel;
        
        // If current level is higher than highest level, update highest level too
        if (newLevel > players[msg.sender].highestLevel) {
            players[msg.sender].highestLevel = newLevel;
        }
        
        emit LevelUpdated(msg.sender, newLevel);
    }

    // Update player's highest level
    function updateHighestLevel(uint256 newLevel) external {
        require(newLevel > players[msg.sender].highestLevel, "Level not higher than current highest level");
        
        players[msg.sender].highestLevel = newLevel;
        
        emit LevelUpdated(msg.sender, newLevel);
    }

    // Check and mint badges based on points
    function _checkAndMintBadges(address player, uint256 points) internal {
        if (points >= GOLD_THRESHOLD && !players[player].badges[3]) {
            _mintBadge(player, 3); // Gold badge
            players[player].badges[3] = true;
        } 
        if (points >= SILVER_THRESHOLD && !players[player].badges[2]) {
            _mintBadge(player, 2); // Silver badge
            players[player].badges[2] = true;
        } 
        if (points >= BRONZE_THRESHOLD && !players[player].badges[1]) {
            _mintBadge(player, 1); // Bronze badge
            players[player].badges[1] = true;
        }
    }

    // Public function to mint badge (for admin use or special events)
    function mintBadge(address player, uint256 badgeType) external onlyOwner {
        require(badgeType >= 1 && badgeType <= 3, "Invalid badge type");
        require(!players[player].badges[badgeType], "Badge already owned");
        
        _mintBadge(player, badgeType);
        players[player].badges[badgeType] = true;
    }

    // Internal function to mint badge NFT
    function _mintBadge(address player, uint256 badgeType) internal {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(player, newTokenId);
        
        emit BadgeMinted(player, newTokenId, badgeType);
    }

    // Internal function to update top scores
    function _updateTopScores(address player, uint256 score) internal {
        // Find position for new score
        uint256 position = 10;
        for (uint256 i = 0; i < 10; i++) {
            if (score > topScores[i].score) {
                position = i;
                break;
            }
        }
        
        // If score makes it to top 10, update array
        if (position < 10) {
            for (uint256 i = 9; i > position; i--) {
                topScores[i] = topScores[i-1];
            }
            topScores[position] = HighScore(player, score);
        }
    }

    // View functions
    function getPlayerPoints(address player) external view returns (uint256) {
        return players[player].points;
    }

    function getPlayerKeys(address player) external view returns (uint256) {
        return players[player].keys;
    }

    function getPlayerHighScore(address player) external view returns (uint256) {
        return players[player].highScore;
    }

    function getPlayerCurrentScore(address player) external view returns (uint256) {
        return players[player].currentScore;
    }

    function getPlayerCurrentLevel(address player) external view returns (uint256) {
        return players[player].currentLevel;
    }

    function getPlayerHighestLevel(address player) external view returns (uint256) {
        return players[player].highestLevel;
    }

    function getTopScores() external view returns (HighScore[10] memory) {
        return topScores;
    }

    function getNextClaimTime(address player) external view returns (uint256) {
        return players[player].lastClaimTime + CLAIM_COOLDOWN;
    }

    function getPlayerBadges(address player) external view returns (bool[3] memory) {
        bool[3] memory badges;
        badges[0] = players[player].badges[1]; // Bronze
        badges[1] = players[player].badges[2]; // Silver
        badges[2] = players[player].badges[3]; // Gold
        return badges;
    }

    function hasBadge(address player, uint256 badgeType) external view returns (bool) {
        require(badgeType >= 1 && badgeType <= 3, "Invalid badge type");
        return players[player].badges[badgeType];
    }

    // Reset player data (for testing or special cases)
    function resetPlayerData(address player) external onlyOwner {
        delete players[player];
    }
} 