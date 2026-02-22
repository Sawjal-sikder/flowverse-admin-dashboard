import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { API_BASE_URL } from '../services/auth';
import { Save, Loader2 } from 'lucide-react';

const RuleAnalysis = () => {
  const [formData, setFormData] = useState({
    rules_contract_createion: '',
    rules_email_reply: '',
    rules_location_suitability: '',
    rules_contract_analysis: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchRules = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard/analysis-rules/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rules');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setFormData(result.data);
      } else if (result.data) {
        setFormData(result.data);
      } else {
        setFormData(result);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await fetch(`${API_BASE_URL}/dashboard/analysis-rules/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update rules');
      }
      
      const result = await response.json();
      setMessage({ type: 'success', text: 'Rules updated successfully!' });
    } catch (error) {
      console.error('Error updating rules:', error);
      setMessage({ type: 'error', text: 'Failed to update rules. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (

      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Rule Analysis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and update analysis rules
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <Card>
          <div className="p-6">
            {fetchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading rules...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label 
                    htmlFor="rules_contract_createion" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rules Contract Creation
                  </label>
                  <textarea
                    id="rules_contract_createion"
                    name="rules_contract_createion"
                    rows={4}
                    value={formData.rules_contract_createion}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter contract creation rules..."
                  />
                </div>

                <div>
                  <label 
                    htmlFor="rules_email_reply" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rules Email Reply
                  </label>
                  <textarea
                    id="rules_email_reply"
                    name="rules_email_reply"
                    rows={4}
                    value={formData.rules_email_reply}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter email reply rules..."
                  />
                </div>

                <div>
                  <label 
                    htmlFor="rules_location_suitability" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rules Location Suitability
                  </label>
                  <textarea
                    id="rules_location_suitability"
                    name="rules_location_suitability"
                    rows={4}
                    value={formData.rules_location_suitability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter location suitability rules..."
                  />
                </div>

                <div>
                  <label 
                    htmlFor="rules_contract_analysis" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rules Contract Analysis
                  </label>
                  <textarea
                    id="rules_contract_analysis"
                    name="rules_contract_analysis"
                    rows={4}
                    value={formData.rules_contract_analysis}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter contract analysis rules..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
  );
};

export default RuleAnalysis;