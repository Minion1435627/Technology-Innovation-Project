import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
   FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import { mockChats } from '../data/mockData';

export default function ChatListScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {mockChats.filter(c => c.unread > 0).length} new
          </Text>
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={mockChats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => navigation.navigate('ChatDetail', { chat: item })}
          >
            <View style={styles.avatarWrapper}>
              <Avatar name={item.user.name} size={52} level={2} showBadge={false} />
              {item.unread > 0 && (
                <View style={styles.unreadDot}>
                  <Text style={styles.unreadDotText}>{item.unread}</Text>
                </View>
              )}
            </View>

            <View style={styles.chatInfo}>
              <View style={styles.chatTopRow}>
                <Text style={[styles.chatName, item.unread > 0 && styles.chatNameUnread]}>
                  {item.user.name}
                </Text>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>
              <View style={styles.postRefRow}>
                <Text style={styles.postRef} numberOfLines={1}>
                  📌 {item.postTitle}
                </Text>
              </View>
              <Text
                style={[styles.lastMessage, item.unread > 0 && styles.lastMessageUnread]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
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
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  unreadBadgeText: { ...typography.caption, color: colors.textWhite, fontWeight: '700' },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    gap: 14,
  },
  avatarWrapper: { position: 'relative' },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  unreadDotText: { fontSize: 10, color: colors.textWhite, fontWeight: '700' },

  chatInfo: { flex: 1 },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatName: { ...typography.bodyBold, color: colors.textPrimary },
  chatNameUnread: { color: colors.primary },
  chatTime: { ...typography.caption, color: colors.textMuted },
  postRefRow: { marginBottom: 4 },
  postRef: { ...typography.caption, color: colors.textMuted },
  lastMessage: { ...typography.small, color: colors.textSecondary },
  lastMessageUnread: { fontWeight: '600', color: colors.textPrimary },

  separator: { height: 1, backgroundColor: colors.border, marginLeft: 82 },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
});
