import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import { useChats } from '../context/ChatContext';

const EXCHANGE_META = {
  c1: {
    status: 'overdue',
    exchangeType: 'borrow',
    countdownText: 'Overdue by 6h',
    helperText: 'Waiting for provider to confirm return',
  },
  c2: {
    status: 'in_progress',
    exchangeType: 'borrow',
    countdownText: 'Return due in 1d 4h',
    helperText: 'Borrowed item countdown is active',
  },
  c3: {
    status: 'due_soon',
    exchangeType: 'service',
    countdownText: 'Task window ends in 45m',
    helperText: 'Service task needs attention soon',
  },
  c5: {
    status: 'pending',
    exchangeType: 'borrow',
    countdownText: 'Provider action needed',
    helperText: 'Use this chat to test provider pending button',
  },
  c6: {
    status: 'in_progress',
    exchangeType: 'borrow',
    countdownText: 'Return due in 12h',
    helperText: 'Use this chat to test provider return confirmation',
  },
  c7: {
    status: 'in_progress',
    exchangeType: 'service',
    countdownText: 'Task window ends in 2h',
    helperText: 'Use this chat to test provider task completion',
  },
  c8: {
    status: 'overdue',
    exchangeType: 'borrow',
    countdownText: 'Overdue by 2d',
    helperText: 'Use this chat to test overdue provider flow',
  },
  c13: {
    status: 'completed',
    exchangeType: 'service',
    countdownText: 'Review now available',
    helperText: 'Use this chat to test completed and review states',
  },
  c14: {
    status: 'disputed',
    exchangeType: 'borrow',
    countdownText: 'Dispute active',
    helperText: 'Use this chat to test dispute and paused penalties',
  },
};

const STATUS_CONFIG = {
  overdue: {
    label: 'Overdue',
    color: colors.error,
    bg: colors.error + '18',
    icon: 'alert-circle',
    priority: 1,
  },
  due_soon: {
    label: 'Due Soon',
    color: colors.warning,
    bg: colors.warning + '22',
    icon: 'time',
    priority: 2,
  },
  in_progress: {
    label: 'In Progress',
    color: colors.info,
    bg: colors.info + '18',
    icon: 'sync',
    priority: 4,
  },
  pending: {
    label: 'Pending',
    color: '#C07A00',
    bg: '#FFF4D6',
    icon: 'hourglass',
    priority: 5,
  },
  completed: {
    label: 'Completed',
    color: colors.success,
    bg: colors.success + '18',
    icon: 'checkmark-circle',
    priority: 7,
  },
  disputed: {
    label: 'Disputed',
    color: '#9c36b5',
    bg: '#f8f0fc',
    icon: 'warning',
    priority: 3,
  },
  none: {
    label: 'No Exchange',
    color: colors.textMuted,
    bg: colors.surface,
    icon: 'chatbubble-ellipses',
    priority: 6,
  },
};

function getChatPriority(chat) {
  const status = (chat.exchange ?? EXCHANGE_META[chat.id])?.state
    ?? (chat.exchange ?? EXCHANGE_META[chat.id])?.status
    ?? 'none';
  const base = STATUS_CONFIG[status]?.priority ?? 6;

  if (status === 'in_progress' && chat.unread > 0) return 3;
  if (status === 'none' && chat.unread > 0) return 5;
  return base;
}

