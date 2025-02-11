'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../../utilis/hooks/useSocket';
import Peer from 'simple-peer';
import Input from '../../../components/ui/Input/Input';

const Page = () => {
  const socket = useSocket();
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef();

  useEffect(() => {
    if (myVideo.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

      socket.on('callUser', (data) => {
        setReceivingCall(true);
        setCaller(data.from);
        setName(data.name);
        setCallerSignal(data.signal);
      });
    }
  }, [myVideo, socket]);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });
    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: socket.id,
        name: name
      });
    });
    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });
    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });
    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  console.log(socket.id, stream, myVideo);

  return (
    <>
      <h1 style={{ textAlign: 'center', color: '#fff' }}>Zoomish</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            <video playsInline muted ref={myVideo} autoPlay style={{ width: '300px' }} />
          </div>
          <div className="video">
            <video playsInline ref={userVideo} autoPlay style={{ width: '300px' }} />
          </div>
        </div>
        <div className="myId">
          <Input
            id="filled-basic"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <span>ID ${socket.id}</span>

          <Input id="filled-basic" value={idToCall} onChange={(e) => setIdToCall(e.target.value)} />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </button>
            ) : (
              <button color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                Call
              </button>
            )}
            {idToCall}
          </div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <button onClick={answerCall}>Answer</button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Page;
