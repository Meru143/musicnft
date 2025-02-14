import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPlaylistSchema, insertTrackSchema } from "@shared/schema";

// In-memory storage for NFT listings
const marketplaceListings = new Map<number, {
  tokenId: number;
  seller: string;
  price: string;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}>();

export function registerRoutes(app: Express): Server {
  // Artists
  app.get("/api/artists", async (_req, res) => {
    const artists = await storage.listArtists();
    res.json(artists);
  });

  app.get("/api/artists/:id", async (req, res) => {
    const artist = await storage.getArtist(parseInt(req.params.id));
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }
    res.json(artist);
  });

  // Tracks
  app.get("/api/tracks", async (_req, res) => {
    const tracks = await storage.listTracks();
    res.json(tracks);
  });

  app.post("/api/tracks", async (req, res) => {
    const track = insertTrackSchema.parse(req.body);
    const created = await storage.createTrack(track);
    res.status(201).json(created);
  });

  app.get("/api/tracks/search", async (req, res) => {
    const query = z.string().parse(req.query.q);
    const tracks = await storage.searchTracks(query);
    res.json(tracks);
  });

  app.get("/api/artists/:id/tracks", async (req, res) => {
    const tracks = await storage.getTracksByArtist(parseInt(req.params.id));
    res.json(tracks);
  });

  // Playlists
  app.post("/api/playlists", async (req, res) => {
    const playlist = insertPlaylistSchema.parse(req.body);
    const created = await storage.createPlaylist(playlist);
    res.status(201).json(created);
  });

  app.patch("/api/playlists/:id", async (req, res) => {
    const playlist = insertPlaylistSchema.partial().parse(req.body);
    const updated = await storage.updatePlaylist(parseInt(req.params.id), playlist);
    res.json(updated);
  });

  // Marketplace routes
  app.get("/api/marketplace/listings", (_req, res) => {
    const listings = Array.from(marketplaceListings.values());
    res.json(listings);
  });

  app.post("/api/marketplace/listings", async (req, res) => {
    const listingSchema = z.object({
      tokenId: z.number(),
      seller: z.string(),
      price: z.string(),
      metadata: z.object({
        name: z.string(),
        description: z.string(),
        image: z.string(),
      }),
    });

    try {
      const listing = listingSchema.parse(req.body);
      marketplaceListings.set(listing.tokenId, listing);
      res.status(201).json(listing);
    } catch (error) {
      res.status(400).json({ message: "Invalid listing data" });
    }
  });

  app.delete("/api/marketplace/listings/:tokenId", (req, res) => {
    const tokenId = parseInt(req.params.tokenId);
    marketplaceListings.delete(tokenId);
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}