import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const STEPS = {
  EMAIL: 1,
  VERIFY: 2,
  SET_PASSWORD: 3,
};

const ForgotPassword = () => {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors = {};
    if (!code) {
      newErrors.code = 'Verification code is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    setErrors({});
    try {
      await api.post('/auth/forgot-password/', { email });
      setStep(STEPS.VERIFY);
      setSuccessMessage('A verification code has been sent to your email.');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Failed to send verification code. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!validateCode()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      await api.post('/auth/forgot-password/verify/', { email, code });
      setStep(STEPS.SET_PASSWORD);
      setSuccessMessage('Code verified successfully. Set your new password.');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Invalid verification code. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      await api.post('/auth/forgot-password/set/password/', {
        email,
        password,
        confirm_password: confirmPassword,
      });
      setSuccessMessage('Password has been reset successfully!');
      setStep(null);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Failed to reset password. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {[STEPS.EMAIL, STEPS.VERIFY, STEPS.SET_PASSWORD].map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all ${
            s === step
              ? 'w-8 bg-primary-600'
              : s < step
              ? 'w-8 bg-primary-400'
              : 'w-8 bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const renderEmailStep = () => (
    <form className="space-y-6" onSubmit={handleSendCode}>
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Enter your email</h3>
        <p className="text-sm text-gray-500 mt-1">
          We'll send a verification code to your email address.
        </p>
      </div>

      <Input
        label="Email address"
        name="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
        }}
        error={errors.email}
        required
        placeholder="Enter your email"
      />

      <Button type="submit" className="w-full" loading={isLoading} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Verification Code'}
      </Button>
    </form>
  );

  const renderVerifyStep = () => (
    <form className="space-y-6" onSubmit={handleVerifyCode}>
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Verify your code</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter the verification code sent to <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      <Input
        label="Verification Code"
        name="code"
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
        }}
        error={errors.code}
        required
        placeholder="Enter verification code"
      />

      <Button type="submit" className="w-full" loading={isLoading} disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </Button>

      <button
        type="button"
        onClick={() => {
          setStep(STEPS.EMAIL);
          setErrors({});
          setSuccessMessage('');
        }}
        className="w-full text-sm text-primary-600 hover:text-primary-500 font-medium"
      >
        Resend code
      </button>
    </form>
  );

  const renderSetPasswordStep = () => (
    <form className="space-y-6" onSubmit={handleSetPassword}>
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Set new password</h3>
        <p className="text-sm text-gray-500 mt-1">
          Create a new password for your account.
        </p>
      </div>

      <div className="relative">
        <Input
          label="New Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          error={errors.password}
          required
          placeholder="Enter new password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword)
              setErrors((prev) => ({ ...prev, confirmPassword: '' }));
          }}
          error={errors.confirmPassword}
          required
          placeholder="Confirm new password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      <Button type="submit" className="w-full" loading={isLoading} disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Password Reset Successful</h3>
      <p className="text-sm text-gray-500">
        Your password has been reset successfully. You can now sign in with your new password.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Back to Sign In
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            {step ? 'Follow the steps to reset your password' : 'All done!'}
          </p>
        </div>

        <Card className="mt-8">
          {step && renderStepIndicator()}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
              {errors.submit}
            </div>
          )}

          {successMessage && step && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4">
              {successMessage}
            </div>
          )}

          {step === STEPS.EMAIL && renderEmailStep()}
          {step === STEPS.VERIFY && renderVerifyStep()}
          {step === STEPS.SET_PASSWORD && renderSetPasswordStep()}
          {!step && renderSuccess()}
        </Card>

        {step && (
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500">&copy; 2024 Admin Panel. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
