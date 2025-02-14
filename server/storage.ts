import { type Artist, type Track, type Playlist, type InsertArtist, type InsertTrack, type InsertPlaylist } from "@shared/schema";

export interface IStorage {
  // Artists
  getArtist(id: number): Promise<Artist | undefined>;
  listArtists(): Promise<Artist[]>;

  // Tracks
  getTrack(id: number): Promise<Track | undefined>;
  listTracks(): Promise<Track[]>;
  getTracksByArtist(artistId: number): Promise<Track[]>;
  searchTracks(query: string): Promise<Track[]>;
  createTrack(track: InsertTrack): Promise<Track>;

  // Playlists
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist>;
}

export class MemStorage implements IStorage {
  private artists: Map<number, Artist>;
  private tracks: Map<number, Track>;
  private playlists: Map<number, Playlist>;
  private currentIds: {
    artist: number;
    track: number;
    playlist: number;
  };

  constructor() {
    this.artists = new Map();
    this.tracks = new Map();
    this.playlists = new Map();
    this.currentIds = {
      artist: 1,
      track: 1,
      playlist: 1,
    };

    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock artists
    const mockArtists: InsertArtist[] = [
      {
        name: "Ethereal Echo",
        imageUrl: "https://images.unsplash.com/photo-1517697471339-4aa32003c11a",
        bio: "Pioneering blockchain-based electronic music",
      },
      {
        name: "Digital Dreamers",
        imageUrl: "https://images.unsplash.com/photo-1499557354967-2b2d8910bcca",
        bio: "Pushing the boundaries of digital sound",
      },
    ];

    mockArtists.forEach(artist => {
      const id = this.currentIds.artist++;
      this.artists.set(id, { ...artist, id });
    });

    // Mock tracks
    const mockTracks: InsertTrack[] = [
      {
        title: "Blockchain Beat",
        artistId: 1,
        albumCoverUrl: "https://images.unsplash.com/photo-1587731556938-38755b4803a6",
        audioUrl: "https://example.com/audio1.mp3",
        duration: 180,
      },
      {
        title: "Crypto Rhythm",
        artistId: 1,
        albumCoverUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167",
        audioUrl: "https://example.com/audio2.mp3",
        duration: 210,
      },
    ];

    mockTracks.forEach(track => {
      const id = this.currentIds.track++;
      this.tracks.set(id, { ...track, id });
    });
  }

  // Artist methods
  async getArtist(id: number): Promise<Artist | undefined> {
    return this.artists.get(id);
  }

  async listArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values());
  }

  // Track methods
  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async listTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }

  async getTracksByArtist(artistId: number): Promise<Track[]> {
    return Array.from(this.tracks.values()).filter(
      track => track.artistId === artistId
    );
  }

  async searchTracks(query: string): Promise<Track[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tracks.values()).filter(
      track => track.title.toLowerCase().includes(lowercaseQuery)
    );
  }

    async createTrack(track: InsertTrack): Promise<Track> {
    const id = this.currentIds.track++;
    const newTrack = { ...track, id };
    this.tracks.set(id, newTrack);
    return newTrack;
  }

  // Playlist methods
  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const id = this.currentIds.playlist++;
    const newPlaylist = { ...playlist, id };
    this.playlists.set(id, newPlaylist);
    return newPlaylist;
  }

  async updatePlaylist(
    id: number,
    playlist: Partial<InsertPlaylist>
  ): Promise<Playlist> {
    const existing = await this.getPlaylist(id);
    if (!existing) {
      throw new Error("Playlist not found");
    }
    const updated = { ...existing, ...playlist };
    this.playlists.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();