import { useContext } from 'react';
import { VideoCallContext } from '@/providers/VideoCallProvider/VideoCallProvider';

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within an VideoCallProvider');
  }

  return context;
};
