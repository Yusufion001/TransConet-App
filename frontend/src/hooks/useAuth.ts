import { useState } from 'react';
import api from '../api/client';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithPin = async (phoneNumber: string, pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login-pin', { phoneNumber, pin });
      return response.data;
    } catch (err: any) {
      setError((typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithPin = async (phoneNumber: string, pin: string, email: string, role: string, fullName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register-pin', { phoneNumber, pin, email, role, fullName });
      return response.data;
    } catch (err: any) {
      setError((typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordRequest = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      // await api.post('/auth/forgot-password', { email });
      await new Promise(resolve => setTimeout(resolve, 1500)); 
    } catch (err: any) {
      setError('Failed to process password recovery request.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordConfirm = async (email: string, token: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      // await api.post('/auth/reset-password', { email, token, newPassword });
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (err: any) {
      setError('Invalid or expired reset token.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loginWithPin,
    registerWithPin,
    resetPasswordRequest,
    resetPasswordConfirm,
    loading,
    error,
    setError
  };
}
