import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PostsProvider } from '../context/PostsContext';
import { ChatProvider } from '../context/ChatContext';
import { FriendsProvider } from '../context/FriendsContext';
import { PrivacyProvider } from '../context/PrivacyContext';
import { AuthProvider } from '../context/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useChats } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { fetchUnreadNotifications, markNotificationRead } from '../lib/db';


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
import SettingsScreen from '../screens/SettingsScreen';
import WhoCanMessageScreen from '../screens/WhoCanMessageScreen';
import LocationSettingsScreen from '../screens/support/LocationSettingsScreen';
import ReportSafetyIssueScreen from '../screens/support/ReportSafetyIssueScreen';
import FAQScreen from '../screens/support/FAQScreen';
import ContactSupportScreen from '../screens/support/ContactSupportScreen';
import CommunityGuidelinesScreen from '../screens/support/CommunityGuidelinesScreen';

// Mini-games
import GamesScreen from '../screens/GamesScreen';
import FarmerScreen from '../screens/minigames/FarmerScreen';
import FisherScreen from '../screens/minigames/FisherScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import TasksScreen from '../screens/TasksScreen';

const AUTH_ROUTE_NAMES = new Set(['Cover', 'Login', 'Register', 'Onboarding']);

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
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
      <MainStack.Screen name="Tasks" component={TasksScreen} />
      <MainStack.Screen name="WhoCanMessage" component={WhoCanMessageScreen} />
      <MainStack.Screen name="LocationSettings" component={LocationSettingsScreen} />
      <MainStack.Screen name="ReportSafetyIssue" component={ReportSafetyIssueScreen} />
      <MainStack.Screen name="FAQ" component={FAQScreen} />
      <MainStack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <MainStack.Screen name="CommunityGuidelines" component={CommunityGuidelinesScreen} />
    </MainStack.Navigator>
  );
}

function PendingInviteWatcher({ navigationRef, currentRouteName }) {
  const { chats } = useChats();
  const { user } = useAuth();
  const alertedTxRef = useRef(new Set());

  useEffect(() => {
    if (!user?.id || !navigationRef?.current?.isReady?.()) return;
    if (!currentRouteName || AUTH_ROUTE_NAMES.has(currentRouteName)) return;

    const pendingInvite = chats.find(chat =>
      chat.exchange?.state === 'pending' &&
      chat.exchange?.pendingBy &&
      chat.exchange?.pendingBy !== chat.exchange?.myRole &&
      chat.exchange?.transactionId
    );

    if (!pendingInvite?.exchange?.transactionId) return;
    if (alertedTxRef.current.has(pendingInvite.exchange.transactionId)) return;

    const currentRoute = navigationRef.current.getCurrentRoute?.();
    if (
      currentRoute?.name === 'ChatDetail' &&
      currentRoute?.params?.chat?.id === pendingInvite.id
    ) {
      alertedTxRef.current.add(pendingInvite.exchange.transactionId);
      return;
    }

    alertedTxRef.current.add(pendingInvite.exchange.transactionId);

    Alert.alert(
      'Pending Request',
      `${pendingInvite.user?.name ?? 'Someone'} sent a start request. Open the chat to review or accept it.`,
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Open Chat',
          onPress: () => navigationRef.current?.navigate('ChatDetail', { chat: pendingInvite }),
        },
      ]
    );
  }, [chats, currentRouteName, navigationRef, user?.id]);

  return null;
}

function ExchangeNotificationWatcher({ navigationRef, currentRouteName }) {
  const { chats } = useChats();
  const { user } = useAuth();
  const alertedNotificationIdsRef = useRef(new Set());
  const showingAlertRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const showUnreadNotification = async () => {
      if (!user?.id || !navigationRef?.current?.isReady?.()) return;
      if (!currentRouteName || AUTH_ROUTE_NAMES.has(currentRouteName)) return;
      if (showingAlertRef.current) return;

      const unread = await fetchUnreadNotifications(user.id);
      if (cancelled || !unread.length) return;

      const refusedNotification = unread.find(item =>
        item.type === 'exchange_refused' &&
        !alertedNotificationIdsRef.current.has(item.id)
      );

      if (!refusedNotification) return;

      const relatedChat = refusedNotification.reference_type === 'chat'
        ? chats.find(chat => chat.id === refusedNotification.reference_id)
        : null;

      const currentRoute = navigationRef.current?.getCurrentRoute?.();
      if (
        currentRoute?.name === 'ChatDetail' &&
        refusedNotification.reference_type === 'chat' &&
        currentRoute?.params?.chat?.id === refusedNotification.reference_id
      ) {
        alertedNotificationIdsRef.current.add(refusedNotification.id);
        await markNotificationRead(refusedNotification.id);
        return;
      }

      alertedNotificationIdsRef.current.add(refusedNotification.id);
      showingAlertRef.current = true;

      Alert.alert(
        refusedNotification.title || 'Start Request Refused',
        refusedNotification.body || 'Your start request was refused.',
        [
          {
            text: 'Dismiss',
            style: 'cancel',
            onPress: () => {
              showingAlertRef.current = false;
              markNotificationRead(refusedNotification.id);
            },
          },
          {
            text: 'Open Chat',
            onPress: async () => {
              showingAlertRef.current = false;
              await markNotificationRead(refusedNotification.id);
              if (relatedChat) {
                navigationRef.current?.navigate('ChatDetail', { chat: relatedChat });
              }
            },
          },
        ]
      );
    };

    showUnreadNotification();
    const intervalId = setInterval(showUnreadNotification, 4000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [chats, currentRouteName, navigationRef, user?.id]);

  return null;
}

export default function AppNavigator() {
  // Set to true to skip auth for development preview
  const isLoggedIn = false;
  const navigationRef = useRef(null);
  const [currentRouteName, setCurrentRouteName] = React.useState(null);

  return (
    <AuthProvider>
    <PrivacyProvider>
    <FriendsProvider>
    <PostsProvider>
    <ChatProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          setCurrentRouteName(navigationRef.current?.getCurrentRoute?.()?.name ?? null);
        }}
        onStateChange={() => {
          setCurrentRouteName(navigationRef.current?.getCurrentRoute?.()?.name ?? null);
        }}
      >
        <PendingInviteWatcher navigationRef={navigationRef} currentRouteName={currentRouteName} />
        <ExchangeNotificationWatcher navigationRef={navigationRef} currentRouteName={currentRouteName} />
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
    </FriendsProvider>
    </PrivacyProvider>
    </AuthProvider>
  );
}