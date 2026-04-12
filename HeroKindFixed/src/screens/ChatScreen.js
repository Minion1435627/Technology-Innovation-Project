import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
   FlatList, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { mockMessages } from '../data/mockData';

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const [canSendMore, setCanSendMore] = useState(false); // gated first message

  const chat = route?.params?.chat;
  const otherUserId = chat?.user?.id ?? 'u6';
  const otherUserName = chat?.user?.name ?? 'David M.';
  const otherUserGender = chat?.user?.gender;
  const GENDER_ICON  = { Male: '♂️', Female: '♀️', 'Non-binary': '⚧️' };

  const goToProfile = () => navigation.navigate('UserProfile', { userId: otherUserId });

  const hasSentFirst = messages.some(m => m.sender === 'me');

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
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
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

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerUser} onPress={goToProfile}>
            <Avatar name={otherUserName} size={40} level={3} />
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.headerName}>{otherUserName}</Text>
                <Text style={styles.onlineIndicator}>● online</Text>
              </View>
              <Text style={styles.headerSub}>
                ⭐ 4.7 · Fitzroy{otherUserGender ? ` · ${GENDER_ICON[otherUserGender]} ${otherUserGender}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Pinned post reference + Start Exchange */}
        <View style={styles.postRef}>
          <View style={styles.postRefAccent} />
          <View style={styles.postRefBody}>
            <Text style={styles.postRefLabel}>📌 Post reference</Text>
            <Text style={styles.postRefTitle}>{chat?.postTitle ?? 'Offering drill + full toolset for the weekend'}</Text>
          </View>
          <TouchableOpacity
            style={styles.exchangeBtn}
            onPress={() => navigation.navigate('Transaction', {
              transaction: {
                id: `t_${Date.now()}`,
                status: 'pending',
                type: 'borrow',
                postTitle: chat?.postTitle ?? 'Exchange',
                item: chat?.postTitle ?? 'Item',
                provider: { id: otherUserId, name: otherUserName, level: 3, stars: 4.7 },
                requester: { id: 'u1', name: 'Alex Chen', level: 3, stars: 4.8 },
                myRole: 'requester',
                handoverDate: new Date().toISOString(),
                agreedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Agreed via chat.',
              }
            })}
          >
            <Ionicons name="swap-horizontal-outline" size={14} color={colors.primary} />
            <Text style={styles.exchangeBtnText}>Start Exchange</Text>
          </TouchableOpacity>
        </View>

        {/* Gate notice */}
        {!hasSentFirst && (
          <View style={styles.gateNotice}>
            <Text style={styles.gateText}>
              Send your first message to start the conversation. David will reply when available.
            </Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachIcon}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerName: { ...typography.bodyBold, color: colors.textPrimary },
  onlineIndicator: { ...typography.caption, color: colors.supply },
  headerSub: { ...typography.caption, color: colors.textSecondary },
  moreIcon: { fontSize: 22, color: colors.textSecondary, padding: 4 },

  postRef: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 10,
    gap: 8,
    alignItems: 'center',
  },
  postRefAccent: { width: 3, backgroundColor: colors.primary, borderRadius: 2, alignSelf: 'stretch' },
  postRefBody: { flex: 1 },
  postRefLabel: { ...typography.caption, color: colors.primary, marginBottom: 2 },
  postRefTitle: { ...typography.smallBold, color: colors.textPrimary },
  exchangeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1,
    borderColor: colors.primary, paddingHorizontal: 8, paddingVertical: 5,
  },
  exchangeBtnText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  gateNotice: {
    backgroundColor: colors.warning + '22',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning + '44',
  },
  gateText: { ...typography.small, color: '#8B6914', textAlign: 'center' },

  messageList: { padding: 16, gap: 12 },

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
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
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
});
