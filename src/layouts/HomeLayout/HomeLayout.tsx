'use client';

import { FC, ReactNode, useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';

interface HomeLayoutProps {
  children: ReactNode;
}

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  const { logout, user } = useContext(AuthContext);

  console.log('user', user);

  return (
    <div className="flex h-screen">
      <div className="md:flex flex-col bg-gray-800 max-w-[440px] w-full">
        <div className="flex items-center justify-center h-16 bg-gray-900 w-full">
          <input
            className="mx-4 w-full rounded-md px-4 py-2 outline-blue-500"
            type="text"
            placeholder="Search"
          />
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 bg-gray-800">
            <a
              href="#"
              className="flex items-center transition delay-50 rounded-md px-2 py-2 text-gray-100 hover:bg-gray-700">
              Dashboard
            </a>
            <a
              href="#"
              className="flex items-center transition delay-50 rounded-md px-2 py-2 mt-2 text-gray-100 hover:bg-gray-700">
              Messages
            </a>
            <a
              href="#"
              className="flex items-center transition delay-50 rounded-md px-2 py-2 mt-2 text-gray-100 hover:bg-gray-700">
              Settings
            </a>
          </nav>
          <button
            className="text-white bg-blue-500 px-6 py-2 rounded-md my-4 w-1/3 hover:bg-blue-600 transition delay-50 mx-4"
            onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      <div className="w-full h-screen shadow-lg bg-gray-200">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200">
            <div className="flex items-center px-4">Chat</div>
          </div>
        </div>
        <div className="w-full p-6">{children}</div>
      </div>
    </div>
  );
};

export default HomeLayout;
