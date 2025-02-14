import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { trackUploadSchema, type TrackUpload, type InsertTrack } from "@shared/schema";
import { ipfsService } from "@/lib/ipfs";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Upload } from "lucide-react";

export function UploadTrack() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TrackUpload>({
    resolver: zodResolver(trackUploadSchema),
    defaultValues: {
      title: "",
      artistId: 1, // Default to first artist for now
      duration: 0,
    },
  });

  const createTrack = useMutation({
    mutationFn: async (track: InsertTrack) => {
      const res = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(track),
      });
      if (!res.ok) throw new Error("Failed to create track");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      form.reset();
      toast({
        title: "Success",
        description: "Track uploaded successfully",
      });
    },
  });

  const onSubmit = async (data: TrackUpload) => {
    try {
      setIsUploading(true);

      // Upload files to IPFS
      const [audioUrl, albumCoverUrl] = await Promise.all([
        ipfsService.uploadFile(data.audioFile),
        ipfsService.uploadFile(data.coverFile),
      ]);

      // Get audio duration
      const duration = await new Promise<number>((resolve) => {
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
          resolve(Math.round(audio.duration));
        });
        audio.src = URL.createObjectURL(data.audioFile);
      });

      // Create track with IPFS URLs
      await createTrack.mutateAsync({
        title: data.title,
        artistId: data.artistId,
        audioUrl,
        albumCoverUrl,
        duration,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload track",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="audioFile"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Audio File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverFile"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isUploading} className="w-full gap-2">
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload Track"}
        </Button>
      </form>
    </Form>
  );
}