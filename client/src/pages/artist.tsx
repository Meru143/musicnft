import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import type { Artist, Track } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function ArtistPage() {
  const [, params] = useRoute("/artist/:id");
  const artistId = parseInt(params?.id || "0");

  const { data: artist } = useQuery<Artist>({
    queryKey: [`/api/artists/${artistId}`],
  });

  const { data: tracks } = useQuery<Track[]>({
    queryKey: [`/api/artists/${artistId}/tracks`],
  });

  if (!artist) return null;

  return (
    <div className="p-6">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-32 h-32 rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
          <p className="text-muted-foreground">{artist.bio}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Tracks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks?.map((track) => (
          <Card key={track.id}>
            <CardContent className="p-4">
              <img
                src={track.albumCoverUrl}
                alt={track.title}
                className="w-full aspect-square object-cover rounded-lg mb-4"
              />
              <h3 className="font-medium">{track.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
