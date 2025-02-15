import { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from 'react';
import SearchBar from '@/components/SearchBar/SearchBar';
import ChatsSearchList from '@/components/ChatsSearchList/ChatsSearchList';
import Chats from '@/components/Chats/Chats';

interface ISidebar {
  onlineUsers: number[];
}

const Sidebar: FC<ISidebar> = ({ onlineUsers }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [isInputActive, setIsInputActive] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleInputFocus = useCallback(() => {
    setIsInputActive(true);
  }, [setIsInputActive]);

  const handleInputBlur = useCallback(() => {
    setIsInputActive(false);
  }, [setIsInputActive]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [setInputValue]
  );

  const handleOnClose = useCallback(() => {
    setInputValue('');
    handleInputBlur();
  }, [handleInputBlur, setInputValue]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        handleOnClose();
      }
    }

    if (isInputActive) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isInputActive, handleOnClose]);

  return (
    <div className="md:flex flex-col bg-white max-w-[440px] w-full h-full" ref={listRef}>
      <SearchBar
        handleInputFocus={handleInputFocus}
        inputValue={inputValue}
        handleInputChange={handleInputChange}
      />
      <div className="relative w-full h-full max-h-[calc(100%-4rem)]">
        <ChatsSearchList isOpen={isInputActive} searchTerm={inputValue} />
        <Chats onlineUsers={onlineUsers} />
      </div>
    </div>
  );
};

export default Sidebar;
