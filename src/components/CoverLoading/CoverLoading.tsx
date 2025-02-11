import React, { FC } from 'react';
import LoadingSVG from '@/assets/icons/loading.svg';

interface CoverLoadingProps {
  children: React.ReactNode;
  isLoading: boolean;
}

const CoverLoading: FC<CoverLoadingProps> = ({ children, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white w-full h-full flex items-center justify-center">
        <LoadingSVG className="animate-spin -ml-1 mr-3 h-12 w-12" />
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default CoverLoading;
