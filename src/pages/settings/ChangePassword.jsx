import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Shield, Save, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [securityData, setSecurityData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);


  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecurityData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setMessage({ type: '', text: '' });
    
    // Add password validation logic here
    if (securityData.new_password !== securityData.confirm_password) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }

    if (securityData.new_password.length < 4) {
      setMessage({ type: 'error', text: 'Password must be at least 4 characters long' });
      return;
    }

    if (!securityData.old_password) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    const payload = {
        old_password: securityData.old_password,
        new_password: securityData.new_password,
        confirm_password: securityData.confirm_password
    };

    setIsLoading(true);

    try {
        const response = await api.post(`/auth/change-password/`, payload);
        if (response.status === 200) {
            setMessage({ type: 'success', text: 'Password changed successfully. You will be logged out for security.' });
            
            // Clear form
            setSecurityData({
                old_password: '',
                new_password: '',
                confirm_password: '',
            });
            
            // Log out the user and redirect to login page
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000); // Give user time to read the message
            
        } else {
            setMessage({ type: 'error', text: 'Failed to change password' });
        }        
    } catch (error) {
        console.error('Error changing password:', error);
        
        // Show specific error message from API if available
        let errorMessage = 'Failed to change password';
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data.detail) {
                errorMessage = error.response.data.detail;
            } else {
                // Handle field-specific errors
                const fieldErrors = [];
                Object.keys(error.response.data).forEach(field => {
                    if (Array.isArray(error.response.data[field])) {
                        fieldErrors.push(`${field}: ${error.response.data[field].join(', ')}`);
                    } else {
                        fieldErrors.push(`${field}: ${error.response.data[field]}`);
                    }
                });
                if (fieldErrors.length > 0) {
                    errorMessage = fieldErrors.join('\n');
                }
            }
        }
        
        setMessage({ type: 'error', text: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };
  return (
              <Card>
                <Card.Header>
                  <Card.Title>Security Settings</Card.Title>
                  <p className="text-sm text-gray-600">
                    Manage your password and security preferences.
                  </p>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-6">
                    {/* Message Display */}
                    {message.text && (
                      <div className={`flex items-center p-4 rounded-lg ${
                        message.type === 'error' 
                          ? 'bg-red-50 border border-red-200 text-red-700' 
                          : 'bg-green-50 border border-green-200 text-green-700'
                      }`}>
                        {message.type === 'error' ? (
                          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium whitespace-pre-line">{message.text}</span>
                      </div>
                    )}

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <Input
                          label="Current Password"
                          name="old_password"
                          type="password"
                          value={securityData.old_password}
                          onChange={handleSecurityChange}
                          required
                        />
                        <Input
                          label="New Password"
                          name="new_password"
                          type="password"
                          value={securityData.new_password}
                          onChange={handleSecurityChange}
                          required
                        />
                        <Input
                          label="Confirm New Password"
                          name="confirm_password"
                          type="password"
                          value={securityData.confirm_password}
                          onChange={handleSecurityChange}
                          required
                        />
                      </div>
                    </div>

                    {/* <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Two-factor authentication
                            </p>
                            <p className="text-sm text-gray-500">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          name="twoFactorEnabled"
                          checked={securityData.twoFactorEnabled}
                          onChange={handleSecurityChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div> */}

                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Updating...' : 'Update Security'}
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
  )
}

export default ChangePassword
