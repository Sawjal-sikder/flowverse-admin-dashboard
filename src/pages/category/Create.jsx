import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import api from '../../services/auth';
import { X } from 'lucide-react';

const Create = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/shop/categories/', {
        name: formData.name,
        description: formData.description || formData.name,
      });
      
      const newCategory = response.data;
      
      // Call the callback to update the parent component
      if (onCreate) {
        onCreate(newCategory);
      }
      
      // Reset form and close modal
      setFormData({ name: '', description: '' });
      onClose();
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (errorData.name && Array.isArray(errorData.name)) {
          setError(`Name validation error: ${errorData.name.join(', ')}`);
          return;
        }
        
        if (errorData.description && Array.isArray(errorData.description)) {
          setError(`Description validation error: ${errorData.description.join(', ')}`);
          return;
        }
        
        // Handle other field validation errors
        const validationErrors = [];
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            validationErrors.push(`${field}: ${errorData[field].join(', ')}`);
          }
        });
        
        if (validationErrors.length > 0) {
          setError(`Validation errors: ${validationErrors.join('; ')}`);
          return;
        }
        
        setError(errorData.message || errorData.detail || 'Failed to create Category');
      } else {
        setError(error.message || 'Failed to create Category');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setFormData({ name: '', description: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900">Create New Category</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter category description..."
                  rows="3"
                  
                />
              </div>


            </div>
            
            <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
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
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Create;

