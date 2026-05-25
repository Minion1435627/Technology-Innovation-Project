import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import LeaderboardAvatar3D from '../components/LeaderboardAvatar3D';
import { fetchLeaderboardWithFilters, fetchNeighbourhoods, getAvatarPublicUrl } from '../lib/db';
import { useAuth } from '../context/AuthContext';

const TOP3_ACCENT  = ['#C9991A', '#7B8D99', '#B86E40'];
const TOP3_BG      = ['#FFFCEB', '#F4F6F7', '#FFF4EE'];
const TOP3_BORDER  = ['#E8C239', '#9DAAB3', '#D4855A'];
const MEDALS       = ['🥇', '🥈', '🥉'];
const TOP3_ORDER   = [1, 0, 2];

const XP_THRESHOLDS = [0, 100, 200, 500, 1000];
const getLevelFromXp = (xp) =>
  XP_THRESHOLDS.reduce((lvl, threshold, i) => (xp ?? 0) >= threshold ? i + 1 : lvl, 1);

const TIMEFRAME_OPTIONS = [
  { key: 'this_week',     label: 'This Week' },
  { key: 'past_3_weeks',  label: 'Past 3 Weeks' },
  { key: 'this_month',    label: 'This Month' },
  { key: 'last_3_months', label: 'Last 3 Months' },
  { key: 'this_year',     label: 'This Year' },
];

const TASK_CATEGORIES = [
  { key: null,             label: 'All Tasks' },
  { key: 'Physical help',  label: 'Physical Help' },
  { key: 'Borrow an item', label: 'Borrow Items' },
  { key: 'Lend an item',   label: 'Lend Items' },
  { key: 'Share food',     label: 'Share Food' },
  { key: 'Study / Skills', label: 'Study & Skills' },
  { key: 'Offer skills',   label: 'Offer Skills' },
  { key: 'Pet care',       label: 'Pet Care' },
  { key: 'Free item',      label: 'Free Items' },
];

