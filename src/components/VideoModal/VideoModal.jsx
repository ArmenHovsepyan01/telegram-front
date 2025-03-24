import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneCall } from 'lucide-react';
import cn from 'classnames';
import LoadingDots from '@/components/LoadingDots/LoadingDots';
import IncomingCall from '@/components/IncomingCall/IncomingCall';

const VideoModal = ({
  isOpen,
  socket,
  onClose,
  chatId,
  callMode,
  callerId,
  callingChatId,
  setCallMode
}) => {
  const [partnerStream, setPartnerStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const userVideo = useRef(null);
  const partnerVideo = useRef(null);
  const peerRef = useRef(null);
  const otherUser = useRef(null);
  const userStream = useRef(null);
  const recorderRef = useRef(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);

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
    if (!partnerStream || !userStream.current) return;

    const audioContext = new AudioContext();

    const userSource = audioContext.createMediaStreamSource(userStream.current);
    const partnerSource = audioContext.createMediaStreamSource(partnerStream);

    const destination = audioContext.createMediaStreamDestination();

    userSource.connect(destination);
    partnerSource.connect(destination);

    const mixedStream = destination.stream;

    const recorder = new MediaRecorder(mixedStream);
    recorderRef.current = recorder;

    let audioChunks = [];
    recorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordedAudioUrl(audioUrl);
      audioChunks = [];
    };

    recorder.start();

    return () => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      audioContext.close();
    };
  }, [partnerStream]);

  useEffect(() => {
    if (!isOpen) return;

    const handleCallAccepted = (data) => {
      console.log('Call accepted data:', data);
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
      socket.on('call-ended', handleCallEnded);
      socket.on('call-declined', handleOnDecline);
    };
  }, [isOpen, socket]);

  useEffect(() => {
    if (userVideo.current && userStream.current) {
      userVideo.current.srcObject = userStream.current;
    }
  }, [callMode]);

  useEffect(() => {
    if (partnerVideo.current && partnerStream) {
      partnerVideo.current.srcObject = partnerStream;
    }
  }, [partnerStream]);

  const handleAccept = () => {
    setCallMode('video');
    socket.emit('call-accepted', { chatId: callingChatId, from: socket.id });
  };

  const stopRecording = () => {
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => track.stop());
      userStream.current = null;
    }
  };

  const handleDecline = () => {
    stopRecording();

    setCallMode('declined');

    socket.emit('call-declined', { chatId: callingChatId, from: socket.id });
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

  function endCall() {
    stopRecording();

    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    socket.emit('call-ended', { chatId: callingChatId || chatId, from: socket.id });

    setPartnerStream(null);
    setCallMode('ended');

    setTimeout(() => onClose(), 1500);
  }

  function handleOnDecline() {
    stopRecording();

    setCallMode('declined');

    setTimeout(() => onClose(), 1500);
  }

  const handleCallEnded = () => {
    stopRecording();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }

    setCallMode('ended');

    setTimeout(() => onClose(), 1500);
  };

  console.log('recordedAudioUrl', recordedAudioUrl);

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
                {recordedAudioUrl && (
                  <div>
                    <a href={recordedAudioUrl} download="call-recording.webm">
                      Download Recording
                    </a>
                  </div>
                )}
                <span>Call ended</span>
              </div>
            )}
            {callMode === 'declined' && (
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
