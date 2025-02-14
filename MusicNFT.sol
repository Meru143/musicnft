// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract MusicNFT is ERC1155, ERC2981, Ownable {
    // Mapping from token ID to token URI
    mapping(uint256 => string) private _uris;

    // Mapping from token ID to artist address
    mapping(uint256 => address) public artistAddresses;

    // Mapping for NFT listings
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    mapping(uint256 => Listing) public listings;

    // Counter for generating unique token IDs
    uint256 private _currentTokenId = 0;

    // Platform fee percentage (e.g., 250 = 2.5%)
    uint96 public constant PLATFORM_FEE = 250;

    constructor() ERC1155("") Ownable(msg.sender) {}

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _uris[tokenId];
    }

    function mint(
        address to,
        uint256 trackId,
        uint256 amount,
        string memory tokenURI,
        address artist,
        uint96 artistRoyalty // in basis points (e.g., 1000 = 10%)
    ) public returns (uint256) {
        require(artistRoyalty <= 5000, "Royalty too high"); // Max 50%

        // Generate new unique token ID
        _currentTokenId++;
        uint256 newTokenId = _currentTokenId;

        // Set token URI
        _uris[newTokenId] = tokenURI;

        // Store artist address
        artistAddresses[newTokenId] = artist;

        // Set royalty information for this token
        // Total royalty = artist royalty + platform fee
        _setTokenRoyalty(newTokenId, address(this), artistRoyalty + PLATFORM_FEE);

        // Mint the token
        _mint(to, newTokenId, amount, "");

        return newTokenId;
    }

    // List an NFT for sale
    function listForSale(uint256 tokenId, uint256 price) external {
        require(balanceOf(msg.sender, tokenId) > 0, "Not the token owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "Already listed");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
    }

    // Cancel a listing
    function cancelListing(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].active, "Not listed");

        delete listings[tokenId];
    }

    // Purchase a listed NFT
    function purchase(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not listed for sale");
        require(msg.value >= listing.price, "Insufficient payment");

        // Get the seller
        address seller = listing.seller;
        require(seller != msg.sender, "Cannot buy your own NFT");

        // Calculate royalties
        (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(tokenId, msg.value);
        require(royaltyReceiver == address(this), "Invalid royalty receiver");

        // Transfer NFT to buyer
        _safeTransferFrom(seller, msg.sender, tokenId, 1, "");

        // Remove listing
        delete listings[tokenId];

        // Pay royalties and seller
        if (royaltyAmount > 0) {
            // Split royalties between artist and platform
            address artist = artistAddresses[tokenId];
            (,uint256 totalRoyalty) = royaltyInfo(tokenId, 10000); // Get basis points
            uint256 artistShare = (royaltyAmount * (totalRoyalty - PLATFORM_FEE)) / totalRoyalty;
            uint256 platformShare = royaltyAmount - artistShare;

            // Transfer royalties
            payable(artist).transfer(artistShare);
            payable(owner()).transfer(platformShare);
        }

        // Transfer remaining amount to seller
        payable(seller).transfer(msg.value - royaltyAmount);
    }

    // Override required function to make ERC2981 work with ERC1155
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Allow contract to receive ETH for royalties
    receive() external payable {}
}