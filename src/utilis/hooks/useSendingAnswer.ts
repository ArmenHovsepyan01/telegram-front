import { useCallback } from 'react';
import { useSocket } from '@/utilis/hooks/useSocket';

export function useSendingAnswer(peerConnection: RTCPeerConnection, roomName: string) {
  const socket = useSocket();

  const handleConnectionOffer = useCallback(
    async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      try {
        console.log('Received Offer:', offer);

        // Check signaling state
        if (peerConnection.signalingState === 'have-local-offer') {
          console.warn('PeerConnection is in have-local-offer state. Rolling back...');
          await peerConnection.setLocalDescription({ type: 'rollback' });
        }

        // Set the remote description
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('Remote description set successfully.');

        // Create an answer
        const answer = await peerConnection.createAnswer();
        console.log('Created Answer:', answer);

        // Set local description
        await peerConnection.setLocalDescription(answer);
        console.log('Local description set successfully.');

        // Send the answer back to the remote peer
        socket?.emit('answer', { answer, roomName });
        console.log('Answer sent to the remote peer.');
      } catch (error) {
        console.error('Error handling connection offer:', error);
      }
    },
    [roomName, peerConnection, socket]
  );

  return {
    handleConnectionOffer
  };
}
