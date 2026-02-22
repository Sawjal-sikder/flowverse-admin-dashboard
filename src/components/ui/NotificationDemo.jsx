import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationDemo = () => {
  const notification = useNotification();

  const handleSuccess = () => {
    notification.success(
      'Success!',
      'Your action was completed successfully.',
      { duration: 3000 }
    );
  };

  const handleError = () => {
    notification.error(
      'Error!',
      'Something went wrong. Please try again.',
      { duration: 5000 }
    );
  };

  const handleWarning = () => {
    notification.warning(
      'Warning!',
      'Please check your input and try again.',
      { duration: 4000 }
    );
  };

  const handleInfo = () => {
    notification.info(
      'Information',
      'Here is some important information for you.',
      { duration: 4000 }
    );
  };

  const handlePersistent = () => {
    notification.info(
      'Persistent Notification',
      'This notification will stay until manually closed.',
      { duration: 0 } // 0 means it won't auto-close
    );
  };

  const handleClearAll = () => {
    notification.clearAllNotifications();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Custom Right-Top Notifications</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleSuccess}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
        >
          Show Success
        </button>
        
        <button
          onClick={handleError}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
        >
          Show Error
        </button>
        
        <button
          onClick={handleWarning}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium"
        >
          Show Warning
        </button>
        
        <button
          onClick={handleInfo}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
        >
          Show Info
        </button>
        
        <button
          onClick={handlePersistent}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 font-medium"
        >
          Persistent
        </button>
        
        <button
          onClick={handleClearAll}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Usage Examples:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
            <code className="text-sm">
              notification.success('Title', 'Description', {`{ duration: 3000 }`})
            </code>
          </div>
          <div className="bg-white p-3 rounded border-l-4 border-red-500">
            <code className="text-sm">
              notification.error('Error Title', 'Error message')
            </code>
          </div>
          <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
            <code className="text-sm">
              notification.warning('Warning', 'Warning message')
            </code>
          </div>
          <div className="bg-white p-3 rounded border-l-4 border-purple-500">
            <code className="text-sm">
              notification.info('Info', 'Info message', {`{ duration: 0 }`}) // Persistent
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;