'use client';

import { FC, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { useSocket } from '@/utilis/hooks/useSocket';
import Sidebar from '@/components/Sidebar/Sidebar';
import VideoCallProvider from '@/providers/VideoCallProvider/VideoCallProvider';

interface HomeLayoutProps {
  children: ReactNode;
}

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('user-online', { userId: user.id });

      socket.on('update-online-users', (data) => {
        setOnlineUsers([...onlineUsers, ...data]);
      });
    }
  }, [socket, user]);

  return (
    <VideoCallProvider>
      <div className="flex h-screen">
        <Sidebar onlineUsers={onlineUsers} />
        <div className="w-full h-screen shadow-lg chats-bg">
          <div className="w-full h-[calc(100%-64px)]">{children}</div>
        </div>
      </div>
    </VideoCallProvider>
  );
};

export default HomeLayout;