export default function LeaderboardScreen({ navigation }) {
  const [leaderboard, setLeaderboard]   = useState([]);
  const [scoreLabel, setScoreLabel]     = useState('pts');
  const [timeframe, setTimeframe]       = useState('this_week');
  const [suburb, setSuburb]             = useState(null);
  const [category, setCategory]         = useState(null);
  const [suburbs, setSuburbs]           = useState([]);
  const [activeFilter, setActiveFilter] = useState(null); // 'timeframe' | 'suburb' | 'category'
  const { user: authUser } = useAuth();

  useEffect(() => {
    fetchNeighbourhoods().then(setSuburbs);
  }, []);

  useEffect(() => {
    fetchLeaderboardWithFilters({ timeframe, suburb, category }).then(({ data, scoreLabel: sl }) => {
      setScoreLabel(sl);
      setLeaderboard(data.map((r, i) => ({
        ...r,
        rank: i + 1,
        score: r.score ?? 0,
        computedLevel: getLevelFromXp(r.xp),
      })));
    });
  }, [timeframe, suburb, category]);

  const top3 = leaderboard.slice(0, 3);
  const rest  = leaderboard.slice(3);

  const timeframeLabel = TIMEFRAME_OPTIONS.find(t => t.key === timeframe)?.label ?? 'This Week';
  const categoryLabel  = TASK_CATEGORIES.find(c => c.key === category)?.label ?? 'All Tasks';
  const sectionTitle   = category
    ? `${categoryLabel} · ${timeframeLabel}`
    : `Top Helpers · ${timeframeLabel}`;

  const filterModalOptions = (() => {
    if (activeFilter === 'timeframe') return TIMEFRAME_OPTIONS;
    if (activeFilter === 'suburb')    return [{ key: null, label: 'All Areas' }, ...suburbs.map(s => ({ key: s, label: s }))];
    if (activeFilter === 'category')  return TASK_CATEGORIES;
    return [];
  })();

  const activeFilterValue = activeFilter === 'timeframe' ? timeframe
    : activeFilter === 'suburb'   ? suburb
    : activeFilter === 'category' ? category
    : null;

  const onSelectFilterOption = (key) => {
    if (activeFilter === 'timeframe') setTimeframe(key);
    else if (activeFilter === 'suburb')   setSuburb(key);
    else if (activeFilter === 'category') setCategory(key);
    setActiveFilter(null);
  };

  const filterModalTitle = activeFilter === 'timeframe' ? 'Time Period'
    : activeFilter === 'suburb'   ? 'Area / Suburb'
    : 'Task Category';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBarScroll}
        contentContainerStyle={styles.filterBarContent}
      >
        <FilterPill
          label={timeframeLabel}
          active={timeframe !== 'this_week'}
          onPress={() => setActiveFilter('timeframe')}
        />
        <FilterPill
          label={suburb ?? 'All Areas'}
          active={!!suburb}
          onPress={() => setActiveFilter('suburb')}
        />
        <FilterPill
          label={categoryLabel}
          active={!!category}
          onPress={() => setActiveFilter('category')}
        />
      </ScrollView>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Weekly reset banner — only for default this_week */}
        {timeframe === 'this_week' && (
          <View style={styles.celebrationBanner}>
            <Text style={styles.celebrationText}>🎉 Weekly rankings reset Monday midnight</Text>
          </View>
        )}

        {/* ── F1-style top-3 cards ────────────────────────────────────── */}
        {top3.length >= 3 && (
          <View style={styles.topThreeSection}>
            <Text style={styles.topThreeTitle}>{sectionTitle}</Text>
            <View style={styles.topThreeRow}>
              {TOP3_ORDER.map(rankIdx => (
                <TopThreeCard
                  key={top3[rankIdx].rank}
                  user={top3[rankIdx]}
                  rankIdx={rankIdx}
                  scoreLabel={scoreLabel}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── My rank highlight ───────────────────────────────────────── */}
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
                  <Text style={styles.myRankScore}>
                    {myEntry.score} {scoreLabel} · {timeframeLabel}
                  </Text>
                  <Text style={styles.myRankTipText}>Help more neighbours to climb!</Text>
                </View>
              </View>
            </View>
          );
        })()}

        {/* ── Full rankings ───────────────────────────────────────────── */}
        <View style={styles.fullList}>
          <Text style={styles.fullListTitle}>Full Rankings</Text>
          {top3.map(user => (
            <LeaderboardRow key={user.rank} user={user} isMe={user.id === authUser?.id} isTop3 scoreLabel={scoreLabel} />
          ))}
          {rest.length > 0 && (
            <View style={styles.listDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Ranks 4–{leaderboard.length}</Text>
              <View style={styles.dividerLine} />
            </View>
          )}
          {rest.map(user => (
            <LeaderboardRow key={user.rank} user={user} isMe={user.id === authUser?.id} scoreLabel={scoreLabel} />
          ))}
        </View>

      </ScrollView>

      {/* ── Filter picker modal ─────────────────────────────────────────── */}
      <Modal
        visible={!!activeFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveFilter(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveFilter(null)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{filterModalTitle}</Text>
            {filterModalOptions.map(opt => (
              <TouchableOpacity
                key={String(opt.key)}
                style={[styles.modalOption, activeFilterValue === opt.key && styles.modalOptionActive]}
                onPress={() => onSelectFilterOption(opt.key)}
              >
                <Text style={[styles.modalOptionText, activeFilterValue === opt.key && styles.modalOptionTextActive]}>
                  {opt.label}
                </Text>
                {activeFilterValue === opt.key && <Text style={styles.modalCheckmark}>✓</Text>}
              </TouchableOpacity>
            ))}
            <View style={styles.modalBottomPad} />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Filter pill ──────────────────────────────────────────────────────────────
function FilterPill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.filterPill, active && styles.filterPillActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]} numberOfLines={1}>
        {label} ▾
      </Text>
    </TouchableOpacity>
  );
}

