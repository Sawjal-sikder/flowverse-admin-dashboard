import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import api from '../../services/auth';
import { X } from 'lucide-react';

const EditPlan = ({ isOpen, onClose, data, onDataUpdate }) => {
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

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        monthly_amount: data.monthly_amount ?? '',
        annual_amount: data.annual_amount ?? '',
        interval: data.interval || 'month',
        currency: data.currency || 'usd',
        is_active: data.is_active ?? true,
      });
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data) return;

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

      const response = await api.patch(`/payment/plans/${data.id}/`, requestBody);

      if (onDataUpdate) {
        onDataUpdate(response.data);
      }
      onClose();
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 401) {
          setError('Unauthorized. Please login again.');
        } else if (status === 403) {
          setError('Forbidden. You do not have permission to perform this action.');
        } else if (errorData && typeof errorData === 'object') {
          const validationErrors = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              validationErrors.push(`${field}: ${errorData[field].join(', ')}`);
            } else if (typeof errorData[field] === 'string') {
              validationErrors.push(`${field}: ${errorData[field]}`);
            }
          });

          if (validationErrors.length > 0) {
            setError(`Validation errors: ${validationErrors.join('; ')}`);
          } else {
            setError(errorData.detail || `Error ${status}: Unable to update plan`);
          }
        } else {
          setError(`Error ${status}: Unable to update plan`);
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.message || 'An unexpected error occurred');
      }
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
          <h3 className="text-lg font-medium text-gray-900">Edit Plan</h3>
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
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter plan name"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-monthly_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Amount
              </label>
              <input
                type="number"
                id="edit-monthly_amount"
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
              <label htmlFor="edit-annual_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Amount
              </label>
              <input
                type="number"
                id="edit-annual_amount"
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
              <label htmlFor="edit-interval" className="block text-sm font-medium text-gray-700 mb-1">
                Interval
              </label>
              <select
                id="edit-interval"
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
              <label htmlFor="edit-currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="edit-currency"
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
                id="edit-is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="edit-is_active" className="ml-2 block text-sm text-gray-700">
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
              {loading ? 'Updating...' : 'Update Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlan;
