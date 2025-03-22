// 'use client';
//
// import { useState, useRef, useEffect } from 'react';
//
// const VideoCallModal = ({ isOpen, onClose, callData, chatId, socket, onOpen }) => {
//   const localVideoRef = useRef<any>(null);
//   const remoteVideoRef = useRef(null);
//   const peerConnection = useRef(
//     new RTCPeerConnection({
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//     })
//   );
//   const [isCalling, setIsCalling] = useState(false);
//   const [isAnswering, setIsAnswering] = useState(false);
//
//   useEffect(() => {
//     if (isOpen && !isAnswering) {
//       initiateCall();
//     }
//     return () => cleanup();
//   }, [isOpen, isAnswering]);
//
//   useEffect(() => {
//     socket.on('video-answer', async ({ sdp }) => {
//       await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
//     });
//
//     socket.on('ice-candidate', ({ candidate }) => {
//       peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//     });
//
//     console.log('video-offer', callData);
//
//     // socket.on('video-offer', async ({ sdp }) => {
//     //   console.log('Video offer', sdp);
//     //   await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
//     //   const answer = await peerConnection.current.createAnswer();
//     //   await peerConnection.current.setLocalDescription(answer);
//     //   socket.emit('video-answer', { target: callData.userId, sdp: answer, chatId });
//     // });
//     socket.on('video-offer', async ({ sdp, target }) => {
//       try {
//         setIsAnswering(true);
//         onOpen();
//         console.log('Video offer', target);
//         // Ensure peer connection is initialized
//         if (!peerConnection.current) {
//           peerConnection.current = new RTCPeerConnection({
//             iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//           });
//
//           // Handle incoming remote media
//           peerConnection.current.ontrack = (event) => {
//             // @ts-ignore
//             remoteVideoRef.current['srcObject'] = event.streams[0];
//           };
//
//           // Send ICE candidates to the caller
//           peerConnection.current.onicecandidate = ({ candidate }) => {
//             if (candidate) {
//               socket.emit('ice-candidate', { target: target, candidate });
//             }
//           };
//         }
//
//         // Set the remote description from the offer
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
//
//         // Get local media stream and add tracks to the peer connection
//         const localStream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true
//         });
//         // @ts-ignore
//         localVideoRef.current['srcObject'] = localStream;
//
//         localStream
//           .getTracks()
//           .forEach((track) => peerConnection.current.addTrack(track, localStream));
//
//         // Create an SDP answer and set it as the local description
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//
//         // Send the answer back to the caller
//         socket.emit('video-answer', { target: target, sdp: answer });
//       } catch (error) {
//         console.error('Error handling video offer:', error);
//       }
//     });
//   }, [socket, chatId, callData]);
//
//   // const initiateCall = async () => {
//   //   if (socket) {
//   //     if (localVideoRef?.current) {
//   //       localVideoRef.current.setAttribute('autoplay', '');
//   //       localVideoRef.current.setAttribute('muted', '');
//   //       localVideoRef.current.setAttribute('playsinline', '');
//   //     }
//   //     const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//   //     // @ts-ignore
//   //     localVideoRef.current['srcObject'] = localStream;
//   //
//   //     peerConnection.current = new RTCPeerConnection({
//   //       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//   //     });
//   //
//   //     localStream
//   //       .getTracks()
//   //       .forEach((track) => peerConnection.current.addTrack(track, localStream));
//   //
//   //     peerConnection.current.ontrack = (event) => {
//   //       // @ts-ignore
//   //       remoteVideoRef.current['srcObject'] = event.streams[0];
//   //     };
//   //
//   //     peerConnection.current.onicecandidate = ({ candidate }) => {
//   //       if (candidate) {
//   //         socket.emit('ice-candidate', { target: callData.userId, candidate, chatId });
//   //       }
//   //     };
//   //
//   //     if (callData.userId) {
//   //       const offer = await peerConnection.current.createOffer();
//   //       await peerConnection.current.setLocalDescription(offer);
//   //       socket.emit('video-offer', { target: callData.userId, sdp: offer, chatId });
//   //       setIsCalling(true);
//   //     }
//   //   }
//   // };
//   const initiateCall = async () => {
//     try {
//       if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//         throw new Error('getUserMedia is not supported in this browser.');
//       }
//
//       // Request access to video and audio
//       const localStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true
//       });
//
//       // Attach the local stream to the video element
//       // @ts-ignore
//       localVideoRef.current['srcObject'] = localStream;
//
//       // Set up the peer connection
//       peerConnection.current = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//       });
//
//       // Add tracks from the local stream
//       localStream
//         .getTracks()
//         .forEach((track) => peerConnection.current.addTrack(track, localStream));
//
//       // Handle incoming tracks for remote video
//       peerConnection.current.ontrack = (event) => {
//         // @ts-ignore
//         remoteVideoRef.current['srcObject'] = event.streams[0];
//       };
//
//       // Handle ICE candidates
//       peerConnection.current.onicecandidate = ({ candidate }) => {
//         if (candidate) {
//           socket.emit('ice-candidate', { target: callData.userId, candidate, chatId });
//         }
//       };
//
//       // Create and send the offer
//       if (callData.userId) {
//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socket.emit('video-offer', { target: callData.userId, sdp: offer, chatId });
//         setIsCalling(true);
//       }
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//     }
//   };
//
//   const cleanup = () => {
//     peerConnection.current?.close();
//     // @ts-ignore
//     peerConnection.current = null;
//   };
//
//   return (
//     isOpen && (
//       <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
//         <div className="relative w-4/5 h-4/5 bg-white flex flex-col items-center">
//           <video ref={localVideoRef} autoPlay muted className="w-full h-1/2 bg-black" />
//           <video ref={remoteVideoRef} autoPlay className="w-full h-1/2 bg-black" />
//           <button
//             onClick={() => {
//               onClose();
//               cleanup();
//             }}
//             className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
//             End Call
//           </button>
//         </div>
//       </div>
//     )
//   );
// };
//
// export default VideoCallModal;
//
import React, { useEffect } from 'react';
import VideoChat from '@/components/VideoChat';

const VideoModal = ({ isOpen, onClose, callData, chatId, socket, onOpen }) => {
  useEffect(() => {
    socket?.on('another_person_ready', () => {
      onOpen();
    });

    socket?.on('callUser', (data) => {
      console.log('calling', data);
      onOpen();
    });
  }, [socket, onOpen]);

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
        <div className="relative w-4/5 h-4/5 bg-white flex flex-col items-center">
          <VideoChat callData={callData} />
        </div>
      </div>
    )
  );
};

export default VideoModal;
