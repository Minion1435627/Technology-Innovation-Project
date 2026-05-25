import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import LeaderboardAvatar3D from '../components/LeaderboardAvatar3D';
import { fetchLeaderboard, getAvatarPublicUrl } from '../lib/db';
import { useAuth } from '../context/AuthContext';

// ─── Top-3 card palette — dark gold / silver / bronze tints ──────────────────
const TOP3_ACCENT = ['#C9991A', '#7B8D99', '#B86E40'];
const TOP3_BG     = ['#1C1A0A', '#10131C', '#1C120A'];
const TOP3_BORDER = ['#7A5F10', '#4A5A68', '#7A4420'];
const MEDALS      = ['🥇', '🥈', '🥉'];
const TOP3_ORDER  = [1, 0, 2]; // display left→right: 2nd · 1st · 3rd

// ─── Suburb filter options ────────────────────────────────────────────────────
const PRESET_SUBURBS = ['Brunswick', 'Carlton', 'Docklands', 'Parkville', 'North Melbourne'];

// ─── Time frame filter options ────────────────────────────────────────────────
// TODO: Time-frame filtering beyond "This week" requires historical score data.
// The DB currently only stores weekly_score (the current week's total).
// To support "This month" / "Last 3 months" / "All time", the backend would need:
//   - A weekly_score_history or monthly_score table, OR
//   - An aggregate on completed exchanges grouped by time window.
// For now, all time options show the current weekly data with a note.
const TIME_FRAMES = [
  { key: 'week',   label: 'This week' },
  { key: 'month',  label: 'This month' },
  { key: '3month', label: 'Last 3 months' },
  { key: 'all',    label: 'All time' },
];

const XP_THRESHOLDS = [0, 100, 200, 500, 1000];
const getLevelFromXp = (xp) =>
  XP_THRESHOLDS.reduce((lvl, threshold, i) => (xp ?? 0) >= threshold ? i + 1 : lvl, 1);

// ─── Score bar color by rank ──────────────────────────────────────────────────
function getBarColor(rank) {
  if (rank === 1) return '#70C894';
  if (rank === 2) return '#5ABCB0';
  if (rank === 3) return '#8CAE6F';
  if (rank <= 6)  return '#4A8F6A';
  if (rank <= 10) return '#376B52';
  return '#274D3C';
}

