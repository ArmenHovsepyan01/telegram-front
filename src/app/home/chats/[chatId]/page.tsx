'use client';

import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { useSocket } from '@/utilis/hooks/useSocket';
import ChatService from '@/services/chat';
import CoverLoading from '@/components/CoverLoading/CoverLoading';
import ChatMessage from '@/components/ChatMessage/ChatMessage';
import ChatInput from '@/components/ChatInput/ChatInput';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { ChatMessage as ChatMessageInterface, ChatWithMessages } from '@/types';
import VideoCallModal from '@/components/VideoModal/VideoModal';
import Button from '@/components/ui/Button/Button';
import { v4 } from 'uuid';

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

const chatService = new ChatService();

const ChatPage: FC<ChatPageProps> = ({ params: { chatId } }) => {
  const socket = useSocket();
  const { user } = useContext(AuthContext);
  const { data, isLoading, mutate } = useSWR(
    `${chatService.endpoint}/${chatId}`,
    () => chatService.getChat(chatId),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );
  const [typingUsers, setTypingUsers] = useState<
    {
      userId: number;
      message: string;
    }[]
  >([]);
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socket && user) {
      socket.emit('joinChat', {
        chatId,
        userId: user.id
      });
    }
  }, [socket, chatId, user]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', async (receivedMessage: ChatMessageInterface) => {
        console.log('New message received:', receivedMessage);
        if (!data?.messages.map((m) => m.id).includes(receivedMessage.id)) {
          await addNewMessage(receivedMessage);
        }
        scrollDown();
      });

      socket.on(
        'messageAck',
        async (updatedMessage: { message: ChatMessageInterface; id: string }) => {
          const { message, id } = updatedMessage;
          await updateMessages(message, id);
        }
      );
    }

    // socket?.on('video-offer', async (payload) => {
    //   console.log('Video offer', payload);
    // });
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('typing', (data) => {
        if (!typingUsers.map((user) => user.userId).includes(data.userId)) {
          setTypingUsers([...typingUsers, data]);
        }
      });

      socket.on('stopTyping', (data) => {
        if (typingUsers.map((user) => user.userId).includes(data.userId)) {
          setTypingUsers([...typingUsers.filter((user) => user.userId !== data.userId)]);
        }
      });
    }
  }, [socket, typingUsers]);

  const targetUser = useMemo(() => {
    return data?.users.filter((i) => i.id !== user?.id)[0];
  }, [data, user]);

  const handleSubmit = async (values: { message: string }) => {
    const message = {
      ...values,
      id: v4(),
      userId: user?.id
    };

    try {
      await addNewMessage(message);
      socket?.emit('sendMessage', {
        message,
        chatId
      });

      scrollDown();
    } catch (e) {
      console.log('error handleSubmit', e);
    }
  };

  const handleVideoCall = useCallback(
    () => setIsVideoCallModalOpen(true),
    [setIsVideoCallModalOpen]
  );

  const updateMessages = useCallback(
    async (message: ChatMessageInterface, id: string) => {
      await mutate(
        (currentData) =>
          ({
            ...currentData,
            messages: (currentData?.messages || []).map((m) => (m.id === id ? message : m))
          }) as ChatWithMessages,
        { revalidate: false }
      );
    },
    [mutate, data]
  );

  const addNewMessage = useCallback(
    async (newMessage) => {
      await mutate(
        (currentData) =>
          ({
            ...currentData,
            messages: [...(currentData?.messages || []), newMessage]
          }) as ChatWithMessages,
        { revalidate: false }
      );
    },
    [mutate, data]
  );

  const scrollDown = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <CoverLoading isLoading={isLoading}>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
          <div className="flex items-center text-black">
            {targetUser ? `${targetUser.name} ${targetUser.lastName}` : 'Chat'}{' '}
          </div>
          <div className="max-w-120px">
            <Button
              text="Video Call"
              type="button"
              onClick={handleVideoCall}
              className="!bg-blue-600"
            />
          </div>
        </div>
      </div>
      <div className="chats-bg w-full h-[calc(100%-1rem)] flex flex-col relative">
        <div
          className="flex flex-col gap-4 h-[calc(100%-4rem)] overflow-y-auto p-4 custom-scrollbar"
          ref={messageContainerRef}>
          {data &&
            data?.messages?.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.message}
                isUser={message.userId === user?.id}
              />
            ))}
          {typingUsers?.length > 0 && (
            <div className="italic bg-gray-200 text-gray-800 max-w-[240px] rounded-lg p-2">
              {typingUsers[0].message}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 w-full px-6">
          <ChatInput handleSubmit={handleSubmit} chatId={chatId} />
        </div>
      </div>
      <VideoCallModal
        isOpen={isVideoCallModalOpen}
        callData={{ userId: user?.id }}
        onClose={() => setIsVideoCallModalOpen(false)}
        chatId={chatId}
        socket={socket}
        onOpen={() => setIsVideoCallModalOpen(true)}
      />
    </CoverLoading>
  );
};

export default ChatPage;
