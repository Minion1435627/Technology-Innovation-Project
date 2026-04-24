import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, ActivityIndicator, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import Avatar3DViewer from '../components/Avatar3DViewer';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserReviews, fetchTransactions, fetchLeaderboard, fetchUserAchievements } from '../lib/db';
import { usePosts } from '../context/PostsContext';
import { useFriends } from '../context/FriendsContext';
import { useChats } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { animateAvatarFromTask, generateAvatarFromImage } from '../services/tripoApi';

const GEN_STATE = { IDLE: 'idle', UPLOADING: 'uploading', GENERATING: 'generating', DONE: 'done', ERROR: 'error' };

const LEVEL_NAMES  = ['Newcomer', 'Helper', 'Trusted Neighbour', 'Community Pillar', 'Legend'];
const LEVEL_EMOJIS = ['🌱', '⭐', '🏅', '💎', '👑'];

const XP_LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 200 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
];

const ROTATION_STEP = 45;
const DEFAULT_MODEL_ROTATION = 90;
const ANIMATION_OPTIONS = [
  { label: 'Idle', value: 'preset:idle' },
  { label: 'Turn', value: 'preset:turn' },
  { label: 'Walk', value: 'preset:walk' },
  { label: 'Run', value: 'preset:run' },
  { label: 'Jump', value: 'preset:jump' },
];

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

const getLevelFromXp = (xp) =>
  XP_LEVELS.reduce((lvl, rule) => (xp ?? 0) >= rule.xp ? rule.level : lvl, 1);
const getXpNext = (level) => XP_LEVELS.find(r => r.level === level + 1)?.xp ?? null;

const ACHIEVEMENT_DEFS = [
  { key: 'tool_lender',     emoji: '🔧', label: 'Tool Lender',    desc: '5+ tools lent'      },
  { key: 'food_sharer',     emoji: '🍱', label: 'Food Sharer',    desc: '3+ food shared'     },
  { key: 'fast_responder',  emoji: '⚡', label: 'Fast Responder', desc: 'Avg reply < 5 min'  },
  { key: 'reliable',        emoji: '💯', label: 'Reliable',       desc: '10+ 5-star reviews' },
  { key: 'community_hero',  emoji: '🦸', label: 'Community Hero', desc: 'Reach Level 5'      },
];

const STATUS_COLOR = {
  pending:     '#f59f00',
  in_progress: '#1c7ed6',
  overdue:     '#e03131',
  disputed:    '#9c36b5',
};
const STATUS_LABEL = {
  pending:     'Pending',
  in_progress: 'In Progress',
  overdue:     'Overdue',
  disputed:    'Disputed',
};

