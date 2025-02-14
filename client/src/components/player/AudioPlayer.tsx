import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Track } from "@shared/schema";
import { TrackControls } from "./TrackControls";

interface AudioPlayerProps {
  track: Track | null;
}

export function AudioPlayer({ track }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (track) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [track]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  if (!track) return null;

  return (
    <Card className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
      <div className="flex items-center gap-4">
        <img
          src={track.albumCoverUrl}
          alt={track.title}
          className="w-12 h-12 rounded"
        />
        <div className="flex-1">
          <h3 className="font-medium">{track.title}</h3>
          <div className="flex items-center gap-4">
            <TrackControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
            />
            <Slider
              value={[currentTime]}
              max={track.duration}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </Card>
  );
}
