import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { truncateAddress } from "@/lib/utils";

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

interface NFTCardProps {
  nft: NFTListing;
  onPurchase: () => void;
}

export function NFTCard({ nft, onPurchase }: NFTCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <img
          src={nft.metadata.image}
          alt={nft.metadata.name}
          className="w-full aspect-square object-cover rounded-lg mb-4"
        />
        <h3 className="font-medium text-lg mb-2">{nft.metadata.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {nft.metadata.description}
        </p>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Seller: {truncateAddress(nft.seller)}</span>
          <span className="font-medium text-primary">
            {nft.price} ETH
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onPurchase} 
          className="w-full gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Purchase
        </Button>
      </CardFooter>
    </Card>
  );
}
