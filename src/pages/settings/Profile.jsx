import React, { useState, useEffect } from 'react';
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
  Camera
} from 'lucide-react';
import useFetchData from '../../hooks/useFetchData';
import api, {PIC_BASE_URL, API_BASE_URL } from '../../services/auth';
import axios from 'axios';

const Profile = () => {
  const endpoint = '/auth/user/';
  const { data, loading, error } = useFetchData(endpoint);

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    profile_picture: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Update profileData when data is fetched
  useEffect(() => {
    if (data) {
      setProfileData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        profile_picture: data.profile_picture || '',
      });
      // Set profile image preview if exists
      if (data.profile_picture) {
        // Handle both relative and absolute URLs
        const imageUrl = data.profile_picture.startsWith('http') 
          ? data.profile_picture 
          : `${PIC_BASE_URL}${data.profile_picture}`;
        setProfileImagePreview(imageUrl);
      }
    }
  }, [data]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);


  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear any previous errors or success messages when user starts typing
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setUpdateError('Please select a valid image file (JPG, PNG, or GIF).');
        // Reset file input
        e.target.value = '';
        return;
      }

      // Validate file size (2MB max for better user experience)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        setUpdateError('File size must be less than 2MB.');
        // Reset file input
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      setUpdateError(null);
      setUpdateSuccess(false);
    }
  };

  const handlePhotoClick = () => {
    document.getElementById('profile-photo-input').click();
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setProfileImagePreview(data?.profile_picture ? 
      (data.profile_picture.startsWith('http') 
        ? data.profile_picture 
        : `${PIC_BASE_URL}${data.profile_picture}`) 
      : null
    );
    
    // Reset file input
    const fileInput = document.getElementById('profile-photo-input');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Clear any previous errors
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleSave = async () => {
    // Basic validation
    if (!profileData.full_name.trim()) {
      setUpdateError('Full name is required.');
      return;
    }

    if (!profileData.email.trim()) {
      setUpdateError('Email address is required.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setUpdateError('Please enter a valid email address.');
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      let updatedUser;

      // Check if we have a file to upload
      if (selectedFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('full_name', profileData.full_name);
        formData.append('email', profileData.email);
        formData.append('phone_number', profileData.phone_number); 
        formData.append('profile_picture', selectedFile);

        const response = await axios.patch(`${API_BASE_URL}/auth/profile/update/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        updatedUser = response.data;
      } else {
        // Update profile without file upload
        const updateData = {
          full_name: profileData.full_name,
          email: profileData.email,
          phone_number: profileData.phone_number
        };

        const response = await axios.patch(`${API_BASE_URL}/auth/profile/update/`, updateData,{
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        updatedUser = response.data;
      }
      
      // Update local state with the response data
      setProfileData(prevData => ({
        ...prevData,
        ...updatedUser
      }));

      // Update profile image preview if updated
      if (updatedUser.profile_picture) {
        const imageUrl = updatedUser.profile_picture.startsWith('http') 
          ? updatedUser.profile_picture 
          : `${PIC_BASE_URL}${updatedUser.profile_picture}`;
        setProfileImagePreview(imageUrl);
      } else if (selectedFile) {
        // If profile picture was removed, clear the preview
        setProfileImagePreview(null);
      }

      // Clear selected file
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('profile-photo-input');
      if (fileInput) {
        fileInput.value = '';
      }

      setUpdateSuccess(true);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        if (status === 400) {
          // Bad request - validation errors
          if (data.email) {
            errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
          } else if (data.full_name) {
            errorMessage = Array.isArray(data.full_name) ? data.full_name[0] : data.full_name;
          } else if (data.phone_number) {
            errorMessage = Array.isArray(data.phone_number) ? data.phone_number[0] : data.phone_number;
          } else if (data.profile_picture) {
            errorMessage = Array.isArray(data.profile_picture) ? data.profile_picture[0] : data.profile_picture;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          }
        } else if (status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to update this profile.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setUpdateError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading profile data...</div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading profile data. Please try again.</div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
                  <Card>
                <Card.Header>
                  <Card.Title>Profile Information</Card.Title>
                  <p className="text-sm text-gray-600">
                    Update your account profile information and email address.
                  </p>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-6">
                    {/* Success Message */}
                    {updateSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Save className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                              Profile updated successfully!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {updateError && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Shield className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">
                              {updateError}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profile Photo */}
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-400 transition-colors" onClick={handlePhotoClick}>
                        {profileImagePreview ? (
                          <img 
                            src={profileImagePreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-medium text-gray-600">
                            {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <input
                          id="profile-photo-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={updateLoading}
                        />
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handlePhotoClick}
                            disabled={updateLoading}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            {selectedFile ? 'Change Photo' : 'Upload Photo'}
                          </Button>
                          {selectedFile && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleRemoveSelectedFile}
                              disabled={updateLoading}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG or GIF. 2MB max.
                        </p>
                        {selectedFile && (
                          <p className="text-xs text-blue-600 mt-1">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleProfileChange}
                        required
                        disabled={updateLoading}
                      />
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                        disabled={updateLoading}
                      />
                      <Input
                        label="Phone Number"
                        name="phone_number"
                        value={profileData.phone_number}
                        onChange={handleProfileChange}
                        disabled={updateLoading}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSave}
                        disabled={updateLoading}
                        className={updateLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>

  )
}

export default Profile
