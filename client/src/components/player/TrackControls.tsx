import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface TrackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function TrackControls({ isPlaying, onPlayPause }: TrackControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon">
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button onClick={onPlayPause} size="icon" variant="secondary">
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <Button variant="ghost" size="icon">
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
}
