import { Card, CardContent } from "@/components/ui/card";
import { NFTList } from "@/components/nft/NFTList";
import { web3Client } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function MyNFTsPage() {
  const connectWallet = () => {
    web3Client.connect();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My NFT Collection</h1>
      
      {web3Client.getSigner() ? (
        <NFTList />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view your NFT collection
            </p>
            <Button onClick={connectWallet} className="gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
