import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminNavigator from './AdminNavigator';
import FindTruckScreen from '../screens/shipper/FindTruckScreen';
import PostCargoScreen from '../screens/shipper/PostCargoScreen';
import MyShipmentsScreen from '../screens/shipper/MyShipmentsScreen';
import TransporterHomeScreen from '../screens/transporter/TransporterHomeScreen';
import JobsScreen from '../screens/transporter/JobsScreen';
import TripsScreen from '../screens/transporter/TripsScreen';
import FleetScreen from '../screens/transporter/FleetScreen';
import AccountScreen from '../screens/shared/AccountScreen';
import TrackingScreen from '../screens/shared/TrackingScreen';
import KycScreen from '../screens/shared/KycScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const icon = {
  Home: '⌂', FindTruck: '🚚', PostCargo: '📦', Shipments: '📋',
  Jobs: '📦', Fleet: '🚛', Trips: '🛣️', Account: '⚙️',
};

function TabsFor({ role }) {
  const shipper = role === 'CUSTOMER';
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#155EEF',
        tabBarInactiveTintColor: '#98A2B3',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
        tabBarStyle: { height: 68, paddingBottom: 8, paddingTop: 5 },
        tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.65 }}>{icon[route.name]}</Text>,
      })}
    >
      {shipper ? (
        <>
          <Tabs.Screen name="FindTruck" component={FindTruckScreen} options={{ title: 'Find Truck' }} />
          <Tabs.Screen name="PostCargo" component={PostCargoScreen} options={{ title: 'Post Cargo' }} />
          <Tabs.Screen name="Shipments" component={MyShipmentsScreen} options={{ title: 'Shipments' }} />
        </>
      ) : (
        <>
          <Tabs.Screen name="Home" component={TransporterHomeScreen} options={{ title: 'Home' }} />
          <Tabs.Screen name="Jobs" component={JobsScreen} options={{ title: 'Find Loads' }} />
          <Tabs.Screen name="Fleet" component={FleetScreen} options={{ title: 'Fleet' }} />
          <Tabs.Screen name="Trips" component={TripsScreen} options={{ title: 'Trips' }} />
        </>
      )}
      <Tabs.Screen name="Account" component={AccountScreen} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading: userLoading } = useAuth();
  const { admin, loading: adminLoading } = useAdminAuth();

  if (userLoading || adminLoading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#155EEF" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {admin ? (
          <Stack.Screen name="AdminMain" component={AdminNavigator} />
        ) : user ? (
          <>
            <Stack.Screen name="Main">{() => <TabsFor role={user.role} />}</Stack.Screen>
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="KYC" component={KycScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
