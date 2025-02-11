import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/utilis/hooks/useSocket';

export function usePeerConnection(localStream: MediaStream) {
  const socket = useSocket();
  const { roomName } = useParams();
  const [guestStream, setGuestStream] = useState<MediaStream | null>(null);

  const peerConnection = useMemo(() => {
    const connection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun2.1.google.com:19302' }]
    });

    console.log('connection', connection);

    connection.addEventListener('icecandidate', ({ candidate }) => {
      socket?.emit('send_candidate', { candidate, roomName });
    });

    connection.addEventListener('track', ({ streams }) => {
      console.log('streams', streams);
      setGuestStream(streams[0]);
    });

    localStream.getTracks().forEach((track) => {
      connection.addTrack(track, localStream);
    });

    return connection;
  }, [localStream, roomName, socket]);

  return {
    peerConnection,
    guestStream
  };
}
