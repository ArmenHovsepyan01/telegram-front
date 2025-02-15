'use client';

import useSWR from 'swr';
import ChatService from '@/services/chat';
import { useParams, useRouter } from 'next/navigation';
import { FC, useCallback, memo } from 'react';
import UserCard from '@/components/UserCard/UserCard';

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
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <nav className="flex flex-col flex-1 overflow-y-auto h-full px-2 py-4 gap-2">
          {data?.data?.map((chat) => {
            const user = chat.users[0];
            if (!user) return null;
            const isOnline = onlineUsers.includes(user.id);
            const selectChat = () => handleSelectChat(chat.id);

            return (
              <UserCard
                name={user.name}
                email={user.email}
                isOnline={isOnline}
                showStatus={true}
                key={chat.id}
                onClick={selectChat}
                selected={params.chatId === chat.id}
              />
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default memo(Chats);
