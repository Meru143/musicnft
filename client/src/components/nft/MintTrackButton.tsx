import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { Track } from "@shared/schema";
import { musicNFTContract } from "@/lib/contracts/MusicNFT";
import { ipfsService } from "@/lib/ipfs";
import { web3Client } from "@/lib/web3";
import { ethers } from "ethers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";

interface MintTrackButtonProps {
  track: Track;
}

const mintSchema = z.object({
  royalty: z.number()
    .min(1, "Royalty must be at least 1%")
    .max(50, "Royalty cannot exceed 50%"),
  quantity: z.number()
    .min(1, "Must mint at least 1 NFT")
    .max(100, "Cannot mint more than 100 NFTs at once"),
  price: z.number()
    .min(0, "Price cannot be negative")
    .max(1000, "Price cannot exceed 1000 ETH")
});

export function MintTrackButton({ track }: MintTrackButtonProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [royaltyPercentage, setRoyaltyPercentage] = useState("10");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0.01");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleMint = async () => {
    try {
      // Validate inputs
      const { royalty, quantity: mintQuantity, price: mintPrice } = mintSchema.parse({
        royalty: Number(royaltyPercentage),
        quantity: Number(quantity),
        price: Number(price)
      });

      // Convert percentage to basis points (e.g., 10% = 1000)
      const royaltyBasisPoints = royalty * 100;

      setIsMinting(true);

      // Check wallet connection
      const signer = web3Client.getSigner();
      if (!signer) {
        throw new Error("Please connect your wallet first");
      }

      // Get wallet address and verify network
      const address = await signer.getAddress();
      const network = await signer.provider?.getNetwork();
      console.log("Minting on network:", network?.name);

      if (network?.name !== 'sepolia') {
        throw new Error("Please switch to Sepolia testnet in your wallet");
      }

      // Create metadata for the NFT
      const metadata = {
        name: track.title,
        description: `Music NFT for track: ${track.title}`,
        image: track.albumCoverUrl,
        animation_url: track.audioUrl,
        properties: {
          duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60)
            .toString()
            .padStart(2, "0")}`,
          royalty: `${royalty}%`,
          quantity: mintQuantity,
          price: `${mintPrice} ETH`,
          files: [
            {
              uri: track.audioUrl,
              type: "audio/mp3",
            },
            {
              uri: track.albumCoverUrl,
              type: "image/jpeg",
            },
          ],
        },
      };

      // Upload metadata to IPFS
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], "metadata.json");

      toast({
        title: "Uploading Metadata",
        description: "Preparing your NFT metadata...",
      });

      const metadataUrl = await ipfsService.uploadFile(metadataFile);
      console.log("Metadata uploaded:", metadataUrl);

      toast({
        title: "Minting NFTs",
        description: `Please confirm the transaction to mint ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''} at ${mintPrice} ETH each...`,
      });

      // Initialize contract
      await musicNFTContract.init();
      console.log("Contract initialized successfully");

      // Convert price to Wei
      const priceInWei = ethers.parseEther(price.toString());

      // Mint NFTs with royalty percentage and price
      const tokenId = await musicNFTContract.mint(
        address, 
        track.id, 
        mintQuantity, 
        metadataUrl,
        address, // artist address is the minter's address
        royaltyBasisPoints,
        priceInWei
      );

      setIsDialogOpen(false);

      toast({
        title: "NFTs Minted Successfully!",
        description: (
          <div>
            <p>{`${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''} has been minted!`}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Token ID: {tokenId}
              <br />
              Quantity: {mintQuantity}
              <br />
              Price: {mintPrice} ETH
              <br />
              Royalty: {royalty}%
            </p>
          </div>
        ),
      });
    } catch (error) {
      console.error("Failed to mint NFT:", error);

      const errorMessage = error instanceof Error 
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Unknown error occurred while minting NFT";

      toast({
        variant: "destructive",
        title: "Failed to Mint NFTs",
        description: errorMessage,
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Mint as NFT
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set NFT Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (ETH)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in ETH"
            />
            <p className="text-sm text-muted-foreground">
              Initial selling price for each NFT
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter number of NFTs to mint (1-100)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="royalty">Royalty Percentage</Label>
            <Input
              id="royalty"
              type="number"
              min="1"
              max="50"
              value={royaltyPercentage}
              onChange={(e) => setRoyaltyPercentage(e.target.value)}
              placeholder="Enter royalty percentage (1-50%)"
            />
            <p className="text-sm text-muted-foreground">
              You will receive this percentage of future sales
            </p>
          </div>
          <Button
            onClick={handleMint}
            disabled={isMinting}
            className="w-full gap-2"
          >
            {isMinting ? "Minting..." : `Mint ${quantity} NFT${Number(quantity) > 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}