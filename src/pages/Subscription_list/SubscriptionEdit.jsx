import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { API_BASE_URL } from '../../services/auth';
import { X } from 'lucide-react';

const SubscriptionEdit = ({ isOpen, onClose, subscription, onSubscriptionUpdate }) => {
  const [formData, setFormData] = useState({
    user: '',
    stripe_customer_id: '',
    status: '',
    trial_end: '',
    current_period_end: '',
    auto_renew: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  // Update form data when subscription changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        user: subscription.user || '',
        stripe_customer_id: subscription.stripe_customer_id || '',
        status: subscription.status || '',
        trial_end: formatDateForInput(subscription.trial_end),
        current_period_end: formatDateForInput(subscription.current_period_end),
        auto_renew: subscription.auto_renew || false,
      });
    }
  }, [subscription]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCancel = () => {
    setFormData({
      user: '',
      stripe_customer_id: '',
      status: '',
      trial_end: '',
      current_period_end: '',
      auto_renew: false,
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subscription) return;

    try {
      setLoading(true);
      setError(null);

      // Prepare the request body
      const requestBody = {
        user: formData.user,
        stripe_customer_id: formData.stripe_customer_id,
        status: formData.status,
        trial_end: formData.trial_end,
        current_period_end: formData.current_period_end,
        auto_renew: formData.auto_renew,
      };


      const response = await fetch(`${API_BASE_URL}/payment/subscriptions/update/${subscription.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          
          // Handle validation errors
          if (typeof errorData === 'object' && errorData !== null) {
            const validationErrors = [];
            Object.keys(errorData).forEach(field => {
              if (Array.isArray(errorData[field])) {
                validationErrors.push(`${field}: ${errorData[field].join(', ')}`);
              } else if (typeof errorData[field] === 'string') {
                validationErrors.push(`${field}: ${errorData[field]}`);
              }
            });
            
            if (validationErrors.length > 0) {
              throw new Error(`Validation errors: ${validationErrors.join('; ')}`);
            }
          }
          
          throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
          
        } catch (parseError) {
          if (parseError.message.includes('Validation errors')) {
            throw parseError;
          }
          throw new Error(`HTTP error! status: ${response.status} - Unable to parse error response`);
        }
      }

      const updatedSubscription = await response.json();
      
      // Update the subscription in the parent component
      onSubscriptionUpdate(updatedSubscription);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Edit Subscription</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>
              <input
                type="text"
                id="user"
                name="user"
                value={formData.user}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
                required
                disabled
              />
            </div>
            
            <div>
              <label htmlFor="stripe_customer_id" className="block text-sm font-medium text-gray-700 mb-1">
                Stripe Customer ID
              </label>
              <input
                type="text"
                id="stripe_customer_id"
                name="stripe_customer_id"
                value={formData.stripe_customer_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Stripe Customer ID"
                required
                disabled
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="inactive">Inactive</option>
                <option value="canceled">Canceled</option>
                <option value="past_due">Past Due</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="trial_end" className="block text-sm font-medium text-gray-700 mb-1">
                Trial End Date
              </label>
              <input
                type="date"
                id="trial_end"
                name="trial_end"
                value={formData.trial_end}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="current_period_end" className="block text-sm font-medium text-gray-700 mb-1">
                Current Period End Date
              </label>
              <input
                type="date"
                id="current_period_end"
                name="current_period_end"
                value={formData.current_period_end}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_renew"
                name="auto_renew"
                checked={formData.auto_renew}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="auto_renew" className="ml-2 block text-sm text-gray-900">
                Auto Renew
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Subscription'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionEdit;