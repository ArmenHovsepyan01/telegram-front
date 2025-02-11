import React, { FC } from 'react';
import cn from 'classnames';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, isUser = false }) => {
  return (
    <div className="w-full">
      <div
        className={cn(
          'max-w-[440px] w-full bg-white text-black p-2 rounded-lg',
          isUser && 'float-end bg-gray-200'
        )}>
        {message}
      </div>
    </div>
  );
};

export default ChatMessage;
