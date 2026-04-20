import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import { fetchUserProfile, fetchUserReviews } from '../lib/db';
import { useFriends } from '../context/FriendsContext';
import { useChats } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';

const LEVEL_EMOJIS = ['🌱', '⭐', '🏅', '💎', '👑'];
const LEVEL_NAMES  = ['Newcomer', 'Helper', 'Trusted Neighbour', 'Community Pillar', 'Legend'];
const GENDER_ICON  = { Male: '♂️', Female: '♀️', 'Non-binary': '⚧️' };
const GENDER_COLOR = { Male: '#4dabf7', Female: '#f783ac', 'Non-binary': '#a78bfa' };
const TYPE_COLOR = { need: colors.need, supply: colors.supply };
const TYPE_LABEL = { need: 'Need', supply: 'Supply' };

export default function UserProfileScreen({ navigation, route }) {
  const userId = route?.params?.userId;
  const highlightReviewId = route?.params?.highlightReviewId;
  const { user: authUser } = useAuth();
  const { friendIds, addFriend, removeFriend, isFriend } = useFriends();
  const { chats } = useChats();
  const { posts } = usePosts();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  const highlightedReviewYRef = useRef(0);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    Promise.all([
      fetchUserProfile(userId),
      fetchUserReviews(userId),
    ]).then(([profile, reviewRows]) => {
      setUser(profile);
      setReviews(reviewRows.map(r => ({
        id: r.id,
        reviewer: r.reviewer?.name ?? 'Anonymous',
        stars: r.stars,
        date: new Date(r.created_at).toLocaleDateString(),
        comment: r.comment ?? '',
        tags: (r.review_selected_tags ?? []).map(t => t.review_tags?.label).filter(Boolean),
      })));
      setLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    if (!highlightReviewId) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(highlightedReviewYRef.current - 24, 0), animated: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [highlightReviewId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFound}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundText}>User not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isMyProfile = userId === authUser?.id;
  const alreadyFriend = !isMyProfile && isFriend(userId);
  const canMessage = !isMyProfile && ((user.message_privacy ?? 'everyone') === 'everyone' || alreadyFriend);
  const computedRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.stars, 0) / reviews.length) * 10) / 10
    : (user.stars ?? 0);
  const stars = Math.round(computedRating);
  const XP_THRESHOLDS = [0, 100, 200, 500, 1000];
  const computedLevel = XP_THRESHOLDS.reduce((lvl, xp, i) => (user.xp ?? 0) >= xp ? i + 1 : lvl, 1);
  const levelIdx = computedLevel - 1;
  const userPosts = posts.filter(p => p.user_id === userId || p.poster?.id === userId).slice(0, 3);

  const handleMessage = () => {
    const existing = chats.find(c => c.user?.id === userId);
    navigation.navigate('ChatDetail', {
      chat: existing ?? { user: { id: user.id, name: user.name, stars: user.stars, gender: user.gender }, postTitle: 'Direct message' },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.heroBlock}>
          <Avatar name={user.name} size={80} level={computedLevel} />
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.name}</Text>
              {user.verified && <Text style={styles.verifiedBadge}>✓</Text>}
            </View>
            <Text style={styles.levelLabel}>
              {LEVEL_EMOJIS[levelIdx]} Level {computedLevel} · {LEVEL_NAMES[levelIdx]}
            </Text>
            {user.gender && (
              <View style={[styles.genderBadge, { backgroundColor: GENDER_COLOR[user.gender] + '22', borderColor: GENDER_COLOR[user.gender] }]}>
                <Text style={[styles.genderBadgeText, { color: GENDER_COLOR[user.gender] }]}>
                  {GENDER_ICON[user.gender]} {user.gender}
                </Text>
              </View>
            )}
            <Text style={styles.neighbourhood}>
              📍 {user.neighbourhood ?? '—'} · Joined {user.join_date ?? ''}
            </Text>
          </View>
        </View>

        {!!user.bio && (
          <View style={styles.bioBlock}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{'⭐'.repeat(stars)}</Text>
            <Text style={styles.statLabel}>{computedRating.toFixed(1)} rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{isMyProfile ? friendIds.length : '—'}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>

        {!isMyProfile && (
          <View style={styles.actions}>
            {canMessage ? (
              <TouchableOpacity style={styles.msgBtn} onPress={handleMessage}>
                <Text style={styles.msgBtnText}>💬 Message</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.msgBtnLocked}>
                <Text style={styles.msgBtnLockedText}>🔒 Friends only</Text>
                <Text style={styles.msgBtnLockedSub}>Add as friend to message</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.addBtn, alreadyFriend && styles.addBtnActive]}
              onPress={() => alreadyFriend ? removeFriend(userId) : addFriend(userId, user)}
            >
              <Text style={[styles.addBtnText, alreadyFriend && styles.addBtnTextActive]}>
                {alreadyFriend ? '✓ Friends' : '+ Add Friend'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {userPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            {userPosts.map(post => (
              <View key={post.id} style={styles.postRow}>
                <View style={[styles.postTypeBadge, { backgroundColor: TYPE_COLOR[post.type] + '22' }]}>
                  <Text style={[styles.postTypeText, { color: TYPE_COLOR[post.type] }]}>
                    {TYPE_LABEL[post.type]}
                  </Text>
                </View>
                <View style={styles.postInfo}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postMeta}>{post.category} · {post.timePosted}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            {reviews.map(review => (
              <View
                key={review.id}
                style={[styles.reviewCard, review.id === highlightReviewId && styles.reviewCardHighlighted]}
                onLayout={e => {
                  if (review.id === highlightReviewId) highlightedReviewYRef.current = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.reviewer}</Text>
                  <Text style={styles.reviewStars}>{'⭐'.repeat(review.stars)}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                {review.id === highlightReviewId && (
                  <View style={styles.newReviewBadge}>
                    <Text style={styles.newReviewBadgeText}>Your latest review</Text>
                  </View>
                )}
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <View style={styles.reviewTags}>
                  {review.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backIconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.primary },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  heroBlock: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  nameBlock: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...typography.h2, color: colors.textPrimary },
  verifiedBadge: {
    fontSize: 14, color: '#fff', backgroundColor: colors.primary,
    borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden',
  },
  levelLabel: { ...typography.small, color: colors.primary, fontWeight: '600' },
  neighbourhood: { ...typography.caption, color: colors.textSecondary },
  genderBadge: {
    flexDirection: 'row', alignSelf: 'flex-start',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
  },
  genderBadgeText: { ...typography.caption, fontWeight: '700' },
  bioBlock: {
    backgroundColor: colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  bioText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.card,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: colors.border },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: 12 },
  msgBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  msgBtnText: { ...typography.button, color: colors.textWhite },
  msgBtnLocked: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, padding: 14, alignItems: 'center', gap: 2,
  },
  msgBtnLockedText: { ...typography.smallBold, color: colors.textSecondary },
  msgBtnLockedSub: { ...typography.caption, color: colors.textMuted },
  addBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  addBtnActive: { backgroundColor: colors.primary },
  addBtnText: { ...typography.button, color: colors.primary },
  addBtnTextActive: { color: colors.textWhite },
  section: { gap: 10 },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  postRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  postTypeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  postTypeText: { ...typography.caption, fontWeight: '700' },
  postInfo: { flex: 1 },
  postTitle: { ...typography.smallBold, color: colors.textPrimary },
  postMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  reviewCard: {
    backgroundColor: colors.card, borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  reviewCardHighlighted: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.primaryLight },
  newReviewBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.primary,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8,
  },
  newReviewBadgeText: { ...typography.caption, color: colors.textWhite, fontWeight: '700' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewerName: { ...typography.smallBold, color: colors.textPrimary, flex: 1 },
  reviewStars: { fontSize: 12 },
  reviewDate: { ...typography.caption, color: colors.textMuted },
  reviewComment: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  reviewTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: colors.primaryLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundEmoji: { fontSize: 48 },
  notFoundText: { ...typography.h3, color: colors.textSecondary },
  backBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { ...typography.button, color: colors.textWhite },
});