export default function LeaderboardScreen({ navigation }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [suburbFilter, setSuburbFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('week');
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

  // Derive suburb options from live data + presets
  const suburbOptions = useMemo(() => {
    const fromData = leaderboard
      .map(r => r.neighbourhood)
      .filter(n => n && !PRESET_SUBURBS.includes(n));
    return ['All', ...PRESET_SUBURBS, ...new Set(fromData)];
  }, [leaderboard]);

  // Apply suburb filter
  const filtered = useMemo(() => {
    if (suburbFilter === 'All') return leaderboard;
    return leaderboard.filter(r => r.neighbourhood === suburbFilter);
  }, [leaderboard, suburbFilter]);

  const top3    = filtered.slice(0, 3);
  const rest    = filtered.slice(3);
  const maxScore = filtered[0]?.score ?? 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.weekBadge}>
          <Text style={styles.weekText}>Weekly</Text>
        </View>
      </View>

      {/* ── Suburb filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}
      >
        {suburbOptions.map(suburb => (
          <TouchableOpacity
            key={suburb}
            style={[styles.filterChip, suburbFilter === suburb && styles.filterChipActive]}
            onPress={() => setSuburbFilter(suburb)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, suburbFilter === suburb && styles.filterChipTextActive]}>
              {suburb}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Time frame filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}
      >
        {TIME_FRAMES.map(tf => (
          <TouchableOpacity
            key={tf.key}
            style={[styles.filterChip, timeFilter === tf.key && styles.filterChipActive]}
            onPress={() => setTimeFilter(tf.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, timeFilter === tf.key && styles.filterChipTextActive]}>
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}
        {timeFilter !== 'week' && (
          <Text style={styles.filterNote}>Showing weekly data</Text>
        )}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.container}>

        {/* ── F1-style top-3 cards ─────────────────────────────────────────── */}
        {top3.length >= 3 && (
          <View style={styles.topThreeSection}>
            <Text style={styles.topThreeTitle}>Top Helpers</Text>
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
          const myEntry = filtered.find(r => r.id === authUser?.id)
            ?? leaderboard.find(r => r.id === authUser?.id);
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
            <LeaderboardRow key={user.rank} user={user} isMe={user.id === authUser?.id} isTop3 maxScore={maxScore} />
          ))}

          {rest.length > 0 && (
            <View style={styles.listDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Ranks 4–{filtered.length}</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {rest.map(user => (
            <LeaderboardRow key={user.rank} user={user} isMe={user.id === authUser?.id} maxScore={maxScore} />
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No results for "{suburbFilter}"</Text>
              <TouchableOpacity onPress={() => setSuburbFilter('All')}>
                <Text style={styles.emptyReset}>Show all suburbs</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── F1-style top-3 card ──────────────────────────────────────────────────────
function TopThreeCard({ user, rankIdx }) {
  const isFirst      = rankIdx === 0;
  const cardH        = isFirst ? 300 : 248;
  const avatarAreaH  = isFirst ? 210 : 170;
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

      {/* Medal chip */}
      <View style={[styles.medalChip, { backgroundColor: TOP3_ACCENT[rankIdx] + '28', top: 10 }]}>
        <Text style={styles.medalEmoji}>{MEDALS[rankIdx]}</Text>
      </View>

      {/* Avatar stage — edge-to-edge, clips 3D to card shape */}
      <View style={[styles.avatarStage, { height: avatarAreaH }]}>
        <CardAvatar user={user} stageH={avatarAreaH} initialsSize={initialsSize} />
      </View>

      {/* Footer */}
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

// ─── Card avatar: 3D fills stage edge-to-edge; initials stay circular ─────────
function CardAvatar({ user, stageH, initialsSize }) {
  const [modelState, setModelState] = React.useState('pending');

  const rawUrl   = getAvatarPublicUrl(user.avatar_storage_path) || user.avatar_url || null;
  const modelUrl = typeof rawUrl === 'string' && rawUrl.startsWith('http') ? rawUrl : null;

  if (!modelUrl || modelState === 'failed') {
    return (
      <View style={styles.initialsCenter}>
        <Avatar name={user.name} size={initialsSize} level={user.computedLevel} />
      </View>
    );
  }

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

// ─── Full rankings row with gradient score bar ────────────────────────────────
function LeaderboardRow({ user, isMe, isTop3, maxScore }) {
  const rankColor = isTop3 ? TOP3_BORDER[user.rank - 1] : colors.textMuted;
  const barPct    = maxScore > 0 ? Math.min(100, (user.score / maxScore) * 100) : 0;
  const barColor  = getBarColor(user.rank);

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={[styles.rankCircle, isTop3 && { backgroundColor: rankColor + '33' }]}>
        <Text style={[styles.rankText, isTop3 && { color: rankColor }]}>{user.rank}</Text>
      </View>
      <Avatar name={user.name} size={40} level={user.computedLevel} showBadge />
      <View style={styles.rowInfo}>
        <View style={styles.rowNameRow}>
          <Text style={[styles.rowName, isMe && styles.rowNameMe]} numberOfLines={1}>
            {user.name}
          </Text>
          {isMe && <View style={styles.youBadge}><Text style={styles.youText}>You</Text></View>}
        </View>
        <Text style={styles.rowNeighbourhood} numberOfLines={1}>
          📍 {user.neighbourhood} · ⭐ {user.stars}
        </Text>
        {/* Gradient score bar */}
        <View style={styles.barRow}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${barPct}%`, backgroundColor: barColor }]} />
          </View>
          <Text style={[styles.barScore, { color: barColor }]}>
            {user.score}<Text style={styles.barScoreUnit}> pts</Text>
          </Text>
        </View>
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
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  weekText: { ...typography.small, color: colors.primary, fontWeight: '600' },

  // ── Filter rows ───────────────────────────────────────────────────────────────
  filterRow: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 44,
  },
  filterRowContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: '#0E1117', fontWeight: '700' },
  filterNote: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginLeft: 4,
  },

  container: { paddingBottom: 90 },

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
    shadowColor: '#C9991A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 2,
  },
  accentBar: { height: 3, width: '100%' },
  rankWatermark: {
    position: 'absolute',
    top: -6, right: -6,
    fontSize: 88, fontWeight: '900', lineHeight: 88, letterSpacing: -4,
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
  avatarStage: { overflow: 'hidden', position: 'relative' },
  initialsCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  cardName: {
    fontSize: 12, fontWeight: '700',
    color: colors.textPrimary, textAlign: 'center', letterSpacing: 0.1,
  },
  cardPts: { fontSize: 15, fontWeight: '800', textAlign: 'center', letterSpacing: 0.2 },
  cardPtsUnit: { fontSize: 10, fontWeight: '400', color: colors.textMuted },
  cardNeighbourhood: { fontSize: 9, color: colors.textMuted, textAlign: 'center' },

  // ── My rank banner ────────────────────────────────────────────────────────────
  myRankBanner: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.primary + '60',
  },
  myRankRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  myRankLeft: { alignItems: 'center', minWidth: 64 },
  myRankRight: { flex: 1, gap: 3 },
  myRankLabel: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  myRankValue: { fontSize: 30, fontWeight: '800', color: colors.primary, lineHeight: 34 },
  myRankScore: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  myRankTipText: { ...typography.caption, color: colors.textMuted },

  // ── Full rankings list ────────────────────────────────────────────────────────
  fullList: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
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

  // ── Row ───────────────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMe: { backgroundColor: colors.primaryLight },
  rankCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { ...typography.smallBold, color: colors.textMuted },
  rowInfo: { flex: 1, gap: 2 },
  rowNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowName: { ...typography.bodyBold, color: colors.textPrimary, flex: 1 },
  rowNameMe: { color: colors.primary },
  youBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1,
  },
  youText: { ...typography.caption, color: '#0E1117', fontWeight: '700' },
  rowNeighbourhood: { ...typography.caption, color: colors.textMuted },

  // ── Gradient score bar ────────────────────────────────────────────────────────
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  barTrack: {
    flex: 1, height: 5, borderRadius: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  barScore: { fontSize: 13, fontWeight: '800', minWidth: 42, textAlign: 'right' },
  barScoreUnit: { fontSize: 10, fontWeight: '400', color: colors.textMuted },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { ...typography.body, color: colors.textMuted },
  emptyReset: { ...typography.small, color: colors.primary, fontWeight: '600' },
});
