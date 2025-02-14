import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { web3Client, type Web3State } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export function ConnectButton() {
  const [state, setState] = useState<Web3State>({
    status: "disconnected",
    address: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    return web3Client.subscribe((newState) => {
      setState(newState);
      if (newState.error) {
        if (newState.error.includes("No Web3 wallet found")) {
          toast({
            variant: "destructive",
            title: "MetaMask Required",
            description: (
              <div>
                <p>Please install MetaMask to connect your wallet:</p>
                <ol className="list-decimal pl-4 mt-2">
                  <li>Visit <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">metamask.io</a></li>
                  <li>Click "Download" and install the extension</li>
                  <li>Create or import a wallet</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            ),
          });
        } else {
          toast({
            variant: "destructive",
            title: "Wallet Error",
            description: newState.error,
          });
        }
      }
    });
  }, [toast]);

  const handleClick = () => {
    if (state.status === "connected") {
      web3Client.disconnect();
    } else {
      web3Client.connect();
    }
  };

  return (
    <Button
      variant={state.status === "connected" ? "secondary" : "default"}
      onClick={handleClick}
      disabled={state.status === "connecting"}
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {state.status === "connecting"
        ? "Connecting..."
        : state.status === "connected"
        ? `${state.address?.slice(0, 6)}...${state.address?.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  );
}