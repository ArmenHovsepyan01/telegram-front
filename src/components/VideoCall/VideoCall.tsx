import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSocket } from '@/utilis/hooks/useSocket';
import VideoModal from '@/components/VideoModal/VideoModal';

const VideoCall = () => {
  const socket = useSocket();
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);
  const [callMode, setCallMode] = useState('calling');
  const [callerId, setCallerId] = useState(null);
  const [callingChatId, setCallingChatId] = useState(null);
  const params = useParams();

  useEffect(() => {
    if (socket) {
      socket.on('incoming-call', (data) => {
        console.log('Incoming call:', data);
        setCallerId(data.from);
        setCallingChatId(data.chatId);
        setCallMode('incoming');
        setIsVideoCallModalOpen(true);
      });
    }

    return () => {
      socket?.off('incoming-call');
    };
  }, [socket]);

  return (
    <VideoModal
      isOpen={isVideoCallModalOpen}
      socket={socket}
      onClose={() => {
        setIsVideoCallModalOpen(false);
      }}
      chatId={params?.chatId}
      callMode={callMode}
      callerId={callerId}
      callingChatId={callingChatId}
    />
  );
};

export default VideoCall;
