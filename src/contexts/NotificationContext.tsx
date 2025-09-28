import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification, { NotificationProps } from '../components/Notification';

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'id' | 'onClose'>) => void;
  showSuccess: (title: string, message: string, details?: string) => void;
  showError: (title: string, message: string, details?: string) => void;
  showInfo: (title: string, message: string, details?: string) => void;
  showWarning: (title: string, message: string, details?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showNotification = (notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: removeNotification
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const showSuccess = (title: string, message: string, details?: string) => {
    showNotification({ type: 'success', title, message, details });
  };

  const showError = (title: string, message: string, details?: string) => {
    showNotification({ type: 'error', title, message, details });
  };

  const showInfo = (title: string, message: string, details?: string) => {
    showNotification({ type: 'info', title, message, details });
  };

  const showWarning = (title: string, message: string, details?: string) => {
    showNotification({ type: 'warning', title, message, details });
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning
    }}>
      {children}
      {notifications.map(notification => (
        <Notification key={notification.id} {...notification} />
      ))}
    </NotificationContext.Provider>
  );
};


