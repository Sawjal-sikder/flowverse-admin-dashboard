import React, { useState, useEffect } from 'react';

// Custom Notification Component
const CustomNotification = ({
  message,
  description,
  type = 'info',
  duration = 4000,
  onClose,
  visible = false,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsAnimating(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getTypeStyles = () => {
    const baseStyles = 'border-l-4 ';
    switch (type) {
      case 'success':
        return baseStyles + 'border-green-500 bg-green-50 text-green-800';
      case 'error':
        return baseStyles + 'border-red-500 bg-red-50 text-red-800';
      case 'warning':
        return baseStyles + 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'info':
      default:
        return baseStyles + 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-lg shadow-lg p-4 ${getTypeStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">{message}</h3>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Container Component
const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id, visible: true };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Expose addNotification function globally
  React.useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {notifications.map((notification) => (
        <CustomNotification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Hook for using notifications
export const useNotification = () => {
  const showNotification = (notification) => {
    if (window.showNotification) {
      window.showNotification(notification);
    }
  };

  return {
    success: (message, description) => showNotification({ message, description, type: 'success' }),
    error: (message, description) => showNotification({ message, description, type: 'error' }),
    warning: (message, description) => showNotification({ message, description, type: 'warning' }),
    info: (message, description) => showNotification({ message, description, type: 'info' }),
  };
};

// Demo Component
const NotificationDemo = () => {
  const notification = useNotification();

  const showDemo = (type) => {
    const messages = {
      success: { message: 'Success!', description: 'Your action was completed successfully.' },
      error: { message: 'Error!', description: 'Something went wrong. Please try again.' },
      warning: { message: 'Warning!', description: 'Please check your input and try again.' },
      info: { message: 'Information', description: 'Here is some important information for you.' },
    };

    notification[type](messages[type].message, messages[type].description);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Custom Right-Top Notifications</h2>
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => showDemo('success')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Show Success
        </button>
        <button
          onClick={() => showDemo('error')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Show Error
        </button>
        <button
          onClick={() => showDemo('warning')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Show Warning
        </button>
        <button
          onClick={() => showDemo('info')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Show Info
        </button>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NotificationContainer />
      <NotificationDemo />
    </div>
  );
};

export default App;
export { CustomNotification, NotificationContainer, useNotification };