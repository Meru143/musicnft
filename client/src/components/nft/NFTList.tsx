import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, TagIcon } from "lucide-react";
import { web3Client } from "@/lib/web3";
import { musicNFTContract } from "@/lib/contracts/MusicNFT";
import type { Track } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
}

interface NFTItem {
  tokenId: number;
  metadata: NFTMetadata;
  balance: number;
}

export function NFTList() {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadNFTs() {
      try {
        const signer = web3Client.getSigner();
        if (!signer) {
          setError("Please connect your wallet to view your NFTs");
          setLoading(false);
          return;
        }

        const address = await signer.getAddress();

        // Initialize contract
        await musicNFTContract.init();

        // Fetch all tracks as potential NFTs
        const response = await fetch("/api/tracks");
        const tracks: Track[] = await response.json();

        const nftPromises = tracks.map(async (track) => {
          try {
            const balance = await musicNFTContract.getBalance(address, track.id);
            if (balance > 0) {
              const uri = await musicNFTContract.getTokenURI(track.id);
              const metadata = await fetch(uri).then(res => res.json());
              return {
                tokenId: track.id,
                metadata,
                balance: Number(balance)
              } as NFTItem;
            }
          } catch (err) {
            console.error(`Error loading NFT for track ${track.id}:`, err);
            return null;
          }
        });

        const results = await Promise.all(nftPromises);
        const validNFTs = results.filter((nft): nft is NFTItem => nft !== null);
        setNfts(validNFTs);
      } catch (error) {
        console.error("Failed to load NFTs:", error);
        setError(error instanceof Error ? error.message : "Failed to load NFTs");
      } finally {
        setLoading(false);
      }
    }

    loadNFTs();
  }, []);

  const handleListForSale = async (tokenId: number) => {
    try {
      // Check wallet connection first
      const signer = web3Client.getSigner();
      if (!signer) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet first using the Connect Wallet button.",
        });
        return;
      }

      // Check if we're on Sepolia network
      const chainId = web3Client.getChainId();
      if (chainId !== 11155111) {
        toast({
          title: "Wrong Network",
          description: "Switching to Sepolia testnet...",
        });

        try {
          await web3Client.switchToSepolia();
        } catch (error) {
          throw new Error("Please switch to Sepolia testnet in your wallet settings.");
        }
      }

      const priceStr = prompt("Enter the price in ETH:");
      if (!priceStr) return;

      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) {
        throw new Error("Please enter a valid price greater than 0");
      }

      // Initialize contract first
      toast({
        title: "Initializing...",
        description: "Please wait while we connect to your wallet",
      });

      // Make sure contract is initialized
      const contract = await musicNFTContract.init();
      if (!contract) {
        throw new Error("Failed to initialize NFT contract");
      }

      // Convert ETH to Wei
      const priceInWei = ethers.parseEther(priceStr);

      toast({
        title: "Listing NFT...",
        description: "Please approve the transaction in your wallet",
      });

      // List the NFT for sale
      const tx = await musicNFTContract.listForSale(tokenId, priceInWei);

      toast({
        title: "Confirming...",
        description: "Please wait while we confirm your transaction",
      });

      await tx.wait();

      // Create the listing in our backend
      const response = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId,
          seller: await signer.getAddress(),
          price: priceStr,
          metadata: nfts.find(nft => nft.tokenId === tokenId)?.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create listing in backend");
      }

      toast({
        title: "Success!",
        description: `NFT listed for ${priceStr} ETH`,
      });

      // Refresh the NFT list
      window.location.reload();
    } catch (error) {
      console.error("Failed to list NFT for sale:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to list NFT for sale. Please check your wallet connection and try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">Loading your NFTs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">No NFTs found in your wallet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map(({ tokenId, metadata, balance }) => (
        <Card key={tokenId}>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={metadata.image}
                alt={metadata.name}
                className="w-full aspect-square object-cover rounded-lg mb-4"
              />
              {balance > 1 && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 right-2 text-sm font-semibold"
                >
                  x{balance}
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-lg mb-2">{metadata.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {metadata.description}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.open(
                  `https://testnets.opensea.io/assets/sepolia/${musicNFTContract.getAddress()}/${tokenId}`,
                  '_blank'
                )}
              >
                <ExternalLink className="h-4 w-4" />
                View on OpenSea
              </Button>
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() => handleListForSale(tokenId)}
              >
                <TagIcon className="h-4 w-4" />
                List for Sale
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}