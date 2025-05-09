import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/utilis/hooks/useSocket';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const VideoModal = dynamic(() => import('@/components/VideoModal/VideoModal'), {
  ssr: false
});

type VideoCallContextType = {
  initiateCall: () => void;
  handleModalClose: () => void;
  isVideoCallModalOpen: boolean;
  setIsVideoCallModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callMode: string;
  setCallMode: React.Dispatch<React.SetStateAction<string>>;
  callerId: string | null;
  setCallerId: React.Dispatch<React.SetStateAction<string | null>>;
  callingChatId: string | null;
  setCallingChatId: React.Dispatch<React.SetStateAction<string | null>>;
  chatId: string | null;
  callId: string | null;
};

export const VideoCallContext = createContext<VideoCallContextType>({
  initiateCall: () => {},
  isVideoCallModalOpen: false,
  setIsVideoCallModalOpen: () => {},
  callMode: 'calling',
  setCallMode: () => {},
  callerId: null,
  setCallerId: () => {},
  callingChatId: null,
  setCallingChatId: () => {},
  handleModalClose: () => {},
  chatId: null,
  callId: null
});

const VideoCallProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useSocket();
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);
  const [callMode, setCallMode] = useState('calling');
  const [callerId, setCallerId] = useState<string | null>(null);
  const [callingChatId, setCallingChatId] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    if (socket) {
      socket.on('incoming-call', (data) => {
        setCallerId(data.from);
        setCallingChatId(data.chatId);
        setCallId(data.callId);
        setCallMode('incoming');
        setIsVideoCallModalOpen(true);
      });

      socket.on('requested-call-id', (data) => {
        setCallId(data.callId);
      });
    }
    return () => {
      socket?.off('incoming-call');
    };
  }, [socket]);

  const handleInitiateCall = useCallback(() => {
    setCallMode('calling');
    setIsVideoCallModalOpen(true);
  }, [setCallMode, setIsVideoCallModalOpen]);

  const handleModalClose = useCallback(() => {
    setIsVideoCallModalOpen(false);
    setCallMode('ended');
  }, [setCallMode, setIsVideoCallModalOpen]);

  return (
    <VideoCallContext.Provider
      value={{
        initiateCall: handleInitiateCall,
        isVideoCallModalOpen,
        setIsVideoCallModalOpen,
        callMode,
        setCallMode,
        callerId,
        setCallerId,
        callingChatId,
        setCallingChatId,
        handleModalClose,
        chatId: params?.chatId as string,
        callId
      }}>
      <React.Fragment>{children}</React.Fragment>
      <VideoModal />
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider;
