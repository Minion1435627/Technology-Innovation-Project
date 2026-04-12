import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';

const STATUS_CONFIG = {
  pending:     { label: 'Pending Handover',  color: '#f59f00', bg: '#fff9db', icon: 'time-outline' },
  in_progress: { label: 'In Progress',       color: '#1c7ed6', bg: '#e7f5ff', icon: 'sync-outline' },
  completed:   { label: 'Completed',         color: '#2f9e44', bg: '#ebfbee', icon: 'checkmark-circle-outline' },
  overdue:     { label: 'Overdue — Action Required', color: '#e03131', bg: '#fff5f5', icon: 'alert-circle-outline' },
  disputed:    { label: 'Under Dispute',     color: '#9c36b5', bg: '#f8f0fc', icon: 'warning-outline' },
};

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft('Overdue');
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <Text style={[styles.countdownValue, isOverdue && { color: colors.error }]}>
      {timeLeft}
    </Text>
  );
}

export default function TransactionScreen({ navigation, route }) {
  const { transaction: initial } = route.params;
  const [tx, setTx] = useState(initial);

  const cfg = STATUS_CONFIG[tx.status];
  const isProvider  = tx.myRole === 'provider';
  const isRequester = tx.myRole === 'requester';

  const markInProgress = () => {
    Alert.alert(
      'Mark as Handed Over',
      `Confirm that you have handed "${tx.item}" to ${tx.requester.name}? The 3-day return window starts now.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Handover', onPress: () => {
            setTx(t => ({
              ...t,
              status: 'in_progress',
              handoverDate: new Date().toISOString(),
              agreedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            }));
          }
        },
      ]
    );
  };

  const confirmReturn = () => {
    Alert.alert(
      'Confirm Item Returned',
      `Has "${tx.item}" been returned by ${tx.requester.name} in good condition?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Confirm Return', onPress: () => {
            setTx(t => ({ ...t, status: 'completed', completedDate: new Date().toISOString() }));
          }
        },
      ]
    );
  };

  const raiseDispute = () => {
    Alert.alert(
      'Raise a Dispute',
      'This will flag the exchange for review and pause any lockout. A moderator will contact both parties.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Raise Dispute', style: 'destructive', onPress: () => {
            setTx(t => ({ ...t, status: 'disputed' }));
          }
        },
      ]
    );
  };

  const formatDate = iso => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exchange</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={20} color={cfg.color} />
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>

        {/* Item card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ITEM / SERVICE</Text>
          <Text style={styles.itemTitle}>{tx.item}</Text>
          <Text style={styles.postRef}>📌 {tx.postTitle}</Text>
        </View>

        {/* Parties */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PARTIES</Text>
          <View style={styles.partyRow}>
            <View style={styles.party}>
              <Avatar name={tx.provider.name} size={48} level={tx.provider.level} />
              <Text style={styles.partyName}>{tx.provider.name}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Provider</Text>
              </View>
              {tx.myRole === 'provider' && <Text style={styles.youLabel}>You</Text>}
            </View>

            <View style={styles.arrowCol}>
              <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
              <Text style={styles.arrowLabel}>lends to</Text>
            </View>

            <View style={styles.party}>
              <Avatar name={tx.requester.name} size={48} level={tx.requester.level} />
              <Text style={styles.partyName}>{tx.requester.name}</Text>
              <View style={[styles.roleTag, { backgroundColor: colors.needLight }]}>
                <Text style={[styles.roleTagText, { color: colors.need }]}>Requester</Text>
              </View>
              {tx.myRole === 'requester' && <Text style={styles.youLabel}>You</Text>}
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TIMELINE</Text>

          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: colors.supply }]} />
            <View style={styles.timelineInfo}>
              <Text style={styles.timelineEvent}>Handover date</Text>
              <Text style={styles.timelineDate}>{formatDate(tx.handoverDate)}</Text>
            </View>
          </View>

          {tx.status !== 'pending' && (
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, {
                backgroundColor: tx.status === 'overdue' ? colors.error : colors.primary
              }]} />
              <View style={styles.timelineInfo}>
                <Text style={styles.timelineEvent}>Return deadline</Text>
                <Text style={[styles.timelineDate, tx.status === 'overdue' && { color: colors.error, fontWeight: '700' }]}>
                  {formatDate(tx.agreedReturnDate)}
                </Text>
              </View>
              {(tx.status === 'in_progress') && (
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownLabel}>Time left</Text>
                  <Countdown targetDate={tx.agreedReturnDate} />
                </View>
              )}
            </View>
          )}

          {tx.status === 'completed' && tx.completedDate && (
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
              <View style={styles.timelineInfo}>
                <Text style={styles.timelineEvent}>Completed</Text>
                <Text style={styles.timelineDate}>{formatDate(tx.completedDate)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        {tx.notes && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>NOTES</Text>
            <Text style={styles.notesText}>{tx.notes}</Text>
          </View>
        )}

        {/* Account locked warning for overdue requester */}
        {tx.status === 'overdue' && isRequester && (
          <View style={styles.lockoutCard}>
            <Ionicons name="lock-closed" size={24} color={colors.error} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lockoutTitle}>Account Restricted</Text>
              <Text style={styles.lockoutBody}>
                Your account is locked because the item was not returned within 3 days. You cannot post or start new chats until the provider confirms return.
              </Text>
            </View>
          </View>
        )}

        {/* 3-day rule info for in-progress */}
        {tx.status === 'in_progress' && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              If the item is not returned and confirmed within 3 days, the requester's account will be automatically locked.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>

          {/* Provider: pending → mark as handed over */}
          {isProvider && tx.status === 'pending' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={markInProgress}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Mark as Handed Over</Text>
            </TouchableOpacity>
          )}

          {/* Provider: in_progress or overdue → confirm return */}
          {isProvider && (tx.status === 'in_progress' || tx.status === 'overdue') && (
            <TouchableOpacity style={styles.primaryBtn} onPress={confirmReturn}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Confirm Item Returned</Text>
            </TouchableOpacity>
          )}

          {/* Requester: in_progress — show return reminder */}
          {isRequester && tx.status === 'in_progress' && (
            <View style={styles.reminderBox}>
              <Ionicons name="alarm-outline" size={18} color={colors.warning} />
              <Text style={styles.reminderText}>
                Return "{tx.item}" to {tx.provider.name} before the deadline to keep your account in good standing.
              </Text>
            </View>
          )}

          {/* Completed — leave review */}
          {tx.status === 'completed' && (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.success }]}>
              <Ionicons name="star-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Leave a Review</Text>
            </TouchableOpacity>
          )}

          {/* Dispute button */}
          {(tx.status === 'in_progress' || tx.status === 'overdue') && (
            <TouchableOpacity style={styles.disputeBtn} onPress={raiseDispute}>
              <Ionicons name="warning-outline" size={18} color={colors.error} />
              <Text style={styles.disputeBtnText}>Raise a Dispute</Text>
            </TouchableOpacity>
          )}

          {/* Chat button */}
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate('ChatDetail', {
              chat: {
                user: isProvider ? tx.requester : tx.provider,
                postTitle: tx.postTitle,
              }
            })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
            <Text style={styles.chatBtnText}>Open Chat</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.textPrimary },

  container: { padding: 16, gap: 14, paddingBottom: 40 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 14, padding: 14,
  },
  statusLabel: { ...typography.bodyBold },

  card: {
    backgroundColor: colors.card, borderRadius: 16,
    padding: 16, gap: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  cardLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.8 },
  itemTitle: { ...typography.h3, color: colors.textPrimary },
  postRef: { ...typography.small, color: colors.textSecondary },

  partyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  party: { alignItems: 'center', gap: 6, flex: 1 },
  partyName: { ...typography.smallBold, color: colors.textPrimary, textAlign: 'center' },
  roleTag: {
    backgroundColor: colors.supplyLight, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  roleTagText: { ...typography.caption, color: colors.supply, fontWeight: '700' },
  youLabel: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  arrowCol: { alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  arrowLabel: { ...typography.caption, color: colors.textMuted },

  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineInfo: { flex: 1 },
  timelineEvent: { ...typography.smallBold, color: colors.textPrimary },
  timelineDate: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  countdownBox: { alignItems: 'flex-end' },
  countdownLabel: { ...typography.caption, color: colors.textMuted },
  countdownValue: { ...typography.bodyBold, color: colors.primary },

  notesText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },

  lockoutCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: '#fff5f5', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: colors.error,
  },
  lockoutTitle: { ...typography.bodyBold, color: colors.error, marginBottom: 4 },
  lockoutBody: { ...typography.small, color: '#c92a2a', lineHeight: 20 },

  infoCard: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: colors.primaryLight, borderRadius: 12, padding: 12,
  },
  infoText: { ...typography.small, color: colors.primary, flex: 1, lineHeight: 18 },

  actions: { gap: 10 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 14, padding: 15,
  },
  primaryBtnText: { ...typography.button, color: '#fff' },

  reminderBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#fff9db', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#f59f00',
  },
  reminderText: { ...typography.small, color: '#744210', flex: 1, lineHeight: 20 },

  disputeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: colors.error, borderRadius: 14, padding: 13,
  },
  disputeBtnText: { ...typography.button, color: colors.error },

  chatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 14, padding: 13,
  },
  chatBtnText: { ...typography.button, color: colors.primary },
});
