import { useLocalCameraStream } from '@/utilis/hooks/useLocalCameraStream';
import VideoChat from '@/components/VideoChat/VideoChat';

const Video = () => {
  const { localStream } = useLocalCameraStream();

  if (!localStream) {
    return null;
  }

  return <VideoChat localStream={localStream} />;
};

export default Video;
