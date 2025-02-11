'use client';

import React, { createContext, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import CoverLoading from '@/components/CoverLoading/CoverLoading';
import { initializeSocket } from '@/utilis/socket';
import { useUser } from '@/utilis/hooks/useUser';
import { getCookie } from 'cookies-next';

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const token = getCookie('accessToken');
  const { current: socket } = useRef<Socket>(initializeSocket(token as string));

  const [isConnected, setIsConnected] = useState(socket.connected);
  const user = useUser();

  useEffect(() => {
    function onConnect() {
      console.log('Socket Connected', socket.id);
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('Socket Disconnected', socket.id);
      setIsConnected(false);
    }

    if (!!user) {
      socket.connect();
      console.log('Socket Connected', socket);
    } else {
      socket.disconnect();
      console.log('Socket Disconnected', socket);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [user]);

  return (
    <CoverLoading isLoading={!isConnected}>
      <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    </CoverLoading>
  );
};