// ─── F1-style top-3 card ──────────────────────────────────────────────────────
function TopThreeCard({ user, rankIdx, scoreLabel }) {
  const isFirst      = rankIdx === 0;
  const cardH        = isFirst ? 300 : 248;
  const avatarAreaH  = isFirst ? 210 : 170;
  const initialsSize = isFirst ? 88 : 70;

  return (
    <View
      style={[
        styles.topCard,
        { height: cardH, backgroundColor: TOP3_BG[rankIdx], borderColor: TOP3_BORDER[rankIdx] },
        isFirst && styles.firstCard,
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: TOP3_ACCENT[rankIdx] }]} />
      <Text style={[styles.rankWatermark, { color: TOP3_ACCENT[rankIdx] + '1E' }]}>
        {rankIdx + 1}
      </Text>
      <View style={[styles.medalChip, { backgroundColor: TOP3_ACCENT[rankIdx] + '28', top: 10 }]}>
        <Text style={styles.medalEmoji}>{MEDALS[rankIdx]}</Text>
      </View>
      <View style={[styles.avatarStage, { height: avatarAreaH }]}>
        <CardAvatar user={user} stageH={avatarAreaH} initialsSize={initialsSize} />
      </View>
      <View style={[styles.cardFooter, { borderTopColor: TOP3_BORDER[rankIdx] + '66' }]}>
        <Text style={styles.cardName} numberOfLines={1}>{user.name}</Text>
        <Text style={[styles.cardPts, { color: TOP3_ACCENT[rankIdx] }]}>
          {user.score}{' '}
          <Text style={styles.cardPtsUnit}>{scoreLabel}</Text>
        </Text>
        {user.neighbourhood ? (
          <Text style={styles.cardNeighbourhood} numberOfLines={1}>📍 {user.neighbourhood}</Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Card avatar ──────────────────────────────────────────────────────────────
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

// ─── Full rankings row ────────────────────────────────────────────────────────
function LeaderboardRow({ user, isMe, isTop3, scoreLabel }) {
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
        <Text style={styles.rowScoreLabel}>{scoreLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.textPrimary },

  // ── Filter bar ────────────────────────────────────────────────────────────
  filterBarScroll: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterBarContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterPillText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: colors.primary,
  },

  container: { paddingBottom: 90 },

  celebrationBanner: {
    backgroundColor: colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  celebrationText: { ...typography.small, color: 'rgba(255,255,255,0.85)' },

  // ── Top-3 cards ───────────────────────────────────────────────────────────
  topThreeSection: { paddingHorizontal: 8, paddingTop: 18, paddingBottom: 4 },
  topThreeTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  topThreeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  topCard: { flex: 1, borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
  firstCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 2,
  },
  accentBar: { height: 3, width: '100%' },
  rankWatermark: {
    position: 'absolute', top: -6, right: -6,
    fontSize: 88, fontWeight: '900', lineHeight: 88, letterSpacing: -4,
  },
  medalChip: {
    position: 'absolute', left: 7, borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2, zIndex: 2,
  },
  medalEmoji: { fontSize: 14, lineHeight: 19 },
  avatarStage: { overflow: 'hidden', position: 'relative' },
  initialsCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardFooter: {
    borderTopWidth: 1, paddingHorizontal: 7, paddingVertical: 6,
    alignItems: 'center', justifyContent: 'center', gap: 1,
  },
  cardName: {
    fontSize: 12, fontWeight: '700', color: colors.textPrimary,
    textAlign: 'center', letterSpacing: 0.1,
  },
  cardPts: { fontSize: 15, fontWeight: '800', textAlign: 'center', letterSpacing: 0.2 },
  cardPtsUnit: { fontSize: 10, fontWeight: '400', color: colors.textMuted },
  cardNeighbourhood: { fontSize: 9, color: colors.textMuted, textAlign: 'center' },

  // ── My rank banner ────────────────────────────────────────────────────────
  myRankBanner: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: 12, marginVertical: 10,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  myRankRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  myRankLeft: { alignItems: 'center', minWidth: 64 },
  myRankRight: { flex: 1, gap: 3 },
  myRankLabel: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  myRankValue: { fontSize: 30, fontWeight: '800', color: colors.primary, lineHeight: 34 },
  myRankScore: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  myRankTipText: { ...typography.caption, color: colors.primary },

  // ── Full rankings list ────────────────────────────────────────────────────
  fullList: {
    backgroundColor: colors.card, borderRadius: 20,
    marginHorizontal: 16, overflow: 'hidden',
  },
  fullListTitle: {
    ...typography.h4, color: colors.textPrimary,
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  listDivider: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { ...typography.caption, color: colors.textMuted },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingHorizontal: 16, gap: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowMe: { backgroundColor: colors.primaryLight },
  rankCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
  },
  rankText: { ...typography.smallBold, color: colors.textMuted },
  rowInfo: { flex: 1 },
  rowNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowName: { ...typography.bodyBold, color: colors.textPrimary },
  rowNameMe: { color: colors.primary },
  youBadge: {
    backgroundColor: colors.primary, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  youText: { ...typography.caption, color: colors.textWhite, fontWeight: '700' },
  rowNeighbourhood: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  rowScore: { alignItems: 'center' },
  rowScoreValue: { ...typography.h4, color: colors.textPrimary },
  rowScoreLabel: { ...typography.caption, color: colors.textMuted },

  // ── Filter modal ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, paddingHorizontal: 16,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12,
  },
  modalTitle: {
    ...typography.h4, color: colors.textPrimary,
    marginBottom: 8, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalOptionActive: { backgroundColor: colors.primaryLight, marginHorizontal: -16, paddingHorizontal: 16 },
  modalOptionText: { ...typography.body, color: colors.textPrimary },
  modalOptionTextActive: { color: colors.primary, fontWeight: '700' },
  modalCheckmark: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  modalBottomPad: { height: 36 },
});
