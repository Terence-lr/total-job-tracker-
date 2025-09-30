import { useState } from 'react';

interface UseLoadingReturn {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoading = (initialState: boolean = false): UseLoadingReturn => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading
  };
};



