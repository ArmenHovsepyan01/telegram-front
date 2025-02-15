import { ChangeEvent, FC, memo, useCallback, useState } from 'react';
import AnimatedDrawer from '@/components/AnimatedDrawer/AnimatedDrawer';

interface ISearchBar {
  handleInputFocus: () => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputValue: string;
}

const SearchBar: FC<ISearchBar> = ({ handleInputFocus, inputValue, handleInputChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  const handleOpenMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, [setIsMenuOpen]);

  return (
    <div className="relative flex items-center justify-center h-16 px-4 gap-1 w-full overflow-x-hidden">
      <span className="icon-menu text-2xl text-navy cursor-pointer" onClick={handleOpenMenu}></span>
      <div className="w-full bg-gray-100 rounded-full flex justify-center items-center">
        <input
          value={inputValue}
          className="w-full py-1 px-4 bg-transparent outline-none text-gray-700"
          type="text"
          placeholder="Search"
          onFocus={handleInputFocus}
          onChange={handleInputChange}
        />
      </div>
      <AnimatedDrawer isOpen={isMenuOpen} handleClose={handleCloseMenu} />
    </div>
  );
};

export default memo(SearchBar);
