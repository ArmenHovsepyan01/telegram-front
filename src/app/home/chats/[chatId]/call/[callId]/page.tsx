'use client';

import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/utilis/hooks/useSocket';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import useSWR from 'swr';
import { ChatMessage as ChatMessageInterface, ChatWithMessages } from '@/types';
import { v4 } from 'uuid';
import CoverLoading from '@/components/CoverLoading/CoverLoading';
import ChatMessage from '@/components/ChatMessage/ChatMessage';
import ChatInput from '@/components/ChatInput/ChatInput';
import ChatService from '@/services/chat';
import TypingLoading from '@/components/TypingLoading';
import { Bot } from 'lucide-react';
import TranscriptDownloader from '@/components/DownloadTranscript';

interface ChatPageProps {
  params: {
    chatId: string;
    callId: string;
  };
}

const chatService = new ChatService();

const CallsPage: FC<ChatPageProps> = ({ params: { callId, chatId } }) => {
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
  const [isTyping, setIsTyping] = useState(false);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      scrollDown();
    }
  }, [isLoading]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('joinAIChat', {
        callId,
        userId: user.id
      });
    }
  }, [socket, chatId, user]);

  useEffect(() => {
    socket?.on(
      'receiveAIMessage',
      async (receivedMessage: { message: ChatMessageInterface; inProgress: boolean }) => {
        const { message, inProgress = false } = receivedMessage;
        const existingMessage = data?.messages.find((m) => m.id === message.id);
        if (existingMessage) {
          await updateMessages(
            {
              ...message,
              inProgress
            },
            existingMessage.id
          );
        } else {
          setIsTyping(false);
          await addNewMessage({
            ...message,
            inProgress
          });
        }
        scrollDown();
      }
    );

    return () => {
      socket?.off('receiveAIMessage');
    };
  }, [socket, data?.messages]);

  const handleSubmit = async (values: { message: string }) => {
    if (isTyping || !!data?.messages?.filter((m) => m.inProgress)?.length) return;

    const message = {
      ...values,
      id: v4(),
      userId: user?.id,
      role: 'user',
    };

    try {
      await addNewMessage(message);
      socket?.emit('sendAIMessage', {
        message,
        chatId,
        callId
      });

      scrollDown();
      setIsTyping(true);
    } catch (e) {
      console.log('error handleSubmit', e);
    }
  };

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

  function scrollDown() {
    if (messageContainerRef.current) {
      setTimeout(() => {
        messageContainerRef?.current?.scrollTo({
          top: messageContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 0);
    }
  }

  return (
    <CoverLoading isLoading={isLoading}>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 h-16 bg-white border-b border-gray-200 px-4">
          <div className="flex items-center text-black">Summarization AI</div>
          <Bot className="h-5 w-5 text-blue-700 cursor-pointer" />
          <TranscriptDownloader callId={callId} />
        </div>
      </div>
      <div className="chats-bg w-full h-[calc(100%-1rem)] flex flex-col relative">
        <div
          className="flex flex-col gap-4 h-[calc(100%-4rem)] overflow-y-auto p-4 custom-scrollbar"
          ref={messageContainerRef}>
          {data &&
            data?.messages?.map((message) => (
              <ChatMessage key={message.id} message={message} isUser={message?.role === 'user'} />
            ))}
          {isTyping && <TypingLoading />}
        </div>
        <div className="absolute bottom-0 left-0 w-full px-6">
          <ChatInput handleSubmit={handleSubmit} chatId={chatId} />
        </div>
      </div>
    </CoverLoading>
  );
};

export default CallsPage;
