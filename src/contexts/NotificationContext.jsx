import React, { createContext, useContext, useState } from 'react';

// Create the Notification Context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random(); // Ensure unique ID
    const newNotification = {
      id,
      visible: true,
      duration: 4000,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods for different notification types
  const success = (message, description, options = {}) => {
    return addNotification({
      message,
      description,
      type: 'success',
      ...options,
    });
  };

  const error = (message, description, options = {}) => {
    return addNotification({
      message,
      description,
      type: 'error',
      duration: 6000, // Longer duration for errors
      ...options,
    });
  };

  const warning = (message, description, options = {}) => {
    return addNotification({
      message,
      description,
      type: 'warning',
      ...options,
    });
  };

  const info = (message, description, options = {}) => {
    return addNotification({
      message,
      description,
      type: 'info',
      ...options,
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;