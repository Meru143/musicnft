import { Home, Disc, Users, ListMusic, Wallet, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Disc, label: "Tracks", href: "/tracks" },
  { icon: Users, label: "Artists", href: "/artists" },
  { icon: ListMusic, label: "Playlists", href: "/playlists" },
  { icon: Wallet, label: "My NFTs", href: "/my-nfts" },
  { icon: ShoppingCart, label: "Marketplace", href: "/marketplace" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background p-4">
      <nav className="space-y-2">
        {links.map(({ icon: Icon, label, href }) => (
          <Link key={href} href={href}>
            <Button
              variant={location === href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                location === href && "bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}