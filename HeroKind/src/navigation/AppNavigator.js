import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../theme/colors';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Main screens
import MapScreen from '../screens/MapScreen';
import NearbyListScreen from '../screens/NearbyListScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostScreen from '../screens/PostScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

// Mini-games
import FarmerScreen from '../screens/minigames/FarmerScreen';
import FisherScreen from '../screens/minigames/FisherScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Map: '🗺️',
  Nearby: '📋',
  Chat: '💬',
  Leaderboard: '🏆',
  Games: '🎮',
  Profile: '👤',
};

const TAB_LABELS = {
  Map: 'Map',
  Nearby: 'Nearby',
  Chat: 'Chat',
  Leaderboard: 'Ranks',
  Games: 'Games',
  Profile: 'Profile',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600' },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarLabel: TAB_LABELS[route.name],
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Nearby" component={NearbyListScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Games" component={FarmerScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs" component={MainTabs} />
      <MainStack.Screen name="Post" component={PostScreen} options={{ presentation: 'modal' }} />
      <MainStack.Screen name="ChatDetail" component={ChatScreen} />
      <MainStack.Screen name="Farmer" component={FarmerScreen} />
      <MainStack.Screen name="Fisher" component={FisherScreen} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  // Set to true to skip auth for development preview
  const isLoggedIn = false;

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <MainNavigator />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
          <AuthStack.Screen name="Main" component={MainNavigator} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
