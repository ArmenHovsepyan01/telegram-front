'use client';

import useSWR from 'swr';
import ChatService from '@/services/chat';
import { useParams, useRouter } from 'next/navigation';
import cn from 'classnames';
import { FC, useCallback, memo } from 'react';

const chatService = new ChatService();

interface ChatProps {
  onlineUsers: number[];
}

const Chats: FC<ChatProps> = ({ onlineUsers }) => {
  const router = useRouter();
  const params = useParams();
  const { data, isLoading } = useSWR(chatService.endpoint, () => chatService.getChats());

  const handleSelectChat = useCallback(
    (chatId: string) => router.push(`/home/chats/${chatId}`),
    [router]
  );

  return (
    <div className="h-full">
      <div className="flex items-center justify-center h-16 bg-gray-900 w-full">
        <input
          className="mx-4 w-full rounded-md px-4 py-2 outline-blue-500"
          type="text"
          placeholder="Search"
        />
      </div>
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <nav className="flex flex-col flex-1 overflow-y-auto h-full px-2 py-4 bg-gray-800 gap-2">
          {data?.data?.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={cn(
                'cursor-pointer flex items-center transition delay-50 rounded-md px-2 py-2 text-gray-100 gap-2',
                chat.id === params?.chatId ? 'bg-gray-500' : 'hover:bg-gray-700'
              )}>
              <span>
                {chat.users[0].name} {chat.users[0].lastName}
              </span>
              <div
                className={cn(
                  'w-4 h-4 rounded-full',
                  onlineUsers.includes(chat.users[0].id) ? 'bg-green-600' : 'bg-amber-600'
                )}
              />
            </div>
          ))}
        </nav>
      )}
    </div>
  );
};

export default memo(Chats);
