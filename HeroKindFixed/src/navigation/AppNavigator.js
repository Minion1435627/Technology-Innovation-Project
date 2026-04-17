import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PostsProvider } from '../context/PostsContext';
import { ChatProvider } from '../context/ChatContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';


import { colors } from '../theme/colors';

// Auth screens
import CoverScreen from '../screens/auth/CoverScreen';
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
import PostDetailScreen from '../screens/PostDetailScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import TransactionScreen from '../screens/TransactionScreen';

// Mini-games
import GamesScreen from '../screens/GamesScreen';
import FarmerScreen from '../screens/minigames/FarmerScreen';
import FisherScreen from '../screens/minigames/FisherScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Map:         { active: 'map',                      inactive: 'map-outline' },
  Chat:        { active: 'chatbubble-ellipses',      inactive: 'chatbubble-ellipses-outline' },
  Leaderboard: { active: 'trophy',                   inactive: 'trophy-outline' },
  Games:       { active: 'game-controller',          inactive: 'game-controller-outline' },
  Profile:     { active: 'person-circle',            inactive: 'person-circle-outline' },
};

const TAB_LABELS = {
  Map: 'Map',
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
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
            size={22}
            color={color}
          />
        ),
        tabBarLabel: TAB_LABELS[route.name],
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Games" component={GamesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs" component={MainTabs} />
      <MainStack.Screen name="Post" component={PostScreen} options={{ presentation: 'modal' }} />
      <MainStack.Screen name="PostDetail" component={PostDetailScreen} />
      <MainStack.Screen name="ChatDetail" component={ChatScreen} />
      <MainStack.Screen name="Farmer" component={FarmerScreen} />
      <MainStack.Screen name="Fisher" component={FisherScreen} />
      <MainStack.Screen name="UserProfile" component={UserProfileScreen} />
      <MainStack.Screen name="Transaction" component={TransactionScreen} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  // Set to true to skip auth for development preview
  const isLoggedIn = false;

  return (
    <PostsProvider>
    <ChatProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <MainNavigator />
        ) : (
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Cover" component={CoverScreen} />
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
            <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
            <AuthStack.Screen name="Main" component={MainNavigator} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </ChatProvider>
    </PostsProvider>
  );
}
