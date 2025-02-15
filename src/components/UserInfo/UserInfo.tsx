import React, { FC } from 'react';
import cn from 'classnames';

interface IUserInfo {
  name: string;
  email: string;
  avatar?: string;
}

const UserInfo: FC<IUserInfo> = ({ name, email, avatar }) => {
  return (
    <div className="w-full bg-transparent text-black rounded-lg">
      <div className="flex items-center">
        <div
          className={cn(
            'rounded-full w-10 h-10 flex items-center justify-center',
            avatar ? 'bg-white' : 'bg-blue-400'
          )}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
          ) : (
            <span className="text-2xl text-white uppercase">{name?.[0] || 'U'}</span>
          )}
        </div>
        <div className="ml-2">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
