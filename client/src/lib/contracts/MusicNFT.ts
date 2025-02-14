import { ethers } from "ethers";
import { web3Client } from "../web3";

// Update ABI to match exact function signatures from the smart contract
const abi = [
  "function mint(address to, uint256 trackId, uint256 amount, string memory uri, address artist, uint96 artistRoyalty) public returns (uint256)",
  "function uri(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address account, uint256 id) public view returns (uint256)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address account, address operator) external view returns (bool)",
  "function supportsInterface(bytes4 interfaceId) public view returns (bool)",
  "function listForSale(uint256 tokenId, uint256 price) external",
  "function cancelListing(uint256 tokenId) external",
  "function purchase(uint256 tokenId) external payable",
  "function listings(uint256) public view returns (address seller, uint256 price, bool active)"
];

const CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;

export class MusicNFTContract {
  private contract: ethers.Contract | null = null;

  private async validateContractAddress() {
    console.log("Validating contract address:", CONTRACT_ADDRESS);

    if (!CONTRACT_ADDRESS) {
      throw new Error("NFT contract address not configured");
    }

    if (!ethers.isAddress(CONTRACT_ADDRESS)) {
      throw new Error(`Invalid contract address: ${CONTRACT_ADDRESS}`);
    }

    return CONTRACT_ADDRESS;
  }

  async init() {
    try {
      const contractAddress = await this.validateContractAddress();
      console.log("Initializing contract with address:", contractAddress);

      const signer = web3Client.getSigner();
      if (!signer) {
        throw new Error("Please connect your wallet first");
      }

      // Create ethers Contract instance with interface
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Verify contract exists on chain
      const code = await signer.provider?.getCode(contractAddress);
      if (!code || code === '0x') {
        throw new Error(`No contract found at address ${contractAddress}`);
      }

      this.contract = contract;
      console.log("Contract initialized successfully:", this.contract.target);

      return this.contract;
    } catch (error) {
      console.error("Contract initialization error:", error);
      throw error instanceof Error ? error : new Error("Failed to initialize NFT contract");
    }
  }

  private async ensureContract() {
    if (!this.contract) {
      console.log("Contract not initialized, initializing now...");
      return await this.init();
    }

    if (!this.contract.runner || !this.contract.target) {
      console.log("Contract invalid, reinitializing...");
      return await this.init();
    }

    return this.contract;
  }

  async listForSale(tokenId: number, priceInWei: ethers.BigNumberish) {
    try {
      const contract = await this.ensureContract();
      console.log("Contract ready for listing:", contract.target);

      // Verify ownership
      const signer = web3Client.getSigner();
      if (!signer) {
        throw new Error("No signer available. Please connect your wallet.");
      }

      const address = await signer.getAddress();
      const balance = await contract.balanceOf(address, tokenId);

      if (Number(balance) <= 0) {
        throw new Error("You don't own this NFT");
      }

      // Check if already listed
      const listing = await contract.listings(tokenId);
      if (listing.active) {
        throw new Error("NFT is already listed for sale");
      }

      // Approve contract for transfer if needed
      const isApproved = await contract.isApprovedForAll(address, contract.target);
      if (!isApproved) {
        console.log("Approving contract for NFT transfer...");
        const approveTx = await contract.setApprovalForAll(contract.target, true);
        await approveTx.wait();
      }

      // List for sale with explicit parameters
      console.log("Listing NFT:", { tokenId, price: priceInWei.toString() });
      const tx = await contract.listForSale(
        ethers.getBigInt(tokenId), 
        priceInWei,
        {
          gasLimit: 300000
        }
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      return tx;
    } catch (error) {
      console.error("Failed to list NFT for sale:", error);
      throw error;
    }
  }

  async getTokenURI(tokenId: number) {
    const contract = await this.ensureContract();
    return await contract.uri(tokenId);
  }

  async getBalance(address: string, tokenId: number) {
    const contract = await this.ensureContract();
    return await contract.balanceOf(address, tokenId);
  }

  async cancelListing(tokenId: number) {
    const contract = await this.ensureContract();
    const tx = await contract.cancelListing(tokenId);
    await tx.wait();
    return tx;
  }

  async purchase(tokenId: number, options: { value: ethers.BigNumberish }) {
    const contract = await this.ensureContract();
    const tx = await contract.purchase(tokenId, options);
    await tx.wait();
    return tx;
  }

  getAddress(): string {
    if (!CONTRACT_ADDRESS) {
      throw new Error("NFT contract address not configured");
    }
    return CONTRACT_ADDRESS;
  }
}

export const musicNFTContract = new MusicNFTContract();