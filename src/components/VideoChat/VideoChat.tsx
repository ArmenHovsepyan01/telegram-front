import { FC } from 'react';
import { usePeerConnection } from '@/utilis/hooks/usePeerConnection';
import { useChatConnection } from '@/utilis/hooks/useChatConnection';
import { VideoFeed } from '@/components/VideoFeed/VideoFeed';

interface VideoChatProps {
  localStream: MediaStream;
}

const VideoChat: FC<VideoChatProps> = ({ localStream }) => {
  const { peerConnection, guestStream } = usePeerConnection(localStream);
  useChatConnection(peerConnection);

  console.log('guestStream', guestStream);
  return (
    <div>
      <VideoFeed mediaStream={localStream} isMuted={true} />
      {guestStream && (
        <div>
          guest
          <VideoFeed mediaStream={guestStream} />
        </div>
      )}
    </div>
  );
};

export default VideoChat;
