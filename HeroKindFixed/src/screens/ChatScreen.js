import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, TextInput, KeyboardAvoidingView, Platform, Modal, ScrollView, Alert, PanResponder, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { mockMessages } from '../data/mockData';

const ATTACHMENT_PROOF_OPTIONS = [
  { id: 'general', label: 'General photo' },
  { id: 'handover', label: 'Handover proof' },
  { id: 'return', label: 'Return proof' },
  { id: 'task', label: 'Task proof' },
  { id: 'evidence', label: 'Evidence' },
];

const LOCATION_SHARE_OPTIONS = [
  { id: 'live', label: 'Live location' },
  { id: 'meetup', label: 'Meet-up spot' },
  { id: 'onsite', label: 'On-site update' },
];

const EXCHANGE_META = {
  c1: {
    state: 'overdue',
    type: 'borrow',
    typeLabel: 'Borrowed item',
    statusLabel: 'Overdue',
    countdownText: 'Overdue by 6 hours',
    summaryText: 'Waiting for provider to confirm return',
    actionLabel: 'View Exchange',
  },
  c2: {
    state: 'in_progress',
    type: 'borrow',
    typeLabel: 'Borrowed item',
    statusLabel: 'In Progress',
    countdownText: 'Return due in 1d 4h',
    summaryText: 'Borrowed item countdown is active',
    actionLabel: 'View Exchange',
  },
  c3: {
    state: 'due_soon',
    type: 'service',
    typeLabel: 'Help / service',
    statusLabel: 'Due Soon',
    countdownText: 'Task window ends in 45m',
    summaryText: 'Provider still needs to mark the task completed',
    actionLabel: 'View Exchange',
  },
  c5: {
    state: 'pending',
    type: 'borrow',
    myRole: 'provider',
    typeLabel: 'Borrowed item',
    statusLabel: 'Pending',
    countdownText: 'Timer starts after provider confirms handover',
    summaryText: 'Use this thread to test the provider pending handover action',
    actionLabel: 'View Exchange',
  },
  c6: {
    state: 'in_progress',
    type: 'borrow',
    myRole: 'provider',
    typeLabel: 'Borrowed item',
    statusLabel: 'In Progress',
    countdownText: 'Return due in 12h',
    summaryText: 'Use this thread to test provider return confirmation',
    actionLabel: 'View Exchange',
  },
  c7: {
    state: 'in_progress',
    type: 'service',
    myRole: 'provider',
    typeLabel: 'Help / service',
    statusLabel: 'In Progress',
    countdownText: 'Task window ends in 2h',
    summaryText: 'Use this thread to test provider task completion',
    actionLabel: 'View Exchange',
  },
  c8: {
    state: 'overdue',
    type: 'borrow',
    myRole: 'requester',
    typeLabel: 'Borrowed item',
    statusLabel: 'Overdue',
    countdownText: 'Overdue by 2d',
    summaryText: 'This overdue borrower flow should show the requester restriction state',
    actionLabel: 'View Exchange',
  },
  c13: {
    state: 'completed',
    type: 'service',
    myRole: 'provider',
    typeLabel: 'Help / service',
    statusLabel: 'Completed',
    countdownText: 'Review prompt unlocked',
    summaryText: 'This task is complete and both sides can now leave a review',
    actionLabel: 'View Exchange',
  },
  c14: {
    state: 'disputed',
    type: 'borrow',
    myRole: 'provider',
    typeLabel: 'Borrowed item',
    statusLabel: 'Disputed',
    countdownText: 'Penalties paused during review',
    summaryText: 'This exchange is under dispute until both sides resolve the issue',
    actionLabel: 'View Exchange',
  },
};

const EXCHANGE_SYSTEM_MESSAGES = {
  c1: [
    {
      id: 'sys_c1_1',
      type: 'system',
      icon: 'swap-horizontal-outline',
      title: 'Exchange created',
      body: 'Borrowed-item exchange was created from this chat.',
      time: 'Yesterday',
    },
    {
      id: 'sys_c1_2',
      type: 'system',
      icon: 'checkmark-circle-outline',
      title: 'Handover confirmed',
      body: 'Provider confirmed the handover and the return countdown started.',
      time: 'Yesterday',
    },
    {
      id: 'sys_c1_3',
      type: 'system',
      icon: 'alert-circle-outline',
      title: 'Exchange overdue',
      body: 'This borrowed item is overdue and still needs final provider confirmation.',
      time: '2 hours ago',
    },
  ],
  c2: [
    {
      id: 'sys_c2_1',
      type: 'system',
      icon: 'swap-horizontal-outline',
      title: 'Exchange created',
      body: 'Borrowed-item exchange is now being tracked by both users.',
      time: 'Today',
    },
    {
      id: 'sys_c2_2',
      type: 'system',
      icon: 'sync-outline',
      title: 'Countdown started',
      body: 'Provider confirmed handover. Return deadline is now active.',
      time: 'Today',
    },
  ],
  c3: [
    {
      id: 'sys_c3_1',
      type: 'system',
      afterId: 'm10',
      icon: 'swap-horizontal-outline',
      title: 'Pending',
      body: 'Help-task exchange was created from this conversation and is waiting for the provider to confirm task start.',
      time: '15 Apr 2026, 1:05 PM',
    },
    {
      id: 'sys_c3_2',
      type: 'system',
      afterId: 'm15',
      icon: 'sync-outline',
      title: 'Started',
      body: 'Provider confirmed the task started. The help-task countdown is now active.',
      time: '15 Apr 2026, 2:10 PM',
    },
    {
      id: 'sys_c3_3',
      type: 'system',
      afterId: 'm18',
      icon: 'alarm-outline',
      title: 'Task due soon',
      body: 'The agreed help window is ending soon. Provider still needs to mark the task completed.',
      time: '15 Apr 2026, 3:25 PM',
    },
  ],
  c5: [
    {
      id: 'sys_c5_1',
      type: 'system',
      afterId: 'c5_m3',
      icon: 'swap-horizontal-outline',
      title: 'Pending',
      body: 'Exchange created. This borrowed-item flow is waiting for provider handover confirmation.',
      time: '15 Apr 2026, 9:00 AM',
    },
  ],
  c6: [
    {
      id: 'sys_c6_1',
      type: 'system',
      afterId: 'c6_m2',
      icon: 'swap-horizontal-outline',
      title: 'Pending',
      body: 'Exchange created. This borrowed-item flow waited for provider handover confirmation.',
      time: '15 Apr 2026, 9:05 AM',
    },
    {
      id: 'sys_c6_2',
      type: 'system',
      afterId: 'c6_m4',
      icon: 'sync-outline',
      title: 'Started',
      body: 'Provider confirmed handover. Countdown started and the borrowed-item flow is now in progress.',
      time: '15 Apr 2026, 10:10 AM',
    },
  ],
  c7: [
    {
      id: 'sys_c7_1',
      type: 'system',
      afterId: 'c7_m2',
      icon: 'swap-horizontal-outline',
      title: 'Pending',
      body: 'Exchange created. This help-task flow waited for provider task-start confirmation.',
      time: '15 Apr 2026, 2:00 PM',
    },
    {
      id: 'sys_c7_2',
      type: 'system',
      afterId: 'c7_m4',
      icon: 'sync-outline',
      title: 'Started',
      body: 'Provider confirmed the task started. Countdown started and this service flow is now in progress.',
      time: '15 Apr 2026, 3:05 PM',
    },
  ],
  c8: [
    {
      id: 'sys_c8_1',
      type: 'system',
      afterId: 'c8_m2',
      icon: 'swap-horizontal-outline',
      title: 'Pending',
      body: 'Exchange created. This borrowed-item flow waited for provider handover confirmation.',
      time: '09 Apr 2026, 5:20 PM',
    },
    {
      id: 'sys_c8_2',
      type: 'system',
      afterId: 'c8_m5',
      icon: 'sync-outline',
      title: 'Started',
      body: 'Provider confirmed handover. Countdown started and the borrowed-item flow moved into progress.',
      time: '10 Apr 2026, 9:00 AM',
    },
    {
      id: 'sys_c8_3',
      type: 'system',
      afterId: 'c8_m8',
      icon: 'alert-circle-outline',
      title: 'Exchange overdue',
      body: 'The return deadline passed without final confirmation, so this borrowed-item exchange is now overdue.',
      time: '13 Apr 2026, 9:15 AM',
    },
  ],
  c13: [
    {
      id: 'sys_c13_1',
      type: 'system',
      afterId: 'c13_m1',
      icon: 'swap-horizontal-outline',
      title: 'Pending',
      body: 'Exchange created. This help-task flow was waiting for provider task-start confirmation.',
      time: '14 Apr 2026, 11:00 AM',
    },
    {
      id: 'sys_c13_2',
      type: 'system',
      afterId: 'c13_m3',
      icon: 'sync-outline',
      title: 'Started',
      body: 'Provider confirmed the task started and the help-task exchange moved into progress.',
      time: '14 Apr 2026, 1:00 PM',
    },
    {
      id: 'sys_c13_3',
      type: 'system',
      afterId: 'c13_m4',
      icon: 'checkmark-circle-outline',
      title: 'Exchange completed',
      body: 'The help task has been marked complete. Both sides can now leave a review.',
      time: '14 Apr 2026, 4:40 PM',
    },
  ],
  c14: [
    {
      id: 'sys_c14_1',
      type: 'system',
      afterId: 'c14_m1',
      icon: 'swap-horizontal-outline',
      title: 'Pending',
      body: 'Exchange created. This borrowed-item flow was waiting for provider handover confirmation.',
      time: '12 Apr 2026, 10:30 AM',
    },
    {
      id: 'sys_c14_2',
      type: 'system',
      afterId: 'c14_m2',
      icon: 'sync-outline',
      title: 'Started',
      body: 'Provider confirmed handover. Countdown started and the borrowed-item exchange moved into progress.',
      time: '12 Apr 2026, 1:15 PM',
    },
    {
      id: 'sys_c14_3',
      type: 'system',
      afterId: 'c14_m4',
      icon: 'warning-outline',
      title: 'Dispute raised',
      body: 'This exchange is under dispute. Penalties are paused while the issue is being reviewed.',
      time: '14 Apr 2026, 7:10 PM',
    },
  ],
};

