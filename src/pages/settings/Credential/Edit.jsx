import React, { useState, useEffect } from 'react';
import { X, Key, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import useUpdate from '../../../hooks/useUpdate';
import { useNotification } from '../../../contexts/NotificationContext';

const Edit = ({ isOpen, onClose, credential, onUpdate }) => {

    const { updateData, loading, error, success, reset } = useUpdate();
    const { success: notifySuccess, error: notifyError } = useNotification();

  const [formData, setFormData] = useState({
    OPENAI_API_KEY: '',
    STRIPE_PUBLISHABLE_KEY: '',
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
  });
  
  const [showKeys, setShowKeys] = useState({
    OPENAI_API_KEY: false,
    STRIPE_PUBLISHABLE_KEY: false,
    STRIPE_SECRET_KEY: false,
    STRIPE_WEBHOOK_SECRET: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (credential) {
      setFormData({
        OPENAI_API_KEY: credential.OPENAI_API_KEY || '',
        STRIPE_PUBLISHABLE_KEY: credential.STRIPE_PUBLISHABLE_KEY || '',
        STRIPE_SECRET_KEY: credential.STRIPE_SECRET_KEY || '',
        STRIPE_WEBHOOK_SECRET: credential.STRIPE_WEBHOOK_SECRET || '',
      });
    }
  }, [credential]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const toggleShowKey = (keyName) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (!formData[key].trim()) {
        newErrors[key] = `${key.replace(/_/g, ' ')} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!credential?.id) {
      notifyError('Credential ID is missing');
      setErrors({ general: 'Unable to update: Credential ID is missing' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await updateData(`/auth/cretiential/${credential.id}/`, formData, 'PATCH');
        if (!response.success) {
        notifyError('Failed to update credentials:', response.error);
        return;
      }
      
      // Call refetch to update the data after successful update
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
      notifySuccess('Credentials updated successfully');
    } catch (error) {
      notifyError('Error updating credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        OPENAI_API_KEY: '',
        STRIPE_PUBLISHABLE_KEY: '',
        STRIPE_SECRET_KEY: '',
        STRIPE_WEBHOOK_SECRET: '',
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Key className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Edit API Credentials
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Security Notice */}
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Security Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  These credentials will be encrypted and stored securely. Never share them publicly or with unauthorized users.
                </p>
              </div>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-600">{errors.general}</span>
              </div>
            )}

            {/* Form Fields */}
            {Object.entries(formData).map(([keyName, value]) => (
              <div key={keyName} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {keyName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showKeys[keyName] ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => handleInputChange(keyName, e.target.value)}
                    className={`w-full pr-12 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors[keyName] 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder={`Enter your ${keyName.replace(/_/g, ' ').toLowerCase()}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(keyName)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showKeys[keyName] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors[keyName] && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors[keyName]}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Credentials</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit;
