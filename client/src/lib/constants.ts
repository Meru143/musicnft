import type { Artist, Track } from "@shared/schema";

export const mockArtists: Artist[] = [
  {
    id: 1,
    name: "Ethereal Echo",
    imageUrl: "https://images.unsplash.com/photo-1517697471339-4aa32003c11a",
    bio: "Pioneering blockchain-based electronic music",
  },
  {
    id: 2,
    name: "Digital Dreamers",
    imageUrl: "https://images.unsplash.com/photo-1499557354967-2b2d8910bcca",
    bio: "Pushing the boundaries of digital sound",
  },
];

export const mockTracks: Track[] = [
  {
    id: 1,
    title: "Blockchain Beat",
    artistId: 1,
    albumCoverUrl: "https://images.unsplash.com/photo-1587731556938-38755b4803a6",
    audioUrl: "https://example.com/audio1.mp3",
    duration: 180,
  },
  {
    id: 2,
    title: "Crypto Rhythm",
    artistId: 1,
    albumCoverUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167",
    audioUrl: "https://example.com/audio2.mp3",
    duration: 210,
  },
];
