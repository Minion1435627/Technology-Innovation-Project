import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';

const REVIEW_TAG_OPTIONS = ['Friendly', 'On time', 'Clear communication', 'Reliable', 'Helpful'];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#f59f00',
    bg: '#fff9db',
    icon: 'time-outline',
  },
  in_progress: {
    label: 'In Progress',
    color: '#1c7ed6',
    bg: '#e7f5ff',
    icon: 'sync-outline',
  },
  completed: {
    label: 'Completed',
    color: '#2f9e44',
    bg: '#ebfbee',
    icon: 'checkmark-circle-outline',
  },
  overdue: {
    label: 'Overdue',
    color: '#e03131',
    bg: '#fff5f5',
    icon: 'alert-circle-outline',
  },
  disputed: {
    label: 'Under Dispute',
    color: '#9c36b5',
    bg: '#f8f0fc',
    icon: 'warning-outline',
  },
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
  const [reviewPromptVisible, setReviewPromptVisible] = useState(initial.status === 'completed');
  const [selectedReviewTags, setSelectedReviewTags] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const isProvider = tx.myRole === 'provider';
  const isRequester = tx.myRole === 'requester';
  const isBorrow = tx.type === 'borrow';
  const flowLabel = isBorrow ? 'Borrowed item' : 'Help / service';
  const assetLabel = isBorrow ? 'ITEM' : 'TASK';
  const startEventLabel = isBorrow ? 'Handover date' : 'Task start date';
  const deadlineLabel = isBorrow ? 'Return deadline' : 'Task window ends';
  const countdownLabel = isBorrow ? 'Time left' : 'Time remaining';
  const providerActionLabel = isBorrow ? 'Confirm Handover' : 'Confirm Task Started';
  const completionActionLabel = isBorrow ? 'Confirm Item Returned' : 'Mark Task Completed';
  const partyArrowLabel = isBorrow ? 'lends to' : 'helps';
  const cfg = STATUS_CONFIG[tx.status];
  const overdueMs = tx.agreedReturnDate ? Date.now() - new Date(tx.agreedReturnDate).getTime() : 0;
  const gracePeriodMs = 3 * 24 * 60 * 60 * 1000;
  const lockoutActive = isBorrow && tx.status === 'overdue' && isRequester && overdueMs >= gracePeriodMs;
  const stickySummary = tx.status === 'completed'
    ? 'Review available'
    : tx.status === 'disputed'
      ? 'Issue under review'
      : tx.status === 'pending'
        ? (isBorrow ? 'Waiting for handover confirmation' : 'Waiting for task start confirmation')
        : (isBorrow ? 'Provider confirms return to finish' : 'Provider marks task completed to finish');

  const markInProgress = () => {
    const title = isBorrow ? 'Confirm Handover' : 'Confirm Task Start';
    const message = isBorrow
      ? `Confirm that you have handed "${tx.item}" to ${tx.requester.name}? The return countdown starts now.`
      : `Confirm that you have started "${tx.item}" with ${tx.requester.name}? The task countdown starts now.`;

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: providerActionLabel,
        onPress: () => {
          setTx(t => ({
            ...t,
            status: 'in_progress',
            handoverDate: new Date().toISOString(),
            agreedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          }));
        },
      },
    ]);
  };

  const confirmCompletion = () => {
    const title = isBorrow ? 'Confirm Item Returned' : 'Mark Task Completed';
    const message = isBorrow
      ? `Has "${tx.item}" been returned by ${tx.requester.name} in good condition?`
      : `Has "${tx.item}" been fully completed for ${tx.requester.name}?`;
    const confirmText = isBorrow ? 'Yes, Confirm Return' : 'Yes, Mark Complete';

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: confirmText,
        onPress: () => {
          setTx(t => ({ ...t, status: 'completed', completedDate: new Date().toISOString() }));
          setReviewPromptVisible(true);
        },
      },
    ]);
  };

  const raiseDispute = () => {
    Alert.alert(
      'Raise a Dispute',
      'This will flag the exchange for review and pause any penalties while the issue is checked.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Raise Dispute',
          style: 'destructive',
          onPress: () => {
            setTx(t => ({ ...t, status: 'disputed' }));
            setReviewPromptVisible(false);
          },
        },
      ]
    );
  };

  const toggleReviewTag = (tag) => {
    setSelectedReviewTags(prev =>
      prev.includes(tag) ? prev.filter(item => item !== tag) : [...prev, tag]
    );
  };

  const submitReview = () => {
    if (!reviewRating) {
      Alert.alert('Add a rating', 'Please select a star rating before submitting your review.');
      return;
    }

    setReviewSubmitted(true);
    setReviewPromptVisible(false);
    Alert.alert('Review submitted', 'Your feedback has been saved for this exchange.');
  };

  const formatDate = iso => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exchange</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        scrollEnabled
        persistentScrollbar
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeaderShell}>
          <View style={styles.stickyHeaderCard}>
            <View style={styles.stickyHeaderMain}>
              <View style={[styles.stickyIconWrap, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={16} color={cfg.color} />
              </View>
              <View style={styles.stickyTextWrap}>
                <Text style={styles.stickyTitle}>{cfg.label} • {flowLabel}</Text>
                <Text style={styles.stickySubtitle} numberOfLines={1}>{stickySummary}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.stickyChatBtn}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  chat: {
                    user: isProvider ? tx.requester : tx.provider,
                    postTitle: tx.postTitle,
                  },
                })
              }
            >
              <Text style={styles.stickyChatBtnText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={20} color={cfg.color} />
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>

        <View style={styles.flowPill}>
          <Text style={styles.flowPillText}>{flowLabel}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{assetLabel}</Text>
          <Text style={styles.itemTitle}>{tx.item}</Text>
          <Text style={styles.postRef}>📌 {tx.postTitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PARTIES</Text>
          <View style={styles.partyRow}>
            <View style={styles.party}>
              <Avatar name={tx.provider.name} size={48} level={tx.provider.level} />
              <Text style={styles.partyName}>{tx.provider.name}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Provider</Text>
              </View>
              {isProvider && <Text style={styles.youLabel}>You</Text>}
            </View>

            <View style={styles.arrowCol}>
              <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
              <Text style={styles.arrowLabel}>{partyArrowLabel}</Text>
            </View>

            <View style={styles.party}>
              <Avatar name={tx.requester.name} size={48} level={tx.requester.level} />
              <Text style={styles.partyName}>{tx.requester.name}</Text>
              <View style={[styles.roleTag, { backgroundColor: colors.needLight }]}>
                <Text style={[styles.roleTagText, { color: colors.need }]}>Requester</Text>
              </View>
              {isRequester && <Text style={styles.youLabel}>You</Text>}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>TIMELINE</Text>

          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: colors.supply }]} />
            <View style={styles.timelineInfo}>
              <Text style={styles.timelineEvent}>{startEventLabel}</Text>
              <Text style={styles.timelineDate}>{formatDate(tx.handoverDate)}</Text>
            </View>
          </View>

          {tx.status !== 'pending' && (
            <View style={styles.timelineRow}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: tx.status === 'overdue' ? colors.error : colors.primary },
                ]}
              />
              <View style={styles.timelineInfo}>
                <Text style={styles.timelineEvent}>{deadlineLabel}</Text>
                <Text style={[styles.timelineDate, tx.status === 'overdue' && styles.timelineDateOverdue]}>
                  {formatDate(tx.agreedReturnDate)}
                </Text>
              </View>
              {tx.status === 'in_progress' && (
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownLabel}>{countdownLabel}</Text>
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

        {tx.notes && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>NOTES</Text>
            <Text style={styles.notesText}>{tx.notes}</Text>
          </View>
        )}

        {lockoutActive && (
          <View style={styles.lockoutCard}>
            <Ionicons name="lock-closed" size={24} color={colors.error} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lockoutTitle}>Account Restricted</Text>
              <Text style={styles.lockoutBody}>
                Your account is locked because the borrowed item was not confirmed in time. You cannot post or start new chats until the provider confirms the return.
              </Text>
            </View>
          </View>
        )}

        {isBorrow && tx.status === 'overdue' && isRequester && !lockoutActive && (
          <View style={styles.reminderBox}>
            <Ionicons name="time-outline" size={18} color={colors.warning} />
            <Text style={styles.reminderText}>
              This borrowed item is overdue. If the provider still has not confirmed the return after 3 days, the requester account will be restricted automatically.
            </Text>
          </View>
        )}

        {tx.status === 'in_progress' && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              {isBorrow
                ? 'If the item is not returned and confirmed within 3 days, the requester account will be automatically locked.'
                : 'This help task is now in progress. The countdown will keep running until the provider marks the task completed.'}
            </Text>
          </View>
        )}

        {tx.status === 'disputed' && (
          <View style={styles.disputeInfoCard}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#7b2cbf" />
            <Text style={styles.disputeInfoText}>
              This exchange is now under dispute. Any lockout or overdue penalties are paused while the issue is reviewed.
            </Text>
          </View>
        )}

        {tx.status === 'completed' && reviewPromptVisible && !reviewSubmitted && (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="star-outline" size={18} color={colors.success} />
              <Text style={styles.reviewTitle}>Review prompt unlocked</Text>
            </View>
            <Text style={styles.reviewBody}>
              Leave a quick rating for this exchange. You can choose multiple tags and add a short comment before submitting.
            </Text>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={styles.starBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={reviewRating >= star ? 'star' : 'star-outline'}
                    size={24}
                    color={reviewRating >= star ? '#f59f00' : colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.reviewTags}>
              {REVIEW_TAG_OPTIONS.map(tag => {
                const selected = selectedReviewTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.reviewTag, selected && styles.reviewTagSelected]}
                    activeOpacity={0.85}
                    onPress={() => toggleReviewTag(tag)}
                  >
                    <Text style={[styles.reviewTagText, selected && styles.reviewTagTextSelected]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={styles.reviewInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Write a short review..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={styles.reviewLaterBtn}
                onPress={() => setReviewPromptVisible(false)}
              >
                <Text style={styles.reviewLaterBtnText}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reviewSubmitBtn}
                onPress={submitReview}
              >
                <Text style={styles.reviewSubmitBtnText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {tx.status === 'completed' && reviewSubmitted && (
          <View style={styles.reviewSubmittedCard}>
            <View style={styles.reviewHeader}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
              <Text style={styles.reviewTitle}>Review submitted</Text>
            </View>
            <Text style={styles.reviewBody}>
              You rated this exchange {reviewRating}/5 and your feedback has been saved.
            </Text>
            {!!selectedReviewTags.length && (
              <View style={styles.reviewTags}>
                {selectedReviewTags.map(tag => (
                  <View key={tag} style={[styles.reviewTag, styles.reviewTagSelected]}>
                    <Text style={[styles.reviewTagText, styles.reviewTagTextSelected]}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            {!!reviewComment.trim() && (
              <Text style={styles.submittedComment}>“{reviewComment.trim()}”</Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          {isProvider && tx.status === 'pending' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={markInProgress}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>{providerActionLabel}</Text>
            </TouchableOpacity>
          )}

          {isProvider && (tx.status === 'in_progress' || tx.status === 'overdue') && (
            <TouchableOpacity style={styles.primaryBtn} onPress={confirmCompletion}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>{completionActionLabel}</Text>
            </TouchableOpacity>
          )}

          {isRequester && tx.status === 'in_progress' && (
            <View style={styles.reminderBox}>
              <Ionicons name="alarm-outline" size={18} color={colors.warning} />
              <Text style={styles.reminderText}>
                {isBorrow
                  ? `Return "${tx.item}" to ${tx.provider.name} before the deadline to keep your account in good standing.`
                  : `Stay in touch with ${tx.provider.name} while "${tx.item}" is in progress. The provider will mark the task completed when it is done.`}
              </Text>
            </View>
          )}

          {tx.status === 'completed' && !reviewSubmitted && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.success }]}
              onPress={() => setReviewPromptVisible(v => !v)}
            >
              <Ionicons name="star-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>{reviewPromptVisible ? 'Not Now' : 'Leave a Review'}</Text>
            </TouchableOpacity>
          )}

          {(tx.status === 'in_progress' || tx.status === 'overdue') && (
            <TouchableOpacity style={styles.disputeBtn} onPress={raiseDispute}>
              <Ionicons name="warning-outline" size={18} color={colors.error} />
              <Text style={styles.disputeBtnText}>Raise a Dispute</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() =>
              navigation.navigate('ChatDetail', {
                chat: {
                  user: isProvider ? tx.requester : tx.provider,
                  postTitle: tx.postTitle,
                },
              })
            }
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  container: { padding: 16, gap: 14, paddingBottom: 260 },
  stickyHeaderShell: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  stickyHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stickyHeaderMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stickyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyTextWrap: { flex: 1 },
  stickyTitle: {
    ...typography.smallBold,
    color: colors.textPrimary,
  },
  stickySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stickyChatBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  stickyChatBtnText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 14,
  },
  statusLabel: { ...typography.bodyBold },
  flowPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flowPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  itemTitle: { ...typography.h3, color: colors.textPrimary },
  postRef: { ...typography.small, color: colors.textSecondary },
  partyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  party: { alignItems: 'center', gap: 6, flex: 1 },
  partyName: { ...typography.smallBold, color: colors.textPrimary, textAlign: 'center' },
  roleTag: {
    backgroundColor: colors.supplyLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  timelineDateOverdue: { color: colors.error, fontWeight: '700' },
  countdownBox: { alignItems: 'flex-end' },
  countdownLabel: { ...typography.caption, color: colors.textMuted },
  countdownValue: { ...typography.bodyBold, color: colors.primary },
  notesText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  lockoutCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#fff5f5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  lockoutTitle: { ...typography.bodyBold, color: colors.error, marginBottom: 4 },
  lockoutBody: { ...typography.small, color: '#c92a2a', lineHeight: 20 },
  infoCard: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
  },
  infoText: { ...typography.small, color: colors.primary, flex: 1, lineHeight: 18 },
  disputeInfoCard: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: '#f8f0fc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5d5fa',
  },
  disputeInfoText: {
    ...typography.small,
    color: '#7b2cbf',
    flex: 1,
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: colors.success + '12',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.success + '33',
    gap: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewTitle: {
    ...typography.bodyBold,
    color: colors.success,
  },
  reviewBody: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 8,
  },
  starBtn: {
    paddingVertical: 2,
  },
  reviewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewTag: {
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewTagSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  reviewTagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  reviewTagTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  reviewInput: {
    minHeight: 92,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...typography.small,
    color: colors.textPrimary,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewLaterBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  reviewLaterBtnText: {
    ...typography.smallBold,
    color: colors.textSecondary,
  },
  reviewSubmitBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },
  reviewSubmitBtnText: {
    ...typography.smallBold,
    color: colors.textWhite,
  },
  reviewSubmittedCard: {
    backgroundColor: colors.success + '12',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.success + '33',
    gap: 10,
  },
  submittedComment: {
    ...typography.small,
    color: colors.textPrimary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actions: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 15,
  },
  primaryBtnText: { ...typography.button, color: '#fff' },
  reminderBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#fff9db',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f59f00',
  },
  reminderText: { ...typography.small, color: '#744210', flex: 1, lineHeight: 20 },
  disputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: 14,
    padding: 13,
  },
  disputeBtnText: { ...typography.button, color: colors.error },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    padding: 13,
  },
  chatBtnText: { ...typography.button, color: colors.primary },
});
