import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import { mockOtherUsers, mockUser } from '../data/mockData';

const LEVEL_EMOJIS = ['🌱', '⭐', '🏅', '💎', '👑'];
const GENDER_ICON  = { Male: '♂️', Female: '♀️', 'Non-binary': '⚧️' };
const GENDER_COLOR = { Male: '#4dabf7', Female: '#f783ac', 'Non-binary': '#a78bfa' };
const TYPE_COLOR = { need: colors.need, supply: colors.supply };
const TYPE_LABEL = { need: 'Need', supply: 'Supply' };

export default function UserProfileScreen({ navigation, route }) {
  const userId = route?.params?.userId;
  const highlightReviewId = route?.params?.highlightReviewId;
  const user = userId === mockUser.id ? mockUser : mockOtherUsers[userId];

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

  const stars = Math.round(user.stars);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Avatar + name block */}
        <View style={styles.heroBlock}>
          <Avatar name={user.name} size={80} level={user.level} />
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.name}</Text>
              {user.verified && <Text style={styles.verifiedBadge}>✓</Text>}
            </View>
            <Text style={styles.levelLabel}>
              {LEVEL_EMOJIS[user.level - 1]} Level {user.level} · {user.levelName}
            </Text>
            {user.gender && (
              <View style={[styles.genderBadge, { backgroundColor: GENDER_COLOR[user.gender] + '22', borderColor: GENDER_COLOR[user.gender] }]}>
                <Text style={[styles.genderBadgeText, { color: GENDER_COLOR[user.gender] }]}>
                  {GENDER_ICON[user.gender]} {user.gender}
                </Text>
              </View>
            )}
            <Text style={styles.neighbourhood}>📍 {user.neighbourhood} · Joined {user.joinDate}</Text>
          </View>
        </View>

        {/* Bio */}
        {user.bio && (
          <View style={styles.bioBlock}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{'⭐'.repeat(stars)}</Text>
            <Text style={styles.statLabel}>{user.stars} rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>#{user.weeklyRank}</Text>
            <Text style={styles.statLabel}>This week</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.msgBtn}
            onPress={() => navigation.navigate('ChatDetail', { chat: { user, postTitle: 'Direct message' } })}
          >
            <Text style={styles.msgBtnText}>💬 Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add Friend</Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        {user.posts?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            {user.posts.map(post => (
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

        {/* Reviews */}
        {user.reviews?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews ({user.reviews.length})</Text>
            {user.reviews.map(review => (
              <View
                key={review.id}
                style={[styles.reviewCard, review.id === highlightReviewId && styles.reviewCardHighlighted]}
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
  addBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  addBtnText: { ...typography.button, color: colors.primary },

  section: { gap: 10 },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  reviewCardHighlighted: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: colors.primaryLight,
  },
  newReviewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  newReviewBadgeText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '700',
  },

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
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewerName: { ...typography.smallBold, color: colors.textPrimary, flex: 1 },
  reviewStars: { fontSize: 12 },
  reviewDate: { ...typography.caption, color: colors.textMuted },
  reviewComment: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  reviewTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: colors.primaryLight, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  tagText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundEmoji: { fontSize: 48 },
  notFoundText: { ...typography.h3, color: colors.textSecondary },
  backBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { ...typography.button, color: colors.textWhite },
});
