import { useState } from 'react';
import Button from '../../components/ui/Button';
import { API_BASE_URL } from '../../services/auth';
import axios from 'axios';
import { X } from 'lucide-react';

const CreatePlan = ({ isOpen, onClose, onDataCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    monthly_amount: '',
    annual_amount: '',
    interval: 'month',
    currency: 'usd',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        name: formData.name,
        monthly_amount: formData.monthly_amount ? parseFloat(formData.monthly_amount) : null,
        annual_amount: formData.annual_amount ? parseFloat(formData.annual_amount) : null,
        interval: formData.interval,
        currency: formData.currency,
        is_active: formData.is_active,
      };

      const response = await axios.post(`${API_BASE_URL}/payment/plans/`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (onDataCreate) {
        onDataCreate(response.data);
      }

      setFormData({
        name: '',
        monthly_amount: '',
        annual_amount: '',
        interval: 'month',
        currency: 'usd',
        is_active: true,
      });
      onClose();
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const validationErrors = [];
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            validationErrors.push(`${field}: ${errorData[field].join(', ')}`);
          }
        });

        if (validationErrors.length > 0) {
          setError(`Validation errors: ${validationErrors.join('; ')}`);
        } else {
          setError(errorData.message || errorData.detail || 'Failed to create plan');
        }
      } else {
        setError(error.message || 'Failed to create plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setFormData({
      name: '',
      monthly_amount: '',
      annual_amount: '',
      interval: 'month',
      currency: 'usd',
      is_active: true,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Plan</h3>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter plan name"
                required
              />
            </div>

            <div>
              <label htmlFor="monthly_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Amount
              </label>
              <input
                type="number"
                id="monthly_amount"
                name="monthly_amount"
                value={formData.monthly_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="annual_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Amount
              </label>
              <input
                type="number"
                id="annual_amount"
                name="annual_amount"
                value={formData.annual_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                Interval
              </label>
              <select
                id="interval"
                name="interval"
                value={formData.interval}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="month">Month</option>
                <option value="year">Year</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
                <option value="bdt">BDT</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active
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
              {loading ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlan;
