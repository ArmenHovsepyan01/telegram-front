import { Bot } from 'lucide-react';

const TypingLoading = () => {
  return (
    <div className="flex items-end">
      <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
        <div className="px-4 py-2 rounded-md inline-block bg-sky-50 text-gray-700 bg-[#e8f6f6]">
          <div className="flex space-x-1 justify-center items-center">
            <div className="p-1 animate-bounce animation-delay-300 open-sans">Typing...</div>
          </div>
        </div>
      </div>
      <div className="relative rounded-full shrink-0 overflow-hidden order-1 object-cover bg-white flex items-center justify-center p-2">
        <Bot className="h-5 w-5 text-blue-700 cursor-pointer" />
      </div>
    </div>
  );
};

export default TypingLoading;
