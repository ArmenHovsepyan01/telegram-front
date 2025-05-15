import React, { FC } from 'react';
import cn from 'classnames';

import { PhoneIncoming, PhoneMissed, PhoneOutgoing, Phone, Bot } from 'lucide-react';
import { CallStatus } from '@/utilis/enums';
import { ChatMessage as ChatMessageInterface } from '@/types';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import ChatService from '@/services/chat';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '@/components/Markdown';

const chatService = new ChatService();

const getPhoneIconByCallStatus = (status: CallStatus, isUser = false) => {
  switch (status) {
    case CallStatus.MISSED:
    case CallStatus.DECLINED:
      return <PhoneMissed className="h-5 w-5 text-red-500" />;
    case CallStatus.STARTED:
      if (isUser) return <PhoneOutgoing className="h-5 w-5 text-teal-700" />;
      return <PhoneIncoming className="h-5 w-5 text-teal-700" />;
    default:
      return <Phone className="h-5 w-5 text-teal-700" />;
  }
};

interface ChatMessageProps {
  message: ChatMessageInterface;
  isUser?: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, isUser }) => {
  const router = useRouter();

  if (message.type === 'call' && message.status) {
    return (
      <div className={cn('w-full')}>
        <div
          className={cn(
            'bg-white rounded-lg w-fit p-2 px-4 flex gap-2 justify-between',
            isUser && 'float-right'
          )}>
          {getPhoneIconByCallStatus(message.status, isUser)}
          <span>
            Video call{' '}
            {!message.endedAt
              ? `0 sec`
              : moment(message.endedAt).diff(moment(message.startedAt), 'minutes') > 0
                ? moment(message.endedAt).diff(moment(message.startedAt), 'minutes') + ' min'
                : moment(message.endedAt).diff(moment(message.startedAt), 'seconds') + ' sec'}
          </span>
          <Tippy content="Ask AI" placement="bottom" className="cursor-pointer">
            <Bot
              className="h-5 w-5 text-blue-700 cursor-pointer"
              onClick={async () => {
                const data = await chatService.createAIChat(message.id);
                router.push(`/home/chats/${data.chatId}/call/${data.callId}`);
              }}
            />
          </Tippy>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          'ml-4 max-w-[440px] w-full bg-white text-black p-2 rounded-lg',
          isUser && 'float-end bg-gray-200'
        )}>
        <MarkdownRenderer inProgress={message?.inProgress}>{message.message}</MarkdownRenderer>
      </div>
    </div>
  );
};

export default ChatMessage;
