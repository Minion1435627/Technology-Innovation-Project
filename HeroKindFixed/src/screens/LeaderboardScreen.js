import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import LeaderboardAvatar3D from '../components/LeaderboardAvatar3D';
import { fetchLeaderboard, getAvatarPublicUrl } from '../lib/db';
import { useAuth } from '../context/AuthContext';

// ─── Top-3 card palette (soft, friendly — not racing-aggressive) ──────────────
const TOP3_ACCENT  = ['#C9991A', '#7B8D99', '#B86E40']; // gold / silver / bronze
const TOP3_BG      = ['#FFFCEB', '#F4F6F7', '#FFF4EE'];
const TOP3_BORDER  = ['#E8C239', '#9DAAB3', '#D4865A'];
const MEDALS       = ['🥇', '🥈', '🥉'];
const TOP3_ORDER   = [1, 0, 2]; // display left→right: 2nd · 1st · 3rd

const XP_THRESHOLDS = [0, 100, 200, 500, 1000];
const getLevelFromXp = (xp) =>
  XP_THRESHOLDS.reduce((lvl, threshold, i) => (xp ?? 0) >= threshold ? i + 1 : lvl, 1);

export default function LeaderboardScreen({ navigation }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const { user: authUser } = useAuth();

  useEffect(() => {
    fetchLeaderboard().then(rows => {
      setLeaderboard(rows.map((r, i) => ({
        ...r,
        rank: i + 1,
        score: r.weekly_score ?? 0,
        computedLevel: getLevelFromXp(r.xp),
      })));
    });
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.weekBadge}>
          <Text style={styles.weekText}>This week</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Celebration banner */}
        <View style={styles.celebrationBanner}>
          <Text style={styles.celebrationText}>🎉 Weekly rankings reset Monday midnight</Text>
        </View>

        {/* ── F1-style top-3 cards ─────────────────────────────────────────── */}
        {top3.length >= 3 && (
          <View style={styles.topThreeSection}>
            <Text style={styles.topThreeTitle}>Top Helpers This Week</Text>
            <View style={styles.topThreeRow}>
              {TOP3_ORDER.map(rankIdx => (
                <TopThreeCard
                  key={top3[rankIdx].rank}
                  user={top3[rankIdx]}
                  rankIdx={rankIdx}
                />
              ))}
            </View>
          </View>
        )}

        {/* My rank highlight */}
        {(() => {
          const myEntry = leaderboard.find(r => r.id === authUser?.id);
          if (!myEntry) return null;
          return (
            <View style={styles.myRankBanner}>
              <View style={styles.myRankRow}>
                <View style={styles.myRankLeft}>
                  <Text style={styles.myRankLabel}>Your rank</Text>
                  <Text style={styles.myRankValue}>#{myEntry.rank}</Text>
                </View>
                <View style={styles.myRankRight}>
                  <Text style={styles.myRankScore}>{myEntry.score} pts this week</Text>
                  <Text style={styles.myRankTipText}>Help more neighbours to climb!</Text>
                </View>
              </View>
            </View>
          );
        })()}

        {/* Full leaderboard */}
        <View style={styles.fullList}>
          <Text style={styles.fullListTitle}>Full Rankings</Text>

          {top3.map(user => (
            <LeaderboardRow key={user.rank} user={user} isMe={user.id === authUser?.id} isTop3 />
          ))}

          <View style={styles.listDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Ranks 4–{leaderboard.length}</Text>
            <View style={styles.dividerLine} />
          </View>

          {rest.map(user => (
            <LeaderboardRow key={user.rank} user={user} isMe={user.id === authUser?.id} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── F1-style top-3 card ──────────────────────────────────────────────────────
// rankIdx: 0=1st, 1=2nd, 2=3rd — drives colours, size, and height.
// Display order (2nd · 1st · 3rd) is handled by TOP3_ORDER in the parent.
function TopThreeCard({ user, rankIdx }) {
  const isFirst     = rankIdx === 0;
  const cardH       = isFirst ? 300 : 248;
  const avatarAreaH = isFirst ? 210 : 170;
  const initialsSize = isFirst ? 88 : 70;

  return (
    <View
      style={[
        styles.topCard,
        {
          height: cardH,
          backgroundColor: TOP3_BG[rankIdx],
          borderColor: TOP3_BORDER[rankIdx],
        },
        isFirst && styles.firstCard,
      ]}
    >
      {/* Accent bar across the top edge */}
      <View style={[styles.accentBar, { backgroundColor: TOP3_ACCENT[rankIdx] }]} />

      {/* Large watermark rank number */}
      <Text style={[styles.rankWatermark, { color: TOP3_ACCENT[rankIdx] + '1E' }]}>
        {rankIdx + 1}
      </Text>

      {/* Medal chip — top-left corner, above accent bar */}
      <View style={[styles.medalChip, { backgroundColor: TOP3_ACCENT[rankIdx] + '28', top: 10 }]}>
        <Text style={styles.medalEmoji}>{MEDALS[rankIdx]}</Text>
      </View>

      {/* Avatar stage — edge-to-edge, no padding, clips 3D to card shape */}
      <View style={[styles.avatarStage, { height: avatarAreaH }]}>
        <CardAvatar user={user} stageH={avatarAreaH} initialsSize={initialsSize} />
      </View>

      {/* Footer — name · pts · neighbourhood */}
      <View style={[styles.cardFooter, { borderTopColor: TOP3_BORDER[rankIdx] + '66' }]}>
        <Text style={styles.cardName} numberOfLines={1}>{user.name}</Text>
        <Text style={[styles.cardPts, { color: TOP3_ACCENT[rankIdx] }]}>
          {user.score}{' '}
          <Text style={styles.cardPtsUnit}>pts</Text>
        </Text>
        {user.neighbourhood ? (
          <Text style={styles.cardNeighbourhood} numberOfLines={1}>
            📍 {user.neighbourhood}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Card avatar: 3D model fills the stage edge-to-edge; initials stay circular ─
// stageH is the pixel height of the avatarStage — used to size the GL canvas.
function CardAvatar({ user, stageH, initialsSize }) {
  const [modelState, setModelState] = React.useState('pending'); // pending | ready | failed

  const rawUrl   = getAvatarPublicUrl(user.avatar_storage_path) || user.avatar_url || null;
  const modelUrl = typeof rawUrl === 'string' && rawUrl.startsWith('http') ? rawUrl : null;

  // No URL or confirmed failure → centered initials circle (stays circular).
  if (!modelUrl || modelState === 'failed') {
    return (
      <View style={styles.initialsCenter}>
        <Avatar name={user.name} size={initialsSize} level={user.computedLevel} />
      </View>
    );
  }

  // 3D: absoluteFill within avatarStage — fills the rectangle, no circular clip.
  // Loading placeholder: centered initials circle on top (later in JSX = higher z).
  return (
    <>
      <LeaderboardAvatar3D
        modelUrl={modelUrl}
        style={StyleSheet.absoluteFill}
        size={stageH}
        onReady={() => setModelState('ready')}
        onLoadError={() => setModelState('failed')}
      />
      {modelState !== 'ready' && (
        <View style={[StyleSheet.absoluteFill, styles.initialsCenter]} pointerEvents="none">
          <Avatar name={user.name} size={initialsSize} level={user.computedLevel} />
        </View>
      )}
    </>
  );
}

// ─── Full rankings row (unchanged logic) ──────────────────────────────────────
function LeaderboardRow({ user, isMe, isTop3 }) {
  const rankColor = isTop3 ? TOP3_BORDER[user.rank - 1] : colors.textMuted;

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={[styles.rankCircle, isTop3 && { backgroundColor: rankColor + '33' }]}>
        <Text style={[styles.rankText, isTop3 && { color: rankColor }]}>{user.rank}</Text>
      </View>
      <Avatar name={user.name} size={40} level={user.computedLevel} showBadge />
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

  // ── Header ────────────────────────────────────────────────────────────────────
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
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  weekBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weekText: { ...typography.small, color: colors.primary, fontWeight: '600' },

  container: { paddingBottom: 90 },

  celebrationBanner: {
    backgroundColor: colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  celebrationText: { ...typography.small, color: 'rgba(255,255,255,0.85)' },

  // ── Top-3 cards ───────────────────────────────────────────────────────────────
  topThreeSection: {
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 4,
  },
  topThreeTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  // alignItems:'flex-end' makes all cards share the same bottom edge so the
  // taller #1 card rises higher — natural podium step without platform blocks.
  topThreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  topCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  firstCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 2,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  // Large rank numeral sits in the upper-right, partially clipped by overflow:hidden
  rankWatermark: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 88,
    fontWeight: '900',
    lineHeight: 88,
    letterSpacing: -4,
  },
  medalChip: {
    position: 'absolute',
    left: 7,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 2,
  },
  medalEmoji: { fontSize: 14, lineHeight: 19 },
  // Edge-to-edge avatar area — 3D fills it via absoluteFill; initials are centered
  avatarStage: {
    overflow: 'hidden',
    position: 'relative',
  },
  initialsCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  cardName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  cardPts: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  cardPtsUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textMuted,
  },
  cardNeighbourhood: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // ── My rank banner — compact horizontal layout ────────────────────────────────
  myRankBanner: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  myRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  myRankLeft: {
    alignItems: 'center',
    minWidth: 64,
  },
  myRankRight: {
    flex: 1,
    gap: 3,
  },
  myRankLabel: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  myRankValue: { fontSize: 30, fontWeight: '800', color: colors.primary, lineHeight: 34 },
  myRankScore: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  myRankTipText: { ...typography.caption, color: colors.primary },

  // ── Full rankings list (unchanged) ────────────────────────────────────────────
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
  youBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  youText: { ...typography.caption, color: colors.textWhite, fontWeight: '700' },
  rowNeighbourhood: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  rowScore: { alignItems: 'center' },
  rowScoreValue: { ...typography.h4, color: colors.textPrimary },
  rowScoreLabel: { ...typography.caption, color: colors.textMuted },
});
