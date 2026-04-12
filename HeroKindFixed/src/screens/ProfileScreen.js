import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
   ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import { mockUser, mockReviews, mockNeeds, mockSupplies } from '../data/mockData';

const LEVEL_NAMES  = ['Newcomer', 'Helper', 'Trusted Neighbour', 'Community Pillar', 'Legend'];
const GENDER_ICON  = { Male: '♂️', Female: '♀️', 'Non-binary': '⚧️' };
const GENDER_COLOR = { Male: '#4dabf7', Female: '#f783ac', 'Non-binary': '#a78bfa' };
const LEVEL_EMOJIS = ['🌱', '⭐', '🏅', '💎', '👑'];
const ACHIEVEMENTS = [
  { id: 'a1', emoji: '🔧', label: 'Tool Lender', desc: '5+ tools lent' },
  { id: 'a2', emoji: '🍱', label: 'Food Sharer', desc: '3+ food shared' },
  { id: 'a3', emoji: '⚡', label: 'Fast Responder', desc: 'Avg reply < 5 min' },
  { id: 'a4', emoji: '💯', label: 'Reliable', desc: '10+ 5-star reviews' },
];

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('reviews');
  const user = mockUser;
  const xpPercent = (user.xp / user.xpNext) * 100;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header actions */}
        <View style={styles.topActions}>
          <Text style={styles.pageTitle}>Profile</Text>
          <View style={styles.topRight}>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
              <Text style={styles.leaderboardLink}>🏆 Leaderboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Avatar name={user.name} size={88} level={user.level} showBadge={false} />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text style={styles.editAvatarText}>Edit avatar</Text>
            </TouchableOpacity>
          </View>

          {/* Name & info */}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.name}</Text>
              {user.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
            <View style={styles.userMetaRow}>
              {user.gender && (
                <View style={[styles.genderBadge, { backgroundColor: GENDER_COLOR[user.gender] + '22', borderColor: GENDER_COLOR[user.gender] }]}>
                  <Text style={[styles.genderBadgeText, { color: GENDER_COLOR[user.gender] }]}>
                    {GENDER_ICON[user.gender]} {user.gender}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userMeta}>📍 {user.neighbourhood} · Joined {user.joinDate}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>⭐ {user.stars}</Text>
                <Text style={styles.statLabel}>{user.totalReviews} reviews</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>#{user.weeklyRank}</Text>
                <Text style={styles.statLabel}>This week</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user.weeklyScore}</Text>
                <Text style={styles.statLabel}>Weekly pts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Level progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelEmoji}>{LEVEL_EMOJIS[user.level - 1]}</Text>
            <View>
              <Text style={styles.levelName}>Level {user.level} — {LEVEL_NAMES[user.level - 1]}</Text>
              <Text style={styles.levelXP}>{user.xp} / {user.xpNext} XP to Level {user.level + 1}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${xpPercent}%` }]} />
          </View>
          <View style={styles.levelTip}>
            <Text style={styles.levelTipText}>
              💡 Help 2 more neighbours this week to reach Level {user.level + 1}!
            </Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achieveScroll}>
            {ACHIEVEMENTS.map(a => (
              <View key={a.id} style={styles.achieveCard}>
                <Text style={styles.achieveEmoji}>{a.emoji}</Text>
                <Text style={styles.achieveLabel}>{a.label}</Text>
                <Text style={styles.achieveDesc}>{a.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Mini-game shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mini-Games</Text>
          <View style={styles.gamesRow}>
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => navigation.navigate('Farmer')}
            >
              <Text style={styles.gameEmoji}>🌾</Text>
              <Text style={styles.gameTitle}>Farmer</Text>
              <Text style={styles.gameSub}>1 crop ready!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => navigation.navigate('Fisher')}
            >
              <Text style={styles.gameEmoji}>🎣</Text>
              <Text style={styles.gameTitle}>Fisher</Text>
              <Text style={styles.gameSub}>Cast a line</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content tabs */}
        <View style={styles.tabBar}>
          {['reviews', 'needs', 'supply'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'reviews' ? '⭐ Reviews' : tab === 'needs' ? '🆘 Needs' : '📦 Supply'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === 'reviews' && mockReviews.map(r => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Avatar name={r.reviewer} size={36} level={2} showBadge={false} />
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewerName}>{r.reviewer}</Text>
                <View style={styles.starsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text key={i} style={{ fontSize: 12, color: i < r.stars ? '#FED330' : colors.border }}>★</Text>
                  ))}
                  <Text style={styles.reviewDate}> · {r.date}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment}>{r.comment}</Text>
            <View style={styles.reviewTags}>
              {r.tags.map(tag => (
                <View key={tag} style={styles.reviewTag}>
                  <Text style={styles.reviewTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {activeTab === 'needs' && mockNeeds.slice(0, 2).map(item => (
          <View key={item.id} style={styles.historyCard}>
            <View style={[styles.historyDot, { backgroundColor: colors.need }]} />
            <View style={styles.historyBody}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyMeta}>{item.category} · {item.timePosted}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.supplyLight }]}>
              <Text style={[styles.statusText, { color: colors.supply }]}>Completed</Text>
            </View>
          </View>
        ))}

        {activeTab === 'supply' && mockSupplies.slice(0, 2).map(item => (
          <View key={item.id} style={styles.historyCard}>
            <View style={[styles.historyDot, { backgroundColor: colors.supply }]} />
            <View style={styles.historyBody}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyMeta}>{item.category} · {item.timePosted}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.statusText, { color: colors.primary }]}>Active</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: 90 },

  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: { ...typography.h2, color: colors.textPrimary },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leaderboardLink: { ...typography.small, color: colors.primary },
  settingsBtn: {},
  settingsIcon: { fontSize: 20 },

  profileCard: {
    backgroundColor: colors.card,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarSection: { alignItems: 'center', gap: 8 },
  editAvatarBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editAvatarText: { ...typography.caption, color: colors.primary },
  userInfo: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  userName: { ...typography.h3, color: colors.textPrimary },
  verifiedBadge: { backgroundColor: colors.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  verifiedText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  userMeta: { ...typography.small, color: colors.textSecondary },
  userMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  genderBadge: {
    flexDirection: 'row', borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  genderBadgeText: { ...typography.caption, fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.bodyBold, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },

  levelCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  levelHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelEmoji: { fontSize: 36 },
  levelName: { ...typography.h4, color: colors.textPrimary },
  levelXP: { ...typography.small, color: colors.textSecondary },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  levelTip: { backgroundColor: colors.primaryLight, borderRadius: 10, padding: 10 },
  levelTipText: { ...typography.small, color: colors.primary },

  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 12 },
  achieveScroll: {},
  achieveCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
    alignItems: 'center',
    width: 100,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  achieveEmoji: { fontSize: 28 },
  achieveLabel: { ...typography.smallBold, color: colors.textPrimary, textAlign: 'center' },
  achieveDesc: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

  gamesRow: { flexDirection: 'row', gap: 12 },
  gameCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  gameEmoji: { fontSize: 36 },
  gameTitle: { ...typography.bodyBold, color: colors.textPrimary },
  gameSub: { ...typography.small, color: colors.textSecondary },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: colors.transparent,
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { ...typography.small, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '600' },

  reviewCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewMeta: { flex: 1 },
  reviewerName: { ...typography.smallBold, color: colors.textPrimary },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  reviewDate: { ...typography.caption, color: colors.textMuted },
  reviewComment: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  reviewTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reviewTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reviewTagText: { ...typography.caption, color: colors.primary },

  historyCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyDot: { width: 10, height: 10, borderRadius: 5 },
  historyBody: { flex: 1 },
  historyTitle: { ...typography.smallBold, color: colors.textPrimary, marginBottom: 2 },
  historyMeta: { ...typography.caption, color: colors.textMuted },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { ...typography.caption, fontWeight: '700' },
});
