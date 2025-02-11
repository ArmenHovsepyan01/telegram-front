'use client';

import { FC, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import Chats from '@/components/Chats/Chats';
import { useSocket } from '@/utilis/hooks/useSocket';
import Drawer from '@/components/Drawer/Drawer';

interface HomeLayoutProps {
  children: ReactNode;
}

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
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
    <div className="flex h-screen">
      <div className="md:flex flex-col bg-gray-800 max-w-[440px] w-full h-full">
        <Chats onlineUsers={onlineUsers} />
        <Drawer />
        <button
          className="text-white bg-blue-500 px-6 py-2 rounded-md my-4 w-1/3 hover:bg-blue-600 transition delay-50 mx-4"
          onClick={logout}>
          Logout
        </button>
      </div>
      <div className="w-full h-screen shadow-lg bg-gray-200">
        <div className="w-full h-[calc(100%-64px)]">{children}</div>
      </div>
    </div>
  );
};

export default HomeLayout;
