import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from './store/authStore';
import {Colors} from './utils/theme';

// Screens
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import ServerListScreen from './screens/Servers/ServerListScreen';
import ServerDetailScreen from './screens/Servers/ServerDetailScreen';
import MonitoringScreen from './screens/Monitoring/MonitoringScreen';
import LogsScreen from './screens/Logs/LogsScreen';
import DomainsScreen from './screens/Domains/DomainsScreen';
import CredentialsScreen from './screens/Credentials/CredentialsScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {fontSize: 10, fontWeight: '600'},
        tabBarIcon: ({focused, color, size}) => {
          const icons: Record<string, {active: string; inactive: string}> = {
            Dashboard: {active: 'home', inactive: 'home-outline'},
            Servers: {active: 'server', inactive: 'server-outline'},
            Monitoring: {active: 'pulse', inactive: 'pulse-outline'},
            Logs: {active: 'document-text', inactive: 'document-text-outline'},
            Settings: {active: 'settings', inactive: 'settings-outline'},
          };
          const iconSet = icons[route.name] || {active: 'apps', inactive: 'apps-outline'};
          return (
            <Ionicons
              name={(focused ? iconSet.active : iconSet.inactive) as any}
              size={size}
              color={color}
            />
          );
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Servers" component={ServerListScreen} />
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />
      <Tab.Screen name="Logs" component={LogsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ServerDetail" component={ServerDetailScreen} />
      <Stack.Screen name="Domains" component={DomainsScreen} />
      <Stack.Screen name="Credentials" component={CredentialsScreen} />
      <Stack.Screen name="Deployments" component={ServerListScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const {user, loading, initialize} = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
