import { useCallback } from 'react';
import { useSocket } from '@/utilis/hooks/useSocket';

export function useOfferSending(peerConnection: RTCPeerConnection, roomName: string) {
  const socket = useSocket();

  const sendOffer = useCallback(async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket?.emit('send_connection_offer', {
      roomName,
      offer
    });
  }, [roomName, socket, peerConnection]);

  return { sendOffer };
}
