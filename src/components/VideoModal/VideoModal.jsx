import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneCall, PhoneIncoming } from 'lucide-react';
import cn from 'classnames';
import LoadingDots from '@/components/LoadingDots/LoadingDots';

const VideoModal = ({ isOpen, socket, onClose, chatId, callMode, callerId }) => {
  const [uiState, setUiState] = useState(callMode);
  const [partnerStream, setPartnerStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const userVideo = useRef(null);
  const partnerVideo = useRef(null);
  const peerRef = useRef(null);
  const otherUser = useRef(null);
  const userStream = useRef(null);

  useEffect(() => {
    setUiState(callMode);
  }, [callMode]);

  useEffect(() => {
    if (!isOpen) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        userStream.current = stream;
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
        if (callMode === 'calling') {
          console.log('Calling:', chatId);
          socket.emit('call-request', { chatId, from: socket.id });
        }
      })
      .catch((err) => {
        console.error('Error accessing media devices:', err);
        onClose();
      });
  }, [isOpen, callMode, chatId, socket, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleCallAccepted = (data) => {
      console.log('Call accepted data:', data);
      setUiState('video');
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
      socket.on('call-ended', handleCallEnded);
      socket.on('call-declined', handleOnDecline);
    };
  }, [isOpen, socket]);

  useEffect(() => {
    if (userVideo.current && userStream.current) {
      userVideo.current.srcObject = userStream.current;
    }
  }, [uiState]);

  useEffect(() => {
    if (partnerVideo.current && partnerStream) {
      partnerVideo.current.srcObject = partnerStream;
    }
  }, [partnerStream]);

  const handleAccept = () => {
    setUiState('video');
    socket.emit('call-accepted', { chatId, from: socket.id });
  };

  const stopRecording = () => {
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => track.stop());
      userStream.current = null;
    }
  };

  const handleDecline = () => {
    stopRecording();

    socket.emit('call-declined', { chatId, from: socket.id });
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
    console.log('handleNewICECandidateMsg', peerRef.current, incoming);
    if (!peerRef.current) return;
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current
      .addIceCandidate(candidate)
      .catch((err) => console.error('Error adding ICE candidate:', err));
  }

  function createPeer(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.stunprotocol.org' },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
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

  function endCall() {
    stopRecording();

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    socket.emit('call-ended', { chatId, from: socket.id });

    setPartnerStream(null);
    setUiState(callMode);

    onClose();
  }

  function handleOnDecline() {
    stopRecording();

    setUiState('declined');

    setTimeout(() => onClose(), 1500);
  }

  const handleCallEnded = () => {
    stopRecording();

    setUiState('ended');

    setTimeout(() => onClose(), 1500);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
        {uiState === 'incoming' ? (
          <div className="bg-white p-4 rounded">
            <div className="flex items-center gap-2">
              <PhoneIncoming className="h-5 w-5 text-teal-700 mr-2 animate-whatsapp-bounce" />
              <p className="text-xl">Incoming call from {callerId}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleAccept}
                className="bg-green-500 text-white px-4 py-2 mr-2 rounded">
                Accept
              </button>
              <button onClick={handleDecline} className="bg-red-500 text-white px-4 py-2 rounded">
                Decline
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-3/5 h-4/5 bg-black flex flex-col items-center rounded-md overflow-hidden">
            {uiState === 'video' && (
              <video autoPlay className="w-full h-full object-cover" ref={partnerVideo} />
            )}

            {uiState === 'calling' && (
              <div className="text-white text-xl my-auto flex gap-4 items-center">
                <PhoneCall className="h-5 w-5" />
                <span>Calling</span> <LoadingDots />
              </div>
            )}
            {uiState === 'ended' && <div className="text-white text-xl my-auto">Call Ended</div>}
            {uiState === 'declined' && (
              <div className="text-white text-xl my-auto">Call Declined</div>
            )}

            <div className="absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video autoPlay muted className="w-full h-full object-cover" ref={userVideo} />
            </div>

            <div className="absolute bottom-4 p-4 flex justify-center gap-4">
              <button
                className={cn('bg-white p-2 rounded-full', isMuted && '!bg-red-500')}
                onClick={toggleMute}>
                {isMuted ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5" />}
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
        )}
      </div>
    )
  );
};

export default VideoModal;
