import { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/utilis/hooks/useSocket';
import { useOfferSending } from '@/utilis/hooks/useOfferSending';
import { useSendingAnswer } from '@/utilis/hooks/useSendingAnswer';
import { useAnswerProcessing } from '@/utilis/hooks/useAnswerProcessing';

export function useChatConnection(peerConnection: RTCPeerConnection) {
  const socket = useSocket();
  const { chatId: roomName } = useParams();
  const { sendOffer } = useOfferSending(peerConnection, roomName as string);
  const { handleConnectionOffer } = useSendingAnswer(peerConnection, roomName as string);
  const { handleOfferAnswer } = useAnswerProcessing(peerConnection);

  console.log('handleConnectionOffer', handleConnectionOffer);
  const handleReceiveCandidate = useCallback(
    ({ candidate }: { candidate: RTCIceCandidate }) => {
      peerConnection.addIceCandidate(candidate);
    },
    [peerConnection]
  );

  console.log('useChatConnection', roomName);

  useEffect(() => {
    socket?.on('answer', (data) => {
      console.log('answeasasar', data);
      handleOfferAnswer(data);
    });
    socket?.emit('call_join_room', roomName);
    socket?.on('another_person_ready', sendOffer);
    socket?.on('send_connection_offer', handleConnectionOffer);
    socket?.on('send_candidate', handleReceiveCandidate);

    return () => {
      socket?.off('another_person_ready', sendOffer);
      socket?.off('send_connection_offer', handleConnectionOffer);
      socket?.off('answer', handleOfferAnswer);
      socket?.off('send_candidate', handleReceiveCandidate);
    };
  }, [
    roomName,
    socket,
    sendOffer,
    handleConnectionOffer,
    handleOfferAnswer,
    handleReceiveCandidate
  ]);
}
