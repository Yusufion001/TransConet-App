import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminModuleScreen from '../screens/admin/AdminModuleScreen';
import AdminAccountsScreen from '../screens/admin/AdminAccountsScreen';

const Stack = createNativeStackNavigator();
export default function AdminNavigator(){
  return <Stack.Navigator screenOptions={{headerShown:false}}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen}/>
    <Stack.Screen name="AdminModule" component={AdminModuleScreen}/>
    <Stack.Screen name="AdminAccounts" component={AdminAccountsScreen}/>
  </Stack.Navigator>;
}
