import { motion } from 'framer-motion';
import { FC, useEffect } from 'react';
import { useAuthContext } from '@/utilis/hooks/useAuthContext';
import Button from '@/components/ui/Button/Button';
import UserInfo from '@/components/UserInfo/UserInfo';

interface IAnimatedDrawer {
  isOpen: boolean;
  handleClose: () => void;
}

const AnimatedDrawer: FC<IAnimatedDrawer> = ({ isOpen, handleClose }) => {
  const { logout, user } = useAuthContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30"
          onClick={handleClose}
        />
      )}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? '0%' : '-100%' }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 max-w-[440px] w-full h-full bg-white shadow-lg z-40">
        <div className="flex justify-end py-1 px-1">
          <button onClick={handleClose}>
            <span className="icon-clear text-2xl text-navy" />
          </button>
        </div>
        <div className="flex flex-col px-2 h-full pb-14 gap-2">
          {user && <UserInfo name={user.name} email={user.email} />}
          <div className="mt-auto">
            <Button
              type="button"
              text="Logout"
              onClick={logout}
              className="!bg-blue-600 lg:w-1/2 sm:w-full"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AnimatedDrawer;
