import LoadingSVG from '@/assets/icons/loading.svg';

const LoadingSpinner = () => {
  return (
    <div className="bg-white w-full h-screen flex items-center justify-center">
      <LoadingSVG className="animate-spin -ml-1 mr-3 h-12 w-12" />
    </div>
  );
};

export default LoadingSpinner;
