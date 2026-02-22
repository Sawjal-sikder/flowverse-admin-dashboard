import { useState } from 'react';
import api from '../services/auth';

const useUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateData = async (endpoint, data, method = 'PATCH') => {
    if (!endpoint) {
      setError('Endpoint is required');
      return { success: false };
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await api({
        method,
        url: endpoint,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      setSuccess(true);
      setError(null);
      return { success: true, data: response.data, response };
    } catch (err) {
      console.error('Error updating data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Update failed';
      setError(errorMessage);
      setSuccess(false);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  return { 
    updateData, 
    loading, 
    error, 
    success, 
    reset 
  };
};

export default useUpdate;
