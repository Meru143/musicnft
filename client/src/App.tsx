import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ArtistPage from "@/pages/artist";
import PlaylistPage from "@/pages/playlist";
import TracksPage from "@/pages/tracks";
import MyNFTsPage from "@/pages/my-nfts";
import MarketplacePage from "@/pages/marketplace";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AudioPlayer } from "@/components/player/AudioPlayer";
import { mockTracks } from "@/lib/constants";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/artist/:id" component={ArtistPage} />
      <Route path="/playlists" component={PlaylistPage} />
      <Route path="/tracks" component={TracksPage} />
      <Route path="/my-nfts" component={MyNFTsPage} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        <main className="pl-64 pt-16 pb-24 min-h-screen">
          <Router />
        </main>
        <AudioPlayer track={mockTracks[0]} />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;