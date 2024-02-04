// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

// Import thirdweb contracts
import "@thirdweb-dev/contracts/drop/DropERC1155.sol"; // For my collection of Pickaxes
import "@thirdweb-dev/contracts/drop/DropERC721.sol"; // For my collection of Miners
import "@thirdweb-dev/contracts/token/TokenERC20.sol"; // For my ERC-20 Token contract
import "@thirdweb-dev/contracts/openzeppelin-presets/utils/ERC1155/ERC1155Holder.sol";
import "@thirdweb-dev/contracts/extension/Staking721.sol";
import "@thirdweb-dev/contracts/eip/interface/IERC20.sol";


// OpenZeppelin (ReentrancyGuard)
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Mining is ReentrancyGuard{

    DropERC721 public immutable catsNftCollection;
    TokenERC20 public immutable rewardsToken;
    address public rewardToken;
    address public deployer;


    constructor(
        DropERC721 catsContractAddress,
        TokenERC20 tweakyContractAddress
    ) {
        catsNftCollection = catsContractAddress;
        rewardsToken = tweakyContractAddress;
    }


    struct MapValue {
        address owner;
        uint256 startTime;
    }

    mapping(uint256 => MapValue) public miningMap;


    function stake(uint256 _tokenId) external nonReentrant {
        // Ensure the player has at least 1 of the token they are trying to stake
        require(
            catsNftCollection.balanceOf(msg.sender, _tokenId) >= 1,
            "You must have at least 1 of the pickaxe you are trying to stake"
        );


        // Transfer the pickaxe to the contract
        catsNftCollection.safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId,
            "Staking your cats"
        );

        // Update the  mapping
        miningMap[_tokenId].owner = msg.sender;
        miningMap[_tokenId].startTime = block.timestamp;


    }

    function withdraw(uint256 _tokenId) external nonReentrant {
        // Ensure the player has a pickaxe
        require(
            miningMap[_tokenId].owner == msg.sender,
            "You must have a cat to withdraw"
        );

        // Calculate the rewards they are owed, and pay them out.
        uint256 reward = calculateRewards(_tokenId);
        rewardsToken.transfer(msg.sender, reward);

        // Send the pickaxe back to the player
        pickaxeNftCollection.safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId,
            "Returning your old pickaxe"
        );
    }

    function claim(_tokenId) external nonReentrant {
        // Calculate the rewards they are owed, and pay them out.
        require(
            miningMap[_tokenId].owner == msg.sender,
            "You must own the cat"
        );
        uint256 reward = calculateRewards(_tokenId);
        rewardsToken.transfer(msg.sender, reward);
    }

    // ===== Internal ===== \\

    // Calculate the rewards the player is owed since last time they were paid out
    // The rewards rate is 20,000,000 per block.
    // This is calculated using block.timestamp and the playerLastUpdate.
    // If playerLastUpdate or playerPickaxe is not set, then the player has no rewards.
    function calculateRewards(uint _tokenId)
        public
        view
        returns (uint256 _rewards)
    {

        // Calculate the time difference between now and the last time they staked/withdrew/claimed their rewards
        uint256 timeDifference = block.timestamp -
            miningMap[_tokenId].startTime;

        // Calculate the rewards they are owed
        uint256 rewards = timeDifference *
            10_000_000_000_000;

        // Return the rewards
        return rewards;
    }
}

