import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { NFTCard } from "@/components/nft/NFTCard";
import { useToast } from "@/hooks/use-toast";
import { web3Client } from "@/lib/web3";
import { musicNFTContract } from "@/lib/contracts/MusicNFT";
import { ethers } from "ethers";

interface NFTListing {
  tokenId: number;
  seller: string;
  price: string;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}

export default function MarketplacePage() {
  const { toast } = useToast();
  const { data: listings, isLoading } = useQuery<NFTListing[]>({
    queryKey: ["/api/marketplace/listings"],
  });

  const handlePurchase = async (listing: NFTListing) => {
    try {
      const signer = web3Client.getSigner();
      if (!signer) {
        throw new Error("Please connect your wallet first");
      }

      const priceInWei = ethers.parseEther(listing.price);
      
      // Initialize contract
      await musicNFTContract.init();

      // Purchase NFT
      const tx = await musicNFTContract.purchase(listing.tokenId, {
        value: priceInWei
      });

      toast({
        title: "Purchasing NFT...",
        description: "Please wait for the transaction to complete",
      });

      await tx.wait();

      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${listing.metadata.name}`,
      });

    } catch (error) {
      console.error("Failed to purchase NFT:", error);
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to purchase NFT",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">NFT Marketplace</h1>
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Loading marketplace listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">NFT Marketplace</h1>
      {listings?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">No NFTs currently listed for sale</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings?.map((listing) => (
            <NFTCard
              key={listing.tokenId}
              nft={listing}
              onPurchase={() => handlePurchase(listing)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
