import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Track, Playlist } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export default function PlaylistPage() {
  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const createPlaylist = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Playlist",
          trackIds: [],
        }),
      });
      if (!res.ok) throw new Error("Failed to create playlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Playlists</h1>
        <Button onClick={() => createPlaylist.mutate()} className="gap-2">
          <Plus className="h-4 w-4" />
          New Playlist
        </Button>
      </div>

      {playlists?.length === 0 && (
        <p className="text-muted-foreground">
          You don't have any playlists yet. Create one to get started!
        </p>
      )}
    </div>
  );
}
