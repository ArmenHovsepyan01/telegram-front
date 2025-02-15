import { FC, memo, useCallback } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import UserService from '@/services/user';
import debounce from 'lodash/debounce';
import UsersList from '@/components/UsersList/UsersList';

interface IChatsSearchList {
  isOpen: boolean;
  searchTerm?: string;
}

const ChatsSearchList: FC<IChatsSearchList> = ({ isOpen, searchTerm = '' }) => {
  const userService = new UserService();
  const shouldFetch = isOpen && searchTerm.length > 0;

  const debouncedFetcher = useCallback(
    debounce((term: string) => userService.searchUsers(term), 100),
    []
  );

  const { data, isLoading } = useSWR(
    shouldFetch ? ['searchUsers', searchTerm] : null,
    () => debouncedFetcher(searchTerm),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chat-list"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-x-0 top-0 max-w-[440px] w-full h-full bg-gray-100 shadow-lg z-20">
          <div className="flex flex-col p-2 h-full pb-14 gap-2">
            {data ? (
              <UsersList users={data?.data} />
            ) : isLoading ? (
              <div>Loading...</div>
            ) : (
              <div>No users found</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(ChatsSearchList);
