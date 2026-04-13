import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, FlatList,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import { mockLeaderboard, mockUser } from '../data/mockData';

const PODIUM_COLORS = ['#FED330', '#BDC3C7', '#E67E22']; // Gold, Silver, Bronze
const PODIUM_EMOJIS = ['🥇', '🥈', '🥉'];
const PODIUM_HEIGHTS = [120, 88, 72];
const PODIUM_ORDER = [1, 0, 2]; // display order: 2nd, 1st, 3rd

export default function LeaderboardScreen({ navigation }) {
  const top3 = mockLeaderboard.slice(0, 3);
  const rest = mockLeaderboard.slice(3);

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.weekBadge}>
          <Text style={styles.weekText}>This week</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Confetti / celebration banner */}
        <View style={styles.celebrationBanner}>
          <Text style={styles.celebrationText}>🎉 Weekly rankings reset Monday midnight</Text>
        </View>

        {/* Podium */}
        <View style={styles.podiumSection}>
          <Text style={styles.podiumTitle}>Top Helpers This Week</Text>

          <View style={styles.podiumStage}>
            {PODIUM_ORDER.map(idx => {
              const user = top3[idx];
              const podiumHeight = PODIUM_HEIGHTS[idx === 0 ? 0 : idx === 1 ? 1 : 2];
              return (
                <View key={user.rank} style={styles.podiumPosition}>
                  {/* Avatar + name above platform */}
                  <View style={styles.podiumAvatarSection}>
                    <Text style={styles.podiumEmoji}>{PODIUM_EMOJIS[idx]}</Text>
                    <Avatar name={user.name} size={idx === 0 ? 64 : 52} level={user.level} />
                    <Text style={styles.podiumName}>{user.name}</Text>
                    <View style={styles.podiumScoreBadge}>
                      <Text style={styles.podiumScore}>{user.score} pts</Text>
                    </View>
                  </View>

                  {/* Platform */}
                  <View
                    style={[
                      styles.platform,
                      { height: podiumHeight, backgroundColor: PODIUM_COLORS[idx] },
                    ]}
                  >
                    <Text style={styles.platformRank}>{user.rank}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* My rank highlight */}
        <View style={styles.myRankBanner}>
          <Text style={styles.myRankLabel}>Your rank</Text>
          <Text style={styles.myRankValue}>#{mockUser.weeklyRank}</Text>
          <Text style={styles.myRankScore}>{mockUser.weeklyScore} pts this week</Text>
          <View style={styles.myRankTip}>
            <Text style={styles.myRankTipText}>
              Help 2 more neighbours to reach #{mockUser.weeklyRank - 1}!
            </Text>
          </View>
        </View>

        {/* Full leaderboard */}
        <View style={styles.fullList}>
          <Text style={styles.fullListTitle}>Full Rankings</Text>

          {/* Top 3 in list */}
          {top3.map(user => (
            <LeaderboardRow key={user.rank} user={user} isMe={user.id === 'u1'} isTop3 />
          ))}

          {/* Divider */}
          <View style={styles.listDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Ranks 4–{mockLeaderboard.length}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Rest */}
          {rest.map(user => (
            <LeaderboardRow key={user.rank} user={user} isMe={user.id === 'u1'} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function LeaderboardRow({ user, isMe, isTop3 }) {
  const rankColor = isTop3 ? PODIUM_COLORS[user.rank - 1] : colors.textMuted;

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={[styles.rankCircle, isTop3 && { backgroundColor: rankColor + '33' }]}>
        <Text style={[styles.rankText, isTop3 && { color: rankColor }]}>{user.rank}</Text>
      </View>
      <Avatar name={user.name} size={40} level={user.level} showBadge />
      <View style={styles.rowInfo}>
        <View style={styles.rowNameRow}>
          <Text style={[styles.rowName, isMe && styles.rowNameMe]}>{user.name}</Text>
          {isMe && <View style={styles.youBadge}><Text style={styles.youText}>You</Text></View>}
        </View>
        <Text style={styles.rowNeighbourhood}>📍 {user.neighbourhood} · ⭐ {user.stars}</Text>
      </View>
      <View style={styles.rowScore}>
        <Text style={styles.rowScoreValue}>{user.score}</Text>
        <Text style={styles.rowScoreLabel}>pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: { ...typography.body, color: colors.primary },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  weekBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weekText: { ...typography.small, color: colors.primary, fontWeight: '600' },

  container: { paddingBottom: 40 },

  celebrationBanner: {
    backgroundColor: colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  celebrationText: { ...typography.small, color: 'rgba(255,255,255,0.85)' },

  podiumSection: {
    backgroundColor: colors.card,
    padding: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  podiumTitle: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginBottom: 24 },

  podiumStage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  podiumPosition: {
    alignItems: 'center',
    flex: 1,
  },
  podiumAvatarSection: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  podiumEmoji: { fontSize: 24 },
  podiumName: { ...typography.smallBold, color: colors.textPrimary, textAlign: 'center' },
  podiumScoreBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  podiumScore: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  platform: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformRank: { fontSize: 22, fontWeight: '800', color: 'rgba(0,0,0,0.3)' },

  myRankBanner: {
    backgroundColor: colors.primaryLight,
    margin: 16,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  myRankLabel: { ...typography.small, color: colors.primary },
  myRankValue: { fontSize: 40, fontWeight: '800', color: colors.primary },
  myRankScore: { ...typography.body, color: colors.textSecondary },
  myRankTip: { marginTop: 4 },
  myRankTipText: { ...typography.small, color: colors.primary, textAlign: 'center' },

  fullList: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  fullListTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { ...typography.caption, color: colors.textMuted },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMe: { backgroundColor: colors.primaryLight },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { ...typography.smallBold, color: colors.textMuted },
  rowInfo: { flex: 1 },
  rowNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowName: { ...typography.bodyBold, color: colors.textPrimary },
  rowNameMe: { color: colors.primary },
  youBadge: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  youText: { ...typography.caption, color: colors.textWhite, fontWeight: '700' },
  rowNeighbourhood: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  rowScore: { alignItems: 'center' },
  rowScoreValue: { ...typography.h4, color: colors.textPrimary },
  rowScoreLabel: { ...typography.caption, color: colors.textMuted },
});
