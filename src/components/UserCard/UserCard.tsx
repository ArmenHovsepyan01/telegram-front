import { FC } from 'react';
import UserInfo from '@/components/UserInfo/UserInfo';
import cn from 'classnames';

interface IUserInfo {
  name: string;
  email: string;
  avatar?: string;
  onClick?: (email: string) => void;
  showStatus?: boolean;
  isOnline?: boolean;
  selected?: boolean;
}

const UserCard: FC<IUserInfo> = ({
  name,
  avatar,
  email,
  onClick,
  showStatus = false,
  isOnline = false,
  selected = false
}) => {
  return (
    <div
      className={cn(
        'w-full p-2 rounded-xl cursor-pointer flex items-center',
        selected ? 'bg-gray-100' : 'bg-white'
      )}
      onClick={() => onClick?.(email)}>
      <UserInfo name={name} email={email} avatar={avatar} />
      {showStatus && (
        <div className={cn('w-4 h-4 rounded-full', isOnline ? 'bg-green-600' : 'bg-amber-600')} />
      )}
    </div>
  );
};

export default UserCard;
