import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield,
  Save,
  Camera,
  KeyRound
} from 'lucide-react';
import ChangePassword from './ChangePassword';
import Profile from './Profile';
import Credential from './Credential/credential';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    weeklyReports: true,
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'credential', name: 'Credentials', icon: KeyRound },
    // { id: 'general', name: 'General', icon: Globe },
  ];

  // const handleProfileChange = (e) => {
  //   const { name, value } = e.target;
  //   setProfileData(prev => ({ ...prev, [name]: value }));
  // };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecurityData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    // Handle save logic here
    alert('Settings saved successfully!');
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account and application preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-64">
            <Card>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <Profile />
            )}

            {activeTab === 'security' && (
              <ChangePassword />
                        )}

            {activeTab === 'credential' && (
              <Credential />
            )}

            {activeTab === 'general' && (
              <Card>
                <Card.Header>
                  <Card.Title>General Settings</Card.Title>
                  <p className="text-sm text-gray-600">
                    Configure general application settings.
                  </p>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                          <option value="GMT">GMT</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;