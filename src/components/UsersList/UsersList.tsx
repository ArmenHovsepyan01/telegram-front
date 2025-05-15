import UserCard from '@/components/UserCard/UserCard';
import { ChatResponse, User } from '@/types';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import ChatService from '@/services/chat';

interface IUserList {
  users: Omit<User, 'id'>[];
  onClose: () => void;
  addNewChat: (chat: ChatResponse) => void;
}

const chatService = new ChatService();

const UsersList: FC<IUserList> = ({ users, onClose, addNewChat }) => {
  const router = useRouter();
  const getChatWithUser = async (email: string) => {
    try {
      const data = await chatService.createChat(email);
      router.push(`/home/chats/${data.id}`);
      addNewChat(data);
      onClose();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!!users?.length &&
        users?.map((user) => (
          <UserCard
            name={user.name}
            email={user.email}
            key={user.email}
            onClick={getChatWithUser}
          />
        ))}
    </div>
  );
};

export default UsersList;
