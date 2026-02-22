import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { API_BASE_URL } from '../../services/auth';
import { X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const EditAdmin = ({ isOpen, onClose, user, onUserUpdate, useLocalUpdate = true }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: "admin"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { Error } = useNotification();

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        role: user.role || 'admin'
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);



      if (useLocalUpdate) {
        // Update local data without API call
        
        const updatedUserData = {
          id: user.id,
          full_name: formData.full_name || '',
          email: formData.email || '',
          phone_number: formData.phone_number || '',
          role: formData.role || 'admin'
        };


        onUserUpdate(updatedUserData);
        onClose();
        return;
      }

      // API update logic (existing code)
      const formDataPayload = new FormData();
      formDataPayload.append('user_id', user.id.toString());
      formDataPayload.append('full_name', formData.full_name || '');
      
      // Only include email if it has actually changed to avoid duplicate email validation
      if (formData.email && formData.email !== user.email) {
        formDataPayload.append('email', formData.email);
      }
      
      formDataPayload.append('phone_number', formData.phone_number || '');
      formDataPayload.append('role', formData.role || 'admin');



      const response = await fetch(`${API_BASE_URL}/dashboard/administrators/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formDataPayload,
      });
      
      if (!response.ok) {
        // Try to get more detailed error information
        let errorData;
        try {
          errorData = await response.json();
          
          // Handle validation errors more gracefully
          if (errorData.email && Array.isArray(errorData.email)) {
            throw new Error(`Email validation error: ${errorData.email.join(', ')}`);
          }
          
          // Handle other field validation errors
          const validationErrors = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              validationErrors.push(`${field}: ${errorData[field].join(', ')}`);
            }
          });
          
          if (validationErrors.length > 0) {
            throw new Error(`Validation errors: ${validationErrors.join('; ')}`);
          }
          
          // If no specific validation errors, use general message
          throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
          
        } catch (parseError) {
          // If JSON parsing fails, don't try to read as text since we already consumed the stream
          if (parseError.message.includes('Validation errors') || parseError.message.includes('Email validation error')) {
            throw parseError; // Re-throw our custom validation error
          }
          throw new Error(`HTTP error! status: ${response.status} - Unable to parse error response`);
        }
      }

      const updatedUser = await response.json();
      
      // Ensure the updated user has the ID for proper list updating
      const updatedUserWithId = {
        ...updatedUser,
        id: user.id
      };
      
      onUserUpdate(updatedUserWithId);
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
          <h3 className="text-lg font-medium text-gray-900">Edit Administrator</h3>
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
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
                // disabled
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
                required
                // disabled
              />
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
                // disabled
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            
            {/* <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active Status
              </label>
            </div> */}
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
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdmin;