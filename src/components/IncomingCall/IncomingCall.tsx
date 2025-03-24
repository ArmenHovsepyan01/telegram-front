import { FC, useEffect, useRef } from 'react';
import { PhoneIncoming } from 'lucide-react';

interface IncomingCallProps {
  callerId: string;
  handleAccept: () => void;
  handleDecline: () => void;
}

const IncomingCall: FC<IncomingCallProps> = ({ callerId, handleAccept, handleDecline }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Playback failed:', error);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const stopAudio = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="bg-white p-4 rounded">
      <audio ref={audioRef} src="/ringtones/xylophone.mp3" autoPlay loop />
      <div className="flex items-center gap-2">
        <PhoneIncoming className="h-5 w-5 text-teal-700 mr-2 animate-whatsapp-bounce" />
        <p className="text-xl">Incoming call from {callerId}</p>
      </div>
      <div className="mt-4">
        <button
          onClick={() => {
            handleAccept();
            stopAudio();
          }}
          className="bg-green-500 text-white px-4 py-2 mr-2 rounded">
          Accept
        </button>
        <button
          onClick={() => {
            handleDecline();
            stopAudio();
          }}
          className="bg-red-500 text-white px-4 py-2 rounded">
          Decline
        </button>
      </div>
    </div>
  );
};

export default IncomingCall;
