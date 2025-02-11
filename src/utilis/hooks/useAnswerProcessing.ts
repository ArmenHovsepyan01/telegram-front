import { useCallback } from 'react';

export function useAnswerProcessing(peerConnection: RTCPeerConnection) {
  const handleOfferAnswer = useCallback(
    async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      try {
        console.log('Received answer:', answer);

        // Check if the signaling state is 'have-remote-offer'
        if (peerConnection.signalingState === 'have-remote-offer') {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Remote description set successfully with answer.');
        } else if (peerConnection.signalingState === 'stable') {
          console.warn('Received answer, but signaling state is stable. Ignoring answer.');
          // Optionally, you could wait for a state change here or trigger some other action
        } else {
          console.warn(
            'Invalid signaling state for setting remote answer:',
            peerConnection.signalingState
          );
        }
      } catch (error) {
        console.error('Error handling remote answer:', error);
      }
    },
    [peerConnection]
  );

  return {
    handleOfferAnswer
  };
}
