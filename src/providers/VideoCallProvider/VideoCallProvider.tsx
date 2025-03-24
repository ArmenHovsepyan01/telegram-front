import React, { createContext, useEffect, useState } from 'react';
import { useSocket } from '@/utilis/hooks/useSocket';
import { useParams } from 'next/navigation';
import VideoModal from '@/components/VideoModal/VideoModal';

export const VideoCallContext = createContext({
  initiateCall: () => {}
});

const VideoCallProvider = ({ children }: { children: React.ReactNode }) => {
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

  const handleInitiateCall = () => {
    setCallMode('calling');
    setIsVideoCallModalOpen(true);
  };

  return (
    <VideoCallContext.Provider value={{ initiateCall: handleInitiateCall }}>
      <React.Fragment>{children}</React.Fragment>
      <VideoModal
        isOpen={isVideoCallModalOpen}
        socket={socket}
        onClose={() => {
          setIsVideoCallModalOpen(false);
          setCallMode('calling');
        }}
        chatId={params?.chatId}
        callMode={callMode}
        setCallMode={setCallMode}
        callerId={callerId}
        callingChatId={callingChatId}
      />
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider;