const mergeLifecycleIntoMessages = (messageList, lifecycle) => {
  if (!lifecycle.length) return messageList;

  const grouped = lifecycle.reduce((acc, item) => {
    const key = item.afterId ?? '__prepend__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const merged = [];

  if (grouped.__prepend__) {
    merged.push(...grouped.__prepend__);
  }

  messageList.forEach((message) => {
    merged.push(message);
    if (grouped[message.id]) {
      merged.push(...grouped[message.id]);
    }
  });

  return merged;
};

const CHAT_MESSAGE_SCENARIOS = {
  c4: [
    { id: 'c4_m1', sender: 'them', text: 'Hi Alex, I saw your question about React state handling.', time: '1:10 PM', read: true },
    { id: 'c4_m2', sender: 'me', text: 'Yes please, I am stuck on how to structure the chat flow.', time: '1:12 PM', read: true },
    { id: 'c4_m3', sender: 'them', text: 'No problem. We can do a short help session later today if that works for you.', time: '1:14 PM', read: true },
    { id: 'c4_m4', sender: 'me', text: 'That would be amazing. Maybe around 4pm?', time: '1:16 PM', read: true },
    { id: 'c4_m5', sender: 'them', text: '4pm works. Once we are both ready, you can start the exchange flow in chat.', time: '1:18 PM', read: false },
  ],
  c5: [
    { id: 'c5_m1', sender: 'them', text: 'Hi, is the screwdriver still available to borrow today?', time: '9:02 AM', read: true },
    { id: 'c5_m2', sender: 'me', text: 'Yes, I can lend it to you this afternoon.', time: '9:05 AM', read: true },
    { id: 'c5_m3', sender: 'them', text: 'Perfect. I only need it for one shelf, so I should be quick.', time: '9:06 AM', read: true },
    { id: 'c5_m4', sender: 'me', text: 'Sounds good. Let us meet downstairs at 2pm.', time: '9:08 AM', read: true },
    { id: 'c5_m5', sender: 'them', text: 'Great, message me once you are there and I will come down.', time: '9:09 AM', read: false },
  ],
  c6: [
    { id: 'c6_m1', sender: 'them', text: 'Thanks again for lending the screwdriver yesterday.', time: '10:15 AM', read: true },
    { id: 'c6_m2', sender: 'me', text: 'No worries. The return timer should already be running in the app.', time: '10:18 AM', read: true },
    { id: 'c6_m3', sender: 'them', text: 'Yes, I can see it. I have finished the shelf and will return it this evening.', time: '10:20 AM', read: true },
    { id: 'c6_m4', sender: 'me', text: 'Perfect. Just leave it with the concierge and send me a message after.', time: '10:22 AM', read: true },
    { id: 'c6_m5', sender: 'them', text: 'Done, I left it there a minute ago. Could you confirm when you pick it up?', time: '10:29 AM', read: false },
  ],
  c7: [
    { id: 'c7_m1', sender: 'them', text: 'Hi Alex, I am ready to go through your React component now.', time: '3:00 PM', read: true },
    { id: 'c7_m2', sender: 'me', text: 'Amazing, thank you. I mainly need help with the chat and exchange states.', time: '3:02 PM', read: true },
    { id: 'c7_m3', sender: 'them', text: 'Let us start with the flow first, then we can polish the UI text after.', time: '3:04 PM', read: true },
    { id: 'c7_m4', sender: 'me', text: 'Perfect. I have my simulator open so I can test while we talk.', time: '3:06 PM', read: true },
    { id: 'c7_m5', sender: 'them', text: 'Great, the task has started on my side. We should be able to finish within the next two hours.', time: '3:08 PM', read: false },
  ],
  c8: [
    { id: 'c8_m1', sender: 'them', text: 'Hi Alex, is the screwdriver still available to borrow for my shelf build?', time: '09 Apr, 4:55 PM', read: true },
    { id: 'c8_m2', sender: 'me', text: 'Yes, that works. I can lend it to you this evening if you still need it.', time: '09 Apr, 5:08 PM', read: true },
    { id: 'c8_m3', sender: 'them', text: 'Perfect, thank you. I only need it overnight and can return it tomorrow.', time: '09 Apr, 5:12 PM', read: true },
    { id: 'c8_m4', sender: 'me', text: 'No problem. Let us meet downstairs at 8:30 and we can start the exchange in the app.', time: '09 Apr, 5:16 PM', read: true },
    { id: 'c8_m5', sender: 'them', text: 'I have picked it up, thanks again. I will message you as soon as I am done with the shelf.', time: '10 Apr, 9:05 AM', read: true },
    { id: 'c8_m6', sender: 'me', text: 'Sounds good. Please make sure it is returned before the deadline shown in chat.', time: '10 Apr, 9:18 AM', read: true },
    { id: 'c8_m7', sender: 'them', text: 'I am running behind because the build took longer than expected. I may need a little more time.', time: '12 Apr, 8:40 PM', read: true },
    { id: 'c8_m8', sender: 'me', text: 'Please keep me updated. Once the deadline passes, the exchange will show as overdue until I can confirm the return.', time: '12 Apr, 8:52 PM', read: true },
    { id: 'c8_m9', sender: 'them', text: 'Hi Alex, sorry about the late return. I dropped the screwdriver back this morning, but I think you were out.', time: '13 Apr, 10:05 AM', read: true },
    { id: 'c8_m10', sender: 'me', text: 'Okay, I will check the mailbox area tonight and confirm once I see it.', time: '13 Apr, 10:18 AM', read: true },
    { id: 'c8_m11', sender: 'them', text: 'Thank you. I really do not want this to stay overdue longer than necessary.', time: '13 Apr, 10:22 AM', read: false },
  ],
  c13: [
    { id: 'c13_m1', sender: 'them', text: 'Thanks again for the React mentoring session.', time: '6:20 PM', read: true },
    { id: 'c13_m2', sender: 'me', text: 'You did great. Your component structure is much cleaner now.', time: '6:22 PM', read: true },
    { id: 'c13_m3', sender: 'them', text: 'I also understand the exchange states a lot better now.', time: '6:24 PM', read: true },
    { id: 'c13_m4', sender: 'me', text: 'Glad to hear that. I have marked the task completed on my side.', time: '6:25 PM', read: true },
    { id: 'c13_m5', sender: 'them', text: 'Perfect, I can see the review section now. I will leave feedback in a moment.', time: '6:27 PM', read: false },
  ],
  c14: [
    { id: 'c14_m1', sender: 'them', text: 'Hi Alex, I need to flag an issue with the drill return.', time: '11:40 AM', read: true },
    { id: 'c14_m2', sender: 'me', text: 'Okay, tell me what happened and we can sort it out here.', time: '11:42 AM', read: true },
    { id: 'c14_m3', sender: 'them', text: 'The case came back, but one of the drill bits is missing.', time: '11:44 AM', read: true },
    { id: 'c14_m4', sender: 'me', text: 'I understand. I have paused completion for now until we confirm everything.', time: '11:46 AM', read: true },
    { id: 'c14_m5', sender: 'them', text: 'That is fair. Let us keep it disputed until I check my bag again tonight.', time: '11:49 AM', read: false },
  ],
};

const CHAT_POST_META = {
  c4: {
    title: 'Can help with React / JavaScript questions this afternoon',
    category: 'Study / skills',
    typeLabel: 'Supply',
    description: '3rd year CS student. Happy to help with frontend questions, state handling, and chat flow logic this afternoon.',
  },
  c5: {
    title: 'Need a screwdriver to assemble my IKEA shelf',
    category: 'Borrow an item',
    typeLabel: 'Need',
    description: 'Moving into a new place and just need a Phillips screwdriver for about 30 minutes. Happy to come to you and return it the same day.',
  },
  c6: {
    title: 'Need a screwdriver to finish one last shelf tonight',
    category: 'Borrow an item',
    typeLabel: 'Need',
    description: 'Borrowed the screwdriver already and using it for the last part of my shelf build. I will return it as soon as I am done tonight.',
  },
  c7: {
    title: 'Offering React mentoring for UI flow and state questions',
    category: 'Offer skills',
    typeLabel: 'Supply',
    description: 'Happy to do a short mentoring session for anyone working on React UI, component state, or interaction polish.',
  },
  c8: {
    title: 'Need a screwdriver for shelf assembly, return delayed',
    category: 'Borrow an item',
    typeLabel: 'Need',
    description: 'Still finishing the shelf and I may need a little longer than expected. I will message clearly once the screwdriver is returned.',
  },
  c13: {
    title: 'Can help review your React component structure',
    category: 'Offer skills',
    typeLabel: 'Supply',
    description: 'Offering a short one-on-one session to review component structure, UI flow, and cleaner naming before submission.',
  },
  c14: {
    title: 'Offering drill + bits set for weekend projects',
    category: 'Lend an item',
    typeLabel: 'Supply',
    description: 'Happy to lend my drill and bits set for small home projects. Please return everything together after use.',
  },
};

const EXCHANGE_STATUS_CONFIG = {
  pending: {
    color: '#C07A00',
    bg: '#FFF4D6',
    icon: 'time-outline',
  },
  in_progress: {
    color: colors.info,
    bg: colors.info + '18',
    icon: 'sync-outline',
  },
  due_soon: {
    color: colors.warning,
    bg: colors.warning + '22',
    icon: 'alarm-outline',
  },
  overdue: {
    color: colors.error,
    bg: colors.error + '18',
    icon: 'alert-circle-outline',
  },
  completed: {
    color: colors.success,
    bg: colors.success + '18',
    icon: 'checkmark-circle-outline',
  },
  none: {
    color: colors.primary,
    bg: colors.primaryLight,
    icon: 'swap-horizontal-outline',
  },
  disputed: {
    color: '#9c36b5',
    bg: '#f8f0fc',
    icon: 'warning-outline',
  },
};

export default function ChatScreen({ navigation, route }) {
  const [input, setInput] = useState('');
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [startExchangeOpen, setStartExchangeOpen] = useState(false);
  const [statusHistoryOpen, setStatusHistoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showStickyCompact, setShowStickyCompact] = useState(false);
  const [draftExchangeType, setDraftExchangeType] = useState('borrow');
  const [attachmentMode, setAttachmentMode] = useState('photo');
  const [attachmentStep, setAttachmentStep] = useState('chooser');
  const [selectedAttachmentSource, setSelectedAttachmentSource] = useState('camera');
  const [selectedAttachmentProof, setSelectedAttachmentProof] = useState('general');
  const [selectedLocationType, setSelectedLocationType] = useState('live');

  const chat = route?.params?.chat;
  const otherUserId = chat?.user?.id ?? 'u6';
  const otherUserName = chat?.user?.name ?? 'David M.';
  const otherUserGender = chat?.user?.gender;
  const initialMessages = useMemo(() => {
    if (chat?.id && CHAT_MESSAGE_SCENARIOS[chat.id]) return CHAT_MESSAGE_SCENARIOS[chat.id];
    return mockMessages;
  }, [chat?.id]);
  const postMeta = chat?.id && CHAT_POST_META[chat.id]
    ? CHAT_POST_META[chat.id]
    : {
      title: chat?.postTitle ?? 'Original post',
      category: 'General',
      typeLabel: 'Post',
      description: 'Open the original post for the full task details.',
    };
  const [messages, setMessages] = useState(initialMessages);
  const [exchange, setExchange] = useState(chat?.id ? EXCHANGE_META[chat.id] ?? null : null);
  const [showScrollUpBtn, setShowScrollUpBtn] = useState(false);
  const [showScrollDownBtn, setShowScrollDownBtn] = useState(false);
  const listRef = useRef(null);
  const hasAutoScrolledRef = useRef(false);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const exchangeStyle = EXCHANGE_STATUS_CONFIG[exchange?.state ?? 'none'];
  const GENDER_ICON = { Male: '♂️', Female: '♀️', 'Non-binary': '⚧️' };

  const scrollToLatest = (animated = true) => {
    requestAnimationFrame(() => {
      const targetOffset = Math.max(
        contentHeightRef.current - layoutHeightRef.current,
        0
      );
      listRef.current?.scrollToOffset({ offset: targetOffset, animated });
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: targetOffset, animated: false });
      }, 70);
    });
  };

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  };

  const updateScrollButtons = (offsetY, contentHeight = contentHeightRef.current, layoutHeight = layoutHeightRef.current) => {
    const distanceFromBottom = Math.max(contentHeight - layoutHeight - offsetY, 0);
    setShowScrollUpBtn(offsetY > 120);
    setShowScrollDownBtn(distanceFromBottom > 80);
  };

  const goToProfile = () => navigation.navigate('UserProfile', { userId: otherUserId });
  const openOriginalPost = () => {
    navigation.navigate('PostDetail', {
      post: {
        ...postMeta,
        ownerName: otherUserName,
        ownerId: otherUserId,
        exchangeSummary: exchange
          ? `${exchange.statusLabel} • ${exchange.countdownText}`
          : 'No exchange yet',
      },
    });
  };

  const buildTimelineDates = () => {
    const now = Date.now();

    switch (exchange?.state) {
      case 'in_progress':
        return {
          handoverDate: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
          agreedReturnDate: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
        };
      case 'due_soon':
        return {
          handoverDate: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          agreedReturnDate: new Date(now + 45 * 60 * 1000).toISOString(),
        };
      case 'overdue':
        return {
          handoverDate: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
          agreedReturnDate: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
        };
      case 'completed':
        return {
          handoverDate: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
          agreedReturnDate: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
          completedDate: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
        };
      case 'disputed':
        return {
          handoverDate: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
          agreedReturnDate: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        };
      case 'pending':
      default:
        return {
          handoverDate: new Date(now).toISOString(),
          agreedReturnDate: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
        };
    }
  };

  const hasSentFirst = messages.some(m => m.sender === 'me');
  const displayMessages = useMemo(() => {
    const lifecycle = chat?.id ? EXCHANGE_SYSTEM_MESSAGES[chat.id] ?? [] : [];
    const mergedTimeline = mergeLifecycleIntoMessages(messages, lifecycle);
    return [
      { id: 'sticky_task_header', type: 'stickyTaskHeader' },
      { id: 'scroll_exchange_intro', type: 'heroHeader' },
      ...mergedTimeline,
    ];
  }, [chat?.id, messages]);
  const statusHistory = useMemo(() => {
    if (!chat?.id) return [];
    return (EXCHANGE_SYSTEM_MESSAGES[chat.id] ?? []).map(entry => ({
      id: entry.id,
      title: entry.title,
      time: entry.time,
      body: entry.body,
      icon: entry.icon,
    }));
  }, [chat?.id]);

  const buildTransactionPayload = () => ({
    ...buildTimelineDates(),
    id: `t_${Date.now()}`,
    status: exchange?.state === 'due_soon' ? 'in_progress' : exchange?.state ?? 'pending',
    type: exchange?.type ?? 'borrow',
    postTitle: chat?.postTitle ?? 'Exchange',
    item: chat?.postTitle ?? 'Item',
    provider: { id: otherUserId, name: otherUserName, level: 3, stars: 4.7 },
    requester: { id: 'u1', name: 'Alex Chen', level: 3, stars: 4.8 },
    myRole: exchange?.myRole ?? 'requester',
    notes: exchange?.type === 'service' ? 'Agreed service window via chat.' : 'Agreed return and handover via chat.',
  });

  const openTransaction = () => {
    navigation.navigate('Transaction', { transaction: buildTransactionPayload() });
  };

  const startExchange = () => {
    const nextExchange = {
      state: 'pending',
      type: draftExchangeType,
      typeLabel: draftExchangeType === 'service' ? 'Help / service' : 'Borrowed item',
      statusLabel: 'Pending',
      countdownText: draftExchangeType === 'service'
        ? 'Timer starts after provider confirms task start'
        : 'Timer starts after provider confirms handover',
      summaryText: draftExchangeType === 'service'
        ? 'Waiting for provider to confirm the task has started'
        : 'Waiting for provider to confirm item handover',
      actionLabel: 'View Exchange',
    };

    setExchange(nextExchange);
    setStartExchangeOpen(false);
    navigation.navigate('Transaction', {
      transaction: {
        id: `t_${Date.now()}`,
        status: 'pending',
        type: draftExchangeType,
        postTitle: chat?.postTitle ?? 'Exchange',
        item: chat?.postTitle ?? 'Item',
        provider: { id: otherUserId, name: otherUserName, level: 3, stars: 4.7 },
        requester: { id: 'u1', name: 'Alex Chen', level: 3, stars: 4.8 },
        myRole: 'requester',
        handoverDate: new Date().toISOString(),
        agreedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: draftExchangeType === 'service' ? 'Agreed service window via chat.' : 'Agreed return and handover via chat.',
      },
    });
  };

  const send = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      sender: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => scrollToLatest(true), 30);
  };

  useEffect(() => {
    hasAutoScrolledRef.current = false;
    setShowScrollUpBtn(false);
    setShowScrollDownBtn(false);
    const timer = setTimeout(() => {
      scrollToLatest(false);
      hasAutoScrolledRef.current = true;
    }, 80);

    return () => clearTimeout(timer);
  }, [chat?.id]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const didShowEvent = 'keyboardDidShow';
    const handleKeyboardShow = () => {
      scrollToLatest(true);
      setTimeout(() => scrollToLatest(false), Platform.OS === 'ios' ? 180 : 100);
    };

    const keyboardShowSub = Keyboard.addListener(showEvent, handleKeyboardShow);
    const keyboardDidShowSub = showEvent === didShowEvent
      ? null
      : Keyboard.addListener(didShowEvent, handleKeyboardShow);

    return () => {
      keyboardShowSub.remove();
      keyboardDidShowSub?.remove();
    };
  }, []);

  const attachmentDetailPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) =>
      attachmentStep === 'details'
      && gestureState.dx > 10
      && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
    onMoveShouldSetPanResponderCapture: (_, gestureState) =>
      attachmentStep === 'details'
      && gestureState.dx > 10
      && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
    onPanResponderTerminationRequest: () => true,
    onShouldBlockNativeResponder: () => false,
    onPanResponderRelease: (_, gestureState) => {
      if (
        attachmentStep === 'details'
        && gestureState.dx > 40
        && Math.abs(gestureState.dy) < 36
      ) {
        setAttachmentStep('chooser');
      }
    },
  }), [attachmentStep]);

  const sendAttachment = () => {
    if (attachmentMode === 'location') {
      const locationLabel = LOCATION_SHARE_OPTIONS.find(option => option.id === selectedLocationType)?.label ?? 'Live location';
      const newLocation = {
        id: `l${Date.now()}`,
        type: 'location',
        sender: 'me',
        locationLabel,
        text: locationLabel === 'Live location'
          ? 'Sharing my live location so we can meet more easily.'
          : locationLabel === 'Meet-up spot'
            ? 'Shared a meet-up spot for this exchange.'
            : 'Shared an on-site update from the current location.',
        place: locationLabel === 'Meet-up spot' ? 'Lygon St front entrance' : 'Current nearby position',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };

      setMessages(prev => [...prev, newLocation]);
      setAttachmentOpen(false);
      setAttachmentStep('chooser');
      setAttachmentMode('photo');
      setSelectedLocationType('live');
      setTimeout(() => scrollToLatest(true), 30);
      return;
    }

    const proofLabel = ATTACHMENT_PROOF_OPTIONS.find(option => option.id === selectedAttachmentProof)?.label ?? 'General photo';
    const sourceLabel = selectedAttachmentSource === 'camera' ? 'Taken with camera' : 'Chosen from library';

    const newAttachment = {
      id: `a${Date.now()}`,
      type: 'attachment',
      sender: 'me',
      proofLabel,
      sourceLabel,
      text: `${proofLabel} attached`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setMessages(prev => [...prev, newAttachment]);
    setAttachmentOpen(false);
    setAttachmentStep('chooser');
    setAttachmentMode('photo');
    setSelectedAttachmentSource('camera');
    setSelectedAttachmentProof('general');
    setSelectedLocationType('live');
    setTimeout(() => scrollToLatest(true), 30);
  };

  const toggleMute = () => {
    setMenuOpen(false);
    setIsMuted(prev => !prev);
  };

  const reportUser = () => {
    setMenuOpen(false);
    Alert.alert(
      'Report User',
      `Report ${otherUserName} for inappropriate behaviour or a safety issue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => Alert.alert('Report sent', 'Thanks. This user has been flagged for review.'),
        },
      ]
    );
  };

  const blockUser = () => {
    setMenuOpen(false);
    Alert.alert(
      'Block User',
      `Block ${otherUserName}? You will no longer receive messages from this chat.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => Alert.alert('User blocked', `${otherUserName} has been blocked from contacting you.`),
        },
      ]
    );
  };

  const renderPersistentStatusBubble = () => (
    <View style={styles.stickyHeaderShell}>
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.stickyHeaderCard}
        onPress={() => exchange && setStatusHistoryOpen(true)}
      >
        <View style={styles.stickyHeaderMain}>
          <View style={[styles.stickyIconWrap, { backgroundColor: exchangeStyle.bg }]}>
            <Ionicons name={exchangeStyle.icon} size={15} color={exchangeStyle.color} />
          </View>
          <View style={styles.stickyTextWrap}>
            <Text style={styles.stickyTitle}>
              {exchange ? `${exchange.statusLabel} • ${exchange.typeLabel}` : 'No exchange yet'}
            </Text>
            <Text style={styles.stickySubtitle} numberOfLines={1}>
              {exchange ? exchange.countdownText : chat?.postTitle ?? 'Start an exchange when both sides are ready'}
            </Text>
          </View>
        </View>
        <View style={styles.stickyRightActions}>
          {exchange && <Ionicons name="time-outline" size={16} color={colors.textMuted} />}
          <TouchableOpacity
            style={styles.stickyActionBtn}
            onPress={exchange ? openTransaction : () => setStartExchangeOpen(true)}
          >
            <Text style={styles.stickyActionText}>{exchange ? 'View' : 'Start'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderMessage = ({ item }) => {
    if (item.type === 'stickyTaskHeader') {
      if (!showStickyCompact) return <View style={styles.stickyTaskPlaceholder} />;

      return (
        <View style={styles.stickyTaskShell}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.stickyTaskCard}
            onPress={openOriginalPost}
          >
            <View style={styles.stickyTaskMain}>
              <View style={styles.stickyTaskTypeChip}>
                <Text style={styles.stickyTaskTypeText}>{postMeta.typeLabel}</Text>
              </View>
              <View style={styles.stickyTaskTextWrap}>
                <Text style={styles.stickyTaskTitle} numberOfLines={1}>{postMeta.title}</Text>
                <Text style={styles.stickyTaskSubtitle} numberOfLines={1}>{postMeta.category}</Text>
              </View>
            </View>
            <Text style={styles.stickyTaskMore}>More</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'heroHeader') {
      return (
        <>
          {exchange?.state === 'completed' && (
            <View style={styles.topStateCard}>
              <Ionicons name="star-outline" size={18} color={colors.success} />
              <View style={styles.topStateCopy}>
                <Text style={styles.topStateTitle}>Review ready</Text>
                <Text style={styles.topStateBody}>This exchange is complete. Leave a quick review while the details are still fresh.</Text>
              </View>
            </View>
          )}

          {exchange?.state === 'disputed' && (
            <View style={[styles.topStateCard, styles.topStateCardDispute]}>
              <Ionicons name="warning-outline" size={18} color="#9c36b5" />
              <View style={styles.topStateCopy}>
                <Text style={[styles.topStateTitle, { color: '#7b2cbf' }]}>Dispute active</Text>
                <Text style={styles.topStateBody}>This exchange is paused for review. Keep chatting here to clarify details while penalties stay paused.</Text>
              </View>
            </View>
          )}

          <View style={styles.pinnedArea}>
            <TouchableOpacity style={styles.taskCard} activeOpacity={0.9} onPress={openOriginalPost}>
              <View style={styles.taskCardTop}>
                <View style={styles.taskTypeChip}>
                  <Text style={styles.taskTypeChipText}>{postMeta.typeLabel}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color={colors.primary} />
              </View>

              <Text style={styles.taskTitle}>{postMeta.title}</Text>

              <View style={styles.taskMetaRow}>
                <View style={styles.taskMetaChip}>
                  <Text style={styles.taskMetaChipText}>{postMeta.category}</Text>
                </View>
                <View style={styles.taskMetaChip}>
                  <Text style={styles.taskMetaChipText}>
                    {exchange ? `${exchange.statusLabel} • ${exchange.typeLabel}` : 'No exchange yet'}
                  </Text>
                </View>
              </View>

              <Text style={styles.taskDescription} numberOfLines={2}>
                {postMeta.description}
              </Text>

              <View style={styles.taskFooter}>
                <Text style={styles.taskFooterText}>
                  {exchange ? exchange.countdownText : 'Open the original post to review the task details'}
                </Text>
                <Text style={styles.taskFooterLink}>More</Text>
              </View>
            </TouchableOpacity>
          </View>

          {!hasSentFirst && (
            <View style={styles.gateNotice}>
              <Text style={styles.gateText}>
                Send your first message to start the conversation. David will reply when available.
              </Text>
            </View>
          )}
        </>
      );
    }

    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageWrap}>
          <View style={styles.systemMessageCard}>
            <View style={styles.systemMessageHeader}>
              <View style={styles.systemIconWrap}>
                <Ionicons name={item.icon} size={14} color={colors.primary} />
              </View>
              <View style={styles.systemHeaderText}>
                <Text style={styles.systemTitle}>{item.title}</Text>
                <Text style={styles.systemTime}>{item.time}</Text>
              </View>
            </View>
            <Text style={styles.systemBody}>{item.body}</Text>
          </View>
        </View>
      );
    }

    const isMe = item.sender === 'me';
    if (item.type === 'attachment') {
      return (
        <View style={[styles.msgRow, styles.msgRowMe]}>
          <View style={[styles.bubble, styles.bubbleMe, styles.attachmentBubble]}>
            <View style={styles.attachmentTopRow}>
              <Ionicons name="image-outline" size={16} color={colors.textWhite} />
              <Text style={styles.attachmentTitle}>{item.proofLabel}</Text>
            </View>
            <Text style={styles.attachmentMeta}>{item.sourceLabel}</Text>
            <Text style={[styles.bubbleText, styles.bubbleTextMe]}>{item.text}</Text>
            <View style={styles.bubbleMeta}>
              <Text style={[styles.bubbleTime, styles.bubbleTimeMe]}>{item.time}</Text>
              <Text style={[styles.readTick, item.read && styles.readTickRead]}>
                {item.read ? '✓✓' : '✓'}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'location') {
      return (
        <View style={[styles.msgRow, styles.msgRowMe]}>
          <View style={[styles.bubble, styles.bubbleMe, styles.locationBubble]}>
            <View style={styles.attachmentTopRow}>
              <Ionicons name="location-outline" size={16} color={colors.textWhite} />
              <Text style={styles.attachmentTitle}>{item.locationLabel}</Text>
            </View>
            <Text style={styles.attachmentMeta}>{item.place}</Text>
            <Text style={[styles.bubbleText, styles.bubbleTextMe]}>{item.text}</Text>
            <View style={styles.locationMapPreview}>
              <Ionicons name="navigate-circle-outline" size={18} color={colors.textWhite} />
              <Text style={styles.locationMapText}>Location preview</Text>
            </View>
            <View style={styles.bubbleMeta}>
              <Text style={[styles.bubbleTime, styles.bubbleTimeMe]}>{item.time}</Text>
              <Text style={[styles.readTick, item.read && styles.readTickRead]}>
                {item.read ? '✓✓' : '✓'}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          <TouchableOpacity onPress={goToProfile}>
            <Avatar name={otherUserName} size={32} level={3} showBadge={false} style={styles.msgAvatar} />
          </TouchableOpacity>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
          <View style={styles.bubbleMeta}>
            <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{item.time}</Text>
            {isMe && (
              <Text style={[styles.readTick, item.read && styles.readTickRead]}>
                {item.read ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerUser} onPress={goToProfile}>
            <Avatar name={otherUserName} size={40} level={3} />
            <View style={styles.headerUserText}>
              <View style={styles.nameRow}>
                <Text style={styles.headerName}>{otherUserName}</Text>
                <Text style={styles.onlineIndicator}>● online</Text>
              </View>
              <Text style={styles.headerSub}>
                ⭐ 4.7 · Fitzroy{otherUserGender ? ` · ${GENDER_ICON[otherUserGender]} ${otherUserGender}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {renderPersistentStatusBubble()}

        <FlatList
          ref={listRef}
          data={displayMessages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          scrollEnabled
          showsVerticalScrollIndicator
          persistentScrollbar
          stickyHeaderIndices={[0]}
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            scrollOffsetRef.current = offsetY;
            setShowStickyCompact(offsetY > 140);
            updateScrollButtons(offsetY);
          }}
          onLayout={(event) => {
            layoutHeightRef.current = event.nativeEvent.layout.height;
            updateScrollButtons(0, contentHeightRef.current, layoutHeightRef.current);
          }}
          onContentSizeChange={(_, height) => {
            contentHeightRef.current = height;
            if (!hasAutoScrolledRef.current) {
              scrollToLatest(false);
              hasAutoScrolledRef.current = true;
            }
            updateScrollButtons(
              scrollOffsetRef.current,
              contentHeightRef.current,
              layoutHeightRef.current
            );
          }}
          scrollEventThrottle={16}
        />

        {showScrollUpBtn && (
          <TouchableOpacity style={styles.scrollUpBtn} onPress={scrollToTop} activeOpacity={0.9}>
            <Ionicons name="arrow-up-outline" size={16} color={colors.textWhite} />
          </TouchableOpacity>
        )}

        {showScrollDownBtn && (
          <TouchableOpacity style={styles.scrollDownBtn} onPress={() => scrollToLatest(true)} activeOpacity={0.9}>
            <Ionicons name="arrow-down-outline" size={16} color={colors.textWhite} />
          </TouchableOpacity>
        )}

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} onPress={() => {
            setAttachmentOpen(true);
            setAttachmentStep('chooser');
          }}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onFocus={() => {
              scrollToLatest(true);
              setTimeout(() => scrollToLatest(false), 160);
            }}
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={attachmentOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setAttachmentOpen(false)}
        >
          <View style={styles.sheetBackdrop}>
            <TouchableOpacity style={styles.sheetDismissArea} activeOpacity={1} onPress={() => setAttachmentOpen(false)} />
            <View
              style={styles.sheet}
              {...(attachmentStep === 'details' ? attachmentDetailPanResponder.panHandlers : {})}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Add Photo</Text>
              <Text style={styles.sheetSub}>
                Add a photo or share location details so the exchange record stays clear.
              </Text>

              {attachmentStep === 'chooser' ? (
                <View style={styles.attachmentChoiceGrid}>
                  <TouchableOpacity
                    style={styles.attachmentChoiceCard}
                    onPress={() => {
                      setAttachmentMode('photo');
                      setAttachmentStep('details');
                    }}
                  >
                    <Ionicons name="image-outline" size={22} color={colors.primary} />
                    <Text style={styles.attachmentChoiceTitle}>Photo</Text>
                    <Text style={styles.attachmentChoiceBody}>
                      Add proof photos, return photos, or general images.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.attachmentChoiceCard}
                    onPress={() => {
                      setAttachmentMode('location');
                      setAttachmentStep('details');
                    }}
                  >
                    <Ionicons name="location-outline" size={22} color={colors.primary} />
                    <Text style={styles.attachmentChoiceTitle}>Location</Text>
                    <Text style={styles.attachmentChoiceBody}>
                      Share live location, a meet-up spot, or an on-site update.
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : attachmentMode === 'photo' ? (
                <View style={styles.attachmentDetailWrap}>
                  <TouchableOpacity
                    style={styles.attachmentBackRow}
                    onPress={() => setAttachmentStep('chooser')}
                  >
                    <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
                    <Text style={styles.attachmentBackText}>Back to options</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeOption, selectedAttachmentSource === 'camera' && styles.typeOptionActive]}
                    onPress={() => setSelectedAttachmentSource('camera')}
                  >
                    <View style={styles.typeOptionCopy}>
                      <Text style={styles.typeOptionTitle}>Take Photo</Text>
                      <Text style={styles.typeOptionBody}>Use the camera for a live handover, return, or evidence photo.</Text>
                    </View>
                    {selectedAttachmentSource === 'camera' && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeOption, selectedAttachmentSource === 'library' && styles.typeOptionActive]}
                    onPress={() => setSelectedAttachmentSource('library')}
                  >
                    <View style={styles.typeOptionCopy}>
                      <Text style={styles.typeOptionTitle}>Choose from Library</Text>
                      <Text style={styles.typeOptionBody}>Attach an existing photo that supports the current exchange.</Text>
                    </View>
                    {selectedAttachmentSource === 'library' && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.proofCard}>
                    <Text style={styles.proofCardTitle}>Photo label</Text>
                    <View style={styles.proofChips}>
                      {ATTACHMENT_PROOF_OPTIONS.map(option => {
                        const selected = option.id === selectedAttachmentProof;
                        return (
                          <TouchableOpacity
                            key={option.id}
                            style={[styles.proofChip, selected && styles.proofChipSelected]}
                            onPress={() => setSelectedAttachmentProof(option.id)}
                          >
                            <Text style={[styles.proofChipText, selected && styles.proofChipTextSelected]}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.sheetActions}>
                    <TouchableOpacity style={styles.sheetSecondaryBtn} onPress={() => setAttachmentOpen(false)}>
                      <Text style={styles.sheetSecondaryText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetPrimaryBtn} onPress={sendAttachment}>
                      <Text style={styles.sheetPrimaryText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.attachmentDetailWrap}>
                  <TouchableOpacity
                    style={styles.attachmentBackRow}
                    onPress={() => setAttachmentStep('chooser')}
                  >
                    <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
                    <Text style={styles.attachmentBackText}>Back to options</Text>
                  </TouchableOpacity>
                  <View style={styles.proofCard}>
                    <Text style={styles.proofCardTitle}>Location share type</Text>
                    <View style={styles.proofChips}>
                      {LOCATION_SHARE_OPTIONS.map(option => {
                        const selected = option.id === selectedLocationType;
                        return (
                          <TouchableOpacity
                            key={option.id}
                            style={[styles.proofChip, selected && styles.proofChipSelected]}
                            onPress={() => setSelectedLocationType(option.id)}
                          >
                            <Text style={[styles.proofChipText, selected && styles.proofChipTextSelected]}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <Text style={styles.locationHelpText}>
                      Share your live location, a meet-up point, or an on-site update for the current exchange.
                    </Text>
                  </View>

                  <View style={styles.sheetActions}>
                    <TouchableOpacity style={styles.sheetSecondaryBtn} onPress={() => setAttachmentOpen(false)}>
                      <Text style={styles.sheetSecondaryText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetPrimaryBtn} onPress={sendAttachment}>
                      <Text style={styles.sheetPrimaryText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={menuOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={styles.sheetBackdrop}>
            <TouchableOpacity style={styles.sheetDismissArea} activeOpacity={1} onPress={() => setMenuOpen(false)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Chat Options</Text>
              <Text style={styles.sheetSub}>
                Manage notifications and safety actions for this conversation.
              </Text>

              <TouchableOpacity style={styles.menuRow} onPress={toggleMute}>
                <View style={styles.menuRowLeft}>
                  <Ionicons
                    name={isMuted ? 'notifications-off-outline' : 'notifications-outline'}
                    size={18}
                    color={colors.textPrimary}
                  />
                  <View>
                    <Text style={styles.menuTitle}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                    <Text style={styles.menuBody}>
                      {isMuted ? 'Turn notifications back on for this chat.' : 'Silence notifications for this conversation.'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.menuValue}>{isMuted ? 'Muted' : ''}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuRow} onPress={reportUser}>
                <View style={styles.menuRowLeft}>
                  <Ionicons name="flag-outline" size={18} color={colors.warning} />
                  <View>
                    <Text style={styles.menuTitle}>Report</Text>
                    <Text style={styles.menuBody}>Flag this user or chat for review.</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuRow, styles.menuRowDanger]} onPress={blockUser}>
                <View style={styles.menuRowLeft}>
                  <Ionicons name="hand-left-outline" size={18} color={colors.error} />
                  <View>
                    <Text style={[styles.menuTitle, { color: colors.error }]}>Block</Text>
                    <Text style={styles.menuBody}>Stop this user from contacting you.</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuPrimaryBtn} onPress={() => setMenuOpen(false)}>
                <View style={styles.menuPrimaryContent}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.textWhite} />
                  <Text style={styles.menuPrimaryText}>Close Options</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={statusHistoryOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setStatusHistoryOpen(false)}
        >
          <View style={styles.sheetBackdrop}>
            <TouchableOpacity style={styles.sheetDismissArea} activeOpacity={1} onPress={() => setStatusHistoryOpen(false)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Status Timeline</Text>
              <Text style={styles.sheetSub}>
                See when each exchange status started, including the current state.
              </Text>

              <ScrollView
                style={styles.historyScroll}
                contentContainerStyle={styles.historyList}
                showsVerticalScrollIndicator
                persistentScrollbar
                nestedScrollEnabled
              >
                {statusHistory.length > 0 ? statusHistory.map((entry, index) => (
                  <View key={entry.id} style={styles.historyRow}>
                    <View style={styles.historyTrack}>
                      <View style={styles.historyDot}>
                        <Ionicons name={entry.icon} size={12} color={colors.primary} />
                      </View>
                      {index < statusHistory.length - 1 && <View style={styles.historyLine} />}
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle}>{entry.title}</Text>
                      <Text style={styles.historyTime}>Started at {entry.time}</Text>
                      <Text style={styles.historyBody}>{entry.body}</Text>
                    </View>
                  </View>
                )) : (
                  <Text style={styles.historyEmpty}>No exchange history yet.</Text>
                )}
              </ScrollView>

              <TouchableOpacity style={styles.sheetPrimaryBtn} onPress={() => setStatusHistoryOpen(false)}>
                <Text style={styles.sheetPrimaryText}>Close Timeline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={startExchangeOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setStartExchangeOpen(false)}
        >
          <View style={styles.sheetBackdrop}>
            <TouchableOpacity style={styles.sheetDismissArea} activeOpacity={1} onPress={() => setStartExchangeOpen(false)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Start Exchange</Text>
              <Text style={styles.sheetSub}>
                Choose the correct exchange type before the formal tracking flow begins.
              </Text>

              <View style={styles.sheetSummary}>
                <Text style={styles.sheetSummaryLabel}>Post</Text>
                <Text style={styles.sheetSummaryValue}>{chat?.postTitle ?? 'Exchange'}</Text>
                <Text style={styles.sheetSummaryMeta}>
                  Provider: {otherUserName} • Requester: Alex Chen
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.typeOption, draftExchangeType === 'borrow' && styles.typeOptionActive]}
                onPress={() => setDraftExchangeType('borrow')}
              >
                <View style={styles.typeOptionCopy}>
                  <Text style={styles.typeOptionTitle}>Borrowed item</Text>
                  <Text style={styles.typeOptionBody}>
                    Use this for lending or borrowing objects. Countdown starts after provider confirms handover, and provider confirms the final return.
                  </Text>
                </View>
                {draftExchangeType === 'borrow' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeOption, draftExchangeType === 'service' && styles.typeOptionActive]}
                onPress={() => setDraftExchangeType('service')}
              >
                <View style={styles.typeOptionCopy}>
                  <Text style={styles.typeOptionTitle}>Help / service</Text>
                  <Text style={styles.typeOptionBody}>
                    Use this for one-off help tasks. Countdown starts after provider confirms the task started, and provider marks the task completed to finish it.
                  </Text>
                </View>
                {draftExchangeType === 'service' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>

              <View style={styles.ruleCard}>
                <Text style={styles.ruleTitle}>What happens next</Text>
                <Text style={styles.ruleBody}>
                  {draftExchangeType === 'service'
                    ? 'The exchange will be created in pending state. Countdown begins only after provider confirms task start.'
                    : 'The exchange will be created in pending state. Countdown begins only after provider confirms the item handover.'}
                </Text>
              </View>

              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.sheetSecondaryBtn} onPress={() => setStartExchangeOpen(false)}>
                  <Text style={styles.sheetSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetPrimaryBtn} onPress={startExchange}>
                  <Text style={styles.sheetPrimaryText}>Create Exchange</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: colors.primary },
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerUserText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerName: { ...typography.bodyBold, color: colors.textPrimary },
  onlineIndicator: { ...typography.caption, color: colors.supply },
  headerSub: { ...typography.caption, color: colors.textSecondary },
  moreIcon: { fontSize: 22, color: colors.textSecondary, padding: 4 },
  exchangeStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exchangeStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exchangeStatusLabel: {
    ...typography.smallBold,
  },
  exchangeStatusMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  stickyHeaderShell: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: colors.background,
    zIndex: 12,
    elevation: 12,
  },
  stickyHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stickyHeaderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stickyIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyTextWrap: {
    flex: 1,
  },
  stickyTitle: {
    ...typography.smallBold,
    color: colors.textPrimary,
    marginBottom: 1,
  },
  stickySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stickyActionBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stickyRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stickyActionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  stickyTaskShell: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  stickyTaskPlaceholder: {
    height: 0,
    backgroundColor: colors.background,
  },
  stickyTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stickyTaskMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stickyTaskTypeChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  stickyTaskTypeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  stickyTaskTextWrap: {
    flex: 1,
  },
  stickyTaskTitle: {
    ...typography.smallBold,
    color: colors.textPrimary,
  },
  stickyTaskSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  stickyTaskMore: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  topStateCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 12,
    marginTop: 2,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.success + '18',
    borderWidth: 1,
    borderColor: colors.success + '33',
  },
  topStateCardDispute: {
    backgroundColor: '#f8f0fc',
    borderColor: '#e5d5fa',
  },
  topStateCopy: {
    flex: 1,
  },
  topStateTitle: {
    ...typography.smallBold,
    color: colors.success,
    marginBottom: 3,
  },
  topStateBody: {
    ...typography.small,
    color: colors.textSecondary,
  },
  pinnedArea: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  taskCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTypeChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  taskTypeChipText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  taskTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  taskMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskMetaChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  taskMetaChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  taskDescription: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskFooterText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  taskFooterLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  gateNotice: {
    backgroundColor: colors.warning + '22',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning + '44',
  },
  gateText: { ...typography.small, color: '#8B6914', textAlign: 'center' },
  messageList: { padding: 16, paddingBottom: 0, gap: 12 },
  systemMessageWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  systemMessageCard: {
    width: '92%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  systemMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  systemIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  systemTitle: {
    ...typography.smallBold,
    color: colors.textPrimary,
  },
  systemTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  systemBody: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { marginBottom: 2 },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: { ...typography.body, color: colors.textPrimary },
  bubbleTextMe: { color: colors.textWhite },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bubbleTime: { ...typography.caption, color: colors.textMuted },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.65)' },
  readTick: { ...typography.caption, color: 'rgba(255,255,255,0.55)' },
  readTickRead: { color: colors.myLocation },
  scrollUpBtn: {
    position: 'absolute',
    right: 14,
    top: 248,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 12,
  },
  scrollDownBtn: {
    position: 'absolute',
    right: 14,
    bottom: 94,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: { fontSize: 22 },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendIcon: { fontSize: 16, color: colors.textWhite },
  attachmentBubble: {
    gap: 6,
    minWidth: 220,
  },
  attachmentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachmentTitle: {
    ...typography.smallBold,
    color: colors.textWhite,
  },
  attachmentMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
  },
  locationBubble: {
    gap: 6,
    minWidth: 230,
  },
  locationMapPreview: {
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationMapText: {
    ...typography.smallBold,
    color: colors.textWhite,
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheetDismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 26,
    gap: 14,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sheetSub: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: -6,
  },
  sheetSummary: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
  },
  sheetSummaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sheetSummaryValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  sheetSummaryMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  attachmentModeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  attachmentModeChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  attachmentModeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  attachmentModeChipText: {
    ...typography.smallBold,
    color: colors.textSecondary,
  },
  attachmentModeChipTextActive: {
    color: colors.primaryDark,
  },
  attachmentChoiceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  attachmentChoiceCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  attachmentChoiceTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  attachmentChoiceBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  attachmentDetailWrap: {
    gap: 12,
  },
  attachmentBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachmentBackText: {
    ...typography.smallBold,
    color: colors.primary,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.card,
  },
  typeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeOptionCopy: {
    flex: 1,
  },
  typeOptionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  typeOptionBody: {
    ...typography.small,
    color: colors.textSecondary,
  },
  ruleCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 14,
  },
  ruleTitle: {
    ...typography.smallBold,
    color: colors.primary,
    marginBottom: 4,
  },
  ruleBody: {
    ...typography.small,
    color: colors.primaryDark,
  },
  proofCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  proofCardTitle: {
    ...typography.smallBold,
    color: colors.textPrimary,
  },
  proofChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  proofChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  proofChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  proofChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  proofChipTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  locationHelpText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  historyList: {
    gap: 14,
    marginTop: 4,
    marginBottom: 18,
    paddingRight: 4,
  },
  historyScroll: {
    maxHeight: 320,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  historyTrack: {
    alignItems: 'center',
  },
  historyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLine: {
    width: 1.5,
    flex: 1,
    minHeight: 26,
    backgroundColor: colors.border,
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  historyTitle: {
    ...typography.smallBold,
    color: colors.textPrimary,
  },
  historyTime: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  historyBody: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  historyEmpty: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowDanger: {
    borderBottomWidth: 0,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  menuTitle: {
    ...typography.smallBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  menuBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  menuValue: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  menuPrimaryBtn: {
    marginTop: 18,
    borderRadius: 14,
    minHeight: 52,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  menuPrimaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  menuPrimaryText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  sheetSecondaryBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  sheetSecondaryText: {
    ...typography.smallBold,
    color: colors.textPrimary,
  },
  sheetPrimaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  sheetPrimaryText: {
    ...typography.smallBold,
    color: colors.textWhite,
  },
});
