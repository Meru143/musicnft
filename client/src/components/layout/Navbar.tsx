import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ConnectButton } from "../wallet/ConnectButton";

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur flex items-center px-4 gap-4">
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tracks..."
          className="pl-9"
        />
      </div>
      <ConnectButton />
    </div>
  );
}
