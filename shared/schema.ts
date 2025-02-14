import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  bio: text("bio").notNull(),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artistId: integer("artist_id").notNull(),
  albumCoverUrl: text("album_cover_url").notNull(),
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration").notNull(),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  trackIds: integer("track_ids").array().notNull(),
});

// Extended schema for track upload that includes file fields
export const trackUploadSchema = createInsertSchema(tracks)
  .omit({ id: true, audioUrl: true, albumCoverUrl: true })
  .extend({
    audioFile: z.instanceof(File, { message: "Audio file is required" }),
    coverFile: z.instanceof(File, { message: "Cover image is required" }),
  });

export const insertArtistSchema = createInsertSchema(artists).omit({ id: true });
export const insertTrackSchema = createInsertSchema(tracks).omit({ id: true });
export const insertPlaylistSchema = createInsertSchema(playlists).omit({ id: true });

export type Artist = typeof artists.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;

export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type TrackUpload = z.infer<typeof trackUploadSchema>;