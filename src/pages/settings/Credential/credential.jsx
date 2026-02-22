import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import { Key, Eye, EyeOff, AlertCircle, Copy, Check } from 'lucide-react';
import useFetchData from '../../../hooks/useFetchData';
import UpdateModal from './Edit';
import Create from './Create';

const Credential = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);

  const [credentialData, setCredentialData] = useState({
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
  const [copiedKeys, setCopiedKeys] = useState({
    OPENAI_API_KEY: false,
    STRIPE_PUBLISHABLE_KEY: false,
    STRIPE_SECRET_KEY: false,
    STRIPE_WEBHOOK_SECRET: false,
  });

  const { data, loading, error, refetch } = useFetchData('/auth/cretiential/');
  useEffect(() => {
    if (data && data.length > 0) {
      const credentials = data[0]; // Get the first object from the array
      setCredentialData({
        id: credentials.id, // Add the ID to the credential data
        OPENAI_API_KEY: credentials.OPENAI_API_KEY || 'Not configured',
        STRIPE_PUBLISHABLE_KEY: credentials.STRIPE_PUBLISHABLE_KEY || 'Not configured',
        STRIPE_SECRET_KEY: credentials.STRIPE_SECRET_KEY || 'Not configured',
        STRIPE_WEBHOOK_SECRET: credentials.STRIPE_WEBHOOK_SECRET || 'Not configured',
      });
    }
  }, [data]);

  const toggleShowKey = (keyName) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const maskKey = (key) => {
    if (!key || key === 'Not configured' || typeof key !== 'string') return key;
    return `${'*'.repeat(Math.max(0, key.length - 8))}${key.slice(-8)}`;
  };

  const copyToClipboard = async (keyName, value) => {
    if (!value || value === 'Not configured') return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKeys(prev => ({
        ...prev,
        [keyName]: true
      }));
      
      // Reset copied status after 2 seconds
      setTimeout(() => {
        setCopiedKeys(prev => ({
          ...prev,
          [keyName]: false
        }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>API Credentials</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading credentials...</div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>API Credentials</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error loading credentials: {error.message}
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>API Credentials</Card.Title>
        <p className="text-sm text-gray-600">
          View your API keys and access tokens for external integrations.
        </p>
      </Card.Header>
      <Card.Content>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-end space-x-3 mb-4">
              <button 
                onClick={() => {
                  setSelectedCredential(credentialData);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Credentials
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Credentials
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(credentialData)
                .filter(([keyName]) => keyName !== 'id') // Filter out the id field
                .map(([keyName, value]) => (
                <div key={keyName} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {keyName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                        {showKeys[keyName] ? value : maskKey(value)}
                      </code>
                      {value && value !== 'Not configured' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => toggleShowKey(keyName)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title={showKeys[keyName] ? 'Hide key' : 'Show key'}
                          >
                            {showKeys[keyName] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(keyName, value)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedKeys[keyName] ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Information</h3>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-3">
                <Key className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    API Key Security
                  </p>
                  <p className="text-sm text-gray-500">
                    Your API credentials are displayed for viewing only. Keep them secure and never share them publicly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card.Content>
      {/* for UpdateModal */}
      <UpdateModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        credential={selectedCredential} 
        onUpdate={refetch}
      />
      {/* for CreateModal */}
      <Create 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        credential={null} 
        onCreate={true}
      />

    </Card>
  );
}

export default Credential
