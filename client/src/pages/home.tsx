import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { Track, Artist } from "@shared/schema";

export default function Home() {
  const { data: tracks } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { data: artists } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  return (
    <div className="p-6">
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Top Tracks</h2>
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
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artists?.map((artist) => (
            <Card key={artist.id}>
              <CardContent className="p-4">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full aspect-square object-cover rounded-full mb-4"
                />
                <h3 className="font-medium text-center">{artist.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