export default function ChatListScreen({ navigation }) {
  const { chats } = useChats();
  const enhancedChats = useMemo(() => {
    const getChatDedupeKey = (chat) => {
      const userId = chat.user?.id ? String(chat.user.id) : '';
      const userName = chat.user?.name ? String(chat.user.name).trim().toLowerCase() : '';
      return userId || userName || chat.id;
    };

    const byUser = new Map();
    chats.forEach(chat => {
      const key = getChatDedupeKey(chat);
      if (!key) return;
      const existing = byUser.get(key);
      if (!existing) {
        byUser.set(key, chat);
        return;
      }

      const existingTime = existing.rawLastMessageAt ? new Date(existing.rawLastMessageAt).getTime() : 0;
      const nextTime = chat.rawLastMessageAt ? new Date(chat.rawLastMessageAt).getTime() : 0;
      if (nextTime >= existingTime) {
        byUser.set(key, chat);
      }
    });

    return [...byUser.values()]
      .map(chat => ({
        ...chat,
        exchange: chat.exchange ?? EXCHANGE_META[chat.id] ?? null,
        priority: getChatPriority(chat),
      }))
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        const aTime = a.rawLastMessageAt ? new Date(a.rawLastMessageAt).getTime() : 0;
        const bTime = b.rawLastMessageAt ? new Date(b.rawLastMessageAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [chats]);

  const activeCount = enhancedChats.filter(chat => chat.exchange).length;
  const unreadCount = enhancedChats.filter(chat => chat.unread > 0).length;

  const renderChatRow = ({ item }) => {
    const exchange = item.exchange;
    const exchangeState = exchange?.state ?? exchange?.status ?? 'none';
    const status = STATUS_CONFIG[exchangeState] ?? STATUS_CONFIG.none;
    const isUrgent = exchangeState === 'overdue' || exchangeState === 'due_soon';

    return (
      <TouchableOpacity
        style={[styles.chatCard, isUrgent && styles.chatCardUrgent]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ChatDetail', { chat: item })}
      >
        <View style={styles.avatarWrapper}>
          <Avatar name={item.user.name} size={54} level={2} showBadge={false} />
          {item.unread > 0 && (
            <View style={styles.unreadDot}>
              <Text style={styles.unreadDotText}>{item.unread}</Text>
            </View>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <View style={styles.nameBlock}>
              <Text style={[styles.chatName, item.unread > 0 && styles.chatNameUnread]}>
                {item.user.name}
              </Text>
              {exchange && (
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Ionicons name={status.icon} size={12} color={status.color} />
                  <Text style={[styles.statusBadgeText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.chatTime}>{item.time}</Text>
          </View>

          <View style={styles.postRefRow}>
            <Ionicons name="bookmark-outline" size={12} color={colors.textMuted} />
            <Text style={styles.postRef} numberOfLines={1}>
              {item.postTitle}
            </Text>
          </View>

          {exchange ? (
            <View style={styles.exchangeSummary}>
              <Text style={[styles.countdownText, exchangeState === 'overdue' && styles.countdownTextOverdue]}>
                {exchange.countdownText ?? exchange.summaryText ?? ''}
              </Text>
              <Text style={styles.helperText} numberOfLines={1}>
                {exchange.helperText ?? exchange.summaryText ?? ''}
              </Text>
            </View>
          ) : (
            <Text
              style={[styles.lastMessage, item.unread > 0 && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSub}>Track urgent exchanges before they become a problem.</Text>
        </View>
        <View style={styles.headerBadges}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeValue}>{unreadCount}</Text>
            <Text style={styles.headerBadgeLabel}>new</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeValue}>{activeCount}</Text>
            <Text style={styles.headerBadgeLabel}>active</Text>
          </View>
        </View>
      </View>

      <View style={styles.priorityBar}>
        <Text style={styles.priorityTitle}>Priority Order</Text>
        <Text style={styles.priorityText}>Overdue and due-soon exchanges are pinned to the top.</Text>
      </View>

      <FlatList
        style={styles.list}
        data={enhancedChats}
        keyExtractor={item => item.id}
        renderItem={renderChatRow}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        scrollEnabled
        showsVerticalScrollIndicator
        persistentScrollbar
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyBody}>Respond to a nearby post to start chatting.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCopy: { flex: 1 },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  headerSub: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBadge: {
    minWidth: 62,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerBadgeValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  headerBadgeLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  priorityBar: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  priorityTitle: {
    ...typography.smallBold,
    color: colors.primary,
    marginBottom: 2,
  },
  priorityText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  list: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 260, flexGrow: 1 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatCardUrgent: {
    borderColor: colors.error + '55',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarWrapper: { position: 'relative' },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
    paddingHorizontal: 4,
  },
  unreadDotText: { fontSize: 10, color: colors.textWhite, fontWeight: '700' },
  chatInfo: { flex: 1, gap: 6 },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  nameBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chatName: { ...typography.bodyBold, color: colors.textPrimary },
  chatNameUnread: { color: colors.primary },
  chatTime: { ...typography.caption, color: colors.textMuted },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '700',
  },
  postRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  postRef: { ...typography.caption, color: colors.textMuted, flex: 1 },
  exchangeSummary: { gap: 2 },
  countdownText: {
    ...typography.smallBold,
    color: colors.textPrimary,
  },
  countdownTextOverdue: {
    color: colors.error,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lastMessage: { ...typography.small, color: colors.textSecondary },
  lastMessageUnread: { fontWeight: '600', color: colors.textPrimary },
  separator: { height: 12 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3, color: colors.textPrimary },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});