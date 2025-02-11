import { FC } from 'react';

interface VideoFeedProps {
  mediaStream: MediaStream;
  isMuted?: boolean;
}

export const VideoFeed: FC<VideoFeedProps> = ({ mediaStream, isMuted = false }) => {
  return (
    <video
      ref={(ref) => {
        if (ref) {
          ref.srcObject = mediaStream;
        }
      }}
      autoPlay={true}
      muted={isMuted}
    />
  );
};
