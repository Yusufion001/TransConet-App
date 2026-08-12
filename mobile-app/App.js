import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AdminAuthProvider } from './src/context/AdminAuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AuthProvider><AdminAuthProvider><StatusBar style="dark" /><AppNavigator /></AdminAuthProvider></AuthProvider>;
}
