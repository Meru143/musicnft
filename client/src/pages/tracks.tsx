import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { Track } from "@shared/schema";
import { UploadTrack } from "@/components/upload/UploadTrack";
import { MintTrackButton } from "@/components/nft/MintTrackButton";

export default function TracksPage() {
  const { data: tracks } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto mb-8">
        <h1 className="text-2xl font-bold mb-4">Upload Track</h1>
        <Card>
          <CardContent className="p-4">
            <UploadTrack />
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">All Tracks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks?.map((track) => (
          <Card key={track.id}>
            <CardContent className="p-4">
              <img
                src={track.albumCoverUrl}
                alt={track.title}
                className="w-full aspect-square object-cover rounded-lg mb-4"
              />
              <h3 className="font-medium text-lg mb-3">{track.title}</h3>
              <MintTrackButton track={track} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}