function formatDue(tx) {
  const due = new Date(tx.agreedReturnDate);
  const now = new Date();
  const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    const n = Math.abs(diffDays);
    return `${n} day${n === 1 ? '' : 's'} late`;
  }
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
}

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [weeklyRank, setWeeklyRank] = useState(null);
  const [unlockedKeys, setUnlockedKeys] = useState([]);
  const [genState, setGenState] = useState(GEN_STATE.IDLE);
  const [genProgress, setGenProgress] = useState(0);
  const [genError, setGenError] = useState('');
  const [modelRotation, setModelRotation] = useState(DEFAULT_MODEL_ROTATION);
  const [animateState, setAnimateState] = useState('idle');
  const [animateLabel, setAnimateLabel] = useState('');
  const [selectedAnimation, setSelectedAnimation] = useState('preset:idle');
  const { posts, removePost } = usePosts();
  const { friends } = useFriends();
  const { chats } = useChats();
  const { profile, user: authUser, patchProfile } = useAuth();
  const user = profile;

  useEffect(() => {
    if (!authUser?.id) return;
    fetchUserReviews(authUser.id).then(rows => {
      setReviews(rows.map(r => ({
        id: r.id,
        reviewer: r.reviewer?.name ?? 'Anonymous',
        stars: r.stars,
        date: new Date(r.created_at).toLocaleDateString(),
        comment: r.comment ?? '',
        tags: (r.review_selected_tags ?? []).map(t => t.review_tags?.label).filter(Boolean),
      })));
    });
    fetchTransactions(authUser.id).then(rows => {
      setTransactions(rows.map(t => ({
        ...t,
        item: t.item ?? '',
        agreedReturnDate: t.agreed_return_date ?? t.agreedReturnDate,
        myRole: t.provider_id === authUser.id ? 'provider' : 'requester',
      })));
    });
    fetchLeaderboard().then(rows => {
      const idx = rows.findIndex(r => r.id === authUser.id);
      if (idx !== -1) setWeeklyRank(idx + 1);
    });
    fetchUserAchievements(authUser.id).then(rows => {
      setUnlockedKeys(rows.map(r => r.achievement_key));
    });

  }, [authUser?.id]);

  const computedLevel = user ? getLevelFromXp(user.xp) : 1;
  const xpNext        = getXpNext(computedLevel);
  const xpPercent     = user ? (xpNext ? Math.min(100, (user.xp / xpNext) * 100) : 100) : 0;
  const activeExchanges    = transactions.filter(t => t.status !== 'completed');
  const completedExchanges = transactions.filter(t => t.status === 'completed');
  const completedTitles    = new Set(completedExchanges.map(t => t.item?.toLowerCase().trim()));
  const isCompletedPost    = (p) => completedTitles.has(p.title?.toLowerCase().trim());
  const myNeeds    = user ? posts.filter(p => (p.poster?.id === user.id || p.user_id === user.id) && p.type === 'need'   && !isCompletedPost(p)) : [];
  const mySupplies = user ? posts.filter(p => (p.poster?.id === user.id || p.user_id === user.id) && p.type === 'supply' && !isCompletedPost(p)) : [];
  const computedRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.stars, 0) / reviews.length) * 10) / 10
    : (user?.stars ?? 0);

  const scrollRef    = useRef(null);
  const tabSectionY  = useRef(0);

  if (!user) return null;

  const scrollTo = (y) => scrollRef.current?.scrollTo({ y, animated: true });

  const handleDelete = (post) => {
    Alert.alert('Delete Post', `Remove "${post.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removePost(post.id) },
    ]);
  };

  const goTab = (key) => {
    setActiveTab(key);
    setTimeout(() => scrollTo(tabSectionY.current - 8), 50);
  };

  const QUICK_ACTIONS = [
    { id: 'needs',   label: 'My Needs',  icon: 'help-circle',  color: colors.need,           onPress: () => goTab('needs') },
    { id: 'supply',  label: 'My Supply', icon: 'gift',         color: colors.supply,         onPress: () => goTab('supply') },
    { id: 'history', label: 'History',   icon: 'time-outline', color: colors.textSecondary,
      onPress: () => Alert.alert('History', `${completedExchanges.length} completed exchange${completedExchanges.length === 1 ? '' : 's'} so far.`) },
  ];

  const xpRemaining = xpNext ? Math.max(0, xpNext - user.xp) : 0;
  const xpHint      = xpNext
    ? `Help ${Math.max(1, Math.ceil(xpRemaining / 100))} more neighbour${xpRemaining > 100 ? 's' : ''} to reach Level ${computedLevel + 1}`
    : 'You have reached the highest level!';

  const rotationStartRef = useRef(modelRotation);
  const avatarPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 3,
      onPanResponderGrant: () => {
        rotationStartRef.current = modelRotation;
      },
      onPanResponderMove: (_, gestureState) => {
        const nextRotation = normalizeDegrees(rotationStartRef.current + gestureState.dx * 0.7);
        setModelRotation(nextRotation);
      },
    })
  ).current;

  const rotateByStep = (delta) => {
    setModelRotation((current) => normalizeDegrees(current + delta));
  };

  const isGenerating = genState === GEN_STATE.UPLOADING || genState === GEN_STATE.GENERATING;

  const pickAndGenerate = async () => {
    if (isGenerating) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access to upload a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setGenState(GEN_STATE.UPLOADING);
    setGenProgress(0);
    setGenError('');

    try {
      const gen = await generateAvatarFromImage(uri, (pct, status) => {
        setGenProgress(pct);
        if (status === 'running') setGenState(GEN_STATE.GENERATING);
      });
      setGenState(GEN_STATE.DONE);
      await patchProfile({
        avatar_url: gen.modelUrl,
        avatar_image_url: gen.renderedImageUrl,
        avatar_task_id: gen.taskId,
      });
    } catch (err) {
      setGenError(err.message ?? 'Generation failed. Please try again.');
      setGenState(GEN_STATE.ERROR);
    }
  };

  const handleAnimateAvatar = async () => {
    if (animateState === 'running') return;
    if (!user.avatar_task_id) {
      Alert.alert('Animation unavailable', 'This avatar needs to be generated again before motion can be added.');
      return;
    }

    try {
      setAnimateState('running');
      setAnimateLabel('Checking avatar...');

      const result = await animateAvatarFromTask(user.avatar_task_id, selectedAnimation, ({ step, pct }) => {
        setAnimateLabel(`${step}${typeof pct === 'number' ? ` ${pct}%` : ''}`);
      });

      await patchProfile({
        avatar_url: result.modelUrl,
        avatar_image_url: result.renderedImageUrl ?? user.avatar_image_url,
      });

      setAnimateState('idle');
      setAnimateLabel('');
      const selectedLabel = ANIMATION_OPTIONS.find(option => option.value === selectedAnimation)?.label ?? 'Selected';
      Alert.alert('Animation ready', `${selectedLabel} motion is now applied to your avatar.`);
    } catch (err) {
      setAnimateState('error');
      setAnimateLabel('');
      Alert.alert('Animation unavailable', err.message ?? 'We could not add movement to this avatar.');
    }
  };

  const openOwnPostDetail = (post) => {
    navigation.navigate('PostDetail', {
      post: {
        ...post,
        typeLabel: post.type === 'need' ? 'Need' : post.type === 'supply' ? 'Supply' : 'Post',
        ownerName: user.name,
        ownerId: user.id,
        ownerStars: user.stars,
        ownerGender: user.gender,
        exchangeSummary: 'Manage this post, review responses, or continue the exchange flow from chat.',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Top header ---------- */}
        <View style={styles.topActions}>
          <Text style={styles.pageTitle}>Profile</Text>
          <View style={styles.topRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------- Profile card ---------- */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <Avatar name={user.name} size={84} level={computedLevel} showBadge imageUri={user.avatar_image_url ?? null} />
            <View style={styles.identity}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                {user.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userMeta} numberOfLines={1}>
                {user.neighbourhood} · Joined {user.join_date ?? ''}
              </Text>
              {!!user.bio && (
                <Text style={styles.userBio} numberOfLines={2}>“{user.bio}”</Text>
              )}
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={15} color={colors.textWhite} />
              <Text style={styles.actionBtnPrimaryText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGhost]}
              onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
            >
              <Ionicons name="eye-outline" size={15} color={colors.primary} />
              <Text style={styles.actionBtnGhostText}>View Public Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------- 3D Avatar ---------- */}
        <View style={styles.avatarBannerWrap} {...avatarPanResponder.panHandlers}>
          {user.avatar_url && genState === GEN_STATE.IDLE ? (
            <Avatar3DViewer
              modelUrl={user.avatar_url}
              rotation={modelRotation}
              style={styles.avatarBanner}
            />
          ) : isGenerating ? (
            <View style={[styles.avatarBanner, styles.avatarBannerCenter]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.avatarBannerText}>
                {genState === GEN_STATE.UPLOADING
                  ? 'Uploading photo…'
                  : `Generating 3D avatar… ${genProgress}%`}
              </Text>
              <View style={styles.avatarProgressBar}>
                <View style={[styles.avatarProgressFill, { width: `${genProgress}%` }]} />
              </View>
            </View>
          ) : genState === GEN_STATE.ERROR ? (
            <TouchableOpacity
              style={[styles.avatarBanner, styles.avatarBannerCenter]}
              onPress={pickAndGenerate}
              activeOpacity={0.75}
            >
              <Ionicons name="warning-outline" size={40} color={colors.error} />
              <Text style={[styles.avatarBannerText, { color: colors.error }]}>Generation failed</Text>
              <Text style={styles.avatarBannerSub}>{genError}</Text>
              <Text style={[styles.avatarBannerSub, { color: colors.primary, marginTop: 6 }]}>Tap to retry</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.avatarBanner, styles.avatarBannerCenter]}
              onPress={pickAndGenerate}
              activeOpacity={0.75}
            >
              <View style={styles.avatarBannerIcon}>
                <Ionicons name="person-outline" size={40} color={colors.textMuted} />
              </View>
              <Text style={styles.avatarBannerText}>Create 3D Avatar</Text>
              <Text style={styles.avatarBannerSub}>Tap to upload a photo and generate your avatar</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.avatarHint}>Drag the avatar or use the arrows to turn left and right.</Text>

        {/* Rotation controls + change button — shown only when avatar exists */}
        {user.avatar_url && genState === GEN_STATE.IDLE && (
          <View style={styles.avatarControls}>
            <View style={styles.rotationButtons}>
              <TouchableOpacity
                style={styles.rotateBtn}
                onPress={() => rotateByStep(-ROTATION_STEP)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.rotateBtnHint}>{Math.round(normalizeDegrees(modelRotation))}°</Text>
              <TouchableOpacity
                style={styles.rotateBtn}
                onPress={() => rotateByStep(ROTATION_STEP)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.motionLabel}>Choose a motion</Text>
            <View style={styles.animationPicker}>
              {ANIMATION_OPTIONS.map((option) => {
                const selected = selectedAnimation === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.animationChip, selected && styles.animationChipActive]}
                    onPress={() => setSelectedAnimation(option.value)}
                    disabled={animateState === 'running'}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.animationChipText, selected && styles.animationChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.avatarActionRow}>
              <TouchableOpacity
                style={[styles.avatarChangePill, animateState === 'running' && styles.avatarActionDisabled]}
                onPress={handleAnimateAvatar}
                disabled={animateState === 'running'}
              >
                <Ionicons name="walk-outline" size={15} color={colors.textSecondary} />
                <Text style={styles.avatarChangePillText}>
                  {animateState === 'running' ? (animateLabel || 'Adding motion...') : 'Add Motion'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarChangePill} onPress={pickAndGenerate}>
                <Ionicons name="camera-outline" size={15} color={colors.textSecondary} />
                <Text style={styles.avatarChangePillText}>Change Avatar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ---------- Stats strip ---------- */}
        <View style={styles.statsStrip}>
          <TouchableOpacity style={styles.statBox} onPress={() => goTab('reviews')} activeOpacity={0.75}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{computedRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
            <Ionicons name="chevron-forward" size={10} color={colors.textMuted} style={styles.statChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => goTab('reviews')} activeOpacity={0.75}>
            <Text style={styles.statEmoji}>🧾</Text>
            <Text style={styles.statValue}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
            <Ionicons name="chevron-forward" size={10} color={colors.textMuted} style={styles.statChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Leaderboard')} activeOpacity={0.75}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>#{weeklyRank ?? '-'}</Text>
            <Text style={styles.statLabel}>This week</Text>
            <Ionicons name="chevron-forward" size={10} color={colors.textMuted} style={styles.statChevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => goTab('friends')} activeOpacity={0.75}>
            <Text style={styles.statEmoji}>🤝</Text>
            <Text style={styles.statValue}>{friends.length}</Text>
            <Text style={styles.statLabel}>Friends</Text>
            <Ionicons name="chevron-forward" size={10} color={colors.textMuted} style={styles.statChevron} />
          </TouchableOpacity>
        </View>

        {/* ---------- Level card ---------- */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelEmoji}>{LEVEL_EMOJIS[computedLevel - 1]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelName}>
                Level {computedLevel} — {LEVEL_NAMES[computedLevel - 1]}
              </Text>
              <Text style={styles.levelXP}>
                {user.xp} / {xpNext ?? '—'} XP
              </Text>
            </View>
            <Text style={styles.levelPercent}>{Math.round(xpPercent)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${xpPercent}%` }]} />
          </View>
          <View style={styles.levelTip}>
            <Text style={styles.levelTipText}>💡 {xpHint}</Text>
          </View>
          <TouchableOpacity
            style={styles.tasksBtn}
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.8}
          >
            <Ionicons name="flash-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.tasksBtnText}>View Daily & Weekly Tasks</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* ---------- Active Exchanges ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Exchanges</Text>
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => Alert.alert(
                'Exchange History',
                `You have completed ${completedExchanges.length} exchange${completedExchanges.length === 1 ? '' : 's'} so far.`
              )}
            >
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {activeExchanges.length === 0 ? (
            <View style={styles.emptyMini}>
              <Text style={styles.emptyMiniText}>No active exchanges right now.</Text>
            </View>
          ) : activeExchanges.map(tx => {
            const counterparty = tx.myRole === 'requester' ? tx.provider : tx.requester;
            const direction    = tx.myRole === 'requester' ? 'From' : 'To';
            return (
              <TouchableOpacity
                key={tx.id}
                style={[styles.txCard, tx.status === 'overdue' && styles.txCardOverdue]}
                onPress={() => navigation.navigate('Transaction', { transaction: tx })}
              >
                <View style={[styles.txStatusDot, { backgroundColor: STATUS_COLOR[tx.status] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.txItem} numberOfLines={1}>{tx.item}</Text>
                  <Text style={styles.txWith} numberOfLines={1}>
                    {direction} {counterparty.name} · {formatDue(tx)}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txStatus, { color: STATUS_COLOR[tx.status] }]}>
                    {STATUS_LABEL[tx.status]}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------- Achievements ---------- */}
        {unlockedKeys.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achieveTagRow}>
              {ACHIEVEMENT_DEFS.filter(a => unlockedKeys.includes(a.key)).map(a => (
                <View key={a.key} style={styles.achieveTag}>
                  <Text style={styles.achieveTagText}>{a.emoji} #{a.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ---------- Tabs ---------- */}
        <View
          onLayout={e => { tabSectionY.current = e.nativeEvent.layout.y; }}
          style={styles.tabBar}
        >
          {[
            { key: 'reviews', label: 'Reviews', icon: 'star',        iconColor: '#FED330' },
            { key: 'needs',   label: 'Needs',   icon: 'help-circle', iconColor: colors.need },
            { key: 'supply',  label: 'Supply',  icon: 'gift',        iconColor: colors.supply },
            { key: 'friends', label: 'Friends', icon: 'people',      iconColor: colors.primary },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <View style={styles.tabInner}>
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={activeTab === tab.key ? tab.iconColor : colors.textMuted}
                />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------- Tab content ---------- */}
        {activeTab === 'reviews' && reviews.map(r => (
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

        {activeTab === 'needs' && (
          myNeeds.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="help-circle" size={64} color={colors.need} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyText}>No active requests</Text>
              <Text style={styles.emptySub}>Tap + REQUEST HELP on the map to post one.</Text>
            </View>
          ) : myNeeds.map(item => (
            <TouchableOpacity key={item.id} style={styles.historyCard} activeOpacity={0.88} onPress={() => openOwnPostDetail(item)}>
              <View style={[styles.historyDot, { backgroundColor: colors.need }]} />
              <View style={styles.historyBody}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyMeta}>{item.category} · {item.timePosted}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.needLight }]}>
                <Text style={[styles.statusText, { color: colors.need }]}>Active</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        {activeTab === 'supply' && (
          mySupplies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No active offers</Text>
              <Text style={styles.emptySub}>Tap + REQUEST HELP on the map to offer something.</Text>
            </View>
          ) : mySupplies.map(item => (
            <TouchableOpacity key={item.id} style={styles.historyCard} activeOpacity={0.88} onPress={() => openOwnPostDetail(item)}>
              <View style={[styles.historyDot, { backgroundColor: colors.supply }]} />
              <View style={styles.historyBody}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyMeta}>{item.category} · {item.timePosted}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.supplyLight }]}>
                <Text style={[styles.statusText, { color: colors.supply }]}>Active</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        {activeTab === 'friends' && (() => {
          const sortedFriends = [...friends].sort((a, b) =>
            (a.name ?? '').localeCompare(b.name ?? '')
          );
          return sortedFriends.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={64} color={colors.primary} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyText}>No friends yet</Text>
              <Text style={styles.emptySub}>Find people on the map and add them as friends.</Text>
            </View>
          ) : sortedFriends.map(friend => (
            <TouchableOpacity
              key={friend.id}
              style={[styles.friendCard, { marginHorizontal: 16, marginVertical: 4 }]}
              onPress={() => navigation.navigate('UserProfile', { userId: friend.id })}
            >
              <Avatar name={friend.name} size={44} level={friend.level} showBadge />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendMeta}>{friend.neighbourhood} · ⭐ {friend.stars}</Text>
              </View>
              <TouchableOpacity
                style={styles.friendChat}
                onPress={() => {
                  const existing = chats.find(c => c.user?.id === friend.id);
                  navigation.navigate('ChatDetail', {
                    chat: existing ?? { user: friend, postTitle: 'Direct message' },
                  });
                }}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ));
        })()}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: 100 },

  /* Top bar */
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
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topPillBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 14,
  },
  topPillText: { ...typography.smallBold, color: colors.primary },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background,
  },

  /* Profile card */
  profileCard: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileTop: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  identity: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  userName: { ...typography.h2, color: colors.textPrimary, maxWidth: '70%' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.primaryLight,
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
  },
  verifiedText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  userMeta: { ...typography.small, color: colors.textSecondary },
  userBio: { ...typography.small, color: colors.textPrimary, fontStyle: 'italic', marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
  },
  actionBtnPrimary: { backgroundColor: colors.primary },
  actionBtnPrimaryText: { ...typography.smallBold, color: colors.textWhite },
  actionBtnGhost: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.primary,
  },
  actionBtnGhostText: { ...typography.smallBold, color: colors.primary },

  /* Avatar banner */
  avatarBannerWrap: {
    marginHorizontal: 16, marginTop: 14,
    aspectRatio: 1,
    position: 'relative',
  },
  avatarBanner: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5, borderColor: colors.border,
    overflow: 'hidden',
  },
  avatarBannerCenter: {
    alignItems: 'center', justifyContent: 'center', gap: 10,
    borderStyle: 'dashed',
  },
  avatarControls: {
    marginHorizontal: 16, marginTop: 8, gap: 8,
  },
  avatarHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 24,
  },
  avatarActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarChangePill: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: 9, borderRadius: 12,
  },
  avatarActionDisabled: { opacity: 0.7 },
  avatarChangePillText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  avatarBannerIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBannerText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  avatarBannerSub: { ...typography.small, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 24 },
  avatarProgressBar: {
    width: '60%', height: 6,
    backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden',
  },
  avatarProgressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  rotationButtons: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24,
  },
  rotateBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  rotateBtnHint: { ...typography.small, color: colors.textMuted },
  motionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  animationPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  animationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  animationChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  animationChipText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  animationChipTextActive: {
    color: colors.primary,
  },

  /* Stats strip */

  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: 16, marginTop: 14,
    gap: 8,
  },
  statBox: {
    flex: 1, alignItems: 'center', gap: 3,
    backgroundColor: colors.card,
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  statEmoji:   { fontSize: 18 },
  statValue:   { ...typography.h4, color: colors.textPrimary },
  statLabel:   { ...typography.caption, color: colors.textMuted },
  statChevron: { marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: colors.border },

  /* Level card */
  levelCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 20, padding: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  levelHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelEmoji: { fontSize: 32 },
  levelName: { ...typography.h4, color: colors.textPrimary },
  levelXP: { ...typography.small, color: colors.textSecondary },
  levelPercent: { ...typography.bodyBold, color: colors.primary },
  progressBar: {
    height: 8, backgroundColor: colors.background,
    borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  levelTip: { backgroundColor: colors.primaryLight, borderRadius: 10, padding: 10 },
  levelTipText: { ...typography.small, color: colors.primary },
  tasksBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 4, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.primaryLight,
  },
  tasksBtnText: { ...typography.small, color: colors.primaryDark, fontWeight: '600' },

  /* Sections */
  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 10 },
  viewAllLink: { ...typography.smallBold, color: colors.primary, marginBottom: 10 },
  historyBtn: { padding: 4 },

  /* Quick actions */
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1, backgroundColor: colors.card,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 10,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  quickIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { ...typography.smallBold, color: colors.textPrimary, textAlign: 'center' },

  /* Transaction cards */
  txCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  txCardOverdue: { borderColor: '#e03131', backgroundColor: '#fff5f5' },
  txStatusDot: { width: 10, height: 10, borderRadius: 5 },
  txItem: { ...typography.smallBold, color: colors.textPrimary },
  txWith: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  txRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txStatus: { ...typography.caption, fontWeight: '700' },

  emptyMini: {
    backgroundColor: colors.card, borderRadius: 14,
    paddingVertical: 18, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  emptyMiniText: { ...typography.small, color: colors.textMuted },

  /* Achievements */
  achieveTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achieveTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  achieveTagText: { ...typography.small, color: colors.primaryDark, fontWeight: '600' },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginTop: 18,
    borderTopWidth: 1, borderTopColor: colors.border,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginBottom: 4,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: colors.transparent,
  },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { ...typography.small, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '600' },

  /* Reviews */
  reviewCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16, marginVertical: 6,
    borderRadius: 16, padding: 14, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
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
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
  },
  reviewTagText: { ...typography.caption, color: colors.primary },

  /* Needs / Supply list */
  historyCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16, marginVertical: 4,
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  historyDot: { width: 10, height: 10, borderRadius: 5 },
  historyBody: { flex: 1 },
  historyTitle: { ...typography.smallBold, color: colors.textPrimary, marginBottom: 2 },
  historyMeta: { ...typography.caption, color: colors.textMuted },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { ...typography.caption, fontWeight: '700' },
  deleteBtn: { padding: 6, marginLeft: 4 },

  friendCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card, borderRadius: 16, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  friendInfo: { flex: 1 },
  friendName: { ...typography.smallBold, color: colors.textPrimary },
  friendMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  friendChat: { padding: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { ...typography.h4, color: colors.textSecondary, marginBottom: 6 },
  emptySub: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
});
