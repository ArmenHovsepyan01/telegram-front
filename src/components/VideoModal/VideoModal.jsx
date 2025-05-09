import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneCall } from 'lucide-react';
import cn from 'classnames';
import LoadingDots from '@/components/LoadingDots/LoadingDots';
import IncomingCall from '@/components/IncomingCall/IncomingCall';
import { useUser } from '@/utilis/hooks/useUser';
import { VideoCallContext } from '@/providers/VideoCallProvider/VideoCallProvider';
import { useSocket } from '@/utilis/hooks/useSocket';
import SocketIOTranscriber from '@/services/transcriber';

const VideoModal = () => {
  const socket = useSocket();
  const {
    isVideoCallModalOpen: isOpen,
    handleModalClose: onClose,
    callMode,
    setCallMode,
    callerId,
    callingChatId,
    chatId,
    callId
  } = useContext(VideoCallContext);

  const [partnerStream, setPartnerStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const userVideo = useRef(null);
  const partnerVideo = useRef(null);
  const peerRef = useRef(null);
  const otherUser = useRef(null);
  const userStream = useRef(null);
  const transcriberRef = useRef(null);
  const [transcript, setTranscript] = useState('');
  const user = useUser();

  const cleanupLocalStream = () => {
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => {
        track.stop();
      });
      userStream.current = null;
    }
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }
  };

  const cleanupPartnerStream = () => {
    if (partnerStream) {
      partnerStream.getTracks().forEach((track) => {
        track.stop();
      });
      setPartnerStream(null);
    }
    if (partnerVideo.current) {
      partnerVideo.current.srcObject = null;
    }
  };

  async function endCall() {
    transcriberRef.current.stop();

    cleanupLocalStream();
    cleanupPartnerStream();
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (userVideo.current) {
      userVideo.current.pause();
      userVideo.current.srcObject = null;
    }
    if (partnerVideo.current) {
      partnerVideo.current.pause();
      partnerVideo.current.srcObject = null;
    }
    socket.emit('call-ended', { chatId: callingChatId || chatId, from: socket.id });
    setCallMode('ended');
    onClose();
  }

  useEffect(() => {
    if (isOpen && callMode !== 'ended') {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: true
        })
        .then((stream) => {
          userStream.current = stream;
          if (userVideo.current) {
            userVideo.current.srcObject = stream;
          }
          if (callMode === 'calling') {
            socket.emit('call-request', { chatId, from: socket.id, callerId: user?.id });
          }
        })
        .catch((err) => {
          console.error('Error accessing media devices:', err);
          endCall();
        });
    }
  }, [isOpen, callMode, chatId, socket, user?.id]);

  useEffect(() => {
    if (!isOpen) return;

    const handleCallAccepted = (data) => {
      setCallMode('video');
      otherUser.current = data.from;
      callUser(data.from);
    };

    socket.on('call-accepted', handleCallAccepted);
    socket.on('offer', handleReceiveCall);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleNewICECandidateMsg);
    socket.on('call-ended', handleCallEnded);
    socket.on('call-declined', handleOnDecline);

    return () => {
      socket.off('call-accepted', handleCallAccepted);
      socket.off('offer', handleReceiveCall);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleNewICECandidateMsg);
      socket.off('call-ended', handleCallEnded);
      socket.off('call-declined', handleOnDecline);
    };
  }, [isOpen, socket]);

  useEffect(() => {
    if (userVideo.current && userStream.current) {
      userVideo.current.srcObject = userStream.current;
    }
  }, [callMode]);

  const handleOnFinalTranscript = useCallback(
    (text) => {
      setTranscript((prev) => prev + ' ' + text);
      socket.emit('call-transcript', { callId, text, userId: user?.id });
    },
    [socket, callId, user?.id]
  );

  useEffect(() => {
    if (callMode === 'video' && userStream?.current) {
      transcriberRef.current = new SocketIOTranscriber(60000, userStream.current, {
        onInterimTranscript: () => {},
        onFinalTranscript: handleOnFinalTranscript,
        onError: (error) => {
          console.error('Transcription error:', error);
        }
      });

      transcriberRef.current.start();
    }
  }, [callMode, handleOnFinalTranscript]);

  useEffect(() => {
    if (partnerVideo.current && partnerStream) {
      partnerVideo.current.srcObject = partnerStream;
    }
  }, [partnerStream]);

  const handleAccept = () => {
    setCallMode('video');
    socket.emit('call-accepted', { chatId: callingChatId, from: socket.id, callId });
  };

  const handleDecline = () => {
    cleanupLocalStream();
    cleanupPartnerStream();
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setCallMode('declined');
    socket.emit('call-declined', { chatId: callingChatId, from: socket.id, callId });
    onClose();
  };

  function callUser(userID) {
    otherUser.current = userID;
    peerRef.current = createPeer(userID);
    userStream.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, userStream.current);
    });
  }

  function handleReceiveCall(incoming) {
    if (!incoming?.sdp?.type) {
      console.error('Invalid SDP in offer:', incoming);
      return;
    }
    otherUser.current = incoming.caller;
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current.getTracks().forEach((track) => {
          peerRef.current.addTrack(track, userStream.current);
        });
      })
      .then(() => peerRef.current.createAnswer())
      .then((answer) => peerRef.current.setLocalDescription(answer))
      .then(() => {
        socket.emit('answer', {
          target: incoming.caller,
          caller: socket.id,
          sdp: peerRef.current.localDescription
        });
      })
      .catch((err) => console.error('Error handling offer:', err));
  }

  function handleAnswer(message) {
    if (!message?.sdp?.type) {
      console.error('Invalid SDP in answer:', message);
      return;
    }
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .catch((err) => console.error('Error setting remote description:', err));
  }

  function handleNewICECandidateMsg(incoming) {
    if (!peerRef.current) return;
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current
      .addIceCandidate(candidate)
      .catch((err) => console.error('Error adding ICE candidate:', err));
  }

  function createPeer(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
        }
      ]
    });
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          target: otherUser.current,
          candidate: e.candidate
        });
      }
    };
    peer.ontrack = (e) => {
      if (e.streams && e.streams[0]) {
        setPartnerStream(e.streams[0]);
      } else {
        console.warn('No stream found in ontrack event');
      }
    };
    if (userID) {
      peer.onnegotiationneeded = () => {
        peer
          .createOffer()
          .then((offer) => peer.setLocalDescription(offer))
          .then(() => {
            socket.emit('offer', {
              target: userID,
              caller: socket.id,
              sdp: peer.localDescription
            });
          })
          .catch((err) => console.error('Error during negotiation:', err));
      };
    }
    return peer;
  }

  const toggleMute = () => {
    if (userStream.current) {
      const audioTracks = userStream.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (userStream.current) {
      const videoTracks = userStream.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  function handleCallEnded() {
    cleanupLocalStream();
    cleanupPartnerStream();
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setCallMode('ended');
    setTimeout(() => onClose(), 1500);
  }

  function handleOnDecline() {
    cleanupLocalStream();
    cleanupPartnerStream();
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setCallMode('declined');
    onClose();
  }

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
        {callMode === 'incoming' ? (
          <IncomingCall
            callerId={callerId}
            handleAccept={handleAccept}
            handleDecline={handleDecline}
          />
        ) : (
          <div className="relative w-3/5 h-4/5 bg-black flex flex-col items-center rounded-md overflow-hidden">
            {callMode === 'video' && (
              <video autoPlay className="w-full h-full object-cover" ref={partnerVideo} />
            )}
            {callMode === 'calling' && (
              <div className="text-white text-xl my-auto flex gap-4 items-center">
                <PhoneCall className="h-5 w-5" />
                <span>Calling</span> <LoadingDots />
              </div>
            )}
            {callMode === 'ended' && (
              <div className="text-white text-xl my-auto">
                <span>Call ended</span>
              </div>
            )}
            {callMode === 'declined' && (
              <div className="text-white text-xl my-auto">Call Declined</div>
            )}
            <div
              className={cn(
                'absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg'
              )}>
              <video
                autoPlay
                muted
                className={cn('w-full h-full object-cover block', isVideoOff && 'hidden')}
                ref={userVideo}
              />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center bg-blue-500">
                  <span className="text-white text-2xl">{user?.name || 'User'} (You)</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 p-4 flex flex-col items-center gap-4">
              <div className="flex justify-center gap-4">
                <button
                  className={cn('bg-white p-2 rounded-full', isMuted && '!bg-red-500')}
                  onClick={toggleMute}>
                  {isMuted ? (
                    <MicOff className="h-5 w-5 text-white" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>
                <button
                  className={cn('bg-white p-2 rounded-full', isVideoOff && '!bg-red-500')}
                  onClick={toggleVideo}>
                  {isVideoOff ? (
                    <VideoOff className="h-5 w-5 text-white" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                </button>
                <button className="px-2 rounded-full bg-red-500 text-white" onClick={endCall}>
                  End Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default VideoModal;